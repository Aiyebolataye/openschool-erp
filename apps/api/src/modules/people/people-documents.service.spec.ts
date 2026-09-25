import { ConflictException, NotFoundException } from '@nestjs/common';
import { PeopleEvents } from './people.events';
import { PeopleDocumentsService } from './people-documents.service';

const ACTOR = { id: 'actor-1', email: 'smo@greenfield.edu.ng' };
const DOC_ID = '9b1c2d3e-0000-4000-8000-000000000006';

function docRow(over: Record<string, unknown> = {}) {
  return {
    id: DOC_ID,
    tenantId: 't1',
    personId: 'p1',
    documentType: 'BIRTH_CERTIFICATE',
    documentName: 'Birth Cert',
    fileReference: 'https://storage.example/files/birth.pdf',
    fileSize: 1024,
    mimeType: 'application/pdf',
    status: 'ACTIVE',
    expiryDate: null,
    version: 1,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
    ...over,
  };
}

function makeHarness() {
  const emit = jest.fn();
  const mocks = {
    peopleDocument: { findFirst: jest.fn(), findMany: jest.fn(), count: jest.fn(), create: jest.fn(), update: jest.fn() },
    person: { findFirst: jest.fn() },
    applicant: { findFirst: jest.fn() },
  };
  const prisma = mocks as any;
  const service = new PeopleDocumentsService(prisma, { emit } as any);
  return { mocks, emit, service };
}

describe('PeopleDocumentsService', () => {
  it('createDocument: enforces P-06 cap (50), applies P-012 cap (20) when open applicant, emits PeopleDocumentUploaded', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.applicant.findFirst.mockResolvedValue(null);
    mocks.peopleDocument.count.mockResolvedValue(49);
    mocks.peopleDocument.create.mockResolvedValue(docRow());

    const out = await service.createDocument(
      't1', 'p1',
      { documentType: 'BIRTH_CERTIFICATE', documentName: 'Birth Cert', fileReference: 'ref://1' },
      ACTOR,
    );
    expect(mocks.applicant.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 't1', personId: 'p1', status: { in: expect.arrayContaining(['APPLIED']) } }) }),
    );
    expect(mocks.peopleDocument.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 't1', personId: 'p1' }) }),
    );
    expect(mocks.peopleDocument.create).toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith(PeopleEvents.PeopleDocumentUploaded, expect.objectContaining({ personId: 'p1', entityId: DOC_ID }));
    expect(out).toEqual(expect.objectContaining({ success: true, data: expect.objectContaining({ id: DOC_ID, documentType: 'BIRTH_CERTIFICATE' }) }));

    mocks.peopleDocument.count.mockResolvedValue(50);
    await expect(
      service.createDocument('t1', 'p1', { documentType: 'PASSPORT', documentName: 'Passport', fileReference: 'ref://2' }, ACTOR),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(mocks.peopleDocument.create).toHaveBeenCalledTimes(1);
  });

  it('createDocument: applies the 20-document P-012 cap when the person has an open applicant', async () => {
    const { mocks, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.applicant.findFirst.mockResolvedValue({ id: 'app-1', status: 'APPLIED' });
    mocks.peopleDocument.count.mockResolvedValue(20);
    await expect(
      service.createDocument('t1', 'p1', { documentType: 'PASSPORT', documentName: 'Passport', fileReference: 'ref://3' }, ACTOR),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('createDocument: returns 404 when the person is missing', async () => {
    const { mocks, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue(null);
    await expect(
      service.createDocument('t1', 'p1', { documentType: 'PASSPORT', documentName: 'Passport', fileReference: 'ref://4' }, ACTOR),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updateDocument: blocks on version mismatch and emits PersonUpdated (documentUpdated)', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.peopleDocument.findFirst.mockResolvedValue(docRow());
    mocks.peopleDocument.update.mockResolvedValue(docRow({ version: 2, documentName: 'Updated' }));

    const out = await service.updateDocument('t1', 'p1', DOC_ID, { version: 1, documentName: 'Updated' }, ACTOR);
    expect(mocks.peopleDocument.update).toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith(PeopleEvents.PersonUpdated, expect.objectContaining({
      personId: 'p1',
      entityId: 'p1',
      changes: { documentUpdated: expect.objectContaining({ id: DOC_ID, documentName: 'Updated' }) },
    }));
    expect(out).toEqual(expect.objectContaining({ data: expect.objectContaining({ version: 2, documentName: 'Updated' }) }));

    mocks.peopleDocument.findFirst.mockResolvedValue(docRow({ version: 2 }));
    await expect(service.updateDocument('t1', 'p1', DOC_ID, { version: 1 }, ACTOR)).rejects.toMatchObject({ status: 409 });
  });

  it('removeDocument: marks deletedAt and emits PeopleDocumentRemoved', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.peopleDocument.findFirst.mockResolvedValue(docRow());
    mocks.peopleDocument.update.mockResolvedValue(docRow({ deletedAt: new Date(), version: 2 }));
    const out = await service.removeDocument('t1', 'p1', DOC_ID, ACTOR);
    expect(mocks.peopleDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date), deletedBy: ACTOR.id }) }),
    );
    expect(emit).toHaveBeenCalledWith(PeopleEvents.PeopleDocumentRemoved, expect.objectContaining({ entityId: DOC_ID, version: 2 }));
    expect(out).toEqual(expect.objectContaining({ data: expect.objectContaining({ id: DOC_ID, version: 2 }) }));
  });

  it('resolveDocument returns 404 for missing/non-person documents', async () => {
    const { mocks, service } = makeHarness();
    mocks.peopleDocument.findFirst.mockResolvedValue(null);
    await expect(service.findOne('t1', 'p1', DOC_ID)).rejects.toBeInstanceOf(NotFoundException);
  });
});