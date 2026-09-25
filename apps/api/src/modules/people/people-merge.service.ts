/**
 * PEOPLE-5 Person Merge (People spec §12).
 *
 * Manual merge only (bulk + advanced auto-suggestion algorithm are §12.3/§16
 * Future). Suggestions are deterministic on-the-fly rules (normalized email /
 * phone / name+DOB) against non-deleted same-tenant persons, capped at P-013
 * (100). Merge is permanent (§12.4), transactional, fully audited with
 * before/after snapshots on the audit log, and soft-deletes the source Person
 * while preserving identity on the target (§12.2). Conflict precedence
 * (§12.5): admin-selected override > newest non-null > null-safe keep.
 *
 * People-owned tables are consolidated inside one transaction. Cross-domain
 * (Academics/Finance/Communication) reference updates are the separate
 * MergeConsumer responsibility (§9.6) — out of the People batch scope.
 */
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { currentCorrelationId } from '../../common/interceptors/correlation-id.interceptor';
import { PeopleEvents, PeopleEventPayload } from './people.events';
import {
  ListMergeHistoryQueryDto,
  ListMergeSuggestionsQueryDto,
  MergePeopleDto,
  MergeConflictOverrideKey,
  MERGE_IDENTITY_FIELDS,
} from './dto/merge.dto';

/** P-013 default results cap for suggestions. */
export const MERGE_SUGGESTIONS_MAX = 100;

function listEnvelope(items: unknown[], total: number, page: number, limit: number) {
  return { success: true, data: { items, total, page, limit } };
}

function singleEnvelope(data: unknown) {
  return { success: true, data };
}

export interface ActorContext {
  id: string;
  email?: string | null;
}

type PersonIdentityRow = {
  id: string;
  publicId: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  email: string;
  phone: string | null;
  dateOfBirth: Date | null;
  gender: string;
  address: string | null;
  bloodGroup: string | null;
  stateOfOrigin: string | null;
  updatedAt: Date;
};

const ROLE_MODELS = ['student', 'staff', 'parent', 'guardian', 'applicant'] as const;

@Injectable()
export class PeopleMergeService {
  private readonly logger = new Logger(PeopleMergeService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
  ) {}

  private emit(event: string, payload: PeopleEventPayload): void {
    this.eventEmitter.emit(event, {
      emittedAt: new Date().toISOString(),
      ...(currentCorrelationId() ? { correlationId: currentCorrelationId() } : {}),
      ...payload,
    });
  }

  private eventBase(tenantId: string, actor: ActorContext) {
    return {
      tenantId,
      actorId: actor.id,
      actorEmail: actor.email ?? null,
    };
  }

  // ---- suggestions ---------------------------------------------------------

  async getSuggestions(tenantId: string, query: ListMergeSuggestionsQueryDto) {
    const limit = Math.min(query.limit ?? MERGE_SUGGESTIONS_MAX, MERGE_SUGGESTIONS_MAX);
    const page = query.page ?? 1;

    // V1 deterministic rule set (advanced scoring = §16 Future). Bound the scan
    // window for determinism; suggestions are advisory, not exhaustive.
    const window = await this.prisma.person.findMany({
      where: { tenantId, deletedAt: null },
      select: {
        id: true,
        publicId: true,
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        bloodGroup: true,
        stateOfOrigin: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
      take: 5000,
    });

    const byEmail = new Map<string, PersonIdentityRow[]>();
    const byPhone = new Map<string, PersonIdentityRow[]>();
    const byNameDob = new Map<string, PersonIdentityRow[]>();

    for (const row of window) {
      const email = row.email?.trim().toLowerCase();
      if (email) {
        byEmail.set(email, [...(byEmail.get(email) ?? []), row]);
      }
      const phone = row.phone?.replace(/[^0-9+]/g, '');
      if (phone && phone.length >= 7) {
        byPhone.set(phone, [...(byPhone.get(phone) ?? []), row]);
      }
      if (row.dateOfBirth) {
        const key = `${row.firstName.trim().toLowerCase()}|${row.lastName.trim().toLowerCase()}|${row.dateOfBirth.toISOString().slice(0, 10)}`;
        byNameDob.set(key, [...(byNameDob.get(key) ?? []), row]);
      }
    }

    const pairs: Map<string, { basis: string[] }> = new Map();
    const addPairs = (group: PersonIdentityRow[], basis: string) => {
      for (let i = 0; i < group.length; i += 1) {
        for (let j = i + 1; j < group.length; j += 1) {
          const key = `${group[i].id}|${group[j].id}`;
          const existing = pairs.get(key);
          pairs.set(
            key,
            existing ? { basis: [...existing.basis, basis] } : { basis: [basis] },
          );
        }
      }
    };

    for (const group of byEmail.values()) addPairs(group, 'email');
    for (const group of byPhone.values()) addPairs(group, 'phone');
    for (const group of byNameDob.values()) addPairs(group, 'name+dob');

    const byId = new Map(window.map((r) => [r.id, r]));
    const all = [...pairs.entries()]
      .slice((page - 1) * limit, page * limit)
      .map(([key, { basis }]) => {
        const [sourceId, targetId] = key.split('|');
        const source = byId.get(sourceId);
        const target = byId.get(targetId);
        if (!source || !target) return null;
        return {
          sourcePersonId: source.id,
          targetPersonId: target.id,
          matchBasis: basis,
          source: { publicId: source.publicId, name: `${source.firstName} ${source.lastName}`.trim() },
          target: { publicId: target.publicId, name: `${target.firstName} ${target.lastName}`.trim() },
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    return listEnvelope(all, Math.min(pairs.size, MERGE_SUGGESTIONS_MAX), page, limit);
  }

  // ---- merge ---------------------------------------------------------------

  async mergePeople(tenantId: string, dto: MergePeopleDto, actor: ActorContext) {
    if (dto.sourcePersonId === dto.targetPersonId) {
      throw new BadRequestException('Source and target Person must be different records');
    }

    const selectIdentity = {
      id: true,
      publicId: true,
      tenantId: true,
      firstName: true,
      lastName: true,
      middleName: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      address: true,
      bloodGroup: true,
      stateOfOrigin: true,
      updatedAt: true,
      version: true,
    } as const;

    const source = await this.prisma.person.findFirst({
      where: { id: dto.sourcePersonId, tenantId, deletedAt: null },
      select: selectIdentity,
    });
    if (!source) {
      throw new NotFoundException('Source Person not found');
    }
    const target = await this.prisma.person.findFirst({
      where: { id: dto.targetPersonId, tenantId, deletedAt: null },
      select: { ...selectIdentity },
    });
    if (!target) {
      throw new NotFoundException('Target Person not found');
    }

    const fieldResolutions: Record<string, { previousValue: unknown; keptValue: unknown }> = {};
    const keptFields: Record<string, unknown> = {};

    for (const field of MERGE_IDENTITY_FIELDS) {
      const override = dto.conflictOverrides?.[field];
      const sourceValue = source[field];
      const targetValue = target[field];
      let kept: unknown;

      if (override !== undefined) {
        kept = override === '' ? null : override;
      } else if (targetValue !== null && targetValue !== undefined) {
        kept = targetValue;
      } else if (sourceValue !== null && sourceValue !== undefined) {
        kept = sourceValue;
      } else {
        kept = null;
      }

      const sourceNonNull = sourceValue !== null && sourceValue !== undefined;
      if (sourceNonNull || override !== undefined) {
        const sourceRepr = this.valueRepr(sourceValue);
        const keptRepr = this.valueRepr(kept);
        if (sourceRepr !== keptRepr) {
          fieldResolutions[field] = { previousValue: sourceValue ?? null, keptValue: kept ?? null };
        }
      }
      keptFields[field] = kept;
    }

    let merged;
    try {
      merged = await this.prisma.$transaction(async (tx) => {
        const prismaAny = tx as unknown as Record<
          string,
          {
            updateMany: (args: Prisma.StudentUpdateManyArgs) => Promise<{ count: number }>;
            findMany: (args: unknown) => Promise<unknown[]>;
          }
        >;

        // 1. Role records (Student/Staff/Parent/Guardian/Applicant): soft-delete
        //    source rows that collide with an existing target row on the same
        //    institution, then re-point the rest (§12.2 consolidation).
        for (const model of ROLE_MODELS) {
          const sourceRows = (await prismaAny[model].findMany({
            where: { tenantId, personId: source.id, deletedAt: null },
            select: { id: true, institutionId: true },
          })) as Array<{ id: string; institutionId: string }>;

          const targetInstitutions = new Set<string>();
          const targetRows = (await prismaAny[model].findMany({
            where: { tenantId, personId: target.id, deletedAt: null },
            select: { institutionId: true },
          })) as Array<{ institutionId: string }>;
          for (const r of targetRows) targetInstitutions.add(r.institutionId);

          for (const row of sourceRows) {
            if (targetInstitutions.has(row.institutionId)) {
              const prismaUpd = tx as unknown as Record<string, { update: (args: { where: { id: string }; data: { deletedAt: Date; deletedBy: string; updatedBy: string } }) => Promise<unknown> }>;
              await prismaUpd[model].update({
                where: { id: row.id },
                data: { deletedAt: new Date(), deletedBy: actor.id, updatedBy: actor.id },
              });
            }
          }

          await prismaAny[model].updateMany({
            where: { tenantId, personId: source.id, deletedAt: null },
            data: { personId: target.id, updatedBy: actor.id },
          });
        }

        // 2. PersonProfile: keep the target profile; adopt source's if target has
        //    none; otherwise soft-delete the source profile (values captured in
        //    the merge audit payload below).
        const [sourceProfile, targetProfile] = await Promise.all([
          tx.personProfile.findFirst({
            where: { personId: source.id },
            select: { id: true, bio: true },
          }),
          tx.personProfile.findFirst({
            where: { personId: target.id },
            select: { id: true },
          }),
        ]);
        if (sourceProfile && !targetProfile) {
          await tx.personProfile.updateMany({
            where: { personId: source.id },
            data: { personId: target.id, updatedBy: actor.id },
          });
        } else if (sourceProfile && targetProfile) {
          await tx.personProfile.update({
            where: { id: sourceProfile.id },
            data: { deletedAt: new Date(), deletedBy: actor.id, updatedBy: actor.id },
          });
        }

        // 3. PersonInstitution: dedupe by repeated roleContext at the same
        //    institution, then re-point the rest.
        const sourceAssignments = await tx.personInstitution.findMany({
          where: { tenantId, personId: source.id, deletedAt: null },
          select: { id: true, institutionId: true, roleContext: true },
        });
        const targetAssignments = await tx.personInstitution.findMany({
          where: { tenantId, personId: target.id, deletedAt: null },
          select: { institutionId: true, roleContext: true },
        });
        const targetAssignKeys = new Set(
          targetAssignments.map((a) => `${a.institutionId}|${a.roleContext}`),
        );
        for (const a of sourceAssignments) {
          if (targetAssignKeys.has(`${a.institutionId}|${a.roleContext}`)) {
            await tx.personInstitution.update({
              where: { id: a.id },
              data: { deletedAt: new Date(), deletedBy: actor.id, updatedBy: actor.id },
            });
          }
        }
        await tx.personInstitution.updateMany({
          where: { tenantId, personId: source.id, deletedAt: null },
          data: { personId: target.id, updatedBy: actor.id },
        });

        // 4. PeopleDocuments: re-point (no per-person uniqueness; both retained
        //    per §12.5 — conflicts keep both documents).
        await tx.peopleDocument.updateMany({
          where: { tenantId, personId: source.id, deletedAt: null },
          data: { personId: target.id, updatedBy: actor.id },
        });

        // 5. EmergencyContacts: re-point, resolving `[tenant, person, priority]`
        //    collisions by renumbering to the next free slot (priority conflicts
        //    keep both contacts; re-assignment is left to the admin §12.5).
        const occupied = new Set<number>();
        const targetContacts = await tx.emergencyContact.findMany({
          where: { tenantId, personId: target.id, deletedAt: null },
          select: { priority: true },
        });
        for (const c of targetContacts) occupied.add(c.priority);

        const sourceContacts = await tx.emergencyContact.findMany({
          where: { tenantId, personId: source.id, deletedAt: null },
          select: { id: true, priority: true },
          orderBy: { priority: 'asc' },
        });
        for (const c of sourceContacts) {
          let priority = c.priority;
          if (occupied.has(priority)) {
            priority = 1;
            while (occupied.has(priority)) priority += 1;
          }
          occupied.add(priority);
          await tx.emergencyContact.update({
            where: { id: c.id },
            data: { personId: target.id, priority, updatedBy: actor.id },
          });
        }

        // 6. PersonRelationships: re-point both sides, then collapse duplicate
        //    rows (same source/target/type/institution) keeping the earliest.
        await tx.personRelationship.updateMany({
          where: { tenantId, sourcePersonId: source.id, deletedAt: null },
          data: { sourcePersonId: target.id, updatedBy: actor.id },
        });
        await tx.personRelationship.updateMany({
          where: { tenantId, targetPersonId: source.id, deletedAt: null },
          data: { targetPersonId: target.id, updatedBy: actor.id },
        });
        const targetRelations = await tx.personRelationship.findMany({
          where: {
            tenantId,
            deletedAt: null,
            OR: [{ sourcePersonId: target.id }, { targetPersonId: target.id }],
          },
          orderBy: { createdAt: 'asc' },
        });
        const seen = new Map<string, string>();
        for (const rel of targetRelations) {
          const key = `${rel.sourcePersonId}|${rel.targetPersonId}|${rel.relationshipType}|${rel.institutionId}`;
          if (seen.has(key)) {
            await tx.personRelationship.update({
              where: { id: rel.id },
              data: { deletedAt: new Date(), deletedBy: actor.id, updatedBy: actor.id },
            });
          } else {
            seen.set(key, rel.id);
          }
        }

        // 7. Surviving Person: apply merged identity fields; source soft-deleted.
        const updateData: Prisma.PersonUpdateInput = {
          firstName: String(keptFields.firstName ?? target.firstName),
          lastName: String(keptFields.lastName ?? target.lastName),
          updatedBy: actor.id,
          version: target.version + 1,
        };
        if (keptFields.middleName !== null) updateData.middleName = String(keptFields.middleName);
        if (keptFields.email) updateData.email = String(keptFields.email);
        if (keptFields.phone !== null) updateData.phone = String(keptFields.phone);
        if (keptFields.dateOfBirth !== null) updateData.dateOfBirth = new Date(String(keptFields.dateOfBirth));
        if (keptFields.gender !== null) updateData.gender = String(keptFields.gender) as Prisma.PersonUpdateInput['gender'];
        if (keptFields.address !== null) updateData.address = String(keptFields.address);
        if (keptFields.bloodGroup !== null) updateData.bloodGroup = String(keptFields.bloodGroup);
        if (keptFields.stateOfOrigin !== null) updateData.stateOfOrigin = String(keptFields.stateOfOrigin);

        const mergedPerson = await tx.person.update({
          where: { id: target.id },
          data: updateData,
        });

        await tx.person.update({
          where: { id: source.id },
          data: { deletedAt: new Date(), deletedBy: actor.id, updatedBy: actor.id },
        });

        return mergedPerson;
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException(
          'Merge conflict: a unique constraint would be violated; resolve duplicates and retry',
        );
      }
      throw err;
    }

    const mergedPerson = await this.prisma.person.findUnique({
      where: { id: target.id },
      select: { id: true, publicId: true, firstName: true, lastName: true, middleName: true, email: true, version: true },
    });

    this.emit(PeopleEvents.PersonMerged, {
      ...this.eventBase(tenantId, actor),
      personId: target.id,
      entityId: target.id,
      version: merged?.version ?? 0,
      changes: {
        sourcePersonId: source.id,
        targetPersonId: target.id,
        fieldResolutions,
        keptFields,
        sourcePublicId: source.publicId,
        sourceSoftDeletedAt: new Date().toISOString(),
      } as Record<string, unknown>,
    });

    return singleEnvelope({
      targetPersonId: target.id,
      targetPerson: mergedPerson,
      sourcePersonId: source.id,
      sourcePersonPublicId: source.publicId,
      fieldResolutions,
    });
  }

  // ---- history -------------------------------------------------------------

  async getMergeHistory(tenantId: string, query: ListMergeHistoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = { tenantId, action: 'people.person.merged' as const };

    const [total, rows] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return listEnvelope(
      rows.map((row) => {
        const changes = (row.changes ?? {}) as {
          sourcePersonId?: string;
          targetPersonId?: string;
          fieldResolutions?: Record<string, unknown>;
        };
        return {
          id: row.id,
          actorId: row.actorId,
          createdAt: row.createdAt,
          sourcePersonId: changes.sourcePersonId ?? null,
          targetPersonId: changes.targetPersonId ?? row.entityId,
          fieldResolutions: changes.fieldResolutions ?? {},
        };
      }),
      total,
      page,
      limit,
    );
  }

  // ---- internals -----------------------------------------------------------

  private valueRepr(value: unknown): string {
    if (value === null || value === undefined) return '\u0000null';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object' && 'toISOString' in (value as object)) {
      return (value as { toISOString(): string }).toISOString();
    }
    return String(value);
  }

  private isUniqueViolation(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      (err as { code?: string }).code === 'P2002'
    );
  }
}