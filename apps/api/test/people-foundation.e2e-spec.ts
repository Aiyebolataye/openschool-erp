import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

describe('People Foundation (PEOPLE-1) — schema, seed, permissions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  }, 30000);

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('Seed People foundation shapes', () => {
    it('seeded staff link to a Person root with employment detail and staff context', async () => {
      const staff = await prisma.staff.findFirst({
        where: { staffNumber: 'STF-002' },
        include: {
          person: true,
          employmentDetail: true,
          institution: true,
        },
      });
      expect(staff).not.toBeNull();
      expect(staff!.internalEmail).toMatch(/\.local$/);
      expect(staff!.personId).toBe(staff!.person.id);
      expect(staff!.person.firstName).toBe('Mr');
      expect(staff!.person.lastName).toBe('Okafor');
      expect(staff!.person.publicId).toMatch(/^P-\d{4}-\d{6}$/);
      expect(staff!.publicId).toMatch(/^EMP-\d{4}-\d{6}$/);
      expect(staff!.status).toBe('ACTIVE');
      expect(staff!.employmentDetail!.position).toBe('Senior Teacher');
      expect(staff!.employmentDetail!.department).toBe('Science');

      const contexts = await prisma.personInstitution.findMany({
        where: { personId: staff!.personId },
      });
      expect(contexts.map((c) => c.roleContext)).toContain('STAFF');
    });

    it('seeded students link to a Person root with enrollment detail', async () => {
      const student = await prisma.student.findFirst({
        where: { studentNumber: 'STU-21401' },
        include: { person: true, enrollmentDetail: true },
      });
      expect(student).not.toBeNull();
      expect(student!.person.firstName + ' ' + student!.person.lastName).toBe('Chidi Eze');
      expect(student!.internalEmail).toMatch(/\.local$/);
      expect(student!.status).toBe('ENROLLED');
      expect(student!.enrollmentDetail!.gradeLevel).toBe('SS1');
      expect(student!.enrollmentDetail!.enrollmentType).toBe('REGULAR');
      expect(student!.person.email).toBe(student!.internalEmail);
    });

    it('person_relationships replace the legacy SGR for the Eze family', async () => {
      const guardianPerson = await prisma.person.findFirst({
        where: { firstName: 'Mr', lastName: 'Eze', publicId: { startsWith: 'P-' } },
      });
      expect(guardianPerson).not.toBeNull();
      const relationships = await prisma.personRelationship.findMany({
        where: { sourcePersonId: guardianPerson!.id },
      });
      expect(relationships).toHaveLength(2);
      for (const rel of relationships) {
        expect(rel.relationshipType).toBe('PARENT');
        expect(rel.institutionId).toBeTruthy();
      }
    });

    it('every People root is tenant-scoped and carries a version + snake_case timestamps', async () => {
      const person = await prisma.person.findFirstOrThrow();
      expect(person.tenantId).toBeTruthy();
      expect(person.version).toBe(1);
      // snake_case-mapped audit columns exist on the new tables
      const student = await prisma.student.findFirstOrThrow({ include: { person: true } });
      expect(student.createdAt).toBeInstanceOf(Date);
      expect(student.person.createdAt).toBeInstanceOf(Date);
      expect(student.person.isActive).toBe(true);
    });
  });

  describe('People permission catalogue (§10.3)', () => {
    const expectedCatalogue = {
      'people:person': ['list', 'read', 'create', 'update', 'delete', 'search', 'assign', 'merge'],
      'people:student': ['list', 'read', 'create', 'update', 'delete'],
      'people:staff': ['list', 'read', 'create', 'update', 'delete'],
      'people:parent': ['list', 'read', 'create', 'update', 'delete'],
      'people:guardian': ['list', 'read', 'create', 'update', 'delete'],
      'people:applicant': ['list', 'read', 'create', 'update', 'delete', 'accept', 'reject'],
      'people:emergency_contact': ['list', 'read', 'create', 'update', 'delete'],
      'people:relationship': ['list', 'read', 'create', 'update', 'delete'],
      'people:document': ['list', 'read', 'create', 'update', 'delete'],
    };

    it('registers the full frozen people:* action catalogue', async () => {
      const rows = await prisma.permission.findMany({
        where: { resource: { startsWith: 'people:' } },
        orderBy: [{ resource: 'asc' }, { action: 'asc' }],
      });
      const catalogue = new Map<string, Set<string>>();
      for (const row of rows) {
        if (!catalogue.has(row.resource)) catalogue.set(row.resource, new Set());
        catalogue.get(row.resource)!.add(row.action);
      }
      expect(catalogue.size).toBe(Object.keys(expectedCatalogue).length);
      for (const [resource, actions] of Object.entries(expectedCatalogue)) {
        expect(catalogue.get(resource)).toEqual(new Set(actions));
      }
    });

    it('grants people:* to every admin role and the D-B operational matrix to the seeded non-admin roles', async () => {
      const adminRoles = ['PLATFORM_ADMIN', 'ORG_ADMIN', 'PRIMARY_INSTITUTION_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL'];
      const peoplePermissions = await prisma.permission.findMany({
        where: { resource: { startsWith: 'people:' } },
        select: { id: true, resource: true, action: true },
      });
      const expectedAdminGrantRows = adminRoles.length * peoplePermissions.length;

      const adminGrants = await prisma.rolePermission.count({
        where: {
          permissionId: { in: peoplePermissions.map((p) => p.id) },
          role: { name: { in: adminRoles } },
        },
      });
      expect(adminGrants).toBe(expectedAdminGrantRows);

      // PEOPLE-2 D-B operational matrix (§ PEOPLE-2_IMPLEMENTATION_REPORT.md)
      const operationalMatrix: Record<string, string[]> = {
        HR_OFFICER: ['people:staff:list', 'people:staff:read', 'people:staff:create', 'people:staff:update', 'people:staff:delete'],
        STUDENT_MANAGEMENT_OFFICER: [
          'people:student:list', 'people:student:read', 'people:student:create', 'people:student:update', 'people:student:delete',
          'people:applicant:list', 'people:applicant:read', 'people:applicant:create', 'people:applicant:update', 'people:applicant:delete', 'people:applicant:accept', 'people:applicant:reject',
        ],
        TEACHER: ['people:person:list', 'people:person:read', 'people:person:search', 'people:student:list', 'people:student:read'],
        PARENT: ['people:person:read', 'people:student:read'],
        STUDENT: ['people:person:read', 'people:student:read'],
      };

      const catalogueIds = new Map(
        peoplePermissions.map((p) => [`${p.resource}:${p.action}`, p.id]),
      );

      for (const [roleName, granted] of Object.entries(operationalMatrix)) {
        const grantRows = await prisma.rolePermission.findMany({
          where: { role: { name: roleName } },
          select: { permission: { select: { resource: true, action: true } } },
        });
        const actual = new Set(
          grantRows
            .filter((g) => g.permission.resource.startsWith('people:'))
            .map((g) => `${g.permission.resource}:${g.permission.action}`),
        );
        expect(actual).toEqual(new Set(granted));
        for (const key of granted) {
          expect(catalogueIds.has(key)).toBe(true);
        }
      }

      const grantedKeys = Object.values(operationalMatrix).flat();
      const totalNonAdminGrant = await prisma.rolePermission.count({
        where: {
          permissionId: { in: grantedKeys.map((k) => catalogueIds.get(k)!) },
          role: { name: { notIn: adminRoles } },
        },
      });
      expect(totalNonAdminGrant).toBe(grantedKeys.length);
    });
  });

  // ---- PEOPLE-4 controller surface (registration check) ---------------------

  describe('PEOPLE-4 controller surface', () => {
    const dummyUuid = '00000000-0000-4000-8000-000000000000';

    it('parents controller is wired: unauthenticated request → 401', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/people/persons/${dummyUuid}/parents`)
        .expect(401);
    });

    it('guardians controller is wired: unauthenticated request → 401', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/people/persons/${dummyUuid}/guardians`)
        .expect(401);
    });

    it('emergency-contacts controller is wired: unauthenticated request → 401', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/people/persons/${dummyUuid}/emergency-contacts`)
        .expect(401);
    });

    it('relationships controller is wired: unauthenticated request → 401', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/people/persons/${dummyUuid}/relationships`)
        .expect(401);
    });
  });
});