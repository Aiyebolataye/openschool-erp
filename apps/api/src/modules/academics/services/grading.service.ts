import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GradeScaleStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { AcademicContext } from '../academic.types';
import { AcademicServiceBase, boundedPage, institutionWhere, ok, okList } from '../academics.common';
import { AcademicsEvents, emitAudited } from '../academics.events';
import {
  AddBoundaryDto,
  AddRemarkDto,
  CreateGradeScaleDto,
  UpdateBoundaryDto,
  UpdateGradeScaleDto,
  UpdateRemarkDto,
} from '../dto/academic-admin.dto';

export interface ResolvedGrade {
  grade: string;
  remark: string | null;
  boundaryId: string | null;
}

@Injectable()
export class GradingService extends AcademicServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  // ------------------------------------------------------------------- scales
  async createScale(ctx: AcademicContext, dto: CreateGradeScaleDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);
    const existing = await this.prisma.gradeScale.findFirst({
      where: { tenantId, institutionId, name: dto.name, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`grade scale "${dto.name}" already exists`);
    }
    const scale = await this.prisma.gradeScale.create({
      data: { tenantId, institutionId, name: dto.name, description: dto.description, createdBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.GradeScaleCreated, {
      tenantId,
      institutionId,
      entityType: 'gradeScale',
      entityId: scale.id,
      actorId: ctx.userId,
      payload: { name: scale.name },
    });
    return ok(scale);
  }

  async listScales(ctx: AcademicContext, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.GradeScaleWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      deletedAt: null,
    };
    const [total, items] = await Promise.all([
      this.prisma.gradeScale.count({ where }),
      this.prisma.gradeScale.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolveScale(tenantId: string, institutionId: string, id: string) {
    const scale = await this.prisma.gradeScale.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!scale) {
      throw new NotFoundException(`grade scale ${id} not found`);
    }
    return scale;
  }

  async getScale(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveScale(tenantId, institutionId, id);
    const scale = await this.prisma.gradeScale.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        boundaries: { orderBy: { displayOrder: 'asc' } },
        remarks: { orderBy: { minScore: 'asc' } },
      },
    });
    return ok(scale);
  }

  async updateScale(ctx: AcademicContext, id: string, dto: UpdateGradeScaleDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveScale(tenantId, institutionId, id);
    const scale = await this.prisma.gradeScale.update({
      where: { id },
      data: { name: dto.name, description: dto.description, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.GradeScaleUpdated, {
      tenantId,
      institutionId,
      entityType: 'gradeScale',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(scale);
  }

  async activateScale(ctx: AcademicContext, id: string) {
    return this.transitionScale(ctx, id, GradeScaleStatus.ACTIVE, AcademicsEvents.GradeScaleActivated);
  }

  async deactivateScale(ctx: AcademicContext, id: string) {
    return this.transitionScale(ctx, id, GradeScaleStatus.INACTIVE, AcademicsEvents.GradeScaleActivated);
  }

  private async transitionScale(ctx: AcademicContext, id: string, next: GradeScaleStatus, event: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveScale(tenantId, institutionId, id);
    if (next === GradeScaleStatus.ACTIVE) {
      const boundaries = await this.prisma.gradeBoundary.count({ where: { gradeScaleId: id, tenantId } });
      if (boundaries === 0) {
        throw new ConflictException('cannot activate a scale with no boundaries');
      }
    }
    const scale = await this.prisma.gradeScale.update({
      where: { id },
      data: { status: next, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, event as never, {
      tenantId,
      institutionId,
      entityType: 'gradeScale',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: next },
    });
    return ok(scale);
  }

  async deleteScale(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveScale(tenantId, institutionId, id);
    const results = await this.prisma.result.count({ where: { gradeScaleId: id, tenantId } });
    if (results > 0) {
      throw new ConflictException(`scale ${id} is referenced by ${results} result(s)`);
    }
    await this.prisma.gradeBoundary.deleteMany({ where: { gradeScaleId: id, tenantId } });
    await this.prisma.remark.deleteMany({ where: { gradeScaleId: id, tenantId } });
    const scale = await this.prisma.gradeScale.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId, status: GradeScaleStatus.INACTIVE },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.GradeScaleDeleted, {
      tenantId,
      institutionId,
      entityType: 'gradeScale',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(scale);
  }

  /** Active scale for results compilation; prefers ACTIVE, else the provided DRAFT. */
  async resolveActiveScale(tenantId: string, institutionId: string): Promise<{ id: string }> {
    const active = await this.prisma.gradeScale.findFirst({
      where: { tenantId, institutionId, status: GradeScaleStatus.ACTIVE, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
    if (!active) {
      throw new ConflictException('no ACTIVE grade scale configured for results compilation');
    }
    return active;
  }

  /**
   * Resolve grade + remark + boundary for a percentage score. Ranges are
   * [minScore, maxScore]; a score exactly at a boundary minScore matches the
   * higher boundary (verified against seed Standard Scale A70-100 / B60-69.99).
   */
  async resolveGrade(
    tenantId: string,
    institutionId: string,
    scaleId: string,
    score: number,
  ): Promise<ResolvedGrade> {
    const boundaries = await this.prisma.gradeBoundary.findMany({
      where: { gradeScaleId: scaleId, tenantId, deletedAt: null },
      orderBy: { minScore: 'desc' },
    });
    if (boundaries.length === 0) {
      throw new ConflictException(`grade scale ${scaleId} has no boundaries`);
    }
    const boundary = boundaries.find(
      (row) => score >= Number(row.minScore) && score <= Number(row.maxScore),
    );
    if (!boundary) {
      throw new ConflictException(`score ${score} falls outside every grade boundary`);
    }
    const remark = await this.prisma.remark.findFirst({
      where: { gradeScaleId: scaleId, tenantId, minScore: { lte: score }, maxScore: { gte: score } },
    });
    return {
      grade: boundary.grade,
      remark: boundary.remark ?? remark?.remarkText ?? null,
      boundaryId: boundary.id,
    };
  }

  // ---------------------------------------------------------------- boundaries
  async addBoundary(ctx: AcademicContext, scaleId: string, dto: AddBoundaryDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const scale = await this.resolveScale(tenantId, institutionId, scaleId);
    if (scale.status !== GradeScaleStatus.DRAFT) {
      throw new ConflictException('boundaries can only be added to a DRAFT scale');
    }
    this.assertBoundaryRange(dto.minScore, dto.maxScore);
    const existing = await this.prisma.gradeBoundary.findFirst({
      where: { tenantId, gradeScaleId: scaleId, grade: dto.grade },
    });
    if (existing) {
      throw new ConflictException(`boundary grade "${dto.grade}" already exists`);
    }
    await this.assertNoOverlap(tenantId, scaleId, dto.minScore, dto.maxScore, null);
    const boundary = await this.prisma.gradeBoundary.create({
      data: {
        tenantId,
        institutionId,
        gradeScaleId: scaleId,
        grade: dto.grade,
        minScore: dto.minScore,
        maxScore: dto.maxScore,
        remark: dto.remark,
        displayOrder: dto.displayOrder,
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.GradeBoundaryAdded, {
      tenantId,
      institutionId,
      entityType: 'gradeBoundary',
      entityId: boundary.id,
      actorId: ctx.userId,
      changes: { gradeScaleId: scaleId, grade: dto.grade, minScore: dto.minScore, maxScore: dto.maxScore },
    });
    return ok(boundary);
  }

  async listBoundaries(ctx: AcademicContext, scaleId: string, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const tenantId = ctx.tenantId;
    await this.resolveScale(tenantId, ctx.institutionId as string, scaleId);
    const where: Prisma.GradeBoundaryWhereInput = { tenantId, gradeScaleId: scaleId, deletedAt: null };
    const [total, items] = await Promise.all([
      this.prisma.gradeBoundary.count({ where }),
      this.prisma.gradeBoundary.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(items, total, p, l);
  }

  async updateBoundary(ctx: AcademicContext, id: string, dto: UpdateBoundaryDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const boundary = await this.prisma.gradeBoundary.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!boundary) {
      throw new NotFoundException(`grade boundary ${id} not found`);
    }
    const scale = await this.resolveScale(tenantId, institutionId, boundary.gradeScaleId);
    if (scale.status !== GradeScaleStatus.DRAFT) {
      throw new ConflictException('boundaries can only be edited on a DRAFT scale');
    }
    const minScore = dto.minScore ?? Number(boundary.minScore);
    const maxScore = dto.maxScore ?? Number(boundary.maxScore);
    this.assertBoundaryRange(minScore, maxScore);
    if (dto.grade && dto.grade !== boundary.grade) {
      const dup = await this.prisma.gradeBoundary.findFirst({
        where: { tenantId, gradeScaleId: scale.id, grade: dto.grade, id: { not: id } },
      });
      if (dup) throw new ConflictException(`boundary grade "${dto.grade}" already exists`);
    }
    await this.assertNoOverlap(tenantId, boundary.gradeScaleId, minScore, maxScore, id);
    const updated = await this.prisma.gradeBoundary.update({
      where: { id },
      data: {
        grade: dto.grade,
        minScore,
        maxScore,
        remark: dto.remark,
        displayOrder: dto.displayOrder,
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.GradeBoundaryUpdated, {
      tenantId,
      institutionId,
      entityType: 'gradeBoundary',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(updated);
  }

  async removeBoundary(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const boundary = await this.prisma.gradeBoundary.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!boundary) {
      throw new NotFoundException(`grade boundary ${id} not found`);
    }
    const scale = await this.resolveScale(tenantId, institutionId, boundary.gradeScaleId);
    if (scale.status !== GradeScaleStatus.DRAFT) {
      throw new ConflictException('boundaries can only be removed from a DRAFT scale');
    }
    const updated = await this.prisma.gradeBoundary.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.GradeBoundaryRemoved, {
      tenantId,
      institutionId,
      entityType: 'gradeBoundary',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(updated);
  }

  // ------------------------------------------------------------------- remarks
  async addRemark(ctx: AcademicContext, scaleId: string, dto: AddRemarkDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const scale = await this.resolveScale(tenantId, institutionId, scaleId);
    if (scale.status !== GradeScaleStatus.DRAFT) {
      throw new ConflictException('remarks can only be added to a DRAFT scale');
    }
    this.assertBoundaryRange(dto.minScore, dto.maxScore);
    const remark = await this.prisma.remark.create({
      data: {
        tenantId,
        institutionId,
        gradeScaleId: scaleId,
        minScore: dto.minScore,
        maxScore: dto.maxScore,
        remarkText: dto.remarkText,
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.RemarkAdded, {
      tenantId,
      institutionId,
      entityType: 'remark',
      entityId: remark.id,
      actorId: ctx.userId,
      changes: { gradeScaleId: scaleId, minScore: dto.minScore, maxScore: dto.maxScore },
    });
    return ok(remark);
  }

  async listRemarks(ctx: AcademicContext, scaleId: string, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const tenantId = ctx.tenantId;
    await this.resolveScale(tenantId, ctx.institutionId as string, scaleId);
    const where: Prisma.RemarkWhereInput = { tenantId, gradeScaleId: scaleId, deletedAt: null };
    const [total, items] = await Promise.all([
      this.prisma.remark.count({ where }),
      this.prisma.remark.findMany({ where, orderBy: { minScore: 'asc' }, skip: (p - 1) * l, take: l }),
    ]);
    return okList(items, total, p, l);
  }

  async updateRemark(ctx: AcademicContext, id: string, dto: UpdateRemarkDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const remark = await this.prisma.remark.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!remark) {
      throw new NotFoundException(`remark ${id} not found`);
    }
    const scale = await this.resolveScale(tenantId, institutionId, remark.gradeScaleId);
    if (scale.status !== GradeScaleStatus.DRAFT) {
      throw new ConflictException('remarks can only be edited on a DRAFT scale');
    }
    const minScore = dto.minScore ?? Number(remark.minScore);
    const maxScore = dto.maxScore ?? Number(remark.maxScore);
    this.assertBoundaryRange(minScore, maxScore);
    const updated = await this.prisma.remark.update({
      where: { id },
      data: {
        minScore,
        maxScore,
        remarkText: dto.remarkText,
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.RemarkUpdated, {
      tenantId,
      institutionId,
      entityType: 'remark',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(updated);
  }

  async removeRemark(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const remark = await this.prisma.remark.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!remark) {
      throw new NotFoundException(`remark ${id} not found`);
    }
    const scale = await this.resolveScale(tenantId, institutionId, remark.gradeScaleId);
    if (scale.status !== GradeScaleStatus.DRAFT) {
      throw new ConflictException('remarks can only be removed from a DRAFT scale');
    }
    const updated = await this.prisma.remark.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.RemarkRemoved, {
      tenantId,
      institutionId,
      entityType: 'remark',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(updated);
  }

  private assertBoundaryRange(min: number, max: number) {
    if (min > max) {
      throw new BadRequestException('minScore must not exceed maxScore');
    }
    if (min < 0 || max > 100) {
      throw new BadRequestException('boundary scores must be within 0..100');
    }
  }

  private async assertNoOverlap(
    tenantId: string,
    scaleId: string,
    min: number,
    max: number,
    excludeId: string | null,
  ) {
    const collisions = await this.prisma.gradeBoundary.count({
      where: {
        tenantId,
        gradeScaleId: scaleId,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
        AND: [{ minScore: { lte: max } }, { maxScore: { gte: min } }],
      },
    });
    if (collisions > 0) {
      throw new ConflictException('boundary range overlaps an existing boundary');
    }
  }
}