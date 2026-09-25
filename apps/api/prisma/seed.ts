import {
  PrismaClient,
  Gender,
  InvoiceStatus,
  PaymentStatus,
  PaymentMethod,
  NotificationStatus,
  AttendanceStatus,
  StudentStatus,
  StaffStatus,
  EmploymentType,
  ContactPreference,
  RelationshipType,
  RoleContext,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Password@123';
export const SEED_INVITATION_EMAIL = 'candidate@greenfield.edu.ng';
export const SEED_INVITATION_RAW_TOKEN = 'seed-invitation-token-0001';
export const SEED_ONBOARDING_EMAIL = 'provisioned.teacher@greenfield.edu.ng';
export const SEED_ONBOARDING_RAW_TOKEN = 'seed-onboarding-token-0001';

const PUBLIC_ID_YEAR = new Date().getFullYear();

// Matches the frozen People format `<PREFIX>-<YYYY>-<NNNNNN>` (see
// src/modules/people/people.utils.ts). Seed sequences are deterministic and
// unique within their tenant-scoped table.
function publicId(prefix: 'P' | 'STU' | 'EMP' | 'APP', sequence: number): string {
  return `${prefix}-${PUBLIC_ID_YEAR}-${String(sequence).padStart(6, '0')}`;
}

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

  // PHASE 5 (P5.1-P5.8): academic fixtures re-authored against the frozen
  // Academic schema (engineering/Academic Management Engineering.md §7-8).
  // See docs/PHASE_5_MIGRATION_REPORT.md for the legacy-tables disposition.
  // Calendar: Year → Session → Terms; departments; subjects; grade levels +
  // streams → classes; students are placed via student_class_enrollments
  // (student_person_id = Person.id, per the frozen cross-domain decision).
  await prisma.department.createMany({
    data: [
      { tenantId: tenant.id, institutionId: institution.id, name: 'Science Department' },
      { tenantId: tenant.id, institutionId: institution.id, name: 'Arts Department' },
      { tenantId: tenant.id, institutionId: institution.id, name: 'Commercial Department' },
    ],
  });

  const deptScience = await prisma.department.findFirst({ where: { tenantId: tenant.id, name: 'Science Department' } });
  const deptArts = await prisma.department.findFirst({ where: { tenantId: tenant.id, name: 'Arts Department' } });
  const deptCommercial = await prisma.department.findFirst({ where: { tenantId: tenant.id, name: 'Commercial Department' } });

  const academicYear = await prisma.academicYear.create({
    data: {
      tenantId: tenant.id,
      institutionId: institution.id,
      name: '2025/2026',
      startDate: new Date('2025-09-08'),
      endDate: new Date('2026-07-17'),
      status: 'ACTIVE',
      isActive: true,
    },
  });

  const academicSession = await prisma.academicSession.create({
    data: {
      tenantId: tenant.id,
      institutionId: institution.id,
      academicYearId: academicYear.id,
      name: '2025/2026 Session',
      startDate: new Date('2025-09-08'),
      endDate: new Date('2026-07-17'),
      status: 'ACTIVE',
    },
  });

  await prisma.term.createMany({
    data: [
      { tenantId: tenant.id, institutionId: institution.id, academicSessionId: academicSession.id, name: 'First Term', startDate: new Date('2025-09-08'), endDate: new Date('2025-12-12'), status: 'ACTIVE' },
      { tenantId: tenant.id, institutionId: institution.id, academicSessionId: academicSession.id, name: 'Second Term', startDate: new Date('2026-01-05'), endDate: new Date('2026-03-27'), status: 'ACTIVE' },
      { tenantId: tenant.id, institutionId: institution.id, academicSessionId: academicSession.id, name: 'Third Term', startDate: new Date('2026-04-13'), endDate: new Date('2026-07-17'), status: 'DRAFT' },
    ],
  });

  const currentTerm = await prisma.term.findFirst({
    where: { academicSessionId: academicSession.id, status: 'ACTIVE' },
    orderBy: { name: 'asc' },
  });

  const subjects = await prisma.subject.createMany({
    data: [
      { tenantId: tenant.id, institutionId: institution.id, departmentId: deptScience?.id, code: 'MTH', name: 'Mathematics', status: 'ACTIVE' },
      { tenantId: tenant.id, institutionId: institution.id, departmentId: deptArts?.id, code: 'ENG', name: 'English Language', status: 'ACTIVE' },
      { tenantId: tenant.id, institutionId: institution.id, departmentId: deptScience?.id, code: 'PHY', name: 'Physics', status: 'ACTIVE' },
      { tenantId: tenant.id, institutionId: institution.id, departmentId: deptScience?.id, code: 'CHM', name: 'Chemistry', status: 'ACTIVE' },
      { tenantId: tenant.id, institutionId: institution.id, departmentId: deptScience?.id, code: 'BIO', name: 'Biology', status: 'ACTIVE' },
      { tenantId: tenant.id, institutionId: institution.id, departmentId: deptArts?.id, code: 'LIT', name: 'Literature in English', status: 'ACTIVE' },
      { tenantId: tenant.id, institutionId: institution.id, departmentId: deptArts?.id, code: 'GOV', name: 'Government', status: 'ACTIVE' },
      { tenantId: tenant.id, institutionId: institution.id, departmentId: deptCommercial?.id, code: 'ECO', name: 'Economics', status: 'ACTIVE' },
      { tenantId: tenant.id, institutionId: institution.id, departmentId: deptCommercial?.id, code: 'ACC', name: 'Accounting', status: 'ACTIVE' },
      { tenantId: tenant.id, institutionId: institution.id, departmentId: deptArts?.id, code: 'YOR', name: 'Yoruba Language', status: 'ACTIVE' },
      { tenantId: tenant.id, institutionId: institution.id, departmentId: deptArts?.id, code: 'CIV', name: 'Civic Education', status: 'ACTIVE' },
      { tenantId: tenant.id, institutionId: institution.id, departmentId: deptScience?.id, code: 'FUR', name: 'Further Mathematics', status: 'ACTIVE' },
      { tenantId: tenant.id, institutionId: institution.id, departmentId: deptScience?.id, code: 'COM', name: 'Computer Science', status: 'ACTIVE' },
    ],
  });

  // P5.2 subject groups: 'Core Science' bundles the science subjects.
  const coreScienceGroup = await prisma.subjectGroup.create({
    data: {
      tenantId: tenant.id,
      institutionId: institution.id,
      name: 'Core Science',
      description: 'Core science subjects for SS1',
    },
  });
  const coreSubjects = await prisma.subject.findMany({
    where: { tenantId: tenant.id, code: { in: ['MTH', 'PHY', 'CHM', 'BIO'] } },
  });
  if (coreSubjects.length === 4) {
    await prisma.subjectSubjectGroup.createMany({
      data: coreSubjects.map((s) => ({
        tenantId: tenant.id,
        subjectId: s.id,
        subjectGroupId: coreScienceGroup.id,
      })),
    });
  }

  // Class structure: grade level + streams → classes.
  const ss1GradeLevel = await prisma.gradeLevel.create({
    data: { tenantId: tenant.id, institutionId: institution.id, name: 'SS1', displayOrder: 1, status: 'ACTIVE' },
  });
  const [scienceStream, artsStream] = await Promise.all([
    prisma.stream.create({ data: { tenantId: tenant.id, institutionId: institution.id, gradeLevelId: ss1GradeLevel.id, name: 'Science' } }),
    prisma.stream.create({ data: { tenantId: tenant.id, institutionId: institution.id, gradeLevelId: ss1GradeLevel.id, name: 'Arts' } }),
  ]);

  const ss1Classes = [];
  const [ss1Science, ss1Arts] = await Promise.all([
    prisma.class.create({ data: { tenantId: tenant.id, institutionId: institution.id, gradeLevelId: ss1GradeLevel.id, streamId: scienceStream.id, name: 'SS 1 Science', capacity: 35, status: 'ACTIVE' } }),
    prisma.class.create({ data: { tenantId: tenant.id, institutionId: institution.id, gradeLevelId: ss1GradeLevel.id, streamId: artsStream.id, name: 'SS 1 Arts', capacity: 30, status: 'ACTIVE' } }),
  ]);
  ss1Classes.push(ss1Science, ss1Arts);

  // P5.6 grading: standard scale + boundaries (drives result compilation).
  const standardScale = await prisma.gradeScale.create({
    data: { tenantId: tenant.id, institutionId: institution.id, name: 'Standard Scale', status: 'ACTIVE' },
  });
  await prisma.gradeBoundary.createMany({
    data: [
      { tenantId: tenant.id, institutionId: institution.id, gradeScaleId: standardScale.id, grade: 'A', minScore: 70, maxScore: 100, remark: 'Excellent', displayOrder: 1 },
      { tenantId: tenant.id, institutionId: institution.id, gradeScaleId: standardScale.id, grade: 'B', minScore: 60, maxScore: 69, remark: 'Very Good', displayOrder: 2 },
      { tenantId: tenant.id, institutionId: institution.id, gradeScaleId: standardScale.id, grade: 'C', minScore: 50, maxScore: 59, remark: 'Good', displayOrder: 3 },
      { tenantId: tenant.id, institutionId: institution.id, gradeScaleId: standardScale.id, grade: 'D', minScore: 40, maxScore: 49, remark: 'Fair', displayOrder: 4 },
      { tenantId: tenant.id, institutionId: institution.id, gradeScaleId: standardScale.id, grade: 'F', minScore: 0, maxScore: 39, remark: 'Fail', displayOrder: 5 },
    ],
  });

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

  // RBAC-3 (P2.3, Option 2): `user_roles` is tenant-scoped —
  // `UserRoleAssignment` carries `tenantId NOT NULL` with
  // `@@unique([tenantId, userId, roleId])`. Every seeded assignment therefore
  // binds the role within the Greenfield tenant context.
  await prisma.userRoleAssignment.createMany({
    data: [
      { tenantId: tenant.id, userId: users[0].id, roleId: roles[0].id },
      { tenantId: tenant.id, userId: users[1].id, roleId: roles[2].id },
      { tenantId: tenant.id, userId: users[2].id, roleId: roles[3].id },
      { tenantId: tenant.id, userId: users[3].id, roleId: roles[6].id },
      { tenantId: tenant.id, userId: users[4].id, roleId: roles[7].id },
      { tenantId: tenant.id, userId: users[5].id, roleId: roles[8].id },
      { tenantId: tenant.id, userId: users[6].id, roleId: roles[9].id },
      { tenantId: tenant.id, userId: users[7].id, roleId: roles[10].id },
      { tenantId: tenant.id, userId: users[8].id, roleId: roles[11].id },
      { tenantId: tenant.id, userId: users[9].id, roleId: roles[12].id },
      { tenantId: tenant.id, userId: users[10].id, roleId: roles[5].id },
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

  // B4 (RBAC-1 / P2.1): register the complete frozen identity permission catalogue.
  // Rows below mirror the authoritative endpoint -> permission matrix verbatim from the
  // frozen spec (engineering/Identity & Access Engineering.md, section 10 - API Catalogue).
  // Two-layer model per ADR-002: Resources live on Permission; Permission Groups bundle
  // them for API-key scoping.
  await prisma.permission.createMany({
    data: [
      // identity:user
      ...['list', 'read', 'create', 'update', 'delete'].map((action) => ({
        resource: 'identity:user',
        action,
        description: `${action} users`,
      })),
      {
        resource: 'identity:user',
        action: 'assign',
        description: 'assign users to roles',
      },
      // identity:role
      ...['list', 'read', 'create', 'update', 'delete'].map((action) => ({
        resource: 'identity:role',
        action,
        description: `${action} roles`,
      })),
      {
        resource: 'identity:role',
        action: 'assign',
        description: 'assign roles to users',
      },
      // identity:permission
      ...['list', 'read', 'create'].map((action) => ({
        resource: 'identity:permission',
        action,
        description: `${action} permissions`,
      })),
      // identity:permission_group (two-layer model ADR-002)
      ...['list', 'read', 'create', 'update', 'delete'].map((action) => ({
        resource: 'identity:permission_group',
        action,
        description: `${action} permission groups`,
      })),
      {
        resource: 'identity:permission_group',
        action: 'assign',
        description: 'assign permissions to groups',
      },
      // identity:delegation
      ...['list', 'read', 'create', 'cancel'].map((action) => ({
        resource: 'identity:delegation',
        action,
        description: `${action} delegations`,
      })),
      // identity:session
      ...['list', 'read', 'revoke'].map((action) => ({
        resource: 'identity:session',
        action,
        description: `${action} sessions`,
      })),
      {
        resource: 'identity:session',
        action: 'revoke_all',
        description: 'revoke all sessions',
      },
    ],
  });

  // PEOPLE-1 (spec §10.3): register the frozen People permission catalogue.
  // `people:*` resource action sets map verbatim from the approved
  // implementation matrix (§18 decision #5).
  await prisma.permission.createMany({
    data: [
      // people:person
      ...['list', 'read', 'create', 'update', 'delete', 'search', 'assign', 'merge'].map((action) => ({
        resource: 'people:person',
        action,
        description: `${action} people`,
      })),
      // people:student / people:staff / people:parent / people:guardian
      ...['student', 'staff', 'parent', 'guardian'].flatMap((type) =>
        ['list', 'read', 'create', 'update', 'delete'].map((action) => ({
          resource: `people:${type}`,
          action,
          description: `${action} ${type}s`,
        })),
      ),
      // people:applicant
      ...['list', 'read', 'create', 'update', 'delete', 'accept', 'reject'].map((action) => ({
        resource: 'people:applicant',
        action,
        description: `${action} applicants`,
      })),
      // people:emergency_contact / people:relationship / people:document
      ...['emergency_contact', 'relationship', 'document'].flatMap((type) =>
        ['list', 'read', 'create', 'update', 'delete'].map((action) => ({
          resource: `people:${type}`,
          action,
          description: `${action} ${type.replace('_', ' ')}s`,
        })),
      ),
    ],
  });

  // P4.1 (Institution Management): register the institution permission
  // catalogue. Admin-only in V1 — the five admin roles receive `institution:*`;
  // no non-admin role receives Institution access. Endpoint -> permission
  // mapping mirrors the approved P4.1 audit decision.
  await prisma.permission.createMany({
    data: [
      // institution:institution
      ...['list', 'read', 'create', 'update', 'delete', 'suspend', 'restore', 'archive', 'activate'].map((action) => ({
        resource: 'institution:institution',
        action,
        description: `${action} institutions`,
      })),
      // institution:config (key-addressable upsert surface -> no create)
      ...['list', 'read', 'update', 'delete'].map((action) => ({
        resource: 'institution:config',
        action,
        description: `${action} institution configuration`,
      })),
      // institution:setting (key-addressable upsert surface -> no create)
      ...['list', 'read', 'update', 'delete'].map((action) => ({
        resource: 'institution:setting',
        action,
        description: `${action} institution settings`,
      })),
    ],
  });

  // PHASE 5 (D-2): register the frozen Academic permission catalogue
  // (engineering/Academic Management Engineering.md §10.3; mapping decision —
  // docs/PHASE_5_ACADEMIC_RBAC_GRANT_MATRIX.md). No new RBAC roles; grants below.
  await prisma.permission.createMany({
    data: [
      // academics:calendar — years/sessions/terms
      ...['read', 'create', 'update', 'manage'].map((action) => ({
        resource: 'academics:calendar',
        action,
        description: `${action} academic calendar`,
      })),
      // academics:subject
      ...['read', 'create', 'update'].map((action) => ({
        resource: 'academics:subject',
        action,
        description: `${action} subjects`,
      })),
      // academics:department
      ...['read', 'create', 'update'].map((action) => ({
        resource: 'academics:department',
        action,
        description: `${action} departments`,
      })),
      // academics:grade_level
      ...['read', 'create', 'update'].map((action) => ({
        resource: 'academics:grade_level',
        action,
        description: `${action} grade levels`,
      })),
      // academics:class
      ...['read', 'create', 'update'].map((action) => ({
        resource: 'academics:class',
        action,
        description: `${action} classes`,
      })),
      // academics:teaching
      ...['read', 'create', 'update', 'delete'].map((action) => ({
        resource: 'academics:teaching',
        action,
        description: `${action} teaching assignments`,
      })),
      // academics:timetable
      ...['read', 'create', 'update', 'manage'].map((action) => ({
        resource: 'academics:timetable',
        action,
        description: `${action} timetables`,
      })),
      // academics:enrollment
      ...['read', 'create', 'update', 'delete'].map((action) => ({
        resource: 'academics:enrollment',
        action,
        description: `${action} enrollments`,
      })),
      // academics:attendance
      ...['read', 'create', 'update'].map((action) => ({
        resource: 'academics:attendance',
        action,
        description: `${action} attendance`,
      })),
      // academics:assignment
      ...['read', 'create', 'update', 'manage', 'submit', 'grade'].map((action) => ({
        resource: 'academics:assignment',
        action,
        description: `${action} assignments`,
      })),
      // academics:assessment
      ...['read', 'create', 'update', 'manage', 'grade'].map((action) => ({
        resource: 'academics:assessment',
        action,
        description: `${action} assessments`,
      })),
      // academics:grading
      ...['read', 'create', 'update'].map((action) => ({
        resource: 'academics:grading',
        action,
        description: `${action} grade scales`,
      })),
      // academics:result
      ...['read', 'compile', 'approve', 'publish', 'generate'].map((action) => ({
        resource: 'academics:result',
        action,
        description: `${action} results`,
      })),
      // academics:progression
      ...['read', 'evaluate', 'approve', 'manage'].map((action) => ({
        resource: 'academics:progression',
        action,
        description: `${action} progressions`,
      })),
      // academics:summer_school
      ...['read', 'create', 'update', 'manage', 'register', 'compile', 'publish'].map((action) => ({
        resource: 'academics:summer_school',
        action,
        description: `${action} summer school`,
      })),
      // academics:policy
      ...['read', 'create', 'update'].map((action) => ({
        resource: 'academics:policy',
        action,
        description: `${action} academic policies`,
      })),
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
  const userPermissionRows = await prisma.permission.findMany({
    where: { resource: 'identity:user' },
  });
  const rolePermissionRows = await prisma.permission.findMany({
    where: { resource: 'identity:role' },
  });
  const permissionRows = await prisma.permission.findMany({
    where: { resource: 'identity:permission' },
  });
  const permissionGroupPermissionRows = await prisma.permission.findMany({
    where: { resource: 'identity:permission_group' },
  });
  const delegationPermissionRows = await prisma.permission.findMany({
    where: { resource: 'identity:delegation' },
  });
  const sessionPermissionRows = await prisma.permission.findMany({
    where: { resource: 'identity:session' },
  });
  const peoplePermissionRows = await prisma.permission.findMany({
    where: { resource: { startsWith: 'people:' } },
  });
  const institutionPermissionRows = await prisma.permission.findMany({
    where: { resource: { startsWith: 'institution:' } },
  });
  const academicPermissionRows = await prisma.permission.findMany({
    where: { resource: { startsWith: 'academics:' } },
  });

  const adminRoleIds = roles
    .filter((r) =>
      ['PLATFORM_ADMIN', 'ORG_ADMIN', 'PRIMARY_INSTITUTION_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL'].includes(
        r.name,
      ),
    )
    .map((r) => r.id);

  // RBAC-4 (P2.5): `identity:session` is a *self-scoped* resource. Every
  // authenticated identity may list and revoke its own sessions
  // (spec §9.8 / D-05); the ObjectScopeGuard enforces the self boundary so a
  // grant can never touch another user's (or another tenant's) sessions.
  // The grant is therefore universal across seeded roles — broadening the
  // RBAC-1 admin-only grant is the object-level scope consequence, not a
  // permission-model change.
  const allRoleIds = roles.map((r) => r.id);

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
      ...userPermissionRows.flatMap((p) =>
        adminRoleIds.map((roleId) => ({ roleId, permissionId: p.id })),
      ),
      ...rolePermissionRows.flatMap((p) =>
        adminRoleIds.map((roleId) => ({ roleId, permissionId: p.id })),
      ),
      ...permissionRows.flatMap((p) =>
        adminRoleIds.map((roleId) => ({ roleId, permissionId: p.id })),
      ),
      ...permissionGroupPermissionRows.flatMap((p) =>
        adminRoleIds.map((roleId) => ({ roleId, permissionId: p.id })),
      ),
      ...delegationPermissionRows.flatMap((p) =>
        adminRoleIds.map((roleId) => ({ roleId, permissionId: p.id })),
      ),
      ...sessionPermissionRows.flatMap((p) =>
        allRoleIds.map((roleId) => ({ roleId, permissionId: p.id })),
      ),
      // PEOPLE-1: `people:*` grants mirror the approved mapping — the five
      // admin roles only. No non-admin role receives People access in V1.
      ...peoplePermissionRows.flatMap((p) =>
        adminRoleIds.map((roleId) => ({ roleId, permissionId: p.id })),
      ),
      // P4.1: `institution:*` grants mirror the approved mapping — the five
      // admin roles only. No non-admin role receives Institution access in V1.
      ...institutionPermissionRows.flatMap((p) =>
        adminRoleIds.map((roleId) => ({ roleId, permissionId: p.id })),
      ),
      // PHASE 5 (D-2): `academics:*` — the five admin roles receive the full
      // frozen catalogue. Non-admin grants follow the operational matrix below.
      ...academicPermissionRows.flatMap((p) =>
        adminRoleIds.map((roleId) => ({ roleId, permissionId: p.id })),
      ),
    ],
  });

  // PEOPLE-2 (frozen PEOPLE-G §8.3 role→permission matrix, locked decision D-B):
  // operational-role grants for People endpoints. Least privilege only; object
  // scope (tenant/institution/self) remains enforced by the guards at runtime.
  const operationalMatrix: {
    roleName: string;
    grants: { resource: string; actions: string[] }[];
  }[] = [
    {
      roleName: 'HR_OFFICER',
      grants: [{ resource: 'people:staff', actions: ['list', 'read', 'create', 'update', 'delete'] }],
    },
    {
      roleName: 'STUDENT_MANAGEMENT_OFFICER',
      grants: [
        { resource: 'people:student', actions: ['list', 'read', 'create', 'update', 'delete'] },
        { resource: 'people:applicant', actions: ['list', 'read', 'create', 'update', 'delete', 'accept', 'reject'] },
      ],
    },
    {
      roleName: 'TEACHER',
      grants: [
        { resource: 'people:person', actions: ['list', 'read', 'search'] },
        { resource: 'people:student', actions: ['list', 'read'] },
      ],
    },
    {
      roleName: 'PARENT',
      grants: [
        { resource: 'people:person', actions: ['read'] },
        { resource: 'people:student', actions: ['read'] },
      ],
    },
    {
      roleName: 'STUDENT',
      grants: [
        { resource: 'people:person', actions: ['read'] },
        { resource: 'people:student', actions: ['read'] },
      ],
    },
  ];

  const matrixGrantRows = operationalMatrix.flatMap(({ roleName, grants }) => {
    const role = roles.find((r) => r.name === roleName);
    if (!role) {
      throw new Error(`Seeded role ${roleName} not found`);
    }
    return grants.flatMap(({ resource, actions }) => {
      const perms = peoplePermissionRows.filter(
        (p) => p.resource === resource && actions.includes(p.action),
      );
      if (perms.length !== actions.length) {
        throw new Error(
          `people permissions missing for ${roleName}:${resource} (expected ${actions.join(',')})`,
        );
      }
      return perms.map((p) => ({ roleId: role.id, permissionId: p.id }));
    });
  });

  if (matrixGrantRows.length > 0) {
    await prisma.rolePermission.createMany({ data: matrixGrantRows });
  }

  // PHASE 5 (D-2): operational-role grants for Academic endpoints — least
  // privilege, mirroring the People matrix pattern. Object scope (tenant /
  // institution / self / persisted TeachingAssignment) remains enforced by the
  // guards at runtime. Frozen mapping: docs/PHASE_5_ACADEMIC_RBAC_GRANT_MATRIX.md §3.
  const academicOperationalMatrix: {
    roleName: string;
    grants: { resource: string; actions: string[] }[];
  }[] = [
    {
      roleName: 'TEACHER',
      grants: [
        { resource: 'academics:calendar', actions: ['read'] },
        { resource: 'academics:subject', actions: ['read'] },
        { resource: 'academics:department', actions: ['read'] },
        { resource: 'academics:grade_level', actions: ['read'] },
        { resource: 'academics:class', actions: ['read'] },
        { resource: 'academics:teaching', actions: ['read'] },
        { resource: 'academics:timetable', actions: ['read'] },
        { resource: 'academics:enrollment', actions: ['read'] },
        { resource: 'academics:attendance', actions: ['read', 'create', 'update'] },
        { resource: 'academics:assignment', actions: ['read', 'create', 'update', 'manage', 'grade'] },
        { resource: 'academics:assessment', actions: ['read', 'create', 'update', 'manage', 'grade'] },
        { resource: 'academics:grading', actions: ['read'] },
        { resource: 'academics:result', actions: ['read', 'approve'] },
        { resource: 'academics:progression', actions: ['read'] },
        { resource: 'academics:summer_school', actions: ['read'] },
        { resource: 'academics:policy', actions: ['read'] },
      ],
    },
    {
      roleName: 'STUDENT',
      grants: [
        { resource: 'academics:calendar', actions: ['read'] },
        { resource: 'academics:subject', actions: ['read'] },
        { resource: 'academics:class', actions: ['read'] },
        { resource: 'academics:timetable', actions: ['read'] },
        { resource: 'academics:attendance', actions: ['read'] },
        { resource: 'academics:assignment', actions: ['read', 'submit'] },
        { resource: 'academics:assessment', actions: ['read'] },
        { resource: 'academics:result', actions: ['read'] },
        { resource: 'academics:progression', actions: ['read'] },
        { resource: 'academics:summer_school', actions: ['read'] },
        { resource: 'academics:policy', actions: ['read'] },
      ],
    },
    {
      roleName: 'PARENT',
      grants: [
        { resource: 'academics:calendar', actions: ['read'] },
        { resource: 'academics:subject', actions: ['read'] },
        { resource: 'academics:class', actions: ['read'] },
        { resource: 'academics:timetable', actions: ['read'] },
        { resource: 'academics:attendance', actions: ['read'] },
        { resource: 'academics:assignment', actions: ['read'] },
        { resource: 'academics:assessment', actions: ['read'] },
        { resource: 'academics:result', actions: ['read'] },
        { resource: 'academics:progression', actions: ['read'] },
        { resource: 'academics:summer_school', actions: ['read'] },
        { resource: 'academics:policy', actions: ['read'] },
      ],
    },
    {
      roleName: 'STUDENT_MANAGEMENT_OFFICER',
      grants: [
        { resource: 'academics:calendar', actions: ['read'] },
        { resource: 'academics:subject', actions: ['read'] },
        { resource: 'academics:department', actions: ['read'] },
        { resource: 'academics:grade_level', actions: ['read'] },
        { resource: 'academics:class', actions: ['read'] },
        { resource: 'academics:teaching', actions: ['read'] },
        { resource: 'academics:enrollment', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'academics:attendance', actions: ['read', 'create', 'update'] },
        { resource: 'academics:result', actions: ['read'] },
        { resource: 'academics:progression', actions: ['read', 'evaluate', 'manage'] },
        { resource: 'academics:summer_school', actions: ['read', 'register'] },
      ],
    },
    {
      roleName: 'HR_OFFICER',
      grants: [
        { resource: 'academics:calendar', actions: ['read'] },
        { resource: 'academics:department', actions: ['read'] },
        { resource: 'academics:subject', actions: ['read'] },
        { resource: 'academics:grade_level', actions: ['read'] },
        { resource: 'academics:class', actions: ['read'] },
        { resource: 'academics:teaching', actions: ['read', 'create', 'update', 'delete'] },
      ],
    },
    {
      roleName: 'BURSAR',
      grants: [{ resource: 'academics:calendar', actions: ['read'] }],
    },
  ];

  const academicMatrixGrantRows = academicOperationalMatrix.flatMap(({ roleName, grants }) => {
    const role = roles.find((r) => r.name === roleName);
    if (!role) {
      throw new Error(`Seeded role ${roleName} not found`);
    }
    return grants.flatMap(({ resource, actions }) => {
      const perms = academicPermissionRows.filter(
        (p) => p.resource === resource && actions.includes(p.action),
      );
      if (perms.length !== actions.length) {
        throw new Error(
          `academics permissions missing for ${roleName}:${resource} (expected ${actions.join(',')})`,
        );
      }
      return perms.map((p) => ({ roleId: role.id, permissionId: p.id }));
    });
  });

  if (academicMatrixGrantRows.length > 0) {
    await prisma.rolePermission.createMany({ data: academicMatrixGrantRows });
  }

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

  // Staff — PEOPLE-1: Person is the identity root. A Staff row carries only
  // role-specific state (publicId, employee id, internal email, hire/status);
  // the name/gender/contact identity lives on the linked Person, and the
  // position/department live on StaffEmploymentDetail.
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
  const staffPersonIds = [];
  let staffSeq = 1;
  let personSeq = 1;
  for (const s of staffUsers) {
    const person = await prisma.person.create({
      data: {
        tenantId: tenant.id,
        publicId: publicId('P', personSeq++),
        firstName: s.firstName,
        lastName: s.lastName,
        gender: s.gender,
        email: s.user.email,
        phone: s.user.phone ?? undefined,
        status: 'ACTIVE',
      },
    });
    const staff = await prisma.staff.create({
      data: {
        tenantId: tenant.id,
        institutionId: institution.id,
        personId: person.id,
        userId: s.user.id,
        publicId: publicId('EMP', staffSeq),
        internalEmail: internalEmail(s.firstName, s.lastName, institution.code),
        staffNumber: s.staffNumber,
        hireDate: s.hireDate,
        employmentType: 'FULL_TIME' as EmploymentType,
        status: 'ACTIVE' as StaffStatus,
      },
    });
    await prisma.staffEmploymentDetail.create({
      data: {
        tenantId: tenant.id,
        staffId: staff.id,
        position: s.position,
        department: s.department,
        contractStartDate: s.hireDate,
      },
    });
    await prisma.personInstitution.create({
      data: {
        tenantId: tenant.id,
        personId: person.id,
        institutionId: institution.id,
        roleContext: 'STAFF' as RoleContext,
      },
    });
    createdStaff.push(staff);
    staffPersonIds.push(person.id);
    staffSeq += 1;
  }

  // PHASE 5 (D-2): teaching fixture. CLASS_TEACHER is a responsibility carried
  // on a persisted TeachingAssignment — NEVER an RBAC role. Mr Okafor
  // (createdStaff[1] / staffPersonIds[1]) teaches Mathematics in 'SS 1 Science'
  // for the active term and holds the class-teacher / homeroom responsibility.
  const mathSubject = await prisma.subject.findFirst({ where: { tenantId: tenant.id, code: 'MTH' } });
  if (currentTerm && mathSubject && ss1Classes.length > 0) {
    await prisma.teachingAssignment.create({
      data: {
        tenantId: tenant.id,
        institutionId: institution.id,
        staffPersonId: staffPersonIds[1],
        subjectId: mathSubject.id,
        classId: ss1Classes[0].id,
        termId: currentTerm.id,
        role: 'CLASS_TEACHER',
        workloadHours: 20,
      },
    });
    await prisma.homeroom.create({
      data: {
        tenantId: tenant.id,
        institutionId: institution.id,
        classId: ss1Classes[0].id,
        staffPersonId: staffPersonIds[1],
      },
    });
  }

  // PEOPLE-3: staff qualification / certification / employment-history fixtures
  // (sub-resource read models for the staff management API).
  await prisma.staffQualification.create({
    data: {
      tenantId: tenant.id,
      staffId: createdStaff[1].id,
      qualificationName: 'B.Sc. Physics',
      institutionName: 'University of Lagos',
      fieldOfStudy: 'Physics',
      yearObtained: 2003,
      grade: 'Second Class Upper',
    },
  });
  await prisma.staffQualification.create({
    data: {
      tenantId: tenant.id,
      staffId: createdStaff[4].id,
      qualificationName: 'Postgraduate Diploma in Librarianship',
      institutionName: 'Ahmadu Bello University',
      fieldOfStudy: 'Librarianship',
      yearObtained: 2010,
    },
  });
  await prisma.staffCertification.create({
    data: {
      tenantId: tenant.id,
      staffId: createdStaff[1].id,
      certificationName: 'TRCN Teacher License',
      issuingBody: 'Teachers Registration Council of Nigeria',
      issueDate: new Date('2018-09-15'),
      expiryDate: new Date('2028-09-15'),
      certificateNumber: 'TRCN-2018-4471',
    },
  });
  await prisma.staffCertification.create({
    data: {
      tenantId: tenant.id,
      staffId: createdStaff[0].id,
      certificationName: 'School Leadership Certificate',
      issuingBody: 'National Institute for Educational Planning',
      issueDate: new Date('2019-06-01'),
      certificateNumber: 'NIE-019-2203',
    },
  });
  await prisma.staffEmploymentHistory.create({
    data: {
      tenantId: tenant.id,
      staffId: createdStaff[1].id,
      institutionName: 'GSS Fiditi',
      position: 'Graduate Teacher',
      startDate: new Date('2014-09-15'),
      endDate: new Date('2019-07-31'),
      reasonForLeaving: 'Relocation',
    },
  });

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

  // PEOPLE-2: backfill institution-level memberships for the HR, Student-Management
  // and Parent operational accounts so their sessions resolve an institution
  // context (login resolution + PeopleScopeGuard institution scope + self reads).
  await prisma.institutionMembership.createMany({
    data: [users[7], users[8], users[10]]
      .filter((u) => !!u)
      .map((u) => ({
        tenantId: tenant.id,
        institutionId: institution.id,
        userId: u.id,
        status: 'ACTIVE',
      })),
    skipDuplicates: true,
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
      ...(teacherRole ? { roles: { create: { tenantId: tenant.id, roleId: teacherRole.id } } } : {}),
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

  // Students — PEOPLE-1: same split as staff. Identity (name/gender/date of
  // birth/contact/blood group/state) lives on Person; Student carries only
  // role state (publicId, student id, internal email, enrollment).
  const parentUser = users[10];
  const studentsData = [
    { studentNumber: 'STU-21401', firstName: 'Chidi', lastName: 'Eze', gender: 'MALE' as Gender, dateOfBirth: new Date('2008-05-15'), admissionDate: new Date('2023-09-04'), phone: '+234 802 111 2222', address: '14 Palm Avenue, Lagos', bloodGroup: 'O+', stateOfOrigin: 'Enugu', gradeLevel: 'SS1', className: 'SS 1 Science' },
    { studentNumber: 'STU-21411', firstName: 'Kayode', lastName: 'Eze', gender: 'MALE' as Gender, dateOfBirth: new Date('2007-11-22'), admissionDate: new Date('2022-09-05'), phone: '+234 802 111 2223', address: '14 Palm Avenue, Lagos', bloodGroup: 'A+', stateOfOrigin: 'Enugu', gradeLevel: 'SS1', className: 'SS 1 Science' },
    { studentNumber: 'STU-21402', firstName: 'Aisha', lastName: 'Bello', gender: 'FEMALE' as Gender, dateOfBirth: new Date('2008-03-10'), admissionDate: new Date('2023-09-04'), phone: '+234 802 111 2224', address: '7 Victoria Island, Lagos', gradeLevel: 'SS1', className: 'SS 1 Arts' },
    { studentNumber: 'STU-21403', firstName: 'Tunde', lastName: 'Olawale', gender: 'MALE' as Gender, dateOfBirth: new Date('2008-07-18'), admissionDate: new Date('2023-09-04'), phone: '+234 802 111 2225', address: '23 Ikeja, Lagos', gradeLevel: 'SS1', className: 'SS 1 Science' },
    { studentNumber: 'STU-21404', firstName: 'Ngozi', lastName: 'Nwosu', gender: 'FEMALE' as Gender, dateOfBirth: new Date('2008-01-25'), admissionDate: new Date('2023-09-04'), phone: '+234 802 111 2226', address: '56 Surulere, Lagos', gradeLevel: 'SS1', className: 'SS 1 Arts' },
  ];

  const createdStudents = [];
  const studentPersonIds = [];
  let studentSeq = 1;
  for (const s of studentsData) {
    const internal = internalEmail(s.firstName, s.lastName, institution.code);
    const person = await prisma.person.create({
      data: {
        tenantId: tenant.id,
        publicId: publicId('P', personSeq++),
        firstName: s.firstName,
        lastName: s.lastName,
        gender: s.gender,
        email: internal,
        phone: s.phone,
        address: s.address,
        bloodGroup: s.bloodGroup,
        stateOfOrigin: s.stateOfOrigin,
        dateOfBirth: s.dateOfBirth,
        status: 'ACTIVE',
      },
    });
    const student = await prisma.student.create({
      data: {
        tenantId: tenant.id,
        institutionId: institution.id,
        personId: person.id,
        publicId: publicId('STU', studentSeq),
        internalEmail: internal,
        studentNumber: s.studentNumber,
        enrollmentDate: s.admissionDate,
        status: 'ENROLLED' as StudentStatus,
      },
    });
    await prisma.studentEnrollmentDetail.create({
      data: {
        tenantId: tenant.id,
        studentId: student.id,
        gradeLevel: s.gradeLevel,
        className: s.className,
        enrollmentType: 'REGULAR',
      },
    });
    await prisma.personInstitution.create({
      data: {
        tenantId: tenant.id,
        personId: person.id,
        institutionId: institution.id,
        roleContext: 'STUDENT' as RoleContext,
      },
    });
    createdStudents.push(student);
    studentPersonIds.push(person.id);
    studentSeq += 1;
  }

  // Guardians & parents — PEOPLE-1: `person_relationships` replaces the old
  // `StudentGuardianRelationship` SGR table (see implementation report §7/§9).
  // guardians.parentUser is Mr Eze (linked to the parent@ account); the father
  // relationship to both Eze boys is a PARENT relationship on the people graph.
  const guardianPerson = await prisma.person.create({
    data: {
      tenantId: tenant.id,
      publicId: publicId('P', personSeq++),
      firstName: 'Mr',
      lastName: 'Eze',
      gender: 'MALE',
      email: internalEmail('Mr', 'Eze', institution.code),
      phone: '+234 801 234 5700',
      status: 'ACTIVE',
    },
  });

  const guardian = await prisma.guardian.create({
    data: {
      tenantId: tenant.id,
      institutionId: institution.id,
      personId: guardianPerson.id,
      userId: parentUser.id,
      contactPreference: 'EMAIL' as ContactPreference,
      status: 'ACTIVE',
    },
  });

  await prisma.personInstitution.create({
    data: {
      tenantId: tenant.id,
      personId: guardianPerson.id,
      institutionId: institution.id,
      roleContext: 'GUARDIAN' as RoleContext,
    },
  });

  const parentPerson = await prisma.person.create({
    data: {
      tenantId: tenant.id,
      publicId: publicId('P', personSeq++),
      firstName: 'Mrs',
      lastName: 'Uche Eze',
      gender: 'FEMALE',
      email: 'uche.eze@ga.local',
      phone: '+234 802 555 7788',
      status: 'ACTIVE',
    },
  });

  await prisma.parent.create({
    data: {
      tenantId: tenant.id,
      institutionId: institution.id,
      personId: parentPerson.id,
      contactPreference: 'PHONE' as ContactPreference,
      status: 'ACTIVE',
    },
  });

  await prisma.personInstitution.create({
    data: {
      tenantId: tenant.id,
      personId: parentPerson.id,
      institutionId: institution.id,
      roleContext: 'PARENT' as RoleContext,
    },
  });

  await prisma.personRelationship.createMany({
    data: [
      { tenantId: tenant.id, institutionId: institution.id, sourcePersonId: guardianPerson.id, targetPersonId: studentPersonIds[0], relationshipType: 'PARENT' as RelationshipType, metadata: { roleContext: 'GUARDIAN', isPrimary: true } },
      { tenantId: tenant.id, institutionId: institution.id, sourcePersonId: guardianPerson.id, targetPersonId: studentPersonIds[1], relationshipType: 'PARENT' as RelationshipType, metadata: { roleContext: 'GUARDIAN', isPrimary: true } },
      { tenantId: tenant.id, institutionId: institution.id, sourcePersonId: parentPerson.id, targetPersonId: studentPersonIds[0], relationshipType: 'PARENT' as RelationshipType, metadata: { roleContext: 'PARENT', isPrimary: false } },
    ],
  });

  // Enrollments — PHASE 5: frozen `student_class_enrollments` (per-term, keyed
  // by Person) replaces the legacy enrollment table (see D-1 report).
  if (ss1Classes.length > 0 && currentTerm) {
    await prisma.studentClassEnrollment.createMany({
      data: [
        { tenantId: tenant.id, institutionId: institution.id, studentPersonId: studentPersonIds[0], classId: ss1Classes[0].id, termId: currentTerm.id, enrollmentDate: new Date('2025-09-08'), status: 'ENROLLED' },
        { tenantId: tenant.id, institutionId: institution.id, studentPersonId: studentPersonIds[1], classId: ss1Classes[0].id, termId: currentTerm.id, enrollmentDate: new Date('2025-09-08'), status: 'ENROLLED' },
        { tenantId: tenant.id, institutionId: institution.id, studentPersonId: studentPersonIds[2], classId: ss1Classes[1].id, termId: currentTerm.id, enrollmentDate: new Date('2025-09-08'), status: 'ENROLLED' },
        { tenantId: tenant.id, institutionId: institution.id, studentPersonId: studentPersonIds[3], classId: ss1Classes[0].id, termId: currentTerm.id, enrollmentDate: new Date('2025-09-08'), status: 'ENROLLED' },
        { tenantId: tenant.id, institutionId: institution.id, studentPersonId: studentPersonIds[4], classId: ss1Classes[1].id, termId: currentTerm.id, enrollmentDate: new Date('2025-09-08'), status: 'ENROLLED' },
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