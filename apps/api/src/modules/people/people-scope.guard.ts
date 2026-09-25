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
import { PEOPLE_SCOPE_KEY, PeopleScopeOptions } from './people-scope.decorator';

/**
 * PEOPLE-2/PEOPLE-3/PEOPLE-4 object-scope guard (frozen PEOPLE-G §8/§10
 * semantics).
 *
 * Preserves the Phase-2 ObjectScopeGuard rules exactly for admin/operational
 * callers:
 *   - person            → tenant scope: target.person.tenantId must equal the
 *     caller's trusted tenantId (cross-tenant fails closed).
 *   - student / staff / parent / guardian / personRelationship →
 *     institution scope: caller needs an ACTIVE institution membership (trusted
 *     institutionId) and the target must belong to tenant + that institution.
 *   - emergencyContact   → tenant scope: emergency contacts are person-level
 *     (no institutionId in the frozen schema); the owner-person binding is
 *     checked by the service (nested relationship).
 *
 * PEOPLE-4 model naming follows the frozen permission/route resources:
 * `emergencyContact` and `personRelationship` are the guard-side camelCase of
 * the `people:emergency_contact` / `people:relationship` permissions.
 *
 * Adds the D-B self-service boundary for PARENT/STUDENT-seated principals:
 * those roles may only READ their own Person/Student records — resolved from
 * trusted state (the staff/student/parent/guardian `userId` bridge, or a
 * PARENT/GUARDIAN person relationship to the student's Person). A caller whose
 * role set is NOT restricted to self-service roles is treated as
 * operational/admin and evaluated with the exact Phase-2 rules.
 *
 * Client-supplied tenant/institution/object ids are never trusted.
 */
const SELF_SERVICE_ROLES = ['PARENT', 'STUDENT'];

/** Models whose scope is institution (tenant + active membership + row match). */
const INSTITUTION_MODELS = ['student', 'staff', 'parent', 'guardian', 'personRelationship', 'applicant'] as const;
type InstitutionScopedModel = (typeof INSTITUTION_MODELS)[number];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

@Injectable()
export class PeopleScopeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const scope = this.reflector.get<PeopleScopeOptions>(
      PEOPLE_SCOPE_KEY,
      context.getHandler(),
    );

    if (!scope) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.sub) {
      throw new UnauthorizedException();
    }

    const params = request.params as Record<string, string> | undefined;
    const objectId = params?.id;

    // Routes without `:id` have no single target object: the controller/service
    // enforces ownership from trusted state.
    if (!objectId) {
      return true;
    }

    const isSelfServiceOnly =
      Array.isArray(user.roles) &&
      user.roles.length > 0 &&
      user.roles.every((role: string) => SELF_SERVICE_ROLES.includes(role));

    if (isSelfServiceOnly) {
      if (scope.model !== 'person' && scope.model !== 'student') {
        throw new ForbiddenException();
      }
      return this.validateSelfAccess(context, user, scope.model, objectId);
    }

    if ((INSTITUTION_MODELS as readonly string[]).includes(scope.model)) {
      return this.validateInstitutionScope(user, scope.model as InstitutionScopedModel, objectId);
    }
    return this.validateTenantScope(user, scope.model as 'person' | 'emergencyContact' | 'peopleDocument', objectId);
  }

  private async validateTenantScope(
    user: { tenantId: string },
    model: 'person' | 'emergencyContact' | 'peopleDocument',
    objectId: string,
  ): Promise<boolean> {
    const target = await this.resolveTarget(model, objectId);
    if (target.tenantId !== user.tenantId) {
      throw new ForbiddenException();
    }
    return true;
  }

  private async validateInstitutionScope(
    user: { sub: string; tenantId: string; institutionId?: string },
    model: InstitutionScopedModel,
    objectId: string,
  ): Promise<boolean> {
    if (!user.institutionId) {
      throw new ForbiddenException();
    }

    const membership = await this.prisma.institutionMembership.findUnique({
      where: {
        tenantId_institutionId_userId: {
          tenantId: user.tenantId,
          institutionId: user.institutionId,
          userId: user.sub,
        },
      },
    });
    if (!membership || membership.status !== 'ACTIVE') {
      throw new ForbiddenException();
    }

    const target = await this.resolveTarget(model, objectId);
    if (target.tenantId !== user.tenantId || target.institutionId !== user.institutionId) {
      throw new ForbiddenException();
    }
    return true;
  }

  /**
   * D-B self-scope: a PARENT/STUDENT-seated caller may only read their own
   * Person/Student records, resolved from trusted server-side state.
   */
  private async validateSelfAccess(
    context: ExecutionContext,
    user: { tenantId: string; sub: string },
    model: 'person' | 'student',
    objectId: string,
  ): Promise<boolean> {
    const selfPersonIds = await this.resolveSelfPersonIds(user.tenantId, user.sub);

    if (model === 'person') {
      const person = await this.resolveTarget('person', objectId);
      if (person.tenantId !== user.tenantId || !selfPersonIds.has(person.id)) {
        throw new ForbiddenException();
      }
      return true;
    }

    const student = await this.resolveTarget('student', objectId);
    if (student.tenantId !== user.tenantId) {
      throw new ForbiddenException();
    }
    if (student.userId === user.sub) {
      return true;
    }

    const linked = await this.prisma.personRelationship.findFirst({
      where: {
        tenantId: user.tenantId,
        relationshipType: { in: ['PARENT', 'GUARDIAN'] },
        OR: [
          { sourcePersonId: { in: [...selfPersonIds] }, targetPersonId: student.personId },
          { targetPersonId: { in: [...selfPersonIds] }, sourcePersonId: student.personId },
        ],
      },
      select: { id: true },
    });
    if (!linked) {
      throw new ForbiddenException();
    }
    return true;
  }

  /**
   * Resolve the guard target by UUID. PEOPLE-4 targets carry no public_id
   * (spec §7.2: public IDs exist only for people/students/staff/applicants),
   * so parent/guardian/personRelationship/emergencyContact/peopleDocument
   * resolve by UUID only — a non-UUID `:id` is NotFound (opaque), never 500.
   * Missing targets are NotFound (opaque); boundary mismatches are Forbidden and
   * decided by the caller.
   */
  private async resolveTarget(
    model:
      | 'person'
      | 'student'
      | 'staff'
      | 'parent'
      | 'guardian'
      | 'personRelationship'
      | 'emergencyContact'
      | 'applicant'
      | 'peopleDocument',
    objectId: string,
  ): Promise<
    { id: string; tenantId: string } & Partial<{
      institutionId: string;
      personId: string;
      userId: string | null;
    }>
  > {
    const institutionSelect = {
      id: true,
      tenantId: true,
      institutionId: true,
      personId: true,
      userId: true,
    } as const;

    // Applicant has no `userId` bridge (schema): selecting it would 500.
    const applicantSelect = {
      id: true,
      tenantId: true,
      institutionId: true,
      personId: true,
    } as const;

    const relationshipSelect = {
      id: true,
      tenantId: true,
      institutionId: true,
    } as const;

    const resolveUuidOnly = async (
      findUnique: () => Promise<
        { id: string; tenantId: string; institutionId?: string; personId?: string; userId?: string | null } | null
      >,
    ): Promise<{ id: string; tenantId: string } & Partial<{ institutionId: string; personId: string; userId: string | null }>> => {
      if (!isUuid(objectId)) {
        throw new NotFoundException();
      }
      const row = await findUnique();
      if (!row) {
        throw new NotFoundException();
      }
      return row;
    };

    if (model === 'parent') {
      return resolveUuidOnly(async () =>
        this.prisma.parent.findUnique({ where: { id: objectId }, select: institutionSelect }),
      );
    }

    if (model === 'guardian') {
      return resolveUuidOnly(async () =>
        this.prisma.guardian.findUnique({ where: { id: objectId }, select: institutionSelect }),
      );
    }

    if (model === 'personRelationship') {
      return resolveUuidOnly(async () =>
        this.prisma.personRelationship.findUnique({ where: { id: objectId }, select: relationshipSelect }),
      );
    }

    if (model === 'emergencyContact') {
      return resolveUuidOnly(async () =>
        this.prisma.emergencyContact.findUnique({
          where: { id: objectId },
          select: { id: true, tenantId: true, personId: true },
        }),
      );
    }

    if (model === 'peopleDocument') {
      return resolveUuidOnly(async () =>
        this.prisma.peopleDocument.findUnique({
          where: { id: objectId },
          select: { id: true, tenantId: true, personId: true },
        }),
      );
    }

    if (model === 'applicant') {
      if (isUuid(objectId)) {
        const applicant = await this.prisma.applicant.findUnique({
          where: { id: objectId },
          select: applicantSelect,
        });
        if (applicant) return applicant;
      }
      const byPublic = await this.prisma.applicant.findFirst({
        where: { publicId: objectId },
        select: applicantSelect,
      });
      if (!byPublic) {
        throw new NotFoundException();
      }
      return byPublic;
    }

    if (model === 'staff') {
      if (isUuid(objectId)) {
        const staff = await this.prisma.staff.findUnique({
          where: { id: objectId },
          select: { id: true, tenantId: true, institutionId: true, personId: true, userId: true },
        });
        if (staff) return staff;
      }
      const byPublic = await this.prisma.staff.findFirst({
        where: { publicId: objectId },
        select: { id: true, tenantId: true, institutionId: true, personId: true, userId: true },
      });
      if (!byPublic) {
        throw new NotFoundException();
      }
      return byPublic;
    }

    if (model === 'student') {
      if (isUuid(objectId)) {
        const student = await this.prisma.student.findUnique({
          where: { id: objectId },
          select: { id: true, tenantId: true, institutionId: true, personId: true, userId: true },
        });
        if (student) return student;
      }
      const byPublic = await this.prisma.student.findFirst({
        where: { publicId: objectId },
        select: { id: true, tenantId: true, institutionId: true, personId: true, userId: true },
      });
      if (!byPublic) {
        throw new NotFoundException();
      }
      return byPublic;
    }

    if (isUuid(objectId)) {
      const person = await this.prisma.person.findUnique({
        where: { id: objectId },
        select: { id: true, tenantId: true },
      });
      if (person) return person;
    }
    const byPublic = await this.prisma.person.findFirst({
      where: { publicId: objectId },
      select: { id: true, tenantId: true },
    });
    if (!byPublic) {
      throw new NotFoundException();
    }
    return byPublic;
  }

  /**
   * Persons belonging to the caller's identity, via the staff/student/parent/
   * guardian `userId` bridge (Phase-1 architecture; §18 decision #3).
   */
  private async resolveSelfPersonIds(
    tenantId: string,
    userId: string,
  ): Promise<Set<string>> {
    const [staff, students, parents, guardians] = await Promise.all([
      this.prisma.staff.findFirst({
        where: { tenantId, userId },
        select: { personId: true },
      }),
      this.prisma.student.findFirst({
        where: { tenantId, userId },
        select: { personId: true },
      }),
      this.prisma.parent.findFirst({
        where: { tenantId, userId },
        select: { personId: true },
      }),
      this.prisma.guardian.findFirst({
        where: { tenantId, userId },
        select: { personId: true },
      }),
    ]);

    const ids = new Set<string>();
    for (const row of [staff, students, parents, guardians]) {
      if (row) ids.add(row.personId);
    }
    return ids;
  }
}