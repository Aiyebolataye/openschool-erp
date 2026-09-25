import { ConflictException, ForbiddenException } from '@nestjs/common';
import { ReportCardStatus, ResultStatus, SubjectStatus } from '@prisma/client';
import { GradingService } from './services/grading.service';
import { ResultsService } from './services/results.service';

function setup() {
  const prisma = {
    institution: { findFirst: jest.fn() },
    gradeScale: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    gradeBoundary: { findMany: jest.fn(), count: jest.fn(), create: jest.fn(), update: jest.fn(), deleteMany: jest.fn() },
    remark: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    class: { findFirst: jest.fn() },
    term: { findFirst: jest.fn() },
    subject: { findFirst: jest.fn() },
    studentClassEnrollment: { findMany: jest.fn(), findFirst: jest.fn() },
    assessment: { findMany: jest.fn() },
    assessmentResult: { findMany: jest.fn() },
    result: { findFirst: jest.fn(), findMany: jest.fn(), count: jest.fn(), upsert: jest.fn(), updateMany: jest.fn() },
    reportCard: { upsert: jest.fn(), updateMany: jest.fn() },
    staff: { findFirst: jest.fn() },
    teachingAssignment: { findFirst: jest.fn() },
  };
  const publisher = { publish: jest.fn() };
  const audit = { record: jest.fn().mockResolvedValue(undefined) };
  jest.clearAllMocks();

  prisma.institution.findFirst.mockResolvedValue({});
  prisma.class.findFirst.mockResolvedValue({ id: 'cl-1' });
  prisma.term.findFirst.mockResolvedValue({ id: 'te-1' });
  prisma.subject.findFirst.mockResolvedValue({ id: 'su-1' });

  const grading = new GradingService(prisma as never, publisher as never, audit as never);
  const service = new ResultsService(prisma as never, publisher as never, audit as never, grading);
  return { service, prisma, grading };
}

const CTX = { tenantId: 't1', institutionId: 'i1', userId: 'u1', personId: 'staff-1' };
const DTO = { classId: 'cl-1', termId: 'te-1', subjectId: 'su-1' };

describe('ResultsService — P5.6 compile/transition invariants', () => {
  it('denies approval until every result is COMPILED', async () => {
    const { service, prisma } = setup();
    prisma.studentClassEnrollment.findMany.mockResolvedValue([{ id: 'e1' }]);
    prisma.result.findMany.mockResolvedValue([
      { id: 'r1', status: ResultStatus.COMPILED },
      { id: 'r2', status: ResultStatus.APPROVED },
    ]);
    prisma.teachingAssignment.findFirst.mockResolvedValue({ id: 'ta-1' });

    await expect(service.approve(CTX, DTO)).rejects.toBeInstanceOf(ConflictException);
  });

  it('denies publishing until every result is APPROVED', async () => {
    const { service, prisma } = setup();
    prisma.studentClassEnrollment.findMany.mockResolvedValue([{ id: 'e1' }]);
    prisma.result.findMany.mockResolvedValue([
      { id: 'r1', status: ResultStatus.APPROVED },
      { id: 'r2', status: ResultStatus.COMPILED },
    ]);
    prisma.teachingAssignment.findFirst.mockResolvedValue({ id: 'ta-1' });

    await expect(service.publish(CTX, DTO)).rejects.toBeInstanceOf(ConflictException);
  });

  it('enforces the persisted P-12 teaching authority on approvals', async () => {
    const { service, prisma } = setup();
    prisma.studentClassEnrollment.findMany.mockResolvedValue([{ id: 'e1' }]);
    prisma.result.findMany.mockResolvedValue([{ id: 'r1', status: ResultStatus.COMPILED }]);
    prisma.teachingAssignment.findFirst.mockResolvedValue(null);

    await expect(service.approve(CTX, DTO)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('approves an all-COMPILED set after the authority check passes', async () => {
    const { service, prisma } = setup();
    prisma.studentClassEnrollment.findMany.mockResolvedValue([{ id: 'e1' }]);
    prisma.result.findMany.mockResolvedValue([{ id: 'r1', status: ResultStatus.COMPILED }]);
    prisma.teachingAssignment.findFirst.mockResolvedValue({ id: 'ta-1' });
    prisma.result.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.approve(CTX, DTO);
    expect(result.transitioned).toBe(1);
    expect(prisma.result.updateMany.mock.calls[0][0].data.status).toBe(ResultStatus.APPROVED);
  });

  it('compiles CA + exam into the totalScore and grades it', async () => {
    const { service, prisma, grading } = setup();
    prisma.gradeScale.findFirst.mockResolvedValue({ id: 'scale-1' });
    prisma.studentClassEnrollment.findMany.mockResolvedValue([{ id: 'e1' }]);
    prisma.assessment.findMany.mockResolvedValue([
      { id: 'a1', assessmentType: 'EXAMINATION', maxScore: 60, weight: 0 },
      { id: 'a2', assessmentType: 'COURSEWORK', maxScore: 50, weight: 30 },
      { id: 'a3', assessmentType: 'COURSEWORK', maxScore: 40, weight: 30 },
    ]);
    prisma.assessmentResult.findMany.mockResolvedValue([
      { assessmentId: 'a1', score: 45 },
      { assessmentId: 'a2', score: 20 },
      { assessmentId: 'a3', score: 10 },
    ]);
    prisma.result.findFirst.mockResolvedValue(null);
    const gradeSpy = jest.spyOn(grading, 'resolveGrade').mockResolvedValue({
      grade: 'B',
      remark: null,
      boundaryId: 'b-1',
    });
    prisma.result.upsert.mockResolvedValue({ id: 're-1' });

    await service.compile(CTX, DTO);

    // a2 ratio 20/50 = 0.4 → 0.4*30 = 12; a3 ratio 10/40 = 0.25 → 7.5; CA 19.5; exam 45 → total 64.5
    expect(gradeSpy).toHaveBeenCalledWith('t1', 'i1', 'scale-1', 64.5);
    const createData = prisma.result.upsert.mock.calls[0][0].create as Record<string, unknown>;
    expect(createData.totalScore).toBe(64.5);
    expect(createData.caScore).toBe(19.5);
    expect(createData.examScore).toBe(45);
    expect(createData.grade).toBe('B');
    expect(createData.status).toBe(ResultStatus.COMPILED);
  });

  it('ranks report-card positions by average descending', async () => {
    const { service, prisma } = setup();
    prisma.studentClassEnrollment.findMany.mockResolvedValue([
      { id: 'e1', studentPersonId: 'p1' },
      { id: 'e2', studentPersonId: 'p2' },
      { id: 'e3', studentPersonId: 'p3' },
    ]);
    prisma.result.findMany.mockImplementation(async ({ where }: { where: { studentClassEnrollmentId: string } }) => {
      const total = { e1: 90, e2: 75, e3: 60 }[where.studentClassEnrollmentId];
      return [{ totalScore: total }];
    });
    prisma.reportCard.upsert.mockImplementation(async ({ create }) => create);

    await service.generateReportCards(CTX, { classId: 'cl-1', termId: 'te-1' });

    const creates = prisma.reportCard.upsert.mock.calls.map((c) => c[0].create) as Array<{
      studentClassEnrollmentId: string;
      position: number;
      totalScore: number;
    }>;
    expect(creates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ studentClassEnrollmentId: 'e1', position: 1, totalScore: 90 }),
        expect.objectContaining({ studentClassEnrollmentId: 'e2', position: 2, totalScore: 75 }),
        expect.objectContaining({ studentClassEnrollmentId: 'e3', position: 3, totalScore: 60 }),
      ]),
    );
  });

  it('publishes report cards with the PUBLISHED status', async () => {
    const { service, prisma } = setup();
    prisma.studentClassEnrollment.findMany.mockResolvedValue([{ id: 'e1' }]);
    prisma.reportCard.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.publishReportCards(CTX, { classId: 'cl-1', termId: 'te-1' });

    expect((result.data as { published: number }).published).toBe(1);
    expect(prisma.reportCard.updateMany.mock.calls[0][0].data.status).toBe(ReportCardStatus.PUBLISHED);
    expect(prisma.reportCard.updateMany.mock.calls[0][0].where.tenantId).toBe('t1');
  });
});