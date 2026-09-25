import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { AcademicContext } from '../academic.types';
import { AcademicServiceBase, boundedPage, institutionWhere, ok, okList } from '../academics.common';
import { AcademicsEvents, emitAudited } from '../academics.events';
import {
  AssignHomeroomDto,
  CreateArmDto,
  CreateTeachingAssignmentDto,
  UpdateArmDto,
  UpdateTeachingAssignmentDto,
} from '../dto/teaching.dto';

@Injectable()
export class TeachingService extends AcademicServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  async createAssignment(ctx: AcademicContext, dto: CreateTeachingAssignmentDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);
    await this.assertActiveStaff(tenantId, institutionId, dto.staffPersonId);
    await this.assertTenantSubject(tenantId, institutionId, dto.subjectId);
    await this.assertTenantClass(tenantId, institutionId, dto.classId);
    await this.assertTenantTerm(tenantId, institutionId, dto.termId);

    const existing = await this.prisma.teachingAssignment.findFirst({
      where: {
        tenantId,
        staffPersonId: dto.staffPersonId,
        subjectId: dto.subjectId,
        classId: dto.classId,
        termId: dto.termId,
        deletedAt: null,
      },
    });
    if (existing) {
      throw new ConflictException(
        'teaching assignment already exists for this staff/subject/class/term',
      );
    }
    const assignment = await this.prisma.teachingAssignment.create({
      data: { tenantId, institutionId, ...dto, createdBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.TeachingCreated, {
      tenantId,
      institutionId,
      entityType: 'teachingAssignment',
      entityId: assignment.id,
      actorId: ctx.userId,
      payload: { staffPersonId: dto.staffPersonId, subjectId: dto.subjectId, classId: dto.classId, termId: dto.termId, role: dto.role },
    });
    return ok(assignment);
  }

  async listAssignments(
    ctx: AcademicContext,
    query: { termId?: string; classId?: string; subjectId?: string; staffPersonId?: string; page?: number; limit?: number },
  ) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(query.page, query.limit);
    const where: Prisma.TeachingAssignmentWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      deletedAt: null,
      ...(query.termId ? { termId: query.termId } : {}),
      ...(query.classId ? { classId: query.classId } : {}),
      ...(query.subjectId ? { subjectId: query.subjectId } : {}),
      ...(query.staffPersonId ? { staffPersonId: query.staffPersonId } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.teachingAssignment.count({ where }),
      this.prisma.teachingAssignment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
        include: { subject: { select: { name: true, code: true } }, class: { select: { name: true } } },
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolveAssignment(tenantId: string, institutionId: string, id: string) {
    const assignment = await this.prisma.teachingAssignment.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!assignment) {
      throw new NotFoundException(`teaching assignment ${id} not found`);
    }
    return assignment;
  }

  async getAssignment(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    return ok(await this.resolveAssignment(ctx.tenantId, ctx.institutionId as string, id));
  }

  async updateAssignment(ctx: AcademicContext, id: string, dto: UpdateTeachingAssignmentDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveAssignment(tenantId, institutionId, id);
    if (dto.staffPersonId) await this.assertActiveStaff(tenantId, institutionId, dto.staffPersonId);
    if (dto.subjectId) await this.assertTenantSubject(tenantId, institutionId, dto.subjectId);
    if (dto.classId) await this.assertTenantClass(tenantId, institutionId, dto.classId);
    if (dto.termId) await this.assertTenantTerm(tenantId, institutionId, dto.termId);
    const assignment = await this.prisma.teachingAssignment.update({
      where: { id },
      data: { ...dto, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.TeachingUpdated, {
      tenantId,
      institutionId,
      entityType: 'teachingAssignment',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(assignment);
  }

  async deleteAssignment(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveAssignment(tenantId, institutionId, id);
    const assignment = await this.prisma.teachingAssignment.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.TeachingDeleted, {
      tenantId,
      institutionId,
      entityType: 'teachingAssignment',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(assignment);
  }

  // ------------------------------------------------------------------ homeroom
  async assignHomeroom(ctx: AcademicContext, classId: string, dto: AssignHomeroomDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.assertTenantClass(tenantId, institutionId, classId);
    await this.assertActiveStaff(tenantId, institutionId, dto.staffPersonId);

    const existing = await this.prisma.homeroom.findFirst({ where: { classId, tenantId, deletedAt: null } });
    const homeroom = await this.prisma.homeroom.upsert({
      where: { classId },
      create: {
        tenantId,
        institutionId,
        classId,
        staffPersonId: dto.staffPersonId,
        assignedAt: new Date(),
        createdBy: ctx.userId,
      },
      update: {
        staffPersonId: dto.staffPersonId,
        assignedAt: new Date(),
        updatedBy: ctx.userId,
        deletedAt: null,
      },
    });
    await emitAudited(
      this.publisher,
      this.audit,
      existing ? AcademicsEvents.HomeroomChanged : AcademicsEvents.HomeroomAssigned,
      {
        tenantId,
        institutionId,
        entityType: 'homeroom',
        entityId: homeroom.id,
        actorId: ctx.userId,
        payload: { classId, staffPersonId: dto.staffPersonId },
      },
    );
    return ok(homeroom);
  }

  async getHomeroom(ctx: AcademicContext, classId: string) {
    this.assertInstitutionContext(ctx);
    const homeroom = await this.prisma.homeroom.findFirst({
      where: { classId, tenantId: ctx.tenantId, deletedAt: null },
    });
    return ok(homeroom ?? null);
  }

  // ---------------------------------------------------------------------- arms
  async createArm(ctx: AcademicContext, classId: string, dto: CreateArmDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.assertTenantClass(tenantId, institutionId, classId);
    if (dto.staffPersonId) {
      await this.assertActiveStaff(tenantId, institutionId, dto.staffPersonId);
    }
    const existing = await this.prisma.arm.findFirst({
      where: { tenantId, classId, name: dto.name, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`arm "${dto.name}" already exists for this class`);
    }
    const arm = await this.prisma.arm.create({
      data: { tenantId, institutionId, classId, ...dto, createdBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.ArmCreated, {
      tenantId,
      institutionId,
      entityType: 'arm',
      entityId: arm.id,
      actorId: ctx.userId,
      payload: { classId, name: arm.name },
    });
    return ok(arm);
  }

  async listArms(ctx: AcademicContext, classId: string, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.ArmWhereInput = {
      tenantId: ctx.tenantId,
      classId,
      deletedAt: null,
    };
    const [total, items] = await Promise.all([
      this.prisma.arm.count({ where }),
      this.prisma.arm.findMany({ where, orderBy: { name: 'asc' }, skip: (p - 1) * l, take: l }),
    ]);
    return okList(items, total, p, l);
  }

  async updateArm(ctx: AcademicContext, id: string, dto: UpdateArmDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const arm = await this.prisma.arm.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!arm) {
      throw new NotFoundException(`arm ${id} not found`);
    }
    if (dto.staffPersonId) {
      await this.assertActiveStaff(tenantId, institutionId, dto.staffPersonId);
    }
    const updated = await this.prisma.arm.update({
      where: { id },
      data: { name: dto.name, staffPersonId: dto.staffPersonId, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.ArmUpdated, {
      tenantId,
      institutionId,
      entityType: 'arm',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(updated);
  }

  async deleteArm(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const arm = await this.prisma.arm.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!arm) {
      throw new NotFoundException(`arm ${id} not found`);
    }
    const updated = await this.prisma.arm.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.ArmDeleted, {
      tenantId,
      institutionId,
      entityType: 'arm',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(updated);
  }

  private async assertActiveStaff(tenantId: string, institutionId: string, staffPersonId: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { tenantId, institutionId, personId: staffPersonId, status: 'ACTIVE' },
    });
    if (!staff) {
      throw new NotFoundException(`staff ${staffPersonId} not found or not ACTIVE`);
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
    const clazz = await this.prisma.class.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!clazz) {
      throw new NotFoundException(`class ${id} not found`);
    }
  }

  private async assertTenantTerm(tenantId: string, institutionId: string, id: string) {
    const term = await this.prisma.term.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!term) {
      throw new NotFoundException(`term ${id} not found`);
    }
  }
}