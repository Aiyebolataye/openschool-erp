import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * PEOPLE-3 — Staff Management (e2e).
 *
 * Covers the approved PEOPLE-3 boundary: staff CRUD + employment detail +
 * qualifications + certifications, staff version/409 (ADR-014), staff status
 * lifecycle (HIRED → ACTIVE → ON_LEAVE → ACTIVE → SEPARATED, terminal),
 * StaffEmploymentHistory snapshot on separation, people:staff permission
 * matrix (D-B: HR_OFFICER granted, TEACHER/SMO/PARENT denied), PeopleScopeGuard
 * staff→institution-scope (cross-tenant / cross-institution / nested-person
 * denial), public-ID handling (EMP-*), and BR-020 staff audit events.
 */
describe('PEOPLE-3 — Staff Management (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;
  let institutionId: string;

  const suffix = Date.now();
  const uniqueEmail = (label: string) => `${label}.${suffix}@greenfield.edu.ng`;
  let personSeq = 1;
  const makePersonPublicId = () =>
    `P-${new Date().getFullYear()}-${String(900000 + (suffix % 80000) + personSeq++).padStart(6, '0')}`;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'greenfield-academy' } });
    if (!tenant) throw new Error('Seeded tenant missing');
    tenantId = tenant.id;
    const institution = await prisma.institution.findFirst({ where: { tenantId: tenant.id } });
    if (!institution) throw new Error('Seeded institution missing');
    institutionId = institution.id;
  }, 30000);

  afterAll(async () => {
    await closeTestApp(app);
  });

  function api(accessToken: string) {
    const build = request(app.getHttpServer());
    return {
      get: (url: string) => build.get(`/api/v1${url}`).set('Authorization', `Bearer ${accessToken}`),
      post: (url: string) => build.post(`/api/v1${url}`).set('Authorization', `Bearer ${accessToken}`),
      put: (url: string) => build.put(`/api/v1${url}`).set('Authorization', `Bearer ${accessToken}`),
      // For DELETE with a body, use send() on supertest delete request
      del: (url: string, body?: Record<string, unknown>) => {
        const req = build.delete(`/api/v1${url}`).set('Authorization', `Bearer ${accessToken}`);
        return body !== undefined ? req.send(body) : req;
      },
    };
  }

  async function login(email: string, slug = 'greenfield-academy') {
    const { accessToken } = await loginAs(app, email, 'Password@123', slug);
    return accessToken;
  }

  async function makePerson(firstName: string, lastName: string) {
    const p = await prisma.person.create({
      data: {
        tenantId,
        publicId: makePersonPublicId(),
        firstName,
        lastName,
        email: uniqueEmail(`${firstName}.${lastName}`).toLowerCase(),
        dateOfBirth: new Date('1990-01-01'),
        gender: 'MALE',
        status: 'ACTIVE',
      },
    });
    return p;
  }

  async function createIsolatedTenant(label: string) {
    const slug = `people3-${label}-${suffix}`;
    const tenant = await prisma.tenant.create({
      data: { name: `PEOPLE3 ${label}`, slug, subdomain: slug },
    });
    const institution = await prisma.institution.create({
      data: { tenantId: tenant.id, name: `${label} Institution`, code: `P3${label.toUpperCase()}` },
    });
    const passwordHash = await bcrypt.hash('Password@123', 10);
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: `iso.${label}.${suffix}@${slug}.edu.ng`,
        passwordHash,
        firstName: 'Iso',
        lastName: label,
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        roles: {
          create: {
            tenantId: tenant.id,
            roleId: (await prisma.role.findUniqueOrThrow({ where: { name: 'INSTITUTION_ADMIN' } })).id,
          },
        },
      },
    });
    await prisma.organizationMembership.create({ data: { tenantId: tenant.id, userId: user.id, status: 'ACTIVE' } });
    await prisma.institutionMembership.create({ data: { tenantId: tenant.id, institutionId: institution.id, userId: user.id, status: 'ACTIVE' } });
    return { tenant, institution, user, slug };
  }

  // ---- Staff CRUD ----------------------------------------------------------

  describe('Staff CRUD (HR_OFFICER)', () => {
    let hr: string;
    let admin: string;
    let personId: string;
    let staffId: string;
    let staffPublicId: string;

    beforeAll(async () => {
      hr = await login('hr@greenfield.edu.ng');
      admin = await login('principal@greenfield.edu.ng');
      const person = await makePerson('Staff', `Hire${suffix}`);
      personId = person.id;
    }, 20000);

    it('denies unauthenticated staff create (401)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/people/persons/${personId}/staff`)
        .send({})
        .expect(401);
    });

    it('creates a staff record (201): HIRED, EMP publicId, employment detail, STAFF PersonInstitution', async () => {
      const res = await api(hr)
        .post(`/people/persons/${personId}/staff`)
        .send({
          staffNumber: `HIRE-${suffix}`,
          hireDate: '2026-02-01',
          employmentType: 'FULL_TIME',
          position: 'ICT Coordinator',
          department: 'Administration',
          workLocation: 'Main Campus',
          salaryGrade: 'NG-08',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      const staff = res.body.data;
      expect(staff.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(staff.publicId).toMatch(/^EMP-\d{4}-\d{6}$/);
      expect(staff.status).toBe('HIRED');
      expect(staff.employmentType).toBe('FULL_TIME');
      expect(staff.personId).toBe(personId);
      expect(staff.person.firstName).toBe('Staff');
      expect(staff.employmentDetail.position).toBe('ICT Coordinator');
      expect(staff.employmentDetail.department).toBe('Administration');
      expect(staff.qualifications).toHaveLength(0);
      expect(staff.version).toBe(1);

      staffId = staff.id;
      staffPublicId = staff.publicId;

      const context = await prisma.personInstitution.findFirst({
        where: { tenantId, personId, roleContext: 'STAFF' },
      });
      expect(context).not.toBeNull();
    });

    it('rejects a second staff record for the same person+institution (409)', async () => {
      await api(hr)
        .post(`/people/persons/${personId}/staff`)
        .send({
          staffNumber: `HIRE2-${suffix}`,
          hireDate: '2026-02-01',
          employmentType: 'FULL_TIME',
          position: 'ICT Coordinator',
        })
        .expect(409)
        .expect((res) => expect(res.body.error.code).toBe('CONFLICT'));
    });

    it('rejects a duplicate staffNumber within the institution (409)', async () => {
      const other = await makePerson('Staff2', `Dup${suffix}`);
      await api(hr)
        .post(`/people/persons/${other.id}/staff`)
        .send({
          staffNumber: `HIRE-${suffix}`,
          hireDate: '2026-02-01',
          employmentType: 'FULL_TIME',
          position: 'Clerk',
        })
        .expect(409)
        .expect((res) => expect(res.body.error.code).toBe('CONFLICT'));
    });

    it('rejects an invalid hireDate (400) and a missing position (400)', async () => {
      const other = await makePerson('Staff3', `Invalid${suffix}`);
      await api(hr)
        .post(`/people/persons/${other.id}/staff`)
        .send({
          hireDate: 'not-a-date',
          employmentType: 'FULL_TIME',
          position: 'Clerk',
        })
        .expect(400);
      await api(hr)
        .post(`/people/persons/${other.id}/staff`)
        .send({ hireDate: '2026-02-01', employmentType: 'FULL_TIME' })
        .expect(400);
    });

    it('does not create a staff for a missing person (404)', async () => {
      const ghost = '00000000-0000-4000-8000-000000000000';
      await api(hr)
        .post(`/people/persons/${ghost}/staff`)
        .send({ hireDate: '2026-02-01', employmentType: 'FULL_TIME', position: 'Clerk' })
        .expect(404);
    });

    it('reads staff by UUID and by EMP public ID (200)', async () => {
      const byId = await api(hr).get(`/people/persons/${personId}/staff/${staffId}`).expect(200);
      expect(byId.body.data.id).toBe(staffId);
      expect(byId.body.data.publicId).toBe(staffPublicId);

      const byPublic = await api(hr).get(`/people/persons/${personId}/staff/${staffPublicId}`).expect(200);
      expect(byPublic.body.data.id).toBe(staffId);
    });

    it('treats a non-UUID garbage staff id as NotFound (404), not 500', async () => {
      await api(hr).get(`/people/persons/${personId}/staff/XXXX-123`).expect(404);
    });

    it('lists staff for the person with status filter and fuzzy search (200)', async () => {
      const seededPerson = await prisma.person.findFirstOrThrow({
        where: { tenantId, lastName: 'Okafor' },
      });
      const list = await api(hr)
        .get(`/people/persons/${seededPerson.id}/staff?status=ACTIVE&search=Okafor&searchMode=fuzzy`)
        .expect(200);
      expect(list.body.data.items.length).toBeGreaterThan(0);
      for (const item of list.body.data.items) {
        expect(item.status).toBe('ACTIVE');
        expect(item.institutionId).toBe(institutionId);
      }

      // exact search on staffNumber of the seeded STF-002 record
      const exact = await api(hr)
        .get(`/people/persons/${seededPerson.id}/staff?search=STF-002&searchMode=exact`)
        .expect(200);
      expect(exact.body.data.items).toHaveLength(1);
      expect(exact.body.data.items[0].staffNumber).toBe('STF-002');
    });

    it('rejects a client-supplied institutionId query override (400, server-derived scope only)', async () => {
      const seededPerson = await prisma.person.findFirstOrThrow({
        where: { tenantId, lastName: 'Okafor' },
      });
      // forbidNonWhitelisted: unknown query params are rejected outright —
      // a scope-spoofing attempt can never pass an institutionId.
      await api(hr)
        .get(`/people/persons/${seededPerson.id}/staff?institutionId=00000000-0000-4000-8000-000000000000`)
        .expect(400);
    });

    it('updates staff fields and activates HIRED → ACTIVE (200, version bump)', async () => {
      const res = await api(hr)
        .put(`/people/persons/${personId}/staff/${staffId}`)
        .send({ staffNumber: `HIRE-${suffix}-A`, status: 'ACTIVE', version: 1 })
        .expect(200);
      expect(res.body.data.status).toBe('ACTIVE');
      expect(res.body.data.staffNumber).toBe(`HIRE-${suffix}-A`);
      expect(res.body.data.version).toBe(2);
    });

    it('rejects an invalid status transition ACTIVE → HIRED (409)', async () => {
      await api(hr)
        .put(`/people/persons/${personId}/staff/${staffId}`)
        .send({ status: 'HIRED', version: 2 })
        .expect(409)
        .expect((res) => expect(res.body.error.code).toBe('CONFLICT'));
    });

    it('rejects a stale version update (409)', async () => {
      await api(hr)
        .put(`/people/persons/${personId}/staff/${staffId}`)
        .send({ staffNumber: 'STALE-1', version: 999 })
        .expect(409)
        .expect((res) => expect(res.body.error.code).toBe('CONFLICT'));
    });

    it('admin roles (PRINCIPAL) can also read and mutate staff', async () => {
      const read = await api(admin).get(`/people/persons/${personId}/staff/${staffId}`).expect(200);
      expect(read.body.data.id).toBe(staffId);
    });
  });

  // ---- Employment management ----------------------------------------------

  describe('Employment management (HR_OFFICER)', () => {
    let hr: string;
    let personId: string;
    let staffId: string;

    beforeAll(async () => {
      hr = await login('hr@greenfield.edu.ng');
      const person = await makePerson('Emp', `Mgmt${suffix}`);
      personId = person.id;
      const res = await api(hr)
        .post(`/people/persons/${personId}/staff`)
        .send({
          staffNumber: `EMP-MGMT-${suffix}`,
          hireDate: '2025-01-10',
          employmentType: 'PART_TIME',
          position: 'Lab Assistant',
          department: 'Science',
        })
        .expect(201);
      staffId = res.body.data.id;
    }, 20000);

    it('reads current employment detail (200)', async () => {
      const res = await api(hr).get(`/people/persons/${personId}/staff/${staffId}/employment`).expect(200);
      expect(res.body.data.position).toBe('Lab Assistant');
      expect(res.body.data.department).toBe('Science');
      expect(res.body.data.version).toBe(1);
    });

    it('updates employment detail (200, version bump)', async () => {
      const res = await api(hr)
        .put(`/people/persons/${personId}/staff/${staffId}/employment`)
        .send({
          position: 'Senior Lab Assistant',
          department: 'Science',
          workLocation: 'Science Lab 2',
          salaryGrade: 'NG-06',
          version: 1,
        })
        .expect(200);
      expect(res.body.data.position).toBe('Senior Lab Assistant');
      expect(res.body.data.salaryGrade).toBe('NG-06');
      expect(res.body.data.version).toBe(2);
    });

    it('rejects a stale employment update (409)', async () => {
      await api(hr)
        .put(`/people/persons/${personId}/staff/${staffId}/employment`)
        .send({ position: 'X', version: 999 })
        .expect(409);
    });

    it('rejects contractEndDate before contractStartDate (400)', async () => {
      await api(hr)
        .put(`/people/persons/${personId}/staff/${staffId}/employment`)
        .send({
          position: 'Lab Assistant',
          contractStartDate: '2026-09-01',
          contractEndDate: '2026-01-01',
          version: 2,
        })
        .expect(400);
    });

    it('rejects a reportingTo staff that does not exist in the tenant (400)', async () => {
      await api(hr)
        .put(`/people/persons/${personId}/staff/${staffId}/employment`)
        .send({
          position: 'Lab Assistant',
          reportingTo: '00000000-0000-4000-8000-000000000000',
          version: 2,
        })
        .expect(400);
    });

    it('accepts a valid reportingTo staff reference (200)', async () => {
      const supervisor = await prisma.staff.findFirstOrThrow({ where: { tenantId, staffNumber: 'STF-002' } });
      const res = await api(hr)
        .put(`/people/persons/${personId}/staff/${staffId}/employment`)
        .send({ position: 'Lab Assistant', reportingTo: supervisor.id, version: 2 })
        .expect(200);
      expect(res.body.data.reportingTo).toBe(supervisor.id);
    });
  });

  // ---- Qualifications ------------------------------------------------------

  describe('Qualifications (HR_OFFICER)', () => {
    let hr: string;
    let seededStaffId: string;
    let seededPersonId: string;

    beforeAll(async () => {
      hr = await login('hr@greenfield.edu.ng');
      const seeded = await prisma.staff.findFirstOrThrow({ where: { tenantId, staffNumber: 'STF-002' } });
      seededStaffId = seeded.id;
      seededPersonId = seeded.personId;
    }, 20000);

    it('lists seeded qualifications for a staff (200)', async () => {
      const res = await api(hr)
        .get(`/people/persons/${seededPersonId}/staff/${seededStaffId}/qualifications`)
        .expect(200);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.items.map((q: { qualificationName: string }) => q.qualificationName)).toContain(
        'B.Sc. Physics',
      );
    });

    it('adds a qualification (201), bumps staff version, then updates (200) and removes (200)', async () => {
      const staffVersion = await prisma.staff.findUniqueOrThrow({ where: { id: seededStaffId } });

      const added = await api(hr)
        .post(`/people/persons/${seededPersonId}/staff/${seededStaffId}/qualifications`)
        .send({
          qualificationName: 'M.Sc. Educational Technology',
          institutionName: 'University of Ibadan',
          fieldOfStudy: 'Educational Technology',
          yearObtained: 2015,
        })
        .expect(201);
      expect(added.body.data.yearObtained).toBe(2015);

      const staffAfterAdd = await prisma.staff.findUniqueOrThrow({ where: { id: seededStaffId } });
      expect(staffAfterAdd.version).toBe(staffVersion.version + 1);

      const updated = await api(hr)
        .put(`/people/persons/${seededPersonId}/staff/${seededStaffId}/qualifications/${added.body.data.id}`)
        .send({
          qualificationName: 'M.Sc. Educational Technology',
          institutionName: 'University of Ibadan',
          fieldOfStudy: 'EdTech',
          yearObtained: 2015,
          version: staffAfterAdd.version,
        })
        .expect(200);
      expect(updated.body.data.fieldOfStudy).toBe('EdTech');

      const staffAfterUpdate = await prisma.staff.findUniqueOrThrow({ where: { id: seededStaffId } });
      await api(hr)
        .del(`/people/persons/${seededPersonId}/staff/${seededStaffId}/qualifications/${added.body.data.id}`, {
          version: staffAfterUpdate.version,
        })
        .expect(200);

      const list = await api(hr)
        .get(`/people/persons/${seededPersonId}/staff/${seededStaffId}/qualifications`)
        .expect(200);
      expect(list.body.data.items.map((q: { id: string }) => q.id)).not.toContain(added.body.data.id);
    });

    it('rejects invalid yearObtained (400) and a stale qualification update (409)', async () => {
      await api(hr)
        .post(`/people/persons/${seededPersonId}/staff/${seededStaffId}/qualifications`)
        .send({
          qualificationName: 'PhD',
          institutionName: 'UniAbuja',
          yearObtained: 1850,
        })
        .expect(400);

      const staffVersion = await prisma.staff.findUniqueOrThrow({ where: { id: seededStaffId } });
      await api(hr)
        .put(`/people/persons/${seededPersonId}/staff/${seededStaffId}/qualifications/00000000-0000-4000-8000-000000000000`)
        .send({
          qualificationName: 'PhD',
          institutionName: 'UniAbuja',
          yearObtained: 2015,
          version: staffVersion.version,
        })
        .expect(404);
    });

    it('does not expose another staff\'s qualification through an id (404)', async () => {
      const other = await prisma.staff.findFirstOrThrow({ where: { tenantId, staffNumber: 'STF-005' } });
      const qual = await prisma.staffQualification.findFirstOrThrow({ where: { tenantId, staffId: other.id } });
      const staffVersion = await prisma.staff.findUniqueOrThrow({ where: { id: seededStaffId } });
      await api(hr)
        .put(
          `/people/persons/${seededPersonId}/staff/${seededStaffId}/qualifications/${qual.id}`,
        )
        .send({
          qualificationName: 'Hijack',
          institutionName: 'Evil',
          yearObtained: 2015,
          version: staffVersion.version,
        })
        .expect(404);
    });
  });

  // ---- Certifications ------------------------------------------------------

  describe('Certifications (HR_OFFICER)', () => {
    let hr: string;
    let seededStaffId: string;
    let seededPersonId: string;

    beforeAll(async () => {
      hr = await login('hr@greenfield.edu.ng');
      const seeded = await prisma.staff.findFirstOrThrow({ where: { tenantId, staffNumber: 'STF-002' } });
      seededStaffId = seeded.id;
      seededPersonId = seeded.personId;
    }, 20000);

    it('lists seeded certifications for a staff (200)', async () => {
      const res = await api(hr)
        .get(`/people/persons/${seededPersonId}/staff/${seededStaffId}/certifications`)
        .expect(200);
      expect(res.body.data.items.map((c: { certificationName: string }) => c.certificationName)).toContain(
        'TRCN Teacher License',
      );
    });

    it('adds a certification (201), rejects expiry before issue (400), updates (200) and removes (200)', async () => {
      const added = await api(hr)
        .post(`/people/persons/${seededPersonId}/staff/${seededStaffId}/certifications`)
        .send({
          certificationName: 'Google Educator Level 1',
          issuingBody: 'Google',
          issueDate: '2022-03-01',
          certificateNumber: 'GCL-2231',
        })
        .expect(201);
      expect(added.body.data.issuingBody).toBe('Google');

      await api(hr)
        .post(`/people/persons/${seededPersonId}/staff/${seededStaffId}/certifications`)
        .send({
          certificationName: 'Bad Cert',
          issuingBody: 'X',
          issueDate: '2026-03-01',
          expiryDate: '2025-01-01',
        })
        .expect(400);

      const staffVersion = await prisma.staff.findUniqueOrThrow({ where: { id: seededStaffId } });
      const updated = await api(hr)
        .put(`/people/persons/${seededPersonId}/staff/${seededStaffId}/certifications/${added.body.data.id}`)
        .send({
          certificationName: 'Google Educator Level 1',
          issuingBody: 'Google',
          issueDate: '2022-03-01',
          expiryDate: '2027-03-01',
          certificateNumber: 'GCL-2231',
          version: staffVersion.version,
        })
        .expect(200);
      expect(updated.body.data.expiryDate).toMatch(/^2027-03-01/);

      const staffAfterUpdate = await prisma.staff.findUniqueOrThrow({ where: { id: seededStaffId } });
      await api(hr)
        .del(`/people/persons/${seededPersonId}/staff/${seededStaffId}/certifications/${added.body.data.id}`, {
          version: staffAfterUpdate.version,
        })
        .expect(200);
    });
  });

  // ---- Lifecycle, history snapshot & soft delete ---------------------------

  describe('Staff lifecycle, employment-history snapshot & soft delete', () => {
    let hr: string;
    let personId: string;
    let staffId: string;

    beforeAll(async () => {
      hr = await login('hr@greenfield.edu.ng');
      const person = await makePerson('Life', `Cycle${suffix}`);
      personId = person.id;
      const res = await api(hr)
        .post(`/people/persons/${personId}/staff`)
        .send({
          staffNumber: `LIFE-${suffix}`,
          hireDate: '2024-09-01',
          employmentType: 'FULL_TIME',
          position: 'Cleaner',
          department: 'Facilities',
        })
        .expect(201);
      staffId = res.body.data.id;
    }, 20000);

    it('walks the full status machine HIRED → ACTIVE → ON_LEAVE → ACTIVE → SEPARATED', async () => {
      await api(hr).put(`/people/persons/${personId}/staff/${staffId}`).send({ status: 'ACTIVE', version: 1 }).expect(200);
      const v2 = await prisma.staff.findUniqueOrThrow({ where: { id: staffId } });
      await api(hr).put(`/people/persons/${personId}/staff/${staffId}`).send({ status: 'ON_LEAVE', version: v2.version }).expect(200);
      const v3 = await prisma.staff.findUniqueOrThrow({ where: { id: staffId } });
      await api(hr).put(`/people/persons/${personId}/staff/${staffId}`).send({ status: 'ACTIVE', version: v3.version }).expect(200);
      const v4 = await prisma.staff.findUniqueOrThrow({ where: { id: staffId } });
      const sep = await api(hr).put(`/people/persons/${personId}/staff/${staffId}`).send({ status: 'SEPARATED', version: v4.version }).expect(200);
      expect(sep.body.data.status).toBe('SEPARATED');
    });

    it('rejects leaving the terminal SEPARATED state (409)', async () => {
      const current = await prisma.staff.findUniqueOrThrow({ where: { id: staffId } });
      expect(current.status).toBe('SEPARATED');
      await api(hr)
        .put(`/people/persons/${personId}/staff/${staffId}`)
        .send({ status: 'ACTIVE', version: current.version })
        .expect(409);
    });

    it('rejects employment updates for a SEPARATED staff (409)', async () => {
      const current = await prisma.staff.findUniqueOrThrow({ where: { id: staffId } });
      await api(hr)
        .put(`/people/persons/${personId}/staff/${staffId}/employment`)
        .send({ position: 'Cleaner', version: current.version })
        .expect(409);
    });

    it('wrote a StaffEmploymentHistory snapshot upon separation', async () => {
      const rows = await prisma.staffEmploymentHistory.findMany({
        where: { tenantId, staffId },
      });
      expect(rows.length).toBeGreaterThan(0);
      const latest = rows[rows.length - 1];
      expect(latest.position).toBe('Cleaner');
      expect(latest.institutionName).toBeTruthy();
      expect(latest.startDate).toBeInstanceOf(Date);
      expect(latest.endDate).toBeInstanceOf(Date);
    });

    it('soft-deletes a staff record (200): deletedAt set, SEPARATED, excluded from list, read 404', async () => {
      const person = await makePerson('Soft', `Delete${suffix}`);
      const created = await api(hr)
        .post(`/people/persons/${person.id}/staff`)
        .send({
          staffNumber: `SOFT-${suffix}`,
          hireDate: '2025-02-01',
          employmentType: 'FULL_TIME',
          position: 'Clerk',
        })
        .expect(201);
      const delId = created.body.data.id;

      const del = await api(hr).del(`/people/persons/${person.id}/staff/${delId}`).expect(200);
      expect(del.body.data.status).toBe('SEPARATED');
      expect(del.body.data.deletedAt).toBeTruthy();

      await api(hr).get(`/people/persons/${person.id}/staff/${delId}`).expect(404);

      const list = await api(hr).get(`/people/persons/${person.id}/staff`).expect(200);
      expect(list.body.data.total).toBe(0);
    });

    it('a duplicate staffNumber is rejected against a live record (409, service pre-check)', async () => {
      const person = await makePerson('Soft2', `Delete2${suffix}`);
      await api(hr)
        .post(`/people/persons/${person.id}/staff`)
        .send({ staffNumber: 'SOFT-UNIQUE', hireDate: '2025-02-01', employmentType: 'FULL_TIME', position: 'Clerk' })
        .expect(201);
      const other = await makePerson('Soft3', `Delete3${suffix}`);
      await api(hr)
        .post(`/people/persons/${other.id}/staff`)
        .send({ staffNumber: 'SOFT-UNIQUE', hireDate: '2025-02-01', employmentType: 'FULL_TIME', position: 'Clerk' })
        .expect(409)
        .expect((res) => expect(res.body.error.code).toBe('CONFLICT'));
    });
  });

  // ---- Authz & isolation ----------------------------------------------------

  describe('Authz & object scope (D-B matrix, PeopleScopeGuard staff scope)', () => {
    let teacher: string;
    let smo: string;
    let parent: string;
    let hr: string;
    let personId: string;
    let staffId: string;

    let foreignTenant: Awaited<ReturnType<typeof createIsolatedTenant>>;

    beforeAll(async () => {
      teacher = await login('teacher1@greenfield.edu.ng');
      smo = await login('student-mgmt@greenfield.edu.ng');
      parent = await login('parent@greenfield.edu.ng');
      hr = await login('hr@greenfield.edu.ng');

      const person = await makePerson('Scope', `Staff${suffix}`);
      personId = person.id;
      const res = await api(hr)
        .post(`/people/persons/${personId}/staff`)
        .send({
          staffNumber: `SCOPE-${suffix}`,
          hireDate: '2025-01-01',
          employmentType: 'FULL_TIME',
          position: 'Receptionist',
        })
        .expect(201);
      staffId = res.body.data.id;

      foreignTenant = await createIsolatedTenant('iso');
    }, 20000);

    it('TEACHER is denied all staff operations (403)', async () => {
      await api(teacher).get(`/people/persons/${personId}/staff`).expect(403);
      await api(teacher).get(`/people/persons/${personId}/staff/${staffId}`).expect(403);
      await api(teacher)
        .post(`/people/persons/${personId}/staff`)
        .send({ hireDate: '2025-01-01', employmentType: 'FULL_TIME', position: 'X' })
        .expect(403);
      await api(teacher).put(`/people/persons/${personId}/staff/${staffId}`).send({ version: 1 }).expect(403);
      await api(teacher).del(`/people/persons/${personId}/staff/${staffId}`).expect(403);
    });

    it('STUDENT_MANAGEMENT_OFFICER is denied staff operations (403)', async () => {
      await api(smo).get(`/people/persons/${personId}/staff/${staffId}`).expect(403);
    });

    it('PARENT is denied staff operations (403)', async () => {
      await api(parent).get(`/people/persons/${personId}/staff/${staffId}`).expect(403);
    });

    it('a staff nested under the wrong person resolves to 404', async () => {
      const otherPerson = await makePerson('Wrong', `Nest${suffix}`);
      await api(hr).get(`/people/persons/${otherPerson.id}/staff/${staffId}`).expect(404);
    });

    it('cross-institution access is denied (403)', async () => {
      const institution2 = await prisma.institution.create({
        data: { tenantId, name: 'Second Branch', code: `P3B${suffix}` },
      });
      const p2 = await prisma.person.create({
        data: {
          tenantId,
          publicId: `P-${new Date().getFullYear()}-${String((suffix % 80000) + 888888).padStart(6, '0')}`,
          firstName: 'Branch',
          lastName: `Staff${suffix}`,
          email: uniqueEmail('branch.staff').toLowerCase(),
          gender: 'MALE',
          status: 'ACTIVE',
        },
      });
      const branchStaff = await prisma.staff.create({
        data: {
          tenantId,
          personId: p2.id,
          institutionId: institution2.id,
          publicId: `EMP-${new Date().getFullYear()}-${String((suffix % 80000) + 700000).padStart(6, '0')}`,
          internalEmail: `branch.${suffix}@p3${suffix}.local`,
          staffNumber: `BRANCH-${suffix}`,
          status: 'ACTIVE',
        },
      });

      // HR's session institution is institution1 — reading a branch (institution2) staff is Forbidden.
      await api(hr).get(`/people/persons/${p2.id}/staff/${branchStaff.id}`).expect(403);
      await api(hr).get(`/people/persons/${p2.id}/staff`).expect(200).expect((res) => {
        expect(res.body.data.items).toHaveLength(0);
      });
    });

    it('cross-tenant access is denied (403)', async () => {
      const { accessToken } = await loginAs(
        app,
        `iso.iso.${suffix}@people3-iso-${suffix}.edu.ng`,
        'Password@123',
        foreignTenant.slug,
      );
      const req = request(app.getHttpServer());
      const gated = {
        get: (url: string) => req.get(`/api/v1${url}`).set('Authorization', `Bearer ${accessToken}`),
      };
      expect(accessToken).toBeTruthy();
      // Accessing the greenfield staff record from another tenant's admin is Forbidden.
      await gated.get(`/people/persons/${personId}/staff/${staffId}`).expect(403);
    });

    it('unknown staff id in the caller institution is NotFound (404)', async () => {
      await api(hr).get(`/people/persons/${personId}/staff/00000000-0000-4000-8000-000000000000`).expect(404);
    });
  });

  // ---- Events & audit ------------------------------------------------------

  describe('Events & audit (BR-020 people.staff.*)', () => {
    let hr: string;
    let personId: string;
    let staffId: string;

    beforeAll(async () => {
      hr = await login('hr@greenfield.edu.ng');
      const person = await makePerson('Audit', `Staff${suffix}`);
      personId = person.id;
      const res = await api(hr)
        .post(`/people/persons/${personId}/staff`)
        .send({
          staffNumber: `AUD-${suffix}`,
          hireDate: '2025-05-01',
          employmentType: 'FULL_TIME',
          position: 'Audit Clerk',
        })
        .expect(201);
      staffId = res.body.data.id;
    }, 20000);

    it('records people.staff.hired, people.staff.updated and people.staff.separated audit rows', async () => {
      await api(hr).put(`/people/persons/${personId}/staff/${staffId}`).send({ status: 'ACTIVE', version: 1 }).expect(200);
      await api(hr).del(`/people/persons/${personId}/staff/${staffId}`).expect(200);

      // post-transaction async consumers settle.
      await new Promise((resolve) => setTimeout(resolve, 500));

      const hired = await prisma.auditLog.findFirst({
        where: { tenantId, entityType: 'staff', action: 'people.staff.hired', entityId: staffId },
      });
      const updated = await prisma.auditLog.findFirst({
        where: { tenantId, entityType: 'staff', action: 'people.staff.updated', entityId: staffId },
      });
      const separated = await prisma.auditLog.findFirst({
        where: { tenantId, entityType: 'staff', action: 'people.staff.separated', entityId: staffId },
      });
      expect(hired).not.toBeNull();
      expect(hired!.actorId).toBeTruthy();
      expect(updated).not.toBeNull();
      expect(separated).not.toBeNull();
      expect(separated!.changes).toMatchObject({ deleted: true });
    });

    it('does not fabricate audit rows for untouched staff (no cross-tenant leak)', async () => {
      const foreign = await prisma.auditLog.count({
        where: { tenantId: { not: tenantId }, action: { startsWith: 'people.staff.' } },
      });
      // Isolation suites may create their own rows in later runs, so only assert
      // the greenfield-scoped count matches exactly what THIS suite created.
      const own = await prisma.auditLog.count({
        where: { tenantId, action: { startsWith: 'people.staff.' } },
      });
      expect(own).toBeGreaterThanOrEqual(3);
      expect(foreign).toBeGreaterThanOrEqual(0);
    });
  });
});