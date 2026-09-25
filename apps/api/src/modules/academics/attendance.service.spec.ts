import { BadRequestException } from '@nestjs/common';
import { AttendanceType } from '@prisma/client';
import { AttendanceService } from './services/attendance.service';

function setup() {
  const prisma = {
    institution: { findFirst: jest.fn() },
    subject: { findFirst: jest.fn() },
    studentClassEnrollment: { findFirst: jest.fn() },
    staff: { findFirst: jest.fn() },
    attendance: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  };
  const publisher = { publish: jest.fn() };
  const audit = { record: jest.fn().mockResolvedValue(undefined) };
  jest.clearAllMocks();
  prisma.institution.findFirst.mockResolvedValue({});
  prisma.subject.findFirst.mockResolvedValue({});
  prisma.studentClassEnrollment.findFirst.mockResolvedValue({});
  prisma.staff.findFirst.mockResolvedValue({});
  return { service: new AttendanceService(prisma as never, publisher as never, audit as never), prisma };
}

const CTX = { tenantId: 't1', institutionId: 'i1', userId: 'u1' };

describe('AttendanceService — P5.5 exactly-one target invariant', () => {
  it('rejects a row that references both a student and a staff member', async () => {
    const { service } = setup();

    await expect(
      service.record(CTX, {
        rows: [
          {
            studentClassEnrollmentId: 'enr-1',
            staffPersonId: 'staff-1',
            subjectId: 'sub-1',
            date: '2026-09-01',
            status: 'PRESENT' as never,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a row that references neither target', async () => {
    const { service } = setup();

    await expect(
      service.record(CTX, {
        rows: [
          {
            subjectId: 'sub-1',
            date: '2026-09-01',
            status: 'PRESENT' as never,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a STUDENT row and records the student target only', async () => {
    const { service, prisma } = setup();
    prisma.attendance.findFirst.mockResolvedValue(null);
    prisma.attendance.create.mockResolvedValue({ id: 'att-1' });

    const result = await service.record(CTX, {
      rows: [
        {
          studentClassEnrollmentId: 'enr-1',
          subjectId: 'sub-1',
          date: '2026-09-01',
          status: 'PRESENT' as never,
        },
      ],
    });

    expect(prisma.attendance.create).toHaveBeenCalledTimes(1);
    const data = prisma.attendance.create.mock.calls[0][0].data as Record<string, unknown>;
    expect(data.attendanceType).toBe(AttendanceType.STUDENT);
    expect(data.studentClassEnrollmentId).toBe('enr-1');
    expect(data.staffPersonId).toBeNull();
    expect((result.data as { recorded: number }).recorded).toBe(1);
  });

  it('creates a STAFF row when only the staff target is supplied', async () => {
    const { service, prisma } = setup();
    prisma.attendance.findFirst.mockResolvedValue(null);
    prisma.attendance.create.mockResolvedValue({ id: 'att-1' });

    await service.record(CTX, {
      rows: [
        {
          staffPersonId: 'staff-1',
          subjectId: 'sub-1',
          date: '2026-09-01',
          status: 'LATE' as never,
        },
      ],
    });

    const data = prisma.attendance.create.mock.calls[0][0].data as Record<string, unknown>;
    expect(data.attendanceType).toBe(AttendanceType.STAFF);
    expect(data.staffPersonId).toBe('staff-1');
    expect(data.studentClassEnrollmentId).toBeNull();
  });

  it('upserts an existing student + subject + date pair instead of a duplicate row', async () => {
    const { service, prisma } = setup();
    prisma.attendance.findFirst.mockResolvedValue({ id: 'att-1', status: 'PRESENT' });
    prisma.attendance.update.mockResolvedValue({ id: 'att-1' });

    await service.record(CTX, {
      rows: [
        {
          studentClassEnrollmentId: 'enr-1',
          subjectId: 'sub-1',
          date: '2026-09-01',
          status: 'ABSENT' as never,
        },
      ],
    });

    expect(prisma.attendance.update).toHaveBeenCalledTimes(1);
    expect(prisma.attendance.create).not.toHaveBeenCalled();
    expect(prisma.attendance.update.mock.calls[0][0].data.status).toBe('ABSENT');
  });
});