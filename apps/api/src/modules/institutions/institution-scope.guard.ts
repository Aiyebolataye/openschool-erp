import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * P4.1 — institution-scoped data guard (config/settings).
 *
 * Enforces the frozen "server-derived ownership" rule for nested institution
 * operations read via the `:id` path segment:
 *
 *   - the actor identity comes ONLY from the trusted JWT context (`req.user`);
 *     the bespoke `req.actor` trust path is gone (frozen Z-5);
 *   - the target institution is resolved server-side by `:id`; a client-supplied
 *     `institutionId` in the body is NEVER trusted;
 *   - the institution must belong to the caller's tenant (cross-tenant fails
 *     closed);
 *   - the caller must hold an ACTIVE institution membership for it.
 *
 * Permission checks remain the responsibility of PermissionGuard; object-scope
 * (tenant ownership of the referenced institution) remains the responsibility
 * of ObjectScopeGuard. This guard adds the active-membership requirement that
 * institution-scoped data (InstitutionConfiguration / InstitutionSetting)
 * needs on top of both.
 */
@Injectable()
export class InstitutionScopeGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.sub || !user?.tenantId) {
      throw new ForbiddenException('authenticated actor context required');
    }

    const params = request.params ?? {};
    const institutionId: string | undefined = params.id ?? params.institutionId;

    if (!institutionId) {
      return true;
    }

    const institution = await this.prisma.institution.findFirst({
      where: { id: institutionId },
      select: { id: true, tenantId: true },
    });

    if (!institution) {
      throw new NotFoundException('institution not found');
    }

    if (institution.tenantId !== user.tenantId) {
      throw new ForbiddenException('institution not in tenant scope');
    }

    const membership = await this.prisma.institutionMembership.findUnique({
      where: {
        tenantId_institutionId_userId: {
          tenantId: user.tenantId,
          institutionId,
          userId: user.sub,
        },
      },
      select: { status: true },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw new ForbiddenException('active institution membership required');
    }

    return true;
  }
}