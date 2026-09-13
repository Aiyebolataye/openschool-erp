import { PrismaClient, UserRole, Gender, EnrollmentStatus, InvoiceStatus, PaymentStatus, PaymentMethod, NotificationStatus, AttendanceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Password@123';
export const SEED_INVITATION_EMAIL = 'candidate@greenfield.edu.ng';
export const SEED_INVITATION_RAW_TOKEN = 'seed-invitation-token-0001';
export const SEED_ONBOARDING_EMAIL = 'provisioned.teacher@greenfield.edu.ng';
export const SEED_ONBOARDING_RAW_TOKEN = 'seed-onboarding-token-0001';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function internalEmail(firstName: string, lastName: string, institutionCode: string): string {
  const part = (value: string) =>
    value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  const local = `${part(firstName).slice(0, 10)}.${part(lastName).slice(0, 10)}`;
  const domain = part(institutionCode).slice(0, 24) || 'school';
  return `${local}@${domain}.local`;
}

async function main() {
  console.log('Seeding database...');

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Greenfield Academy',
      slug: 'greenfield-academy',
      subdomain: 'greenfield',
      primaryColor: '#16A34A',
      subscription: 'premium',
      maxStudents: 2000,
      maxStaff: 300,
    },
  });

  const institution = await prisma.institution.create({
    data: {
      tenantId: tenant.id,
      name: 'Greenfield Academy',
      code: 'GA',
      address: '123 Academy Drive',
      city: 'Lagos',
      state: 'Lagos',
      country: 'NG',
      phone: '+234 801 234 5678',
      email: 'admin@greenfield.edu.ng',
      motto: 'Excellence in Education',
      timezone: 'Africa/Lagos',
      currency: 'NGN',
    },
  });

  await prisma.department.createMany({
    data: [
      { tenantId: tenant.id, institutionId: institution.id, name: 'Science Department', code: 'SCI' },
      { tenantId: tenant.id, institutionId: institution.id, name: 'Arts Department', code: 'ART' },
      { tenantId: tenant.id, institutionId: institution.id, name: 'Commercial Department', code: 'COM' },
      { tenantId: tenant.id, institutionId: institution.id, name: 'Junior School', code: 'JNR' },
      { tenantId: tenant.id, institutionId: institution.id, name: 'Senior School', code: 'SNR' },
    ],
  });

  const academicYear = await prisma.academicYear.create({
    data: {
      tenantId: tenant.id,
      institutionId: institution.id,
      name: '2025/2026',
      startYear: 2025,
      endYear: 2026,
      isCurrent: true,
    },
  });

  await prisma.term.createMany({
    data: [
      { tenantId: tenant.id, academicYearId: academicYear.id, name: 'First Term', startDate: new Date('2025-09-08'), endDate: new Date('2025-12-12'), isCurrent: true },
      { tenantId: tenant.id, academicYearId: academicYear.id, name: 'Second Term', startDate: new Date('2026-01-05'), endDate: new Date('2026-03-27') },
      { tenantId: tenant.id, academicYearId: academicYear.id, name: 'Third Term', startDate: new Date('2026-04-13'), endDate: new Date('2026-07-17') },
    ],
  });

  const currentTerm = await prisma.term.findFirst({
    where: { academicYearId: academicYear.id, isCurrent: true },
  });

  const curriculum = await prisma.curriculum.create({
    data: {
      tenantId: tenant.id,
      institutionId: institution.id,
      academicYearId: academicYear.id,
      name: 'Standard Curriculum',
      version: '1.0',
    },
  });

  const subjects = await prisma.subject.createMany({
    data: [
      { tenantId: tenant.id, institutionId: institution.id, curriculumId: curriculum.id, code: 'MTH', name: 'Mathematics', creditHours: 4 },
      { tenantId: tenant.id, institutionId: institution.id, curriculumId: curriculum.id, code: 'ENG', name: 'English Language', creditHours: 4 },
      { tenantId: tenant.id, institutionId: institution.id, curriculumId: curriculum.id, code: 'PHY', name: 'Physics', creditHours: 3 },
      { tenantId: tenant.id, institutionId: institution.id, curriculumId: curriculum.id, code: 'CHM', name: 'Chemistry', creditHours: 3 },
      { tenantId: tenant.id, institutionId: institution.id, curriculumId: curriculum.id, code: 'BIO', name: 'Biology', creditHours: 3 },
      { tenantId: tenant.id, institutionId: institution.id, curriculumId: curriculum.id, code: 'LIT', name: 'Literature in English', creditHours: 3 },
      { tenantId: tenant.id, institutionId: institution.id, curriculumId: curriculum.id, code: 'GOV', name: 'Government', creditHours: 3 },
      { tenantId: tenant.id, institutionId: institution.id, curriculumId: curriculum.id, code: 'ECO', name: 'Economics', creditHours: 3 },
      { tenantId: tenant.id, institutionId: institution.id, curriculumId: curriculum.id, code: 'ACC', name: 'Accounting', creditHours: 3 },
      { tenantId: tenant.id, institutionId: institution.id, curriculumId: curriculum.id, code: 'YOR', name: 'Yoruba Language', creditHours: 2 },
      { tenantId: tenant.id, institutionId: institution.id, curriculumId: curriculum.id, code: 'CIV', name: 'Civic Education', creditHours: 2 },
      { tenantId: tenant.id, institutionId: institution.id, curriculumId: curriculum.id, code: 'FUR', name: 'Further Mathematics', creditHours: 3 },
      { tenantId: tenant.id, institutionId: institution.id, curriculumId: curriculum.id, code: 'COM', name: 'Computer Science', creditHours: 3 },
    ],
  });

  const mathSubject = await prisma.subject.findFirst({ where: { code: 'MTH', tenantId: tenant.id } });
  const engSubject = await prisma.subject.findFirst({ where: { code: 'ENG', tenantId: tenant.id } });

  const ss1Classes = [];
  if (mathSubject && engSubject) {
    const [created1, created2] = await Promise.all([
      prisma.class.create({ data: { tenantId: tenant.id, institutionId: institution.id, subjectId: mathSubject.id, academicYearId: academicYear.id, name: 'SS 1 Science', section: 'A', capacity: 35 } }),
      prisma.class.create({ data: { tenantId: tenant.id, institutionId: institution.id, subjectId: engSubject.id, academicYearId: academicYear.id, name: 'SS 1 Arts', section: 'A', capacity: 30 } }),
    ]);
    ss1Classes.push(created1, created2);
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const users = await Promise.all([
    prisma.user.create({ data: { tenantId: tenant.id, email: 'admin@greenfield.edu.ng', passwordHash, firstName: 'Sarah', lastName: 'Mitchell', phone: '+234 801 234 5678', status: 'ACTIVE' } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'principal@greenfield.edu.ng', passwordHash, firstName: 'Mrs', lastName: 'Ajayi', phone: '+234 801 234 5680', status: 'ACTIVE' } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'teacher1@greenfield.edu.ng', passwordHash, firstName: 'Mr', lastName: 'Okafor', phone: '+234 801 234 5682', status: 'ACTIVE' } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'hostel@greenfield.edu.ng', passwordHash, firstName: 'Mr', lastName: 'Okoye', phone: '+234 801 234 5684', status: 'ACTIVE' } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'nurse@greenfield.edu.ng', passwordHash, firstName: 'Nurse', lastName: 'Fatima', phone: '+234 801 234 5686', status: 'ACTIVE' } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'librarian@greenfield.edu.ng', passwordHash, firstName: 'Mrs', lastName: 'Ibrahim', phone: '+234 801 234 5688', status: 'ACTIVE' } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'transport@greenfield.edu.ng', passwordHash, firstName: 'Mr', lastName: 'Musa Idris', phone: '+234 801 234 5690', status: 'ACTIVE' } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'hr@greenfield.edu.ng', passwordHash, firstName: 'Mrs', lastName: 'Ngozi Bello', phone: '+234 801 234 5692', status: 'ACTIVE' } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'student-mgmt@greenfield.edu.ng', passwordHash, firstName: 'Mrs', lastName: 'Adaeze Chukwu', phone: '+234 801 234 5694', status: 'ACTIVE' } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'bursar@greenfield.edu.ng', passwordHash, firstName: 'Mrs', lastName: 'Chiamaka Okafor', phone: '+234 801 234 5696', status: 'ACTIVE' } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'parent@greenfield.edu.ng', passwordHash, firstName: 'Mr', lastName: 'Eze', phone: '+234 801 234 5700', status: 'ACTIVE' } }),
  ]);

  const roles = await Promise.all([
    prisma.role.create({ data: { name: 'PLATFORM_ADMIN', description: 'Platform administrator', isSystem: true } }),
    prisma.role.create({ data: { name: 'INSTITUTION_ADMIN', description: 'Institution administrator', isSystem: true } }),
    prisma.role.create({ data: { name: 'PRINCIPAL', description: 'School principal', isSystem: true } }),
    prisma.role.create({ data: { name: 'TEACHER', description: 'Teaching staff', isSystem: true } }),
    prisma.role.create({ data: { name: 'STUDENT', description: 'Student', isSystem: true } }),
    prisma.role.create({ data: { name: 'PARENT', description: 'Parent/Guardian', isSystem: true } }),
    prisma.role.create({ data: { name: 'HOSTEL_ADMIN', description: 'Hostel administrator', isSystem: true } }),
    prisma.role.create({ data: { name: 'CLINIC_ADMIN', description: 'Clinic administrator', isSystem: true } }),
    prisma.role.create({ data: { name: 'LIBRARIAN', description: 'Librarian', isSystem: true } }),
    prisma.role.create({ data: { name: 'TRANSPORT_MANAGER', description: 'Transport manager', isSystem: true } }),
    prisma.role.create({ data: { name: 'HR_OFFICER', description: 'HR/Payroll officer', isSystem: true } }),
    prisma.role.create({ data: { name: 'STUDENT_MANAGEMENT_OFFICER', description: 'Student management officer', isSystem: true } }),
    prisma.role.create({ data: { name: 'BURSAR', description: 'Bursar', isSystem: true } }),
    prisma.role.create({ data: { name: 'ORG_ADMIN', description: 'Organization administrator', isSystem: true } }),
    prisma.role.create({ data: { name: 'PRIMARY_INSTITUTION_ADMIN', description: 'Primary institution administrator', isSystem: true } }),
  ]);

  await prisma.userRoleAssignment.createMany({
    data: [
      { userId: users[0].id, roleId: roles[0].id },
      { userId: users[1].id, roleId: roles[2].id },
      { userId: users[2].id, roleId: roles[3].id },
      { userId: users[3].id, roleId: roles[6].id },
      { userId: users[4].id, roleId: roles[7].id },
      { userId: users[5].id, roleId: roles[8].id },
      { userId: users[6].id, roleId: roles[9].id },
      { userId: users[7].id, roleId: roles[10].id },
      { userId: users[8].id, roleId: roles[11].id },
      { userId: users[9].id, roleId: roles[12].id },
      { userId: users[10].id, roleId: roles[5].id },
    ],
  });

  // B1: mark seeded accounts as email-verified (D-02: privileged roles require verification)
  await Promise.all(
    users.map((u) =>
      prisma.user.update({
        where: { id: u.id },
        data: { emailVerifiedAt: new Date() },
      }),
    ),
  );

  // B1: seed identity:invitation + identity:onboarding permissions for admin roles
  await prisma.permission.createMany({
    data: [
      ...['list', 'read', 'create', 'revoke'].map((action) => ({
        resource: 'identity:invitation',
        action,
        description: `${action} invitations`,
      })),
      {
        resource: 'identity:onboarding',
        action: 'create',
        description: 'issue onboarding links',
      },
      // B5 (P1.7): read-only audit access for admin roles
      {
        resource: 'identity:audit_log',
        action: 'list',
        description: 'list audit log entries',
      },
      {
        resource: 'identity:audit_log',
        action: 'read',
        description: 'read audit log entries',
      },
    ],
  });

  const invitationPermissionRows = await prisma.permission.findMany({
    where: { resource: 'identity:invitation' },
  });
  const onboardingPermissionRows = await prisma.permission.findMany({
    where: { resource: 'identity:onboarding' },
  });
  const auditLogPermissionRows = await prisma.permission.findMany({
    where: { resource: 'identity:audit_log' },
  });

  const adminRoleIds = roles
    .filter((r) =>
      ['PLATFORM_ADMIN', 'ORG_ADMIN', 'PRIMARY_INSTITUTION_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL'].includes(
        r.name,
      ),
    )
    .map((r) => r.id);

  await prisma.rolePermission.createMany({
    data: [
      ...invitationPermissionRows.flatMap((p) =>
        adminRoleIds.map((roleId) => ({ roleId, permissionId: p.id })),
      ),
      ...onboardingPermissionRows.flatMap((p) =>
        adminRoleIds.map((roleId) => ({ roleId, permissionId: p.id })),
      ),
      ...auditLogPermissionRows.flatMap((p) =>
        adminRoleIds.map((roleId) => ({ roleId, permissionId: p.id })),
      ),
    ],
  });

  // B1: seed one pending invitation (TEACHER) for demo/e2e acceptance
  await prisma.userInvitation.create({
    data: {
      tenantId: tenant.id,
      email: SEED_INVITATION_EMAIL,
      token: hashToken(SEED_INVITATION_RAW_TOKEN),
      roleId: roles[3].id,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Staff
  const staffUsers = [
    { user: users[1], staffNumber: 'STF-001', firstName: 'Mrs', lastName: 'Ajayi', gender: 'FEMALE' as Gender, position: 'Principal', department: 'Administration', hireDate: new Date('2020-01-15') },
    { user: users[2], staffNumber: 'STF-002', firstName: 'Mr', lastName: 'Okafor', gender: 'MALE' as Gender, position: 'Senior Teacher', department: 'Science', specialization: 'Physics', hireDate: new Date('2019-09-01') },
    { user: users[3], staffNumber: 'STF-003', firstName: 'Mr', lastName: 'Okoye', gender: 'MALE' as Gender, position: 'Hostel Warden', department: 'Hostels', hireDate: new Date('2021-08-15') },
    { user: users[4], staffNumber: 'STF-004', firstName: 'Nurse', lastName: 'Fatima', gender: 'FEMALE' as Gender, position: 'School Nurse', department: 'Clinic', hireDate: new Date('2022-01-10') },
    { user: users[5], staffNumber: 'STF-005', firstName: 'Mrs', lastName: 'Ibrahim', gender: 'FEMALE' as Gender, position: 'Head Librarian', department: 'Library', hireDate: new Date('2019-03-01') },
    { user: users[6], staffNumber: 'STF-006', firstName: 'Mr', lastName: 'Musa Idris', gender: 'MALE' as Gender, position: 'Transport Manager', department: 'Transport', hireDate: new Date('2021-06-01') },
    { user: users[7], staffNumber: 'STF-007', firstName: 'Mrs', lastName: 'Ngozi Bello', gender: 'FEMALE' as Gender, position: 'HR Officer', department: 'HR', hireDate: new Date('2020-09-01') },
    { user: users[8], staffNumber: 'STF-008', firstName: 'Mrs', lastName: 'Adaeze Chukwu', gender: 'FEMALE' as Gender, position: 'Student Management Officer', department: 'Student Affairs', hireDate: new Date('2022-04-01') },
    { user: users[9], staffNumber: 'STF-009', firstName: 'Mrs', lastName: 'Chiamaka Okafor', gender: 'FEMALE' as Gender, position: 'Bursar', department: 'Finance', hireDate: new Date('2019-01-01') },
  ];

  const createdStaff = [];
  for (const s of staffUsers) {
    const staff = await prisma.staff.create({
      data: {
        tenantId: tenant.id,
        institutionId: institution.id,
        userId: s.user.id,
        staffNumber: s.staffNumber,
        internalEmail: internalEmail(s.firstName, s.lastName, institution.code),
        firstName: s.firstName,
        lastName: s.lastName,
        gender: s.gender,
        position: s.position,
        department: s.department,
        specialization: s.specialization,
        hireDate: s.hireDate,
      },
    });
    createdStaff.push(staff);
  }

  // B1: identity memberships — an organization-level membership for every
  // seeded account and an institution-level membership for institution-holding
  // identities (backfill; memberships carry the identity context used by login
  // resolution and authorization).
  await prisma.organizationMembership.createMany({
    data: users.map((u) => ({ tenantId: tenant.id, userId: u.id, status: 'ACTIVE' })),
  });

  await prisma.institutionMembership.createMany({
    data: createdStaff.flatMap((s) =>
      s.userId
        ? [{ tenantId: tenant.id, institutionId: s.institutionId, userId: s.userId, status: 'ACTIVE' }]
        : [],
    ),
  });

  // B1: provisioned teacher account + six-month onboarding link (single-use,
  // hashed at rest). The claim is the initial email verification + activation.
  const teacherRole = roles.find((r) => r.name === 'TEACHER');
  const provisionedTeacher = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: SEED_ONBOARDING_EMAIL,
      passwordHash,
      firstName: 'Provisioned',
      lastName: 'Teacher',
      status: 'ACTIVE',
      ...(teacherRole ? { roles: { create: { roleId: teacherRole.id } } } : {}),
    },
  });

  await prisma.organizationMembership.create({
    data: { tenantId: tenant.id, userId: provisionedTeacher.id, status: 'ACTIVE' },
  });

  await prisma.onboardingLink.create({
    data: {
      tenantId: tenant.id,
      userId: provisionedTeacher.id,
      email: SEED_ONBOARDING_EMAIL,
      token: hashToken(SEED_ONBOARDING_RAW_TOKEN),
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 182 * 24 * 60 * 60 * 1000),
    },
  });

  // Students
  const parentUser = users[10];
  const guardian = await prisma.guardian.create({
    data: {
      tenantId: tenant.id,
      userId: parentUser.id,
      firstName: 'Mr',
      lastName: 'Eze',
      email: 'parent@greenfield.edu.ng',
      phone: '+234 801 234 5700',
      occupation: 'Engineer',
      relationship: 'Father',
      isPrimary: true,
    },
  });

  const studentsData = [
    { studentNumber: 'STU-21401', firstName: 'Chidi', lastName: 'Eze', gender: 'MALE' as Gender, dateOfBirth: new Date('2008-05-15'), admissionDate: new Date('2023-09-04'), status: 'ACTIVE' as EnrollmentStatus, phone: '+234 802 111 2222', address: '14 Palm Avenue, Lagos', bloodGroup: 'O+', stateOfOrigin: 'Enugu' },
    { studentNumber: 'STU-21411', firstName: 'Kayode', lastName: 'Eze', gender: 'MALE' as Gender, dateOfBirth: new Date('2007-11-22'), admissionDate: new Date('2022-09-05'), status: 'ACTIVE' as EnrollmentStatus, phone: '+234 802 111 2223', address: '14 Palm Avenue, Lagos', bloodGroup: 'A+', stateOfOrigin: 'Enugu' },
    { studentNumber: 'STU-21402', firstName: 'Aisha', lastName: 'Bello', gender: 'FEMALE' as Gender, dateOfBirth: new Date('2008-03-10'), admissionDate: new Date('2023-09-04'), status: 'ACTIVE' as EnrollmentStatus, phone: '+234 802 111 2224', address: '7 Victoria Island, Lagos' },
    { studentNumber: 'STU-21403', firstName: 'Tunde', lastName: 'Olawale', gender: 'MALE' as Gender, dateOfBirth: new Date('2008-07-18'), admissionDate: new Date('2023-09-04'), status: 'ACTIVE' as EnrollmentStatus, phone: '+234 802 111 2225', address: '23 Ikeja, Lagos' },
    { studentNumber: 'STU-21404', firstName: 'Ngozi', lastName: 'Nwosu', gender: 'FEMALE' as Gender, dateOfBirth: new Date('2008-01-25'), admissionDate: new Date('2023-09-04'), status: 'ACTIVE' as EnrollmentStatus, phone: '+234 802 111 2226', address: '56 Surulere, Lagos' },
  ];

  const createdStudents = [];
  for (const s of studentsData) {
    const student = await prisma.student.create({
      data: {
        tenantId: tenant.id,
        institutionId: institution.id,
        studentNumber: s.studentNumber,
        internalEmail: internalEmail(s.firstName, s.lastName, institution.code),
        firstName: s.firstName,
        lastName: s.lastName,
        gender: s.gender,
        dateOfBirth: s.dateOfBirth,
        admissionDate: s.admissionDate,
        status: s.status,
        phone: s.phone,
        address: s.address,
        bloodGroup: s.bloodGroup,
        stateOfOrigin: s.stateOfOrigin,
      },
    });
    createdStudents.push(student);
  }

  await prisma.studentGuardianRelationship.createMany({
    data: [
      { tenantId: tenant.id, studentId: createdStudents[0].id, guardianId: guardian.id, relationship: 'Father', isPrimary: true },
      { tenantId: tenant.id, studentId: createdStudents[1].id, guardianId: guardian.id, relationship: 'Father', isPrimary: true },
    ],
  });

  // Enrollments
  if (ss1Classes.length > 0) {
    await prisma.enrollment.createMany({
      data: [
        { tenantId: tenant.id, studentId: createdStudents[0].id, classId: ss1Classes[0].id, academicYearId: academicYear.id, status: 'ACTIVE' },
        { tenantId: tenant.id, studentId: createdStudents[1].id, classId: ss1Classes[0].id, academicYearId: academicYear.id, status: 'ACTIVE' },
        { tenantId: tenant.id, studentId: createdStudents[2].id, classId: ss1Classes[1].id, academicYearId: academicYear.id, status: 'ACTIVE' },
        { tenantId: tenant.id, studentId: createdStudents[3].id, classId: ss1Classes[0].id, academicYearId: academicYear.id, status: 'ACTIVE' },
        { tenantId: tenant.id, studentId: createdStudents[4].id, classId: ss1Classes[1].id, academicYearId: academicYear.id, status: 'ACTIVE' },
      ],
    });
  }

  // Fee structures
  const feeStructures = await Promise.all([
    prisma.feeStructure.create({ data: { tenantId: tenant.id, institutionId: institution.id, academicYearId: academicYear.id, termId: currentTerm?.id, name: 'Tuition Fee', category: 'tuition', amount: 450000, currency: 'NGN', isMandatory: true } }),
    prisma.feeStructure.create({ data: { tenantId: tenant.id, institutionId: institution.id, academicYearId: academicYear.id, termId: currentTerm?.id, name: 'Hostel Fee', category: 'hostel', amount: 120000, currency: 'NGN', isMandatory: false } }),
    prisma.feeStructure.create({ data: { tenantId: tenant.id, institutionId: institution.id, academicYearId: academicYear.id, termId: currentTerm?.id, name: 'Transport Fee', category: 'transport', amount: 80000, currency: 'NGN', isMandatory: false } }),
  ]);

  // Invoices for Chidi and Kayode
  for (const student of [createdStudents[0], createdStudents[1]]) {
    for (const fee of feeStructures) {
      await prisma.invoice.create({
        data: {
          tenantId: tenant.id,
          studentId: student.id,
          feeStructureId: fee.id,
          academicYearId: academicYear.id,
          termId: currentTerm?.id,
          invoiceNumber: `INV-${student.studentNumber}-${fee.category.toUpperCase()}-${Date.now()}`,
          description: `${fee.name} for ${currentTerm?.name || 'Term'}`,
          totalAmount: fee.amount,
          paidAmount: 0,
          balance: fee.amount,
          status: 'PENDING',
          dueDate: new Date('2026-10-31'),
        },
      });
    }
  }

  // Transport routes
  const route = await prisma.transportRoute.create({
    data: {
      tenantId: tenant.id,
      institutionId: institution.id,
      name: 'Route A - Victoria Island',
      code: 'RTA',
      description: 'Victoria Island → Lekki → School',
      stops: ['Victoria Island Phase 1', 'Lekki Phase 2', 'School Gate'],
      distance: 12.5,
      estimatedTime: 35,
    },
  });

  await prisma.vehicle.create({
    data: {
      tenantId: tenant.id,
      routeId: route.id,
      plateNumber: 'ABC-123-DE',
      type: 'Bus',
      capacity: 30,
      driverName: 'Mr. Chinedu',
      driverPhone: '+234 803 333 4444',
    },
  });

  // Hostels
  const hostel = await prisma.hostel.create({
    data: {
      tenantId: tenant.id,
      institutionId: institution.id,
      name: 'Red House',
      code: 'RH',
      gender: 'MALE',
      capacity: 80,
      wardenStaffId: createdStaff[2].id,
      phone: '+234 801 234 5710',
    },
  });

  await prisma.hostelAllocation.create({
    data: {
      tenantId: tenant.id,
      hostelId: hostel.id,
      studentId: createdStudents[1].id,
      roomNumber: 'A-101',
      bedNumber: 'B1',
      startDate: new Date('2025-09-08'),
      status: 'ACTIVE',
    },
  });

  // Library
  const book = await prisma.libraryBook.create({
    data: {
      tenantId: tenant.id,
      isbn: '978-0134685991',
      title: 'Effective Java',
      author: 'Joshua Bloch',
      publisher: 'Addison-Wesley',
      category: 'Technology',
      edition: '3rd',
      totalCopies: 3,
      availableCopies: 2,
      location: 'Science Shelf A',
    },
  });

  await prisma.bookLoan.create({
    data: {
      tenantId: tenant.id,
      bookId: book.id,
      studentId: createdStudents[0].id,
      termId: currentTerm?.id,
      loanDate: new Date('2026-07-01'),
      dueDate: new Date('2026-07-15'),
      status: 'BORROWED',
    },
  });

  // B5 (P1.7, decision D-B5-3): DB-level append-only immutability for audit
  // logs. `db push --force-reset` (e2e/test global-setup) rebuilds tables from
  // the schema without triggers, so this re-applies the invariant after any
  // reset. Idempotent; the same trigger also ships in the B5 migration.
  // Prisma 6 rejects multi-statement raw SQL in a single prepared statement,
  // so each DDL command ships as its own single-statement call.
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION audit_logs_prevent_mutation()
    RETURNS TRIGGER AS $$
    BEGIN
      RAISE EXCEPTION 'audit_logs are append-only; updates and deletes are forbidden';
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS audit_logs_append_only ON audit_logs;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER audit_logs_append_only
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION audit_logs_prevent_mutation();
  `);

  console.log('Seed completed successfully.');
  console.log(`Tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`Users: ${users.length}`);
  console.log(`Students: ${createdStudents.length}`);
  console.log(`Staff: ${createdStaff.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });