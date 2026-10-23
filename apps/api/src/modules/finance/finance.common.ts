import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventPublisher } from '../events/event-publisher';
import { AuditService } from '../audit/audit.service';
import { FinanceContext } from './finance.types';

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
 * Shared base infrastructure for every finance service: scoped tenant +
 * institution resolution (Finance spec BR-01) and the D-4 emit+audit helper
 * wiring used by P6.1. All scope predicates are built from the trusted JWT
 * context, never from client input.
 */
@Injectable()
export abstract class FinanceServiceBase {
  protected constructor(
    protected readonly prisma: PrismaService,
    protected readonly publisher: EventPublisher,
    protected readonly audit: AuditService,
  ) {}

  protected assertInstitutionContext(ctx: FinanceContext): string {
    if (!ctx.institutionId) {
      throw new ForbiddenException(
        'finance operations require an institution context',
      );
    }
    return ctx.institutionId;
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
}

export type PagedSlice = { page: number; limit: number };
