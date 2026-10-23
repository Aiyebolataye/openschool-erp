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
      // PEOPLE-1 — People ObjectScope registry (frozen People module).
      // Objects resolve their tenant/institution/person ownership from trusted
      // server-side state; the guard then enforces tenant/institution/self
      // boundaries exactly as it does for Identity/RBAC objects.
      person: { id: true, tenantId: true },
      personProfile: { id: true, tenantId: true, personId: true },
      personInstitution: { id: true, tenantId: true, institutionId: true, personId: true },
      student: { id: true, tenantId: true, institutionId: true, personId: true, userId: true, status: true },
      staff: { id: true, tenantId: true, institutionId: true, personId: true, userId: true, status: true },
      parent: { id: true, tenantId: true, institutionId: true, personId: true, userId: true },
      guardian: { id: true, tenantId: true, institutionId: true, personId: true, userId: true },
      applicant: { id: true, tenantId: true, institutionId: true, personId: true, status: true },
      emergencyContact: { id: true, tenantId: true, personId: true },
      personRelationship: {
        id: true,
        tenantId: true,
        institutionId: true,
        sourcePersonId: true,
        targetPersonId: true,
      },
      peopleDocument: { id: true, tenantId: true, personId: true },
      studentEnrollmentDetail: { id: true, tenantId: true, studentId: true },
      studentAcademicRecord: { id: true, tenantId: true, studentId: true },
      studentGraduationDetail: { id: true, tenantId: true, studentId: true },
      studentTransferDetail: { id: true, tenantId: true, studentId: true },
      studentWithdrawalDetail: { id: true, tenantId: true, studentId: true },
      staffEmploymentDetail: { id: true, tenantId: true, staffId: true },
      staffQualification: { id: true, tenantId: true, staffId: true },
      staffCertification: { id: true, tenantId: true, staffId: true },
      staffEmploymentHistory: { id: true, tenantId: true, staffId: true },
      // P4.1 — Institution Management ObjectScope registry (additive).
      institutionConfiguration: { id: true, tenantId: true, institutionId: true },
      institutionSetting: { id: true, tenantId: true, institutionId: true },
      // P5 — Academic Management ObjectScope registry (frozen §7/§12, additive).
      // Objects resolve their tenant + institution ownership from trusted
      // server-side state; cross-tenant / cross-institution access fails closed.
      academicYear: { id: true, tenantId: true, institutionId: true },
      academicSession: { id: true, tenantId: true, institutionId: true, academicYearId: true },
      term: { id: true, tenantId: true, institutionId: true, academicSessionId: true },
      subject: { id: true, tenantId: true, institutionId: true, departmentId: true },
      subjectGroup: { id: true, tenantId: true, institutionId: true },
      department: { id: true, tenantId: true, institutionId: true },
      gradeLevel: { id: true, tenantId: true, institutionId: true },
      stream: { id: true, tenantId: true, institutionId: true, gradeLevelId: true },
      class: { id: true, tenantId: true, institutionId: true, gradeLevelId: true, streamId: true },
      arm: { id: true, tenantId: true, institutionId: true, classId: true },
      homeroom: { id: true, tenantId: true, institutionId: true, classId: true },
      teachingAssignment: { id: true, tenantId: true, institutionId: true },
      timetable: { id: true, tenantId: true, institutionId: true, classId: true, termId: true },
      timetableSlot: { id: true, tenantId: true, institutionId: true, timetableId: true },
      studentClassEnrollment: {
        id: true,
        tenantId: true,
        institutionId: true,
        studentPersonId: true,
        classId: true,
        termId: true,
      },
      subjectRegistration: { id: true, tenantId: true, institutionId: true, studentClassEnrollmentId: true },
      attendance: { id: true, tenantId: true, institutionId: true },
      assignment: { id: true, tenantId: true, institutionId: true },
      assignmentSubmission: { id: true, tenantId: true, institutionId: true, assignmentId: true },
      assessment: { id: true, tenantId: true, institutionId: true },
      assessmentResult: { id: true, tenantId: true, institutionId: true, assessmentId: true },
      gradeScale: { id: true, tenantId: true, institutionId: true },
      gradeBoundary: { id: true, tenantId: true, institutionId: true, gradeScaleId: true },
      remark: { id: true, tenantId: true, institutionId: true, gradeScaleId: true },
      result: { id: true, tenantId: true, institutionId: true },
      reportCard: { id: true, tenantId: true, institutionId: true, studentClassEnrollmentId: true, termId: true },
      academicProgression: { id: true, tenantId: true, institutionId: true, studentPersonId: true, termId: true },
      academicPolicy: { id: true, tenantId: true, institutionId: true },
      summerSchoolSession: { id: true, tenantId: true, institutionId: true, termId: true },
      summerSchoolRegistration: { id: true, tenantId: true, institutionId: true, summerSchoolSessionId: true },
      summerSchoolResult: { id: true, tenantId: true, institutionId: true, summerSchoolRegistrationId: true },
      // P6.1 — Finance ObjectScope registry (frozen §7/§12, additive).
      // Fee catalogue objects resolve their tenant + institution ownership from
      // trusted server-side state; cross-tenant / cross-institution access fails
      // closed, same as the academic and institution registries.
      feeCategory: { id: true, tenantId: true, institutionId: true },
      feeItem: { id: true, tenantId: true, institutionId: true, feeCategoryId: true },
      // P6.2 — Finance accounting / billing / policy registry (frozen §7/§12,
      // additive). Same fail-closed contract as the P6.1 fee catalogue: the
      // object's tenant + institution ownership is resolved from trusted
      // server-side state before the boundary check runs.
      feeSchedule: { id: true, tenantId: true, institutionId: true, academicSessionId: true },
      bill: {
        id: true,
        tenantId: true,
        institutionId: true,
        studentPersonId: true,
        feeScheduleId: true,
      },
      discount: { id: true, tenantId: true, institutionId: true },
      ledgerAccount: { id: true, tenantId: true, institutionId: true },
      financialPeriod: { id: true, tenantId: true, institutionId: true },
      journalEntry: { id: true, tenantId: true, institutionId: true, financialPeriodId: true },
      financialPolicy: { id: true, tenantId: true, institutionId: true },
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
