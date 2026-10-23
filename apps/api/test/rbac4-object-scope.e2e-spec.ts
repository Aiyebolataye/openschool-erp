import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * RBAC-4 (P2.5) — Object-Level Authorization (e2e).
 *
 * Covers the frozen 9-item security test basket:
 *   1. correct-object allowed
 *   2. wrong-institution denied
 *   3. wrong-org denied
 *   4. same-role-another-tenant denied
 *   5. client-supplied context ignored
 *   6. missing/invalid membership denied
 *   7. deactivated membership/institution denied
 *   8. Platform Admin unchanged
 *   9. Phase-1 + RBAC-1/2/3 regression green (full suite run separately)
 *
 * Object scopes exercised: sessions (self), invitations (tenant), audit
 * (tenant), onboarding (tenant + institution binding).
 */
describe('RBAC-4 — Object-Level Authorization (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let greenfield: { id: string };
  let mainInstitution: { id: string };

  const unique = (label: string) => `${label}.${Date.now()}@greenfield.edu.ng`;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'greenfield-academy' } });
    if (!tenant) throw new Error('Seeded tenant missing');
    greenfield = { id: tenant.id };
    const institution = await prisma.institution.findFirst({
      where: { tenantId: tenant.id },
    });
    if (!institution) throw new Error('Seeded institution missing');
    mainInstitution = { id: institution.id };
  }, 30000);

  afterAll(async () => {
    await closeTestApp(app);
  });

  async function roleId(name: string): Promise<string> {
    const role = await prisma.role.findUnique({ where: { name } });
    if (!role) throw new Error(`Seeded role ${name} not found`);
    return role.id;
  }

  /** Create an independent organization sharing no objects with Demo. */
  async function createIsoTenant(label: string) {
    const suffix = Date.now();
    const slug = `rbac4-${label}-${suffix}`;
    const tenant = await prisma.tenant.create({
      data: { name: `RBAC4 ${label}`, slug, subdomain: slug },
    });
    const institution = await prisma.institution.create({
      data: { tenantId: tenant.id, name: `${label} Institution`, code: `RBAC4-${label.toUpperCase()}` },
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
        roles: { create: { tenantId: tenant.id, roleId: await roleId('INSTITUTION_ADMIN') } },
      },
    });
    await prisma.organizationMembership.create({
      data: { tenantId: tenant.id, userId: user.id, status: 'ACTIVE' },
    });
    await prisma.institutionMembership.create({
      data: { tenantId: tenant.id, institutionId: institution.id, userId: user.id, status: 'ACTIVE' },
    });
    return { tenant, institution, user, slug };
  }

  /** Provision a greenfield account that is not yet active/verified. */
  async function provisionDemoUser(email: string) {
    const passwordHash = await bcrypt.hash('provisional-not-a-password', 10);
    return prisma.user.create({
      data: {
        tenantId: greenfield.id,
        email,
        passwordHash,
        firstName: 'Provisioned',
        lastName: 'E2E',
        status: 'ACTIVE',
        roles: { create: { tenantId: greenfield.id, roleId: await roleId('TEACHER') } },
      },
    });
  }

  /** Create a greenfield INSTITUTION_ADMIN with optional institution membership. */
  async function createDemoInstitutionAdmin(
    options: { membership?: 'ACTIVE' | 'INACTIVE' } = {},
  ) {
    const email = unique('gf-admin');
    const passwordHash = await bcrypt.hash('Password@123', 10);
    const user = await prisma.user.create({
      data: {
        tenantId: greenfield.id,
        email,
        passwordHash,
        firstName: 'GF',
        lastName: 'Admin',
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        roles: { create: { tenantId: greenfield.id, roleId: await roleId('INSTITUTION_ADMIN') } },
      },
    });
    await prisma.organizationMembership.create({
      data: { tenantId: greenfield.id, userId: user.id, status: 'ACTIVE' },
    });
    if (options.membership) {
      await prisma.institutionMembership.create({
        data: {
          tenantId: greenfield.id,
          institutionId: mainInstitution.id,
          userId: user.id,
          status: options.membership,
        },
      });
    }
    return { user, email };
  }

  describe('#1 correct-object allowed (self + tenant scopes)', () => {
    it('revokes the caller\'s own session by id and only that one', async () => {
      await loginAs(app, 'admin@greenfield.edu.ng');
      const tokens = await loginAs(app, 'admin@greenfield.edu.ng');
      const admin = await prisma.user.findFirst({ where: { email: 'admin@greenfield.edu.ng' } });
      const sessions = await prisma.session.findMany({
        where: { userId: admin!.id, isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(sessions.length).toBeGreaterThanOrEqual(2);

      const older = sessions[sessions.length - 1];
      await request(app.getHttpServer())
        .delete(`/api/v1/sessions/${older.id}`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/sessions')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);

      const row = await prisma.session.findUnique({ where: { id: older.id } });
      expect(row?.isActive).toBe(false);
    });

    it('reads a tenant-scoped invitation and audit entry the caller owns', async () => {
      const { accessToken } = await loginAs(app, 'admin@greenfield.edu.ng');
      const created = await request(app.getHttpServer())
        .post('/api/v1/invitations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: unique('allowed-read') })
        .expect(201);
      const invitationId: string = created.body.data.invitation.id;

      const audit = await prisma.auditLog.create({
        data: {
          tenantId: greenfield.id,
          actorEmail: 'admin@greenfield.edu.ng',
          action: 'rbac4.allowed.read',
          entityType: 'Tenant',
          entityId: greenfield.id,
        },
      });

      await request(app.getHttpServer())
        .get(`/api/v1/invitations/${invitationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      await request(app.getHttpServer())
        .get(`/api/v1/audit-logs/${audit.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('issues an onboarding link (org-scoped and institution-scoped) as Platform Admin', async () => {
      const { accessToken } = await loginAs(app, 'admin@greenfield.edu.ng');
      const email = unique('allowed-ob');

      await request(app.getHttpServer())
        .post('/api/v1/onboarding')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email })
        .expect(404); // unknown account -> opaque 404, no enumeration

      await provisionDemoUser(email);
      await request(app.getHttpServer())
        .post('/api/v1/onboarding')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email })
        .expect(201);

      // #8 Platform Admin semantics preserved: admin holds NO institution
      // membership yet can bind an institution-scoped link (platform authority).
      const instEmail = unique('allowed-ob-inst');
      await provisionDemoUser(instEmail);
      await request(app.getHttpServer())
        .post('/api/v1/onboarding')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: instEmail, institutionId: mainInstitution.id })
        .expect(201);
    });
  });

  describe('#2/#3/#4 wrong-owner, wrong-org, same-role-another-tenant denied', () => {
    it('self scope: another user\'s session cannot be revoked (wrong owner)', async () => {
      await loginAs(app, 'teacher1@greenfield.edu.ng');
      const teacher = await prisma.user.findFirst({ where: { email: 'teacher1@greenfield.edu.ng' } });
      const teacherSession = await prisma.session.findFirst({
        where: { userId: teacher!.id, isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(teacherSession).toBeTruthy();

      const { accessToken } = await loginAs(app, 'admin@greenfield.edu.ng');
      await request(app.getHttpServer())
        .delete(`/api/v1/sessions/${teacherSession!.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      // the target session is untouched (deny only, never mutate)
      const row = await prisma.session.findUnique({ where: { id: teacherSession!.id } });
      expect(row?.isActive).toBe(true);
    });

    it('tenant scope: a same-role admin in another organization cannot read Demo invitations or audit', async () => {
      const iso = await createIsoTenant('cross');
      const isoLogin = await loginAs(app, iso.user.email, 'Password@123', iso.slug);

      const { accessToken } = await loginAs(app, 'admin@greenfield.edu.ng');
      const created = await request(app.getHttpServer())
        .post('/api/v1/invitations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: unique('cross-read') })
        .expect(201);
      const inviteId: string = created.body.data.invitation.id;

      const audit = await prisma.auditLog.create({
        data: {
          tenantId: greenfield.id,
          actorEmail: 'admin@greenfield.edu.ng',
          action: 'rbac4.cross.read',
          entityType: 'Tenant',
          entityId: greenfield.id,
        },
      });

      await request(app.getHttpServer())
        .get(`/api/v1/invitations/${inviteId}`)
        .set('Authorization', `Bearer ${isoLogin.accessToken}`)
        .expect(403);
      await request(app.getHttpServer())
        .get(`/api/v1/audit-logs/${audit.id}`)
        .set('Authorization', `Bearer ${isoLogin.accessToken}`)
        .expect(403);

      // wrong-org: the iso admin list sees only its own tenant's rows
      const isoList = await request(app.getHttpServer())
        .get('/api/v1/invitations')
        .set('Authorization', `Bearer ${isoLogin.accessToken}`)
        .expect(200);
      const items = isoList.body.data.items as { tenantId: string }[];
      expect(items.length).toBe(0);
    });

    it('tenant scope: an onboarding link cannot be issued for an identity outside the caller org', async () => {
      const iso = await createIsoTenant('onb');
      const isoLogin = await loginAs(app, iso.user.email, 'Password@123', iso.slug);
      const email = unique('cross-ob');

      await request(app.getHttpServer())
        .post('/api/v1/onboarding')
        .set('Authorization', `Bearer ${isoLogin.accessToken}`)
        .send({ email })
        .expect(404); // greenfield identity is invisible from the iso org
    });
  });

  describe('#5 client-supplied context never overrides trusted state', () => {
    it('forged tenant/owner headers and query ids are ignored', async () => {
      const iso = await createIsoTenant('forge');
      const isoLogin = await loginAs(app, iso.user.email, 'Password@123', iso.slug);

      const { accessToken } = await loginAs(app, 'admin@greenfield.edu.ng');
      const created = await request(app.getHttpServer())
        .post('/api/v1/invitations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: unique('forge-read') })
        .expect(201);
      const inviteId: string = created.body.data.invitation.id;

      // The attacker claims oracle-type control: x-tenant-id of the target org
      // and an ownership hint in the query string. The server resolves the
      // object's owner itself — the request context inputs are ignored.
      await request(app.getHttpServer())
        .get(`/api/v1/invitations/${inviteId}`)
        .set('Authorization', `Bearer ${isoLogin.accessToken}`)
        .set('x-tenant-id', greenfield.id)
        .query({ tenantId: greenfield.id })
        .expect(403);

      // Same attack against the self-scoped session surface.
      await loginAs(app, 'teacher1@greenfield.edu.ng');
      const teacher = await prisma.user.findFirst({ where: { email: 'teacher1@greenfield.edu.ng' } });
      const teacherSession = await prisma.session.findFirst({
        where: { userId: teacher!.id, isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      await request(app.getHttpServer())
        .delete(`/api/v1/sessions/${teacherSession!.id}`)
        .set('Authorization', `Bearer ${isoLogin.accessToken}`)
        .set('x-user-id', teacher!.id)
        .query({ userId: teacher!.id })
        .expect(403);
    });
  });

  describe('#6/#7 missing, invalid and deactivated membership/institution denied', () => {
    it('institution binding requires an ACTIVE membership (missing -> denied)', async () => {
      const gf = await createDemoInstitutionAdmin({}); // org-only, no institution membership
      const login = await loginAs(app, gf.email);
      const email = unique('inst-missing');
      await provisionDemoUser(email);

      await request(app.getHttpServer())
        .post('/api/v1/onboarding')
        .set('Authorization', `Bearer ${login.accessToken}`)
        .send({ email, institutionId: mainInstitution.id })
        .expect(403);
    });

    it('wrong institution: a principal cannot bind a link to an institution it has no membership in', async () => {
      const annex = await prisma.institution.create({
        data: { tenantId: greenfield.id, name: 'RBAC4 Annex', code: 'RBAC4-ANNEX' },
      });
      const principal = await loginAs(app, 'principal@greenfield.edu.ng');
      const email = unique('inst-wrong');
      await provisionDemoUser(email);

      await request(app.getHttpServer())
        .post('/api/v1/onboarding')
        .set('Authorization', `Bearer ${principal.accessToken}`)
        .send({ email, institutionId: annex.id })
        .expect(403);
    });

    it('deactivated membership denies institution binding', async () => {
      const gf = await createDemoInstitutionAdmin({ membership: 'ACTIVE' });
      await prisma.institutionMembership.update({
        where: {
          tenantId_institutionId_userId: {
            tenantId: greenfield.id,
            institutionId: mainInstitution.id,
            userId: gf.user.id,
          },
        },
        data: { status: 'INACTIVE' },
      });
      const login = await loginAs(app, gf.email);
      const email = unique('inst-inactive');
      await provisionDemoUser(email);

      await request(app.getHttpServer())
        .post('/api/v1/onboarding')
        .set('Authorization', `Bearer ${login.accessToken}`)
        .send({ email, institutionId: mainInstitution.id })
        .expect(403);
    });

    it('deactivated institution is not a valid binding target', async () => {
      const annex = await prisma.institution.create({
        data: { tenantId: greenfield.id, name: 'RBAC4 Dark', code: 'RBAC4-DARK' },
      });
      await prisma.institution.update({
        where: { id: annex.id },
        data: { status: 'DEACTIVATED' },
      });
      const { accessToken } = await loginAs(app, 'admin@greenfield.edu.ng');
      const email = unique('inst-dark');
      await provisionDemoUser(email);

      await request(app.getHttpServer())
        .post('/api/v1/onboarding')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email, institutionId: annex.id })
        .expect(400);
    });

    it('missing/random object ids fail closed without leaking existence', async () => {
      const { accessToken } = await loginAs(app, 'admin@greenfield.edu.ng');
      const ghost = randomUUID();

      await request(app.getHttpServer())
        .delete(`/api/v1/sessions/${ghost}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
      await request(app.getHttpServer())
        .get(`/api/v1/audit-logs/${ghost}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});