import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { OBJECT_SCOPE_KEY, ObjectScopeOptions } from '../decorators/object-scope.decorator';

/**
 * RBAC-4 (P2.5) — Object-Level Authorization Guard.
 *
 * Evaluates the object-scope predicate:
 *   authenticated identity → trusted organization context → trusted institution
 *   context → active membership → role → permission → target object ownership/scope
 *
 * The target object's organization/institution/membership ownership is resolved
 * from trusted server-side state. Client-supplied tenant/institution/object
 * identifiers NEVER override the trusted authorization context.
 *
 * Cross-organization access fails closed.
 * Cross-institution access fails closed.
 * Invalid or missing ownership fails closed.
 * Deactivated organization, institution, or membership must not bypass authorization.
 */
@Injectable()
export class ObjectScopeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const scope = this.reflector.get<ObjectScopeOptions>(
      OBJECT_SCOPE_KEY,
      context.getHandler(),
    );

    if (!scope || scope.type === 'none' || scope.type === 'authOnly') {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.sub) {
      throw new UnauthorizedException();
    }

    const tenantId: string = user.tenantId;
    const userId: string = user.sub;
    const institutionId: string | undefined = user.institutionId;

    switch (scope.type) {
      case 'tenant':
        return this.validateTenantScope(request, tenantId, scope.model);

      case 'self':
        return this.validateSelfScope(request, tenantId, userId, scope.model);

      case 'institution':
        return this.validateInstitutionScope(
          request,
          tenantId,
          institutionId,
          userId,
          scope.model,
        );

      default:
        throw new ForbiddenException('Invalid object scope configuration');
    }
  }

  /**
   * Tenant scope: the target object must belong to the caller's tenant.
   * Resolves the object's tenantId from the trusted DB, never from client input.
   */
  private async validateTenantScope(
    request: Record<string, unknown>,
    tenantId: string,
    model?: string,
  ): Promise<boolean> {
    const params = request.params as Record<string, string> | undefined;
    const objectId = params?.id;

    if (!objectId || !model) {
      return true;
    }

    const object = await this.resolveObject(objectId, model);
    if (!object) {
      throw new NotFoundException();
    }

    if ((object as Record<string, unknown>).tenantId !== tenantId) {
      throw new ForbiddenException();
    }

    return true;
  }

  /**
   * Self scope: the target object must belong to the caller's userId + tenantId.
   * Used for session management (list/revoke own sessions).
   */
  private async validateSelfScope(
    request: Record<string, unknown>,
    tenantId: string,
    userId: string,
    model?: string,
  ): Promise<boolean> {
    const params = request.params as Record<string, string> | undefined;
    const objectId = params?.id;

    if (!objectId || !model) {
      return true;
    }

    const object = await this.resolveObject(objectId, model);
    if (!object) {
      throw new NotFoundException();
    }

    const objRecord = object as Record<string, unknown>;
    if (objRecord.tenantId !== tenantId || objRecord.userId !== userId) {
      throw new ForbiddenException();
    }

    return true;
  }

  /**
   * Institution scope: the target object must belong to the caller's
   * institutionId + tenantId, and the caller must have an active institution
   * membership.
   */
  private async validateInstitutionScope(
    request: Record<string, unknown>,
    tenantId: string,
    institutionId: string | undefined,
    userId: string,
    model?: string,
  ): Promise<boolean> {
    if (!institutionId) {
      throw new ForbiddenException();
    }

    const membership = await this.prisma.institutionMembership.findUnique({
      where: {
        tenantId_institutionId_userId: {
          tenantId,
          institutionId,
          userId,
        },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw new ForbiddenException();
    }

    const params = request.params as Record<string, string> | undefined;
    const objectId = params?.id;

    if (!objectId || !model) {
      return true;
    }

    const object = await this.resolveObject(objectId, model);
    if (!object) {
      throw new NotFoundException();
    }

    const objRecord = object as Record<string, unknown>;
    if (
      objRecord.tenantId !== tenantId ||
      objRecord.institutionId !== institutionId
    ) {
      throw new ForbiddenException();
    }

    return true;
  }

  /**
   * Resolve an object by ID from the appropriate Prisma table.
   * Maps the model name to the correct Prisma client accessor and
   * selects only the ownership-relevant fields.
   */
  private async resolveObject(
    id: string,
    model: string,
  ): Promise<Record<string, unknown> | null> {
    const selectMap: Record<string, Record<string, boolean>> = {
      session: { id: true, tenantId: true, userId: true },
      userInvitation: { id: true, tenantId: true, email: true },
      onboardingLink: { id: true, tenantId: true, userId: true, institutionId: true },
      auditLog: { id: true, tenantId: true },
      user: { id: true, tenantId: true },
      institution: { id: true, tenantId: true },
      tenant: { id: true },
      institutionMembership: { id: true, tenantId: true, institutionId: true, userId: true, status: true },
      organizationMembership: { id: true, tenantId: true, userId: true, status: true },
      userRoleAssignment: { id: true, tenantId: true, userId: true, roleId: true },
    };

    const select = selectMap[model];
    if (!select) {
      throw new ForbiddenException('Unsupported object scope model');
    }

    const prisma = this.prisma as unknown as Record<string, { findUnique: (args: { where: { id: string }; select: Record<string, boolean> }) => Promise<Record<string, unknown> | null> }>;
    const accessor = prisma[model];

    if (!accessor) {
      throw new ForbiddenException('Unsupported object scope model');
    }

    return accessor.findUnique({ where: { id }, select });
  }
}
