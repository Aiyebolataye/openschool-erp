import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PeopleEvents } from './people.events';
import { ApplicantsService } from './applicants.service';

const ACTOR = { id: 'actor-1', email: 'smo@greenfield.edu.ng' };
const UUID = '9b1c2d3e-0000-4000-8000-000000000005';

function applicantRow(over: Record<string, unknown> = {}) {
  return {
    id: UUID,
    tenantId: 't1',
    institutionId: 'i1',
    personId: 'p1',
    publicId: 'APP-2026-000001',
    applicationDate: new Date('2026-09-01'),
    targetGrade: 'GRADE_10',
    source: 'WALK_IN',
    status: 'APPLIED',
    notes: null,
    version: 1,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
    person: { id: 'p1', firstName: 'Ann', lastName: 'A', email: 'a@x.com', publicId: 'P-2026-001' },
    institution: { id: 'i1', name: 'Demo Academy', code: 'GA' },
    ...over,
  };
}

function makeHarness() {
  const emit = jest.fn();
  const mocks: any = {
    applicant: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    person: { findFirst: jest.fn() },
    institution: { findFirst: jest.fn() },
    personInstitution: { upsert: jest.fn() },
    student: { findMany: jest.fn(), create: jest.fn() },
    studentEnrollmentDetail: { create: jest.fn() },
    $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(mocks)),
  };
  const prisma = mocks as any;
  const service = new ApplicantsService(prisma, { emit } as any);
  return { mocks, emit, service };
}

describe('ApplicantsService', () => {
  it('creates an applicant (APPLIED, WALK_IN default), upserts the APPLICANT institution role, emits ApplicantCreated', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.applicant.findFirst.mockResolvedValueOnce(null);
    mocks.applicant.findFirst.mockResolvedValue(applicantRow());
    mocks.institution.findFirst.mockResolvedValue({ id: 'i1' });
    mocks.applicant.findMany.mockResolvedValue([]);
    mocks.applicant.create.mockResolvedValue(applicantRow());
    mocks.applicant.create.mockResolvedValue(applicantRow());

    const out = await service.createApplicant('t1', 'i1', 'p1', { targetGrade: 'GRADE_10' }, ACTOR);

    expect(mocks.applicant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 't1',
          personId: 'p1',
          institutionId: 'i1',
          source: 'WALK_IN',
          status: 'APPLIED',
          createdBy: ACTOR.id,
        }),
      }),
    );
    expect(mocks.personInstitution.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId_personId_institutionId_roleContext: { tenantId: 't1', personId: 'p1', institutionId: 'i1', roleContext: 'APPLICANT' } },
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      PeopleEvents.ApplicantCreated,
      expect.objectContaining({ personId: 'p1', entityId: UUID, version: 1, actorId: ACTOR.id }),
    );
    expect(out).toEqual(expect.objectContaining({ success: true, data: expect.objectContaining({ id: UUID, publicId: 'APP-2026-000001', personName: 'Ann A' }) }));
  });

  it('rejects missing institution context and missing person', async () => {
    const { mocks, service } = makeHarness();
    await expect(service.createApplicant('t1', undefined, 'p1', { targetGrade: 'GRADE_10' }, ACTOR)).rejects.toBeInstanceOf(ForbiddenException);
    mocks.person.findFirst.mockResolvedValue(null);
    await expect(service.createApplicant('t1', 'i1', 'p1', { targetGrade: 'GRADE_10' }, ACTOR)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a second applicant for the same person/institution with 409', async () => {
    const { mocks, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.applicant.findFirst.mockResolvedValue({ id: 'existing' });
    await expect(service.createApplicant('t1', 'i1', 'p1', { targetGrade: 'GRADE_10' }, ACTOR)).rejects.toBeInstanceOf(ConflictException);
    expect(mocks.applicant.create).not.toHaveBeenCalled();
  });

  it('maps a P2002 unique violation to 409 (create race)', async () => {
    const { mocks, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.applicant.findFirst.mockResolvedValue(null);
    mocks.institution.findFirst.mockResolvedValue({ id: 'i1' });
    mocks.applicant.findMany.mockResolvedValue([]);
    mocks.applicant.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.createApplicant('t1', 'i1', 'p1', { targetGrade: 'GRADE_10' }, ACTOR)).rejects.toBeInstanceOf(ConflictException);
  });

  it('list requires institution context, sweeps due applicants to EXPIRED, returns paged envelope', async () => {
    const { mocks, emit, service } = makeHarness();
    await expect(service.listApplicants('t1', undefined, 'p1', {}, ACTOR)).rejects.toBeInstanceOf(ForbiddenException);

    mocks.applicant.findMany.mockResolvedValueOnce([
      { id: 'expired-1', applicationDate: new Date('2020-01-01') },
    ]);
    const live = applicantRow();
    mocks.applicant.findMany.mockResolvedValueOnce([live]);
    mocks.applicant.count.mockResolvedValue(1);
    mocks.applicant.update.mockResolvedValue({});

    const out = await service.listApplicants('t1', 'i1', 'p1', { status: 'APPLIED' }, ACTOR);

    expect(mocks.applicant.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'expired-1' }, data: expect.objectContaining({ status: 'EXPIRED' }) }),
    );
    expect(emit).toHaveBeenCalledWith(PeopleEvents.ApplicantExpired, expect.objectContaining({ entityId: 'expired-1' }));
    expect(mocks.applicant.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 't1', institutionId: 'i1', personId: 'p1', status: 'APPLIED', deletedAt: null }),
      }),
    );
    expect(out).toEqual(expect.objectContaining({ success: true, data: expect.objectContaining({ total: 1, items: expect.arrayContaining([expect.objectContaining({ id: UUID })]) }) }));
  });

  it('findOne applies lazy expiry-on-read and blocks cross-institution/missing rows', async () => {
    const { mocks, service } = makeHarness();
    mocks.applicant.findFirst.mockResolvedValue(applicantRow({ applicationDate: new Date('2020-01-01') }));
    mocks.applicant.update.mockResolvedValue(applicantRow({ status: 'EXPIRED', version: 2, applicationDate: new Date('2020-01-01') }));

    await service.findOne('t1', 'i1', 'p1', UUID, ACTOR);
    expect(mocks.applicant.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: UUID }, data: expect.objectContaining({ status: 'EXPIRED' }) }),
    );

    mocks.applicant.findFirst.mockReset();
    mocks.applicant.findFirst.mockResolvedValue(applicantRow({ institutionId: 'i2' }));
    await expect(service.findOne('t1', 'i1', 'p1', UUID, ACTOR)).rejects.toBeInstanceOf(ForbiddenException);

    mocks.applicant.findFirst.mockResolvedValue(null);
    await expect(service.findOne('t1', 'i1', 'p1', UUID, ACTOR)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update allows APPLIED → UNDER_REVIEW, blocks terminal transitions, blocks version mismatch, refuses expired', async () => {
    const { mocks, service } = makeHarness();
    const row = (status: string) => applicantRow({ status, applicationDate: new Date('2099-01-01') });

    mocks.applicant.findFirst.mockResolvedValue(row('APPLIED'));
    mocks.applicant.update.mockResolvedValue(row('UNDER_REVIEW'));
    await service.updateApplicant('t1', 'i1', 'p1', UUID, { version: 1, status: 'UNDER_REVIEW' }, ACTOR);
    expect(mocks.applicant.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'UNDER_REVIEW', version: 2 }) }));

    mocks.applicant.findFirst.mockResolvedValue(row('APPLIED'));
    await expect(service.updateApplicant('t1', 'i1', 'p1', UUID, { version: 1, status: 'REJECTED' }, ACTOR)).rejects.toBeInstanceOf(ConflictException);

    mocks.applicant.findFirst.mockResolvedValue(row('APPLIED'));
    await expect(service.updateApplicant('t1', 'i1', 'p1', UUID, { version: 99, status: 'UNDER_REVIEW' }, ACTOR)).rejects.toMatchObject({ status: 409 });

    mocks.applicant.findFirst.mockResolvedValue(applicantRow({ applicationDate: new Date('2020-01-01') }));
    await expect(service.updateApplicant('t1', 'i1', 'p1', UUID, { version: 1, status: 'UNDER_REVIEW' }, ACTOR)).rejects.toBeInstanceOf(ConflictException);
  });

  it('accept creates a Student + enrollment detail + STUDENT role and emits ApplicantAccepted + StudentEnrolled', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.applicant.findFirst.mockResolvedValue(applicantRow({ applicationDate: new Date('2099-01-01') }));
    mocks.person.findFirst.mockResolvedValue({ id: 'p1', firstName: 'Ann', lastName: 'A' });
    mocks.institution.findFirst.mockResolvedValue({ id: 'i1', code: 'GA' });
    mocks.student.findMany.mockResolvedValue([{ publicId: 'STU-2026-000000' }]);
    mocks.student.create.mockResolvedValue({ id: 'stu-1' });
    mocks.applicant.update.mockResolvedValue(applicantRow({ status: 'ACCEPTED', version: 2 }));
    mocks.studentEnrollmentDetail.create.mockResolvedValue({});

    const out = await service.acceptApplicant('t1', 'i1', 'p1', UUID, { version: 1 }, ACTOR);

    expect(mocks.student.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tenantId: 't1', personId: 'p1', institutionId: 'i1', status: 'ENROLLED', publicId: 'STU-2026-000001' }) }),
    );
    expect(mocks.studentEnrollmentDetail.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ gradeLevel: 'GRADE_10', enrollmentType: 'NEW' }) }),
    );
    expect(mocks.personInstitution.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId_personId_institutionId_roleContext: { tenantId: 't1', personId: 'p1', institutionId: 'i1', roleContext: 'STUDENT' } } }),
    );
    expect(emit).toHaveBeenCalledWith(PeopleEvents.ApplicantAccepted, expect.objectContaining({ personId: 'p1', entityId: UUID, version: 2 }));
    expect(emit).toHaveBeenCalledWith(PeopleEvents.StudentEnrolled, expect.objectContaining({ personId: 'p1', entityId: 'stu-1' }));
    expect(out).toEqual(expect.objectContaining({ success: true, data: expect.objectContaining({ status: 'ACCEPTED', studentId: 'stu-1' }) }));
  });

  it('accept rejects a terminal applicant and an expired application', async () => {
    const { mocks, service } = makeHarness();
    mocks.applicant.findFirst.mockResolvedValue(applicantRow({ status: 'REJECTED', applicationDate: new Date('2099-01-01') }));
    await expect(service.acceptApplicant('t1', 'i1', 'p1', UUID, { version: 1 }, ACTOR)).rejects.toBeInstanceOf(ConflictException);

    mocks.applicant.findFirst.mockResolvedValue(applicantRow({ applicationDate: new Date('2020-01-01') }));
    mocks.applicant.update.mockResolvedValue(applicantRow({ status: 'EXPIRED', version: 2 }));
    await expect(service.acceptApplicant('t1', 'i1', 'p1', UUID, { version: 1 }, ACTOR)).rejects.toBeInstanceOf(ConflictException);
  });

  it('reject transitions to REJECTED and emits ApplicantRejected with the reason', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.applicant.findFirst.mockResolvedValue(applicantRow({ applicationDate: new Date('2099-01-01') }));
    mocks.applicant.update.mockResolvedValue(applicantRow({ status: 'REJECTED', version: 2 }));
    await service.rejectApplicant('t1', 'i1', 'p1', UUID, { version: 1, rejectionReason: 'Incomplete documents' }, ACTOR);
    expect(mocks.applicant.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'REJECTED' }) }));
    expect(emit).toHaveBeenCalledWith(PeopleEvents.ApplicantRejected, expect.objectContaining({ changes: { reason: 'Incomplete documents' } }));
  });

  it('softDelete marks deletedAt/deletedBy without emitting an event', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.applicant.findFirst.mockResolvedValue(applicantRow());
    mocks.applicant.update.mockResolvedValue(applicantRow({ deletedAt: new Date(), deletedBy: ACTOR.id }));
    const out = await service.softDeleteApplicant('t1', 'i1', 'p1', UUID, ACTOR);
    expect(mocks.applicant.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date), deletedBy: ACTOR.id }) }));
    expect(out).toEqual(expect.objectContaining({ success: true, data: expect.objectContaining({ id: UUID }) }));
    expect(emit).not.toHaveBeenCalled();
  });

  it('rejects an invalid applicationDate', async () => {
    const { mocks, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.applicant.findFirst.mockResolvedValue(null);
    mocks.institution.findFirst.mockResolvedValue({ id: 'i1' });
    await expect(service.createApplicant('t1', 'i1', 'p1', { targetGrade: 'GRADE_10', applicationDate: 'not-a-date' }, ACTOR)).rejects.toBeInstanceOf(BadRequestException);
  });
});