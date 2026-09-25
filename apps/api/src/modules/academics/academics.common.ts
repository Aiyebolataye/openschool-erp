import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventPublisher } from '../events/event-publisher';
import { AuditService } from '../audit/audit.service';
import { AcademicContext } from './academic.types';
import { TeachingRole } from '@prisma/client';

export function ok(data: unknown) {
  return { success: true as const, data };
}

export function okList(items: unknown[], total: number, page: number, limit: number) {
  return { success: true as const, data: { items, total, page, limit } };
}

export function boundedPage(page: number | undefined, limit: number | undefined) {
  const p = page && page > 0 ? page : 1;
  const l = limit && limit > 0 ? Math.min(limit, 100) : 20;
  return { page: p, limit: l };
}

export function institutionWhere(tenantId: string, institutionId: string) {
  return { tenantId, institutionId };
}

/**
 * Shared base infrastructure for every academic service: scoped tenant +
 * institution resolution, the D-4 emit+audit helper and the P-12 result /
 * grading authority checks against the persisted teaching assignments
 * (CLASS_TEACHER / DEPARTMENT_HEAD), never against client-supplied claims.
 */
@Injectable()
export abstract class AcademicServiceBase {
  protected constructor(
    protected readonly prisma: PrismaService,
    protected readonly publisher: EventPublisher,
    protected readonly audit: AuditService,
  ) {}

  protected assertInstitutionContext(ctx: AcademicContext) {
    if (!ctx.institutionId) {
      throw new ForbiddenException(
        'academic operations require an institution context',
      );
    }
  }

  protected async resolveInstitution(tenantId: string, institutionId: string) {
    const institution = await this.prisma.institution.findFirst({
      where: { id: institutionId, tenantId },
    });
    if (!institution) {
      throw new NotFoundException(
        `institution ${institutionId} not found in tenant ${tenantId}`,
      );
    }
    return institution;
  }

  protected async resolveStaffPersonId(
    tenantId: string,
    institutionId: string,
    userId: string | undefined | null,
  ): Promise<string | null> {
    if (!userId) {
      return null;
    }
    const staff = await this.prisma.staff.findFirst({
      where: { tenantId, institutionId, userId, status: 'ACTIVE' },
    });
    return staff?.personId ?? null;
  }

  protected teachingAuthorityRoles(): TeachingRole[] {
    return [TeachingRole.CLASS_TEACHER, TeachingRole.DEPARTMENT_HEAD];
  }

  /**
   * P-12 authority enforcement: result approval / publishing and assessment /
   * assignment grading require the actor to be the persisted CLASS_TEACHER (or
   * DEPARTMENT_HEAD) for the subject/class/term in teaching_assignments.
   */
  protected async assertTeachingAuthority(
    tenantId: string,
    institutionId: string,
    staffPersonId: string | null | undefined,
    subjectId: string,
    classId: string,
    termId: string,
  ): Promise<void> {
    if (!staffPersonId) {
      throw new ForbiddenException('no teaching authority for anonymous actor');
    }
    const assignment = await this.prisma.teachingAssignment.findFirst({
      where: {
        tenantId,
        institutionId,
        staffPersonId,
        subjectId,
        classId,
        termId,
        role: { in: this.teachingAuthorityRoles() },
        deletedAt: null,
      },
    });
    if (!assignment) {
      throw new ForbiddenException(
        'actor is not the assigned class teacher for this subject/class/term',
      );
    }
  }

  protected async assertDateRange(start: Date | undefined, end: Date | undefined) {
    if (start && end && start > end) {
      throw new BadRequestException(`startDate must precede endDate`);
    }
  }
}

export type PagedSlice = { page: number; limit: number };