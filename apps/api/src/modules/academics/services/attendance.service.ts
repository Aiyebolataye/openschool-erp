import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus, AttendanceType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { AcademicContext } from '../academic.types';
import { AcademicServiceBase, boundedPage, institutionWhere, ok, okList } from '../academics.common';
import { AcademicsEvents, emitAudited } from '../academics.events';
import { AttendanceRowDto, CorrectAttendanceDto, RecordAttendanceDto } from '../dto/activity.dto';

@Injectable()
export class AttendanceService extends AcademicServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  /**
   * Batch attendance. Every row must reference exactly one of
   * studentClassEnrollmentId (STUDENT) or staffPersonId (STAFF) — mirrored by
   * the archive-migration CHECK + the NULL-DISTINCT partial unique on the
   * (tenant, enrollment, subject, date) triplet, so duplicates collapse and
   * tampering fails closed at the DB layer too.
   */
  async record(ctx: AcademicContext, dto: RecordAttendanceDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);
    if (dto.rows.length === 0) {
      throw new BadRequestException('attendance batch must contain at least one row');
    }

    const created: { id: string; date: Date; subjectId: string }[] = [];
    for (const row of dto.rows) {
      created.push(await this.recordRow(tenantId, institutionId, row, ctx.userId));
    }

    await emitAudited(this.publisher, this.audit, AcademicsEvents.AttendanceRecorded, {
      tenantId,
      institutionId,
      entityType: 'attendance',
      entityId: 'batch',
      actorId: ctx.userId,
      changes: { count: created.length },
    });
    return ok({ recorded: created.length, rows: created });
  }

  private async recordRow(
    tenantId: string,
    institutionId: string,
    row: AttendanceRowDto,
    actorId: string,
  ) {
    const enrollmentId = row.studentClassEnrollmentId ?? null;
    const staffPersonId = row.staffPersonId ?? null;
    const targetCount = (enrollmentId ? 1 : 0) + (staffPersonId ? 1 : 0);
    if (targetCount !== 1) {
      throw new BadRequestException(
        'attendance row must reference exactly one of studentClassEnrollmentId or staffPersonId',
      );
    }

    await this.assertTenantSubject(tenantId, institutionId, row.subjectId);
    if (enrollmentId) {
      await this.assertTenantEnrollment(tenantId, institutionId, enrollmentId);
    } else {
      await this.assertTenantStaff(tenantId, institutionId, staffPersonId as string);
    }

    const date = new Date(row.date);
    const existing = await this.prisma.attendance.findFirst({
      where: { tenantId, studentClassEnrollmentId: enrollmentId, subjectId: row.subjectId, date },
    });
    if (existing) {
      const updated = await this.prisma.attendance.update({
        where: { id: existing.id },
        data: { status: row.status, notes: row.notes ?? null, updatedBy: actorId },
      });
      return { id: updated.id, date, subjectId: row.subjectId };
    }
    const created = await this.prisma.attendance.create({
      data: {
        tenantId,
        institutionId,
        studentClassEnrollmentId: enrollmentId,
        staffPersonId: staffPersonId,
        subjectId: row.subjectId,
        date,
        status: row.status,
        attendanceType: enrollmentId ? AttendanceType.STUDENT : AttendanceType.STAFF,
        notes: row.notes,
        createdBy: actorId,
      },
    });
    return { id: created.id, date, subjectId: row.subjectId };
  }

  async correct(ctx: AcademicContext, id: string, dto: CorrectAttendanceDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const attendance = await this.prisma.attendance.findFirst({
      where: { id, tenantId },
    });
    if (!attendance) {
      throw new NotFoundException(`attendance record ${id} not found`);
    }
    const updated = await this.prisma.attendance.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes ?? attendance.notes,
        corrected: true,
        correctedBy: ctx.userId,
        correctedAt: new Date(),
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.AttendanceCorrected, {
      tenantId,
      institutionId: attendance.institutionId,
      entityType: 'attendance',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: attendance.status, nextStatus: dto.status, corrected: true },
    });
    return ok(updated);
  }

  async list(
    ctx: AcademicContext,
    query: {
      enrollmentId?: string;
      staffPersonId?: string;
      subjectId?: string;
      classId?: string;
      date?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    },
  ) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(query.page, query.limit);
    const dateFilter: NonNullable<Prisma.AttendanceWhereInput['date']> | undefined = (() => {
      if (query.date) return new Date(query.date);
      if (query.from || query.to) {
        return {
          ...(query.from ? { gte: new Date(query.from) } : {}),
          ...(query.to ? { lte: new Date(query.to) } : {}),
        };
      }
      return undefined;
    })();

    const where: Prisma.AttendanceWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      ...(query.enrollmentId ? { studentClassEnrollmentId: query.enrollmentId } : {}),
      ...(query.staffPersonId ? { staffPersonId: query.staffPersonId } : {}),
      ...(query.subjectId ? { subjectId: query.subjectId } : {}),
      ...(query.classId ? { enrollment: { classId: query.classId } } : {}),
      ...(dateFilter ? { date: dateFilter } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.attendance.count({ where }),
      this.prisma.attendance.findMany({
        where,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip: (p - 1) * l,
        take: l,
        include: { subject: { select: { name: true, code: true } } },
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async assertTenantSubject(tenantId: string, institutionId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({ where: { id, tenantId, institutionId, deletedAt: null } });
    if (!subject) throw new NotFoundException(`subject ${id} not found`);
  }

  private async assertTenantEnrollment(tenantId: string, institutionId: string, id: string) {
    const enrollment = await this.prisma.studentClassEnrollment.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!enrollment) throw new NotFoundException(`enrollment ${id} not found`);
  }

  private async assertTenantStaff(tenantId: string, institutionId: string, staffPersonId: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { tenantId, institutionId, personId: staffPersonId, status: 'ACTIVE' },
    });
    if (!staff) throw new NotFoundException(`staff ${staffPersonId} not found`);
  }
}