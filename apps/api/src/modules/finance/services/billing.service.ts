import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BillStatus, FeeScheduleStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { FinanceContext } from '../finance.types';
import {
  FinanceServiceBase,
  boundedPage,
  institutionWhere,
  ok,
  okList,
} from '../finance.common';
import { FinanceEvents, emitFinanceEventAudited } from '../finance.events';
import { decimalToString } from '../dto/fee.dto';
import { CancelBillDto, GenerateBillDto } from '../dto/bill.dto';

type BillRow = Prisma.BillGetPayload<Record<string, never>>;

/**
 * P6.2 — Billing service (frozen Finance §5.6, §5.7 BR-03, §6.4 I-22, §7.2
 * bills, §9.8 Bill -> Invoice -> Payment flow, §10.3 Bills).
 *
 * Scope note: this service covers bill generation and cancellation only.
 * `POST /bills/:id/convert` (finance:bill:convert) is intentionally absent —
 * conversion creates an `invoices` row, and the spec-conformant invoice table
 * cannot exist while the pre-P6.1 legacy `invoices` table holds the frozen name.
 * That archival is a separate, gated decision, so no conversion path exists here
 * rather than one writing to a non-conformant table.
 */
@Injectable()
export class BillingService extends FinanceServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  /**
   * Generates one bill for one student from a published fee schedule.
   *
   * Decisions taken here, each traceable to the frozen spec:
   *
   * - The schedule must be PUBLISHED. §5.6 gives FeeSchedule a single forward
   *   transition (Draft -> Published) and §9.8 step 3 turns a published schedule
   *   into a charge, so a DRAFT schedule is not yet an authoritative price list.
   * - The total is the sum of every non-deleted schedule item. §7.2 defines
   *   `mandatory` only as a flag ("false = optional fee") and states no rule that
   *   excludes optional items from the bill, so none are excluded. The mandatory
   *   and optional subtotals are reported in the event payload so the split is
   *   visible to audit rather than buried in the total.
   * - No discount, scholarship or tax is applied. §9.8 applies those at steps
   *   4-5, i.e. on the way to the invoice, and discount application is
   *   invoice-scoped (§7.2 discount_applications) which is not available yet.
   */
  async generateBill(ctx: FinanceContext, dto: GenerateBillDto) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    await this.resolveInstitution(tenantId, institutionId);

    const schedule = await this.prisma.feeSchedule.findFirst({
      where: {
        id: dto.feeScheduleId,
        tenantId,
        institutionId,
        deletedAt: null,
      },
      include: { items: { include: { feeItem: true } } },
    });
    if (!schedule) {
      throw new NotFoundException(`fee schedule ${dto.feeScheduleId} not found`);
    }
    if (schedule.status !== FeeScheduleStatus.PUBLISHED) {
      throw new ConflictException(
        `fee schedule ${schedule.id} must be published before bills can be generated from it`,
      );
    }

    // §7.2 bills.student_person_id — People domain Student, verified by lookup
    // (cross-domain UUID, §8.2). "Must be active" is a V-INV-01 rule that belongs
    // to invoice generation, so only existence is required here.
    const student = await this.prisma.student.findFirst({
      where: {
        personId: dto.studentPersonId,
        tenantId,
        institutionId,
      },
      select: { id: true, personId: true },
    });
    if (!student) {
      throw new NotFoundException(
        `student person ${dto.studentPersonId} not found in institution ${institutionId}`,
      );
    }

    if (dto.termId) {
      const term = await this.prisma.term.findFirst({
        where: { id: dto.termId, tenantId, institutionId },
        select: { id: true },
      });
      if (!term) {
        throw new NotFoundException(
          `term ${dto.termId} not found in institution ${institutionId}`,
        );
      }
    }

    // Guard against billing the same student twice from one schedule. §7.2
    // declares no unique key on bills, but BR-03 makes the bill the charge for
    // that student against that schedule, so a second active bill for the same
    // pair would silently double-charge. Cancelled bills do not block a regen.
    const existingActive = await this.prisma.bill.findFirst({
      where: {
        tenantId,
        institutionId,
        studentPersonId: dto.studentPersonId,
        feeScheduleId: schedule.id,
        deletedAt: null,
        status: { in: [BillStatus.GENERATED, BillStatus.SENT] },
      },
      select: { id: true, status: true },
    });
    if (existingActive) {
      throw new ConflictException(
        `student person ${dto.studentPersonId} already has a ${existingActive.status} bill for schedule ${schedule.id}`,
      );
    }

    const items = schedule.items.filter((item) => item.deletedAt === null);
    let total = new Prisma.Decimal(0);
    let mandatoryTotal = new Prisma.Decimal(0);
    let optionalTotal = new Prisma.Decimal(0);
    for (const item of items) {
      total = total.add(item.amount);
      if (item.mandatory) {
        mandatoryTotal = mandatoryTotal.add(item.amount);
      } else {
        optionalTotal = optionalTotal.add(item.amount);
      }
    }

    const bill = await this.prisma.bill.create({
      data: {
        tenantId,
        institutionId,
        studentPersonId: dto.studentPersonId,
        feeScheduleId: schedule.id,
        // BR-029 — the session is inherited from the session-scoped schedule so
        // the bill can never disagree with the schedule that produced it.
        academicSessionId: schedule.academicSessionId,
        termId: dto.termId,
        totalAmount: total,
        status: BillStatus.GENERATED,
        notes: dto.notes,
        createdBy: ctx.userId,
      },
    });

    await emitFinanceEventAudited(
      this.publisher,
      this.audit,
      FinanceEvents.BillGenerated,
      {
        tenantId,
        institutionId,
        entityType: 'bill',
        entityId: bill.id,
        actorId: ctx.userId,
        payload: {
          studentPersonId: bill.studentPersonId,
          feeScheduleId: bill.feeScheduleId,
          academicSessionId: bill.academicSessionId,
        },
        // §129 — the amount is on the audit row.
        changes: {
          status: bill.status,
          totalAmount: decimalToString(bill.totalAmount),
          mandatorySubtotal: decimalToString(mandatoryTotal),
          optionalSubtotal: decimalToString(optionalTotal),
          itemCount: items.length,
          academicSessionId: bill.academicSessionId,
          termId: bill.termId,
        },
      },
    );

    return ok(this.serializeBill(bill));
  }

  async listBills(
    ctx: FinanceContext,
    page?: number,
    limit?: number,
    status?: BillStatus,
    studentPersonId?: string,
    feeScheduleId?: string,
    academicSessionId?: string,
  ) {
    const institutionId = this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.BillWhereInput = {
      ...institutionWhere(ctx.tenantId, institutionId),
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(studentPersonId ? { studentPersonId } : {}),
      ...(feeScheduleId ? { feeScheduleId } : {}),
      ...(academicSessionId ? { academicSessionId } : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.bill.count({ where }),
      this.prisma.bill.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(rows.map((row) => this.serializeBill(row)), total, p, l);
  }

  async getBill(ctx: FinanceContext, id: string) {
    const institutionId = this.assertInstitutionContext(ctx);
    const bill = await this.resolveBill(ctx.tenantId, institutionId, id);
    return ok(this.serializeBill(bill));
  }

  private async resolveBill(
    tenantId: string,
    institutionId: string,
    id: string,
  ): Promise<BillRow> {
    const bill = await this.prisma.bill.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!bill) {
      throw new NotFoundException(`bill ${id} not found`);
    }
    return bill;
  }

  /**
   * §5.6 — Bill: Generated -> Sent -> Converted / Cancelled. A bill that has
   * already been converted to an invoice must never be cancellable (the invoice
   * carries the obligation), and cancelling twice is rejected so the transition
   * stays observable. CONVERTED is therefore terminal here.
   */
  async cancelBill(ctx: FinanceContext, id: string, dto: CancelBillDto) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const existing = await this.resolveBill(tenantId, institutionId, id);

    if (existing.status === BillStatus.CANCELLED) {
      throw new ConflictException(`bill ${id} is already cancelled`);
    }
    if (existing.status === BillStatus.CONVERTED) {
      throw new BadRequestException(
        `bill ${id} has been converted to an invoice and can no longer be cancelled`,
      );
    }
    if (dto.version !== undefined && dto.version !== existing.version) {
      throw new ConflictException(
        `bill ${id} version mismatch: expected ${dto.version}, current ${existing.version}`,
      );
    }

    const bill = await this.prisma.bill.update({
      where: { id },
      data: {
        status: BillStatus.CANCELLED,
        notes: dto.reason ?? existing.notes,
        version: existing.version + 1,
        updatedBy: ctx.userId,
      },
    });

    await emitFinanceEventAudited(
      this.publisher,
      this.audit,
      FinanceEvents.BillCancelled,
      {
        tenantId,
        institutionId,
        entityType: 'bill',
        entityId: bill.id,
        actorId: ctx.userId,
        payload: { studentPersonId: bill.studentPersonId, reason: dto.reason ?? null },
        changes: {
          status: bill.status,
          previousStatus: existing.status,
          totalAmount: decimalToString(bill.totalAmount),
          version: bill.version,
          previousVersion: existing.version,
        },
      },
    );

    return ok(this.serializeBill(bill));
  }

  private serializeBill(bill: BillRow) {
    return { ...bill, totalAmount: decimalToString(bill.totalAmount) };
  }
}
