import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClassStatus, GradeLevelStatus, SubjectStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { AcademicContext } from '../academic.types';
import { AcademicServiceBase, boundedPage, institutionWhere, ok, okList } from '../academics.common';
import { AcademicsEvents, emitAudited } from '../academics.events';
import {
  CreateClassDto,
  CreateDepartmentDto,
  CreateStreamDto,
  CreateSubjectDto,
  CreateSubjectGroupDto,
  GradeLevelDto,
  GrantSubjectsDto,
  UpdateClassDto,
  UpdateDepartmentDto,
  UpdateGradeLevelDto,
  UpdateStreamDto,
  UpdateSubjectDto,
  UpdateSubjectGroupDto,
} from '../dto/curriculum.dto';

@Injectable()
export class CurriculumService extends AcademicServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  // ------------------------------------------------------------- departments
  async createDepartment(ctx: AcademicContext, dto: CreateDepartmentDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);

    const existing = await this.prisma.department.findFirst({
      where: { tenantId, institutionId, name: dto.name, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`department "${dto.name}" already exists`);
    }
    if (dto.headStaffId) {
      await this.assertStaffExists(tenantId, institutionId, dto.headStaffId);
    }
    const department = await this.prisma.department.create({
      data: {
        tenantId,
        institutionId,
        name: dto.name,
        headStaffId: dto.headStaffId,
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.DepartmentCreated, {
      tenantId,
      institutionId,
      entityType: 'department',
      entityId: department.id,
      actorId: ctx.userId,
      payload: { name: department.name },
    });
    return ok(department);
  }

  async listDepartments(ctx: AcademicContext, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.DepartmentWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      deletedAt: null,
    };
    const [total, items] = await Promise.all([
      this.prisma.department.count({ where }),
      this.prisma.department.findMany({ where, orderBy: { name: 'asc' }, skip: (p - 1) * l, take: l }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolveDepartment(tenantId: string, institutionId: string, id: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!department) {
      throw new NotFoundException(`department ${id} not found`);
    }
    return department;
  }

  async getDepartment(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    return ok(await this.resolveDepartment(ctx.tenantId, ctx.institutionId as string, id));
  }

  async updateDepartment(ctx: AcademicContext, id: string, dto: UpdateDepartmentDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveDepartment(tenantId, institutionId, id);
    if (dto.headStaffId) {
      await this.assertStaffExists(tenantId, institutionId, dto.headStaffId);
    }
    const department = await this.prisma.department.update({
      where: { id },
      data: { name: dto.name, headStaffId: dto.headStaffId, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.DepartmentUpdated, {
      tenantId,
      institutionId,
      entityType: 'department',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(department);
  }

  async deleteDepartment(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveDepartment(tenantId, institutionId, id);
    const subjects = await this.prisma.subject.count({ where: { departmentId: id, tenantId, deletedAt: null } });
    if (subjects > 0) {
      throw new ConflictException(`department ${id} has ${subjects} subject(s); unassign them first`);
    }
    const department = await this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.DepartmentDeleted, {
      tenantId,
      institutionId,
      entityType: 'department',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(department);
  }

  private async assertStaffExists(tenantId: string, institutionId: string, staffPersonId: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { tenantId, institutionId, personId: staffPersonId, status: 'ACTIVE' },
    });
    if (!staff) {
      throw new NotFoundException(`staff ${staffPersonId} not found or not ACTIVE`);
    }
  }

  // ---------------------------------------------------------------- subjects
  async createSubject(ctx: AcademicContext, dto: CreateSubjectDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);

    const existing = await this.prisma.subject.findFirst({
      where: { tenantId, institutionId, code: dto.code, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`subject code "${dto.code}" already exists`);
    }
    if (dto.departmentId) {
      await this.resolveDepartment(tenantId, institutionId, dto.departmentId);
    }
    const subject = await this.prisma.subject.create({
      data: {
        tenantId,
        institutionId,
        departmentId: dto.departmentId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SubjectCreated, {
      tenantId,
      institutionId,
      entityType: 'subject',
      entityId: subject.id,
      actorId: ctx.userId,
      payload: { name: subject.name, code: subject.code },
    });
    return ok(subject);
  }

  async listSubjects(ctx: AcademicContext, page?: number, limit?: number, departmentId?: string) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.SubjectWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      deletedAt: null,
      ...(departmentId ? { departmentId } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.subject.count({ where }),
      this.prisma.subject.findMany({ where, orderBy: { name: 'asc' }, skip: (p - 1) * l, take: l }),
    ]);
    return okList(items, total, p, l);
  }

  async getSubject(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    return ok(await this.resolveSubject(ctx.tenantId, ctx.institutionId as string, id));
  }

  private async resolveSubject(tenantId: string, institutionId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!subject) {
      throw new NotFoundException(`subject ${id} not found`);
    }
    return subject;
  }

  async updateSubject(ctx: AcademicContext, id: string, dto: UpdateSubjectDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveSubject(tenantId, institutionId, id);
    if (dto.departmentId) {
      await this.resolveDepartment(tenantId, institutionId, dto.departmentId);
    }
    const subject = await this.prisma.subject.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        departmentId: dto.departmentId,
        status: dto.status,
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SubjectUpdated, {
      tenantId,
      institutionId,
      entityType: 'subject',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(subject);
  }

  async activateSubject(ctx: AcademicContext, id: string) {
    return this.setSubjectStatus(ctx, id, SubjectStatus.ACTIVE, AcademicsEvents.SubjectActivated);
  }

  async deactivateSubject(ctx: AcademicContext, id: string) {
    return this.setSubjectStatus(ctx, id, SubjectStatus.INACTIVE, AcademicsEvents.SubjectDeactivated);
  }

  private async setSubjectStatus(ctx: AcademicContext, id: string, status: SubjectStatus, event: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveSubject(tenantId, institutionId, id);
    const subject = await this.prisma.subject.update({
      where: { id },
      data: { status, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, event as never, {
      tenantId,
      institutionId,
      entityType: 'subject',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: status },
    });
    return ok(subject);
  }

  async deleteSubject(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveSubject(tenantId, institutionId, id);
    const usages = await this.prisma.teachingAssignment.count({ where: { subjectId: id, tenantId, deletedAt: null } });
    if (usages > 0) {
      throw new ConflictException(`subject ${id} has ${usages} teaching assignment(s)`);
    }
    const subject = await this.prisma.subject.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId, status: SubjectStatus.INACTIVE },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SubjectDeleted, {
      tenantId,
      institutionId,
      entityType: 'subject',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(subject);
  }

  // ----------------------------------------------------------- subject groups
  async createSubjectGroup(ctx: AcademicContext, dto: CreateSubjectGroupDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);

    const existing = await this.prisma.subjectGroup.findFirst({
      where: { tenantId, institutionId, name: dto.name, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`subject group "${dto.name}" already exists`);
    }
    const group = await this.prisma.subjectGroup.create({
      data: {
        tenantId,
        institutionId,
        name: dto.name,
        description: dto.description,
        createdBy: ctx.userId,
        ...(dto.subjectIds?.length
          ? { subjects: { create: dto.subjectIds.map((subjectId) => ({ tenantId, subjectId })) } }
          : {}),
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SubjectGroupCreated, {
      tenantId,
      institutionId,
      entityType: 'subjectGroup',
      entityId: group.id,
      actorId: ctx.userId,
      payload: { name: group.name },
    });
    return ok(group);
  }

  async listSubjectGroups(ctx: AcademicContext, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.SubjectGroupWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      deletedAt: null,
    };
    const [total, items] = await Promise.all([
      this.prisma.subjectGroup.count({ where }),
      this.prisma.subjectGroup.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (p - 1) * l,
        take: l,
        include: { subjects: { select: { subject: true } } },
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolveSubjectGroup(tenantId: string, institutionId: string, id: string) {
    const group = await this.prisma.subjectGroup.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!group) {
      throw new NotFoundException(`subject group ${id} not found`);
    }
    return group;
  }

  async getSubjectGroup(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveSubjectGroup(tenantId, institutionId, id);
    const group = await this.prisma.subjectGroup.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { subjects: { select: { subject: true } } },
    });
    return ok(group);
  }

  async updateSubjectGroup(ctx: AcademicContext, id: string, dto: UpdateSubjectGroupDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveSubjectGroup(tenantId, institutionId, id);
    const group = await this.prisma.subjectGroup.update({
      where: { id },
      data: { name: dto.name, description: dto.description, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SubjectGroupUpdated, {
      tenantId,
      institutionId,
      entityType: 'subjectGroup',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(group);
  }

  async addSubjectsToGroup(ctx: AcademicContext, id: string, dto: GrantSubjectsDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveSubjectGroup(tenantId, institutionId, id);
    const existing = await this.prisma.subjectSubjectGroup.findMany({
      where: { tenantId, subjectGroupId: id, subjectId: { in: dto.subjectIds } },
      select: { subjectId: true },
    });
    const existingIds = new Set(existing.map((row) => row.subjectId));
    const fresh = dto.subjectIds.filter((subjectId) => !existingIds.has(subjectId));
    if (fresh.length > 0) {
      await this.prisma.subjectSubjectGroup.createMany({
        data: fresh.map((subjectId) => ({ tenantId, institutionId, subjectId, subjectGroupId: id })),
        skipDuplicates: true,
      });
    }
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SubjectGroupSubjectAdded, {
      tenantId,
      institutionId,
      entityType: 'subjectGroup',
      entityId: id,
      actorId: ctx.userId,
      changes: { added: fresh.length, existing: dto.subjectIds.length - fresh.length } as never,
    });
    return ok({ added: fresh.length });
  }

  async removeSubjectFromGroup(ctx: AcademicContext, id: string, subjectId: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveSubjectGroup(tenantId, institutionId, id);
    const deleted = await this.prisma.subjectSubjectGroup.deleteMany({
      where: { tenantId, subjectGroupId: id, subjectId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SubjectGroupSubjectRemoved, {
      tenantId,
      institutionId,
      entityType: 'subjectGroup',
      entityId: id,
      actorId: ctx.userId,
      changes: { subjectId, removed: deleted.count } as never,
    });
    return ok({ removed: deleted.count });
  }

  async deleteSubjectGroup(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveSubjectGroup(tenantId, institutionId, id);
    await this.prisma.subjectSubjectGroup.deleteMany({ where: { tenantId, subjectGroupId: id } });
    const group = await this.prisma.subjectGroup.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SubjectGroupDeleted, {
      tenantId,
      institutionId,
      entityType: 'subjectGroup',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(group);
  }

  // ------------------------------------------------------------- grade levels
  async createGradeLevel(ctx: AcademicContext, dto: GradeLevelDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);
    const existing = await this.prisma.gradeLevel.findFirst({
      where: { tenantId, institutionId, name: dto.name, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`grade level "${dto.name}" already exists`);
    }
    const level = await this.prisma.gradeLevel.create({
      data: { tenantId, institutionId, name: dto.name, displayOrder: dto.displayOrder, createdBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.GradeLevelCreated, {
      tenantId,
      institutionId,
      entityType: 'gradeLevel',
      entityId: level.id,
      actorId: ctx.userId,
      payload: { name: level.name, displayOrder: level.displayOrder },
    });
    return ok(level);
  }

  async listGradeLevels(ctx: AcademicContext, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.GradeLevelWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      deletedAt: null,
    };
    const [total, items] = await Promise.all([
      this.prisma.gradeLevel.count({ where }),
      this.prisma.gradeLevel.findMany({ where, orderBy: { displayOrder: 'asc' }, skip: (p - 1) * l, take: l }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolveGradeLevel(tenantId: string, institutionId: string, id: string) {
    const level = await this.prisma.gradeLevel.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!level) {
      throw new NotFoundException(`grade level ${id} not found`);
    }
    return level;
  }

  async getGradeLevel(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    return ok(await this.resolveGradeLevel(ctx.tenantId, ctx.institutionId as string, id));
  }

  async updateGradeLevel(ctx: AcademicContext, id: string, dto: UpdateGradeLevelDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveGradeLevel(tenantId, institutionId, id);
    const level = await this.prisma.gradeLevel.update({
      where: { id },
      data: {
        name: dto.name,
        displayOrder: dto.displayOrder,
        status: dto.status,
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.GradeLevelUpdated, {
      tenantId,
      institutionId,
      entityType: 'gradeLevel',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status } as never,
    });
    return ok(level);
  }

  async deleteGradeLevel(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveGradeLevel(tenantId, institutionId, id);
    const classes = await this.prisma.class.count({ where: { gradeLevelId: id, tenantId, deletedAt: null } });
    if (classes > 0) {
      throw new ConflictException(`grade level ${id} has ${classes} class(es)`);
    }
    const level = await this.prisma.gradeLevel.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId, status: GradeLevelStatus.INACTIVE },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.GradeLevelDeleted, {
      tenantId,
      institutionId,
      entityType: 'gradeLevel',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(level);
  }

  // ------------------------------------------------------------------ streams
  async createStream(ctx: AcademicContext, gradeLevelId: string, dto: CreateStreamDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveGradeLevel(tenantId, institutionId, gradeLevelId);
    const existing = await this.prisma.stream.findFirst({
      where: { tenantId, institutionId, name: dto.name, gradeLevelId, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`stream "${dto.name}" already exists for this grade level`);
    }
    const stream = await this.prisma.stream.create({
      data: { tenantId, institutionId, gradeLevelId, name: dto.name, createdBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.StreamCreated, {
      tenantId,
      institutionId,
      entityType: 'stream',
      entityId: stream.id,
      actorId: ctx.userId,
      payload: { name: stream.name, gradeLevelId },
    });
    return ok(stream);
  }

  async listStreams(ctx: AcademicContext, gradeLevelId?: string, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.StreamWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      deletedAt: null,
      ...(gradeLevelId ? { gradeLevelId } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.stream.count({ where }),
      this.prisma.stream.findMany({ where, orderBy: { name: 'asc' }, skip: (p - 1) * l, take: l }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolveStream(tenantId: string, institutionId: string, id: string) {
    const stream = await this.prisma.stream.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!stream) {
      throw new NotFoundException(`stream ${id} not found`);
    }
    return stream;
  }

  async updateStream(ctx: AcademicContext, id: string, dto: UpdateStreamDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveStream(tenantId, institutionId, id);
    const stream = await this.prisma.stream.update({
      where: { id },
      data: { name: dto.name, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.StreamUpdated, {
      tenantId,
      institutionId,
      entityType: 'stream',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(stream);
  }

  async deleteStream(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveStream(tenantId, institutionId, id);
    const classes = await this.prisma.class.count({ where: { streamId: id, tenantId, deletedAt: null } });
    if (classes > 0) {
      throw new ConflictException(`stream ${id} has ${classes} class(es)`);
    }
    const stream = await this.prisma.stream.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.StreamDeleted, {
      tenantId,
      institutionId,
      entityType: 'stream',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(stream);
  }

  // ------------------------------------------------------------------- classes
  async createClass(ctx: AcademicContext, dto: CreateClassDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);
    await this.resolveGradeLevel(tenantId, institutionId, dto.gradeLevelId);
    if (dto.streamId) {
      const stream = await this.resolveStream(tenantId, institutionId, dto.streamId);
      if (stream.gradeLevelId !== dto.gradeLevelId) {
        throw new ConflictException('stream does not belong to the given grade level');
      }
    }
    const existing = await this.prisma.class.findFirst({
      where: { tenantId, institutionId, gradeLevelId: dto.gradeLevelId, name: dto.name, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`class "${dto.name}" already exists for this grade level`);
    }
    const clazz = await this.prisma.class.create({
      data: {
        tenantId,
        institutionId,
        gradeLevelId: dto.gradeLevelId,
        streamId: dto.streamId,
        name: dto.name,
        capacity: dto.capacity,
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.ClassCreated, {
      tenantId,
      institutionId,
      entityType: 'class',
      entityId: clazz.id,
      actorId: ctx.userId,
      payload: { name: clazz.name },
    });
    return ok(clazz);
  }

  async listClasses(ctx: AcademicContext, gradeLevelId?: string, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.ClassWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      deletedAt: null,
      ...(gradeLevelId ? { gradeLevelId } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.class.count({ where }),
      this.prisma.class.findMany({
        where,
        orderBy: [{ gradeLevel: { displayOrder: 'asc' } }, { name: 'asc' }],
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(items, total, p, l);
  }

  async getClass(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    return ok(await this.resolveClass(ctx.tenantId, ctx.institutionId as string, id));
  }

  private async resolveClass(tenantId: string, institutionId: string, id: string) {
    const clazz = await this.prisma.class.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!clazz) {
      throw new NotFoundException(`class ${id} not found`);
    }
    return clazz;
  }

  async updateClass(ctx: AcademicContext, id: string, dto: UpdateClassDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveClass(tenantId, institutionId, id);
    const clazz = await this.prisma.class.update({
      where: { id },
      data: {
        name: dto.name,
        capacity: dto.capacity,
        status: dto.status,
        streamId: dto.streamId,
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.ClassUpdated, {
      tenantId,
      institutionId,
      entityType: 'class',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: clazz.status } as never,
    });
    return ok(clazz);
  }

  async activateClass(ctx: AcademicContext, id: string) {
    return this.setClassStatus(ctx, id, ClassStatus.ACTIVE, AcademicsEvents.ClassActivated);
  }

  async deactivateClass(ctx: AcademicContext, id: string) {
    return this.setClassStatus(ctx, id, ClassStatus.INACTIVE, AcademicsEvents.ClassDeactivated);
  }

  private async setClassStatus(ctx: AcademicContext, id: string, status: ClassStatus, event: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveClass(tenantId, institutionId, id);
    const clazz = await this.prisma.class.update({ where: { id }, data: { status, updatedBy: ctx.userId } });
    await emitAudited(this.publisher, this.audit, event as never, {
      tenantId,
      institutionId,
      entityType: 'class',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: status },
    });
    return ok(clazz);
  }

  async deleteClass(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveClass(tenantId, institutionId, id);
    const enrollments = await this.prisma.studentClassEnrollment.count({ where: { classId: id, tenantId, deletedAt: null } });
    if (enrollments > 0) {
      throw new ConflictException(`class ${id} has ${enrollments} enrollment(s)`);
    }
    const clazz = await this.prisma.class.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId, status: ClassStatus.INACTIVE },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.ClassDeleted, {
      tenantId,
      institutionId,
      entityType: 'class',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(clazz);
  }
}