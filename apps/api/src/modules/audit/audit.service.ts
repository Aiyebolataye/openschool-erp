import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Append-only audit persistence (P1.7 / decisions D-B5-2, D-B5-3).
 *
 * - `record` accepts only a fixed set of explicit, whitelisted fields. The raw
 *   event payload is never spread into the row, so event drift cannot smuggle
 *   unexpected data into the audit trail.
 * - The service exposes no update/delete path. The DB-level
 *   `audit_logs_append_only` trigger (B5 migration) enforces immutability for
 *   any other writer, including ad-hoc prisma-system resets.
 */
export interface AuditRecordInput {
  tenantId: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues?: Prisma.InputJsonValue | null;
  newValues?: Prisma.InputJsonValue | null;
  changes?: Prisma.InputJsonValue | null;
  contextIp?: string | null;
  contextUserAgent?: string | null;
  correlationId?: string | null;
}

const PAGE_MAX = 100;

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private captureActorEmail(): boolean {
    return this.config.get<boolean>('audit.actorEmailCapture', true);
  }

  async record(input: AuditRecordInput): Promise<void> {
    const data: Prisma.AuditLogCreateInput = {
      tenant: input.tenantId
        ? { connect: { id: input.tenantId } }
        : undefined,
      actorId: input.actorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      oldValues: input.oldValues == null ? null : JSON.stringify(input.oldValues),
      newValues: input.newValues == null ? null : JSON.stringify(input.newValues),
      changes: input.changes ?? Prisma.JsonNull,
      contextIp: input.contextIp || null,
      contextUserAgent: input.contextUserAgent || null,
      correlationId: input.correlationId || null,
      ...(this.captureActorEmail() ? { actorEmail: input.actorEmail ?? null } : {}),
    };

    await this.prisma.auditLog.create({ data });
  }

  async list(
    tenantId: string,
    query: { page?: number; limit?: number; action?: string },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.AuditLogWhereInput = {
      tenantId,
      ...(query.action ? { action: query.action } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      success: true as const,
      data: {
        items,
        total,
        page,
        limit,
      },
    };
  }

  async findById(tenantId: string, id: string) {
    const row = await this.prisma.auditLog.findFirst({
      where: { id, tenantId },
    });
    return row;
  }
}