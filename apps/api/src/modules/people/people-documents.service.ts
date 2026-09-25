/**
 * PEOPLE-5 People Documents (People spec §5.9 assumption 7, §6.5 P-06/P-012).
 *
 * Tenant-scoped, stored against a Person. Documents are references only: the
 * immutable file bytes live in Platform Services; People stores the
 * `fileReference` pointer. Per-person cap is P-06 (50), tightened to P-012 (20)
 * when the person holds an open Applicant. Update re-emits PersonUpdated
 * (§5.8 has no PeopleDocumentUpdated event; parent-entity fallback precedent),
 * upload/remove emit PeopleDocumentUploaded/PeopleDocumentRemoved.
 */
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
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
  CreatePeopleDocumentDto,
  ListPeopleDocumentsQueryDto,
  UpdatePeopleDocumentDto,
} from './dto/people-document.dto';

/** P-06 default max documents per person. */
export const PEOPLE_DOCUMENT_MAX_PER_PERSON = 50;
/** P-012 default max documents for an applicant. */
export const APPLICANT_DOCUMENT_MAX = 20;

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

@Injectable()
export class PeopleDocumentsService {
  private readonly logger = new Logger(PeopleDocumentsService.name);

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

  // ---- resolution ----------------------------------------------------------

  private async resolveDocument(tenantId: string, personId: string, id: string) {
    const document = await this.prisma.peopleDocument.findFirst({
      where: { id, tenantId, personId, deletedAt: null },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  private async assertPersonInTenant(tenantId: string, personId: string): Promise<void> {
    const person = await this.prisma.person.findFirst({
      where: { tenantId, id: personId, deletedAt: null },
      select: { id: true },
    });
    if (!person) {
      throw new NotFoundException('Person not found');
    }
  }

  /** P-006 (50) by default; P-012 (20) when the person holds an open Applicant. */
  private async documentCapFor(tenantId: string, personId: string): Promise<number> {
    const openApplicant = await this.prisma.applicant.findFirst({
      where: {
        tenantId,
        personId,
        deletedAt: null,
        status: { in: ['APPLIED', 'UNDER_REVIEW', 'ACCEPTED'] },
      },
      select: { id: true },
    });
    return openApplicant ? APPLICANT_DOCUMENT_MAX : PEOPLE_DOCUMENT_MAX_PER_PERSON;
  }

  // ---- list / read ---------------------------------------------------------

  async listDocuments(tenantId: string, personId: string, query: ListPeopleDocumentsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.PeopleDocumentWhereInput = {
      tenantId,
      personId,
      deletedAt: null,
      ...(query.documentType ? { documentType: query.documentType } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, documents] = await Promise.all([
      this.prisma.peopleDocument.count({ where }),
      this.prisma.peopleDocument.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return listEnvelope(
      documents.map((d) => this.documentScope(d)),
      total,
      page,
      limit,
    );
  }

  async findOne(tenantId: string, personId: string, id: string) {
    const document = await this.resolveDocument(tenantId, personId, id);
    return singleEnvelope(this.documentScope(document));
  }

  async createDocument(
    tenantId: string,
    personId: string,
    dto: CreatePeopleDocumentDto,
    actor: ActorContext,
  ) {
    await this.assertPersonInTenant(tenantId, personId);

    const cap = await this.documentCapFor(tenantId, personId);
    const activeCount = await this.prisma.peopleDocument.count({
      where: { tenantId, personId, deletedAt: null },
    });
    if (activeCount >= cap) {
      throw new ConflictException(
        `Document limit reached for this person (max ${cap} per person; P-06/P-012)`,
      );
    }

    const expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null;
    if (dto.expiryDate && (expiryDate == null || Number.isNaN(expiryDate.getTime()))) {
      throw new BadRequestException('expiryDate must be a valid date');
    }

    const created = await this.prisma.peopleDocument.create({
      data: {
        tenantId,
        personId,
        documentType: dto.documentType,
        documentName: dto.documentName,
        fileReference: dto.fileReference,
        ...(dto.fileSize !== undefined ? { fileSize: dto.fileSize } : {}),
        ...(dto.mimeType ? { mimeType: dto.mimeType } : {}),
        ...(expiryDate ? { expiryDate } : {}),
        status: 'ACTIVE',
        createdBy: actor.id,
        updatedBy: actor.id,
      },
    });

    this.emit(PeopleEvents.PeopleDocumentUploaded, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: created.id,
      version: created.version,
    });

    return singleEnvelope(this.documentScope(created));
  }

  async updateDocument(
    tenantId: string,
    personId: string,
    id: string,
    dto: UpdatePeopleDocumentDto,
    actor: ActorContext,
  ) {
    const document = await this.resolveDocument(tenantId, personId, id);
    this.assertVersion(document.version, dto.version);

    const data: Prisma.PeopleDocumentUpdateInput = {};
    if (dto.documentType !== undefined) data.documentType = dto.documentType;
    if (dto.documentName !== undefined) data.documentName = dto.documentName;
    if (dto.fileReference !== undefined) data.fileReference = dto.fileReference;
    if (dto.fileSize !== undefined) data.fileSize = dto.fileSize;
    if (dto.mimeType !== undefined) data.mimeType = dto.mimeType;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.expiryDate !== undefined) {
      const nextDate = dto.expiryDate ? new Date(dto.expiryDate) : null;
      if (dto.expiryDate && (nextDate == null || Number.isNaN(nextDate.getTime()))) {
        throw new BadRequestException('expiryDate must be a valid date');
      }
      data.expiryDate = nextDate;
    }
    data.updatedBy = actor.id;
    data.version = document.version + 1;

    const updated = await this.prisma.peopleDocument.update({
      where: { id: document.id },
      data,
    });

    // §5.8 defines no PeopleDocumentUpdated event (only Uploaded/Removed);
    // re-emit the parent PersonUpdated with the change details (precedent:
    // staff qualifications/certifications re-emit StaffUpdated).
    this.emit(PeopleEvents.PersonUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: personId,
      version: updated.version,
      changes: {
        documentUpdated: {
          id: updated.id,
          documentType: updated.documentType,
          documentName: updated.documentName,
        },
      } as Record<string, unknown>,
    });

    return singleEnvelope(this.documentScope(updated));
  }

  async removeDocument(tenantId: string, personId: string, id: string, actor: ActorContext) {
    const document = await this.resolveDocument(tenantId, personId, id);

    const updated = await this.prisma.peopleDocument.update({
      where: { id: document.id },
      data: {
        deletedAt: new Date(),
        deletedBy: actor.id,
        updatedBy: actor.id,
        version: document.version + 1,
      },
    });

    this.emit(PeopleEvents.PeopleDocumentRemoved, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updated.id,
      version: updated.version,
    });

    return singleEnvelope({
      id: updated.id,
      personId: updated.personId,
      deletedAt: updated.deletedAt,
      version: updated.version,
    });
  }

  // ---- internals -----------------------------------------------------------

  private documentScope(d: {
    id: string;
    personId: string;
    documentType: string;
    documentName: string;
    fileReference: string;
    fileSize: number | null;
    mimeType: string | null;
    status: string;
    expiryDate: Date | null;
    version: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: d.id,
      personId: d.personId,
      documentType: d.documentType,
      documentName: d.documentName,
      fileReference: d.fileReference,
      fileSize: d.fileSize,
      mimeType: d.mimeType,
      status: d.status,
      expiryDate: d.expiryDate,
      version: d.version,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  private assertVersion(current: number, expected: number): void {
    if (current !== expected) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'Version conflict: record has been modified by another request',
        },
        HttpStatus.CONFLICT,
      );
    }
  }
}