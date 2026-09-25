import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TimetableStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { AcademicContext } from '../academic.types';
import { AcademicServiceBase, boundedPage, institutionWhere, ok, okList } from '../academics.common';
import { AcademicsEvents, emitAudited } from '../academics.events';
import {
  CreateTimetableDto,
  CreateTimetableSlotDto,
  UpdateTimetableDto,
  UpdateTimetableSlotDto,
} from '../dto/teaching.dto';

@Injectable()
export class TimetableService extends AcademicServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  async createTimetable(ctx: AcademicContext, dto: CreateTimetableDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);
    await this.assertTenantClass(tenantId, institutionId, dto.classId);
    await this.assertTenantTerm(tenantId, institutionId, dto.termId);

    const existing = await this.prisma.timetable.findFirst({
      where: { tenantId, classId: dto.classId, termId: dto.termId, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('a timetable already exists for this class/term');
    }
    const timetable = await this.prisma.timetable.create({
      data: { tenantId, institutionId, ...dto, createdBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.TimetableCreated, {
      tenantId,
      institutionId,
      entityType: 'timetable',
      entityId: timetable.id,
      actorId: ctx.userId,
      payload: { classId: dto.classId, termId: dto.termId },
    });
    return ok(timetable);
  }

  async listTimetables(ctx: AcademicContext, classId?: string, termId?: string, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.TimetableWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      deletedAt: null,
      ...(classId ? { classId } : {}),
      ...(termId ? { termId } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.timetable.count({ where }),
      this.prisma.timetable.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
        include: { slots: true, class: { select: { name: true } }, term: { select: { name: true } } },
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolveTimetable(tenantId: string, institutionId: string, id: string) {
    const timetable = await this.prisma.timetable.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!timetable) {
      throw new NotFoundException(`timetable ${id} not found`);
    }
    return timetable;
  }

  async getTimetable(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveTimetable(tenantId, institutionId, id);
    const timetable = await this.prisma.timetable.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { slots: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] } },
    });
    return ok(timetable);
  }

  async updateTimetable(ctx: AcademicContext, id: string, dto: UpdateTimetableDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveTimetable(tenantId, institutionId, id);
    if (current.status === TimetableStatus.PUBLISHED) {
      throw new ConflictException('published timetable cannot be edited; archive it first');
    }
    const timetable = await this.prisma.timetable.update({
      where: { id },
      data: { classId: dto.classId, termId: dto.termId, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.TimetableUpdated, {
      tenantId,
      institutionId,
      entityType: 'timetable',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(timetable);
  }

  async publishTimetable(ctx: AcademicContext, id: string) {
    return this.transitionTimetable(ctx, id, TimetableStatus.PUBLISHED, AcademicsEvents.TimetablePublished);
  }

  async archiveTimetable(ctx: AcademicContext, id: string) {
    return this.transitionTimetable(ctx, id, TimetableStatus.ARCHIVED, AcademicsEvents.TimetableArchived);
  }

  private async transitionTimetable(ctx: AcademicContext, id: string, next: TimetableStatus, event: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveTimetable(tenantId, institutionId, id);
    if (current.status === next) {
      throw new ConflictException(`timetable ${id} is already ${next}`);
    }
    if (current.status === TimetableStatus.ARCHIVED) {
      throw new ConflictException('archived timetable cannot be changed');
    }
    const timetable = await this.prisma.timetable.update({
      where: { id },
      data: { status: next, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, event as never, {
      tenantId,
      institutionId,
      entityType: 'timetable',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: next },
    });
    return ok(timetable);
  }

  async deleteTimetable(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveTimetable(tenantId, institutionId, id);
    await this.prisma.timetableSlot.deleteMany({ where: { timetableId: id, tenantId } });
    const timetable = await this.prisma.timetable.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.TimetableDeleted, {
      tenantId,
      institutionId,
      entityType: 'timetable',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status } as never,
    });
    return ok(timetable);
  }

  // -------------------------------------------------------------------- slots
  async addSlot(ctx: AcademicContext, timetableId: string, dto: CreateTimetableSlotDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const timetable = await this.resolveTimetable(tenantId, institutionId, timetableId);
    if (timetable.status !== TimetableStatus.DRAFT) {
      throw new ConflictException('slots can only be added to a DRAFT timetable');
    }
    await this.assertTenantSubject(tenantId, institutionId, dto.subjectId);
    await this.assertSlotWindow(dto.startTime, dto.endTime);
    const existing = await this.prisma.timetableSlot.findFirst({
      where: { tenantId, timetableId, dayOfWeek: dto.dayOfWeek, startTime: this.timeOfDay(dto.startTime) },
    });
    if (existing) {
      throw new ConflictException('a slot already exists at this day/time window');
    }
    const slot = await this.prisma.timetableSlot.create({
      data: {
        tenantId,
        institutionId,
        timetableId,
        dayOfWeek: dto.dayOfWeek,
        startTime: this.timeOfDay(dto.startTime),
        endTime: this.timeOfDay(dto.endTime),
        subjectId: dto.subjectId,
        staffPersonId: dto.staffPersonId,
        room: dto.room,
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.TimetableSlotAdded, {
      tenantId,
      institutionId,
      entityType: 'timetableSlot',
      entityId: slot.id,
      actorId: ctx.userId,
      payload: { timetableId, dayOfWeek: dto.dayOfWeek },
    });
    return ok(slot);
  }

  async updateSlot(ctx: AcademicContext, id: string, dto: UpdateTimetableSlotDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const slot = await this.prisma.timetableSlot.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!slot) {
      throw new NotFoundException(`timetable slot ${id} not found`);
    }
    const timetable = await this.resolveTimetable(tenantId, institutionId, slot.timetableId);
    if (timetable.status !== TimetableStatus.DRAFT) {
      throw new ConflictException('slots can only be edited on a DRAFT timetable');
    }
    if (dto.startTime && dto.endTime) {
      await this.assertSlotWindow(dto.startTime, dto.endTime);
    }
    const updated = await this.prisma.timetableSlot.update({
      where: { id },
      data: {
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime ? this.timeOfDay(dto.startTime) : undefined,
        endTime: dto.endTime ? this.timeOfDay(dto.endTime) : undefined,
        subjectId: dto.subjectId,
        staffPersonId: dto.staffPersonId,
        room: dto.room,
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.TimetableSlotUpdated, {
      tenantId,
      institutionId,
      entityType: 'timetableSlot',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(updated);
  }

  async removeSlot(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const slot = await this.prisma.timetableSlot.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!slot) {
      throw new NotFoundException(`timetable slot ${id} not found`);
    }
    const timetable = await this.resolveTimetable(tenantId, institutionId, slot.timetableId);
    if (timetable.status !== TimetableStatus.DRAFT) {
      throw new ConflictException('slots can only be removed from a DRAFT timetable');
    }
    await this.prisma.timetableSlot.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.TimetableSlotRemoved, {
      tenantId,
      institutionId,
      entityType: 'timetableSlot',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok({ removed: true });
  }

  private timeOfDay(value: string) {
    const [hours, minutes] = value.split(':');
    const dt = new Date(`1970-01-01T${value}`);
    if (Number.isNaN(dt.getTime()) || !hours || !minutes) {
      throw new ConflictException(`invalid time "${value}" (expected HH:mm)`);
    }
    return dt;
  }

  private async assertSlotWindow(start: string, end: string) {
    const startD = new Date(`1970-01-01T${start}`);
    const endD = new Date(`1970-01-01T${end}`);
    if (startD >= endD) {
      throw new ConflictException('slot startTime must precede endTime');
    }
  }

  private async assertTenantSubject(tenantId: string, institutionId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!subject) {
      throw new NotFoundException(`subject ${id} not found`);
    }
  }

  private async assertTenantClass(tenantId: string, institutionId: string, id: string) {
    const clazz = await this.prisma.class.findFirst({ where: { id, tenantId, institutionId, deletedAt: null } });
    if (!clazz) {
      throw new NotFoundException(`class ${id} not found`);
    }
  }

  private async assertTenantTerm(tenantId: string, institutionId: string, id: string) {
    const term = await this.prisma.term.findFirst({ where: { id, tenantId, institutionId, deletedAt: null } });
    if (!term) {
      throw new NotFoundException(`term ${id} not found`);
    }
  }
}