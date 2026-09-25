import { ConflictException } from '@nestjs/common';
import { GradeScaleStatus } from '@prisma/client';
import { GradingService } from './services/grading.service';

const SCALE = {
  id: 'scale-1',
  tenantId: 't1',
  institutionId: 'i1',
  name: 'Standard',
  status: GradeScaleStatus.DRAFT,
  deletedAt: null,
};

function setup() {
  const prisma = {
    institution: { findFirst: jest.fn() },
    gradeScale: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    gradeBoundary: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), deleteMany: jest.fn() },
    remark: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    result: { count: jest.fn() },
  };
  const publisher = { publish: jest.fn() };
  const audit = { record: jest.fn().mockResolvedValue(undefined) };
  jest.clearAllMocks();
  return { service: new GradingService(prisma as never, publisher as never, audit as never), prisma };
}

const A_BOUNDARIES = [
  { id: 'b-a', grade: 'A', minScore: 70, maxScore: 100, remark: null },
  { id: 'b-b', grade: 'B', minScore: 60, maxScore: 69.99, remark: null },
  { id: 'b-c', grade: 'C', minScore: 50, maxScore: 59.99, remark: null },
];

describe('GradingService — P5.6 boundary/grade invariants', () => {
  it('resolves the higher boundary when a score sits exactly on the split (A70-100/B60-69.99)', async () => {
    const { service, prisma } = setup();
    prisma.gradeBoundary.findMany.mockResolvedValue(A_BOUNDARIES);
    prisma.remark.findFirst.mockResolvedValue(null);

    await expect(service.resolveGrade('t1', 'i1', 'scale-1', 70)).resolves.toMatchObject({ grade: 'A' });
    await expect(service.resolveGrade('t1', 'i1', 'scale-1', 69.99)).resolves.toMatchObject({ grade: 'B' });
    await expect(service.resolveGrade('t1', 'i1', 'scale-1', 100)).resolves.toMatchObject({ grade: 'A' });
  });

  it('picks the top-most matching band when bands overlap upwards (A* 90-100 vs A 70-100)', async () => {
    const { service, prisma } = setup();
    prisma.gradeBoundary.findMany.mockResolvedValue([
      { id: 'b-astar', grade: 'A*', minScore: 90, maxScore: 100, remark: null },
      ...A_BOUNDARIES,
    ]);
    prisma.remark.findFirst.mockResolvedValue(null);

    await expect(service.resolveGrade('t1', 'i1', 'scale-1', 95)).resolves.toMatchObject({ grade: 'A*' });
  });

  it('falls back to a remark row when the winning boundary carries none', async () => {
    const { service, prisma } = setup();
    prisma.gradeBoundary.findMany.mockResolvedValue(A_BOUNDARIES);
    prisma.remark.findFirst.mockResolvedValue({ remarkText: 'Excellent' });

    await expect(service.resolveGrade('t1', 'i1', 'scale-1', 92)).resolves.toMatchObject({
      grade: 'A',
      remark: 'Excellent',
    });
  });

  it('rejects compilation without an ACTIVE scale', async () => {
    const { service, prisma } = setup();
    prisma.gradeScale.findFirst.mockResolvedValue(null);

    await expect(service.resolveActiveScale('t1', 'i1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('refuses to activate a scale with zero boundaries', async () => {
    const { service, prisma } = setup();
    prisma.institution.findFirst.mockResolvedValue({});
    prisma.gradeScale.findFirst.mockResolvedValue(SCALE);
    prisma.gradeBoundary.count.mockResolvedValue(0);

    await expect(
      service.activateScale({ tenantId: 't1', institutionId: 'i1', userId: 'u1' }, 'scale-1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects overlapping boundaries on a DRAFT scale', async () => {
    const { service, prisma } = setup();
    prisma.institution.findFirst.mockResolvedValue({});
    prisma.gradeScale.findFirst.mockResolvedValue(SCALE);
    prisma.gradeBoundary.findFirst.mockResolvedValue(null);
    prisma.gradeBoundary.count.mockResolvedValue(1);

    await expect(
      service.addBoundary(
        { tenantId: 't1', institutionId: 'i1', userId: 'u1' },
        'scale-1',
        { grade: 'B+', minScore: 65, maxScore: 75, displayOrder: 1 },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects duplicate boundary grades on a DRAFT scale', async () => {
    const { service, prisma } = setup();
    prisma.institution.findFirst.mockResolvedValue({});
    prisma.gradeScale.findFirst.mockResolvedValue(SCALE);
    prisma.gradeBoundary.findFirst.mockResolvedValue({ id: 'b-a' });

    await expect(
      service.addBoundary(
        { tenantId: 't1', institutionId: 'i1', userId: 'u1' },
        'scale-1',
        { grade: 'A', minScore: 85, maxScore: 90, displayOrder: 2 },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});