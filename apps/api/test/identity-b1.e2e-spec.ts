import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';
import { hashToken } from '../src/modules/identity/identity.utils';

describe('Identity B1 â€” Invitations, Registration, Email Verification (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const unique = (label: string) => `${label}.${Date.now()}@greenfield.edu.ng`;

  let personPublicIdSeq = 10000;
  function testPublicId(prefix: 'P' | 'STU' = 'P'): string {
    return `${prefix}-2026-${String(personPublicIdSeq++).padStart(6, '0')}`;
  }

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  }, 30000);

  afterAll(async () => {
    await closeTestApp(app);
  });

  async function roleId(name: string): Promise<string> {
    const role = await prisma.role.findUnique({ where: { name } });
    if (!role) throw new Error(`Seeded role ${name} not found`);
    return role.id;
  }

  async function createInvitation(accessToken: string, email: string, role?: string) {
    const body: Record<string, string> = { email };
    if (role) body.roleId = await roleId(role);
    const res = await request(app.getHttpServer())
      .post('/api/v1/invitations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(body)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.invitation.status).toBe('PENDING');
    return res.body.data;
  }

  describe('Invitation management (guarded by identity:invitation permissions)', () => {
    let adminToken: string;

    beforeAll(async () => {
      adminToken = (await loginAs(app, 'admin@greenfield.edu.ng')).accessToken;
    });

    it('blocks non-privileged users from creating invitations', async () => {
      const teacher = await loginAs(app, 'teacher1@greenfield.edu.ng');
      await request(app.getHttpServer())
        .post('/api/v1/invitations')
        .set('Authorization', `Bearer ${teacher.accessToken}`)
        .send({ email: unique('blocked') })
        .expect(403);
    });

    it('rejects unauthenticated invitation administration with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/invitations')
        .send({ email: unique('unauth') })
        .expect(401);
    });

    it('creates an invitation and exposes the plaintext token only in non-production', async () => {
      const email = unique('invitee');
      const data = await createInvitation(adminToken, email, 'TEACHER');

      expect(data.invitation.email).toBe(email);
      expect(data.invitation.roleName).toBe('TEACHER');
      expect(data.invitationToken).toBeDefined();
    });

    it('validates an invitation token via the public accept endpoint', async () => {
      const email = unique('claim');
      const data = await createInvitation(adminToken, email, 'TEACHER');

      const res = await request(app.getHttpServer())
        .post(`/api/v1/invitations/${data.invitation.id}/accept`)
        .send({ token: data.invitationToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(email);
      expect(res.body.data.roleName).toBe('TEACHER');
    });

    it('rejects a claim with the wrong token', async () => {
      const email = unique('wrongtoken');
      const data = await createInvitation(adminToken, email);

      await request(app.getHttpServer())
        .post(`/api/v1/invitations/${data.invitation.id}/accept`)
        .send({ token: 'not-the-real-token' })
        .expect(400);
    });

    it('rejects a claim for an expired invitation', async () => {
      const data = await createInvitation(adminToken, unique('expiredaccept'));
      await prisma.userInvitation.update({
        where: { id: data.invitation.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      await request(app.getHttpServer())
        .post(`/api/v1/invitations/${data.invitation.id}/accept`)
        .send({ token: data.invitationToken })
        .expect(400);
    });

    it('public claim check does not mutate the invitation', async () => {
      const email = unique('claimnomut');
      const data = await createInvitation(adminToken, email, 'TEACHER');

      await request(app.getHttpServer())
        .post(`/api/v1/invitations/${data.invitation.id}/accept`)
        .send({ token: data.invitationToken })
        .expect(200);

      const row = await prisma.userInvitation.findUnique({
        where: { id: data.invitation.id },
      });
      expect(row?.status).toBe('PENDING');
      expect(row?.acceptedAt).toBeNull();

      // registration is the consuming operation and still works afterwards
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          tenantSlug: 'greenfield-academy',
          email,
          password: 'Abcd1234!',
          firstName: 'Claim',
          lastName: 'Nomut',
          invitationToken: data.invitationToken,
        })
        .expect(201);
    });

    it('lists invitations using the locked flat envelope', async () => {
      await createInvitation(adminToken, unique('listed'));

      const res = await request(app.getHttpServer())
        .get('/api/v1/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toBeInstanceOf(Array);
      expect(typeof res.body.data.total).toBe('number');
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.limit).toBe(20);
      expect(res.body.data.meta).toBeUndefined();
    });

    it('resends an invitation with a regenerated token', async () => {
      const email = unique('resend');
      const data = await createInvitation(adminToken, email);

      const res = await request(app.getHttpServer())
        .post(`/api/v1/invitations/${data.invitation.id}/resend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      const newToken = res.body.data.invitationToken;
      expect(newToken).toBeDefined();
      expect(newToken).not.toBe(data.invitationToken);

      await request(app.getHttpServer())
        .post(`/api/v1/invitations/${data.invitation.id}/accept`)
        .send({ token: data.invitationToken })
        .expect(400);

      await request(app.getHttpServer())
        .post(`/api/v1/invitations/${data.invitation.id}/accept`)
        .send({ token: newToken })
        .expect(200);
    });

    it('revokes an invitation and rejects subsequent claims', async () => {
      const email = unique('revoke');
      const data = await createInvitation(adminToken, email);

      await request(app.getHttpServer())
        .delete(`/api/v1/invitations/${data.invitation.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .post(`/api/v1/invitations/${data.invitation.id}/accept`)
        .send({ token: data.invitationToken })
        .expect(400);
    });
  });

  describe('Registration (invitation-driven)', () => {
    let adminToken: string;

    beforeAll(async () => {
      adminToken = (await loginAs(app, 'admin@greenfield.edu.ng')).accessToken;
    });

    it('rejects registration without an invitation token (invite-only default)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          tenantSlug: 'greenfield-academy',
          email: unique('noinvite'),
          password: 'Abcd1234!',
          firstName: 'No',
          lastName: 'Invite',
        })
        .expect(400);
    });

    it('rejects a client-supplied role (server-authoritative role assignment)', async () => {
      const data = await createInvitation(adminToken, unique('roleride'), 'TEACHER');

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          tenantSlug: 'greenfield-academy',
          email: data.invitation.email,
          password: 'Abcd1234!',
          firstName: 'Role',
          lastName: 'Ride',
          invitationToken: data.invitationToken,
          roleName: 'PLATFORM_ADMIN',
        })
        .expect(400);
    });

    it('rejects registration with an expired invitation', async () => {
      const data = await createInvitation(adminToken, unique('expiredreg'), 'TEACHER');
      await prisma.userInvitation.update({
        where: { id: data.invitation.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          tenantSlug: 'greenfield-academy',
          email: data.invitation.email,
          password: 'Abcd1234!',
          firstName: 'Expired',
          lastName: 'Reg',
          invitationToken: data.invitationToken,
        })
        .expect(400);
    });

    it('rejects registration with an invalid token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          tenantSlug: 'greenfield-academy',
          email: unique('badinvite'),
          password: 'Abcd1234!',
          firstName: 'Bad',
          lastName: 'Invite',
          invitationToken: 'invalid-token',
        })
        .expect(400);
    });

    it('rejects registration when the email does not match the invitation', async () => {
      const data = await createInvitation(adminToken, unique('intended'), 'TEACHER');

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          tenantSlug: 'greenfield-academy',
          email: unique('different'),
          password: 'Abcd1234!',
          firstName: 'Wrong',
          lastName: 'Email',
          invitationToken: data.invitationToken,
        })
        .expect(400);
    });

    it('rejects a password that violates the tenant policy', async () => {
      const data = await createInvitation(adminToken, unique('weakpw'), 'TEACHER');

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          tenantSlug: 'greenfield-academy',
          email: data.invitation.email,
          password: 'weak',
          firstName: 'Weak',
          lastName: 'Password',
          invitationToken: data.invitationToken,
        })
        .expect(400);

      expect(res.body.error.details).toBeDefined();
    });

    it('registers a user via invitation and consumes the token', async () => {
      const email = unique('registered');
      const data = await createInvitation(adminToken, email, 'TEACHER');

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          tenantSlug: 'greenfield-academy',
          email,
          password: 'Abcd1234!',
          firstName: 'New',
          lastName: 'Teacher',
          invitationToken: data.invitationToken,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(email);
      expect(res.body.data.verificationToken).toBeDefined();

      const token = res.body.data.verificationToken;
      const resArr = await request(app.getHttpServer())
        .post('/api/v1/auth/email/verify')
        .send({ token })
        .expect(200);
      expect(resArr.body.data.verified).toBe(true);

      // token now consumed (invitation accepted)
      await request(app.getHttpServer())
        .post(`/api/v1/invitations/${data.invitation.id}/accept`)
        .send({ token: data.invitationToken })
        .expect(400);

      // replaying the consumed token cannot register again
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          tenantSlug: 'greenfield-academy',
          email,
          password: 'Abcd1234!',
          firstName: 'New',
          lastName: 'Teacher',
          invitationToken: data.invitationToken,
        })
        .expect(400);
    });

    it('does not disclose account existence for a duplicate identity (D-03)', async () => {
      // control: a fresh identity registers successfully
      const controlEmail = unique('d03control');
      const control = await createInvitation(adminToken, controlEmail, 'TEACHER');
      const controlRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          tenantSlug: 'greenfield-academy',
          email: controlEmail,
          password: 'Abcd1234!',
          firstName: 'Control',
          lastName: 'Reg',
          invitationToken: control.invitationToken,
        })
        .expect(201);

      // construct the duplicate state: this email now has an account, and a
      // fresh PENDING invitation exists for it (as in a createâ†’register race;
      // the admin create endpoint itself refuses to invite existing accounts).
      const tenant = await prisma.tenant.findUnique({
        where: { slug: 'greenfield-academy' },
      });
      if (!tenant) throw new Error('Seeded tenant missing');
      const rawToken = randomBytes(32).toString('base64url');
      const duplicateInvitation = await prisma.userInvitation.create({
        data: {
          tenantId: tenant.id,
          email: controlEmail,
          token: hashToken(rawToken),
          roleId: await roleId('TEACHER'),
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const duplicateRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          tenantSlug: 'greenfield-academy',
          email: controlEmail,
          password: 'Abcd1234!',
          firstName: 'Control',
          lastName: 'Reg',
          invitationToken: rawToken,
        })
        .expect(201);

      // identical success envelope: no 4xx, no indication the account exists
      expect(duplicateRes.body.success).toBe(true);
      expect(duplicateRes.body.data.email).toBe(controlEmail);
      expect(duplicateRes.body.data.verificationToken).toBeDefined();
      expect(Object.keys(duplicateRes.body.data).sort()).toEqual(
        Object.keys(controlRes.body.data).sort(),
      );

      // exactly one account remains, and the duplicate invitation was consumed
      const count = await prisma.user.count({
        where: { tenantId: tenant.id, email: controlEmail },
      });
      expect(count).toBe(1);

      const consumed = await prisma.userInvitation.findUnique({
        where: { id: duplicateInvitation.id },
      });
      expect(consumed?.status).toBe('ACCEPTED');
      expect(consumed?.acceptedAt).toBeTruthy();

      // the original account is still able to log in with its own credentials
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: controlEmail,
          password: 'Abcd1234!',
          tenantSlug: 'greenfield-academy',
        })
        .expect(200);
    });

    it('allows a non-privileged unverified user to log in', async () => {
      const email = unique('unverified');
      const data = await createInvitation(adminToken, email, 'TEACHER');

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          tenantSlug: 'greenfield-academy',
          email,
          password: 'Abcd1234!',
          firstName: 'Unverified',
          lastName: 'Teacher',
          invitationToken: data.invitationToken,
        })
        .expect(201);

      const login = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: 'Abcd1234!', tenantSlug: 'greenfield-academy' })
        .expect(200);

      expect(login.body.data.user.roles).toContain('TEACHER');
    });
  });

  describe('Privileged-role verification gate (D-02)', () => {
    let adminToken: string;

    beforeAll(async () => {
      adminToken = (await loginAs(app, 'admin@greenfield.edu.ng')).accessToken;
    });

    it('blocks login for an unverified user holding a privileged role', async () => {
      const email = unique('admincandidate');
      const data = await createInvitation(adminToken, email, 'INSTITUTION_ADMIN');

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          tenantSlug: 'greenfield-academy',
          email,
          password: 'Abcd1234!',
          firstName: 'Future',
          lastName: 'Admin',
          invitationToken: data.invitationToken,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: 'Abcd1234!', tenantSlug: 'greenfield-academy' })
        .expect(401);

      await request(app.getHttpServer())
        .post('/api/v1/auth/email/verify')
        .send({ token: res.body.data.verificationToken })
        .expect(200);

      const login = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: 'Abcd1234!', tenantSlug: 'greenfield-academy' })
        .expect(200);

      expect(login.body.data.user.roles).toContain('INSTITUTION_ADMIN');
    });
  });

  describe('Email verification endpoints', () => {
    it('issues a verification token on request for an authenticated user', async () => {
      const admin = (await loginAs(app, 'admin@greenfield.edu.ng')).accessToken;
      const email = unique('unverified');
      const invitation = await createInvitation(admin, email, 'TEACHER');

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          tenantSlug: 'greenfield-academy',
          email,
          password: 'Abcd1234!',
          firstName: 'Unverified',
          lastName: 'Teacher',
          invitationToken: invitation.invitationToken,
        })
        .expect(201);

      const tokens = await loginAs(app, email, 'Abcd1234!');

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/email/verification-request')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(201);

      expect(res.body.data.sent).toBe(true);
      expect(res.body.data.verificationToken).toBeDefined();

      await request(app.getHttpServer())
        .post('/api/v1/auth/email/verify')
        .send({ token: res.body.data.verificationToken })
        .expect(200);
    });
  });

  describe('Onboarding links (provisioned accounts) â€” lifecycle & security', () => {
    let adminToken: string;
    let institutionId: string;

    beforeAll(async () => {
      adminToken = (await loginAs(app, 'admin@greenfield.edu.ng')).accessToken;
      const tenant = await prisma.tenant.findUnique({
        where: { slug: 'greenfield-academy' },
      });
      if (!tenant) throw new Error('Seeded tenant missing');
      const institution = await prisma.institution.findFirst({
        where: { tenantId: tenant.id },
      });
      if (!institution) throw new Error('Seeded institution missing');
      institutionId = institution.id;
    });

    async function provisionUser(
      email: string,
      firstName: string,
      lastName: string,
      roleNames: string[] = [],
    ) {
      const tenant = await prisma.tenant.findUnique({
        where: { slug: 'greenfield-academy' },
      });
      if (!tenant) throw new Error('Seeded tenant missing');
      const placeholder = await bcrypt.hash(randomBytes(16).toString('base64url'), 10);
      const roleAssignments = [];
      for (const name of roleNames) {
        const role = await prisma.role.findUnique({ where: { name } });
        if (!role) throw new Error(`Seeded role ${name} not found`);
        roleAssignments.push({ tenantId: tenant.id, roleId: role.id });
      }
      return prisma.user.create({
        data: {
          tenantId: tenant.id,
          email,
          passwordHash: placeholder,
          firstName,
          lastName,
          status: 'ACTIVE',
          ...(roleAssignments.length ? { roles: { create: roleAssignments } } : {}),
        },
      });
    }

    async function issueLink(email: string) {
      const res = await request(app.getHttpServer())
        .post('/api/v1/onboarding')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email })
        .expect(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.onboardingLink.status).toBe('PENDING');
      expect(res.body.data.onboardingToken).toBeDefined();
      return res.body.data;
    }

    it('blocks non-privileged users from issuing onboarding links', async () => {
      const teacher = await loginAs(app, 'teacher1@greenfield.edu.ng');
      await request(app.getHttpServer())
        .post('/api/v1/onboarding')
        .set('Authorization', `Bearer ${teacher.accessToken}`)
        .send({ email: 'anyone@greenfield.edu.ng' })
        .expect(403);
    });

    it('rejects an unauthenticated onboarding-link request with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/onboarding')
        .send({ email: 'anyone@greenfield.edu.ng' })
        .expect(401);
    });

    it('rejects an unknown account with 404', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/onboarding')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'does-not-exist@greenfield.edu.ng' })
        .expect(404);
    });

    it('rejects an already-active verified account with 409', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/onboarding')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'teacher1@greenfield.edu.ng' })
        .expect(409);
    });

    it('#1 opens for the intended identity: review reveals the provisioned information', async () => {
      const email = unique('ob-review');
      await provisionUser(email, 'Ada', 'Okonkwo', ['TEACHER']);
      const issued = await issueLink(email);

      const review = await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${issued.onboardingLink.id}/review`)
        .send({ token: issued.onboardingToken })
        .expect(200);

      expect(review.body.success).toBe(true);
      expect(review.body.data.email).toBe(email);
      expect(review.body.data.firstName).toBe('Ada');
      expect(review.body.data.lastName).toBe('Okonkwo');
      expect(review.body.data.roleNames).toContain('TEACHER');
    });

    it('#2 review does not consume the link', async () => {
      const email = unique('ob-nomut');
      await provisionUser(email, 'Ben', 'Uche');
      const issued = await issueLink(email);

      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${issued.onboardingLink.id}/review`)
        .send({ token: issued.onboardingToken })
        .expect(200);

      const row = await prisma.onboardingLink.findUnique({
        where: { id: issued.onboardingLink.id },
      });
      expect(row?.status).toBe('PENDING');
      expect(row?.confirmedAt).toBeNull();
      expect(row?.acceptedAt).toBeNull();
    });

    it('#3 confirmation is required before the password can be set', async () => {
      const email = unique('ob-gate');
      await provisionUser(email, 'Cara', 'Nnamdi');
      const issued = await issueLink(email);

      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${issued.onboardingLink.id}/claim`)
        .send({ token: issued.onboardingToken, password: 'Abcd1234!' })
        .expect(400);
    });

    it('#4 confirmation rejects names that do not match the provisioned account', async () => {
      const email = unique('ob-mismatch');
      await provisionUser(email, 'Dara', 'Eze');
      const issued = await issueLink(email);

      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${issued.onboardingLink.id}/confirm`)
        .send({ token: issued.onboardingToken, firstName: 'Wrong', lastName: 'Person' })
        .expect(400);

      const row = await prisma.onboardingLink.findUnique({
        where: { id: issued.onboardingLink.id },
      });
      expect(row?.status).toBe('PENDING');
      expect(row?.confirmedAt).toBeNull();
    });

    it('#5 confirmation succeeds when the echoed name matches (case/whitespace tolerant)', async () => {
      const email = unique('ob-confirm');
      await provisionUser(email, 'Ella', 'Adeyemi');
      const issued = await issueLink(email);

      const confirm = await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${issued.onboardingLink.id}/confirm`)
        .send({ token: issued.onboardingToken, firstName: '  ELLA ', lastName: 'adeyemi' })
        .expect(200);

      expect(confirm.body.data.confirmed).toBe(true);

      const row = await prisma.onboardingLink.findUnique({
        where: { id: issued.onboardingLink.id },
      });
      expect(row?.status).toBe('CONFIRMED');
      expect(row?.confirmedAt).toBeTruthy();
    });

    it('#6 completes the flow only after confirmation: activate + verify + org membership', async () => {
      const email = unique('ob-flow');
      await provisionUser(email, 'Femi', 'Obinna');
      const issued = await issueLink(email);
      const linkId = issued.onboardingLink.id;

      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/confirm`)
        .send({ token: issued.onboardingToken, firstName: 'Femi', lastName: 'Obinna' })
        .expect(200);

      const claim = await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/claim`)
        .send({ token: issued.onboardingToken, password: 'Abcd1234!' })
        .expect(200);

      expect(claim.body.data.onboarded).toBe(true);
      expect(claim.body.data.accessToken).toBeDefined();
      expect(claim.body.data.refreshToken).toBeDefined();
      expect(claim.body.data.user.email).toBe(email);

      const link = await prisma.onboardingLink.findUnique({ where: { id: linkId } });
      if (!link) throw new Error('Onboarding link missing after claim');
      const user = await prisma.user.findUnique({ where: { id: link.userId } });
      if (!user) throw new Error('Provisioned user missing after claim');
      expect(user.status).toBe('ACTIVE');
      expect(user.emailVerifiedAt).toBeTruthy();

      const orgMembership = await prisma.organizationMembership.findUnique({
        where: { tenantId_userId: { tenantId: user.tenantId, userId: user.id } },
      });
      expect(orgMembership?.status).toBe('ACTIVE');

      expect(link?.status).toBe('COMPLETED');
      expect(link?.acceptedAt).toBeTruthy();
    });

    it('#7 binds an institution membership for institution-scoped links and auto-authenticates', async () => {
      const email = unique('ob-inst');
      await provisionUser(email, 'Gabi', 'Chidimma');

      const issuedRes = await request(app.getHttpServer())
        .post('/api/v1/onboarding')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email, institutionId })
        .expect(201);
      const issued = issuedRes.body.data;
      const linkId = issued.onboardingLink.id;

      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/confirm`)
        .send({ token: issued.onboardingToken, firstName: 'Gabi', lastName: 'Chidimma' })
        .expect(200);

      const claim = await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/claim`)
        .send({ token: issued.onboardingToken, password: 'Abcd1234!' })
        .expect(200);

      const link = await prisma.onboardingLink.findUnique({ where: { id: linkId } });
      if (!link) throw new Error('Onboarding link missing after claim');
      const user = await prisma.user.findUnique({ where: { id: link.userId } });
      if (!user) throw new Error('Provisioned user missing after claim');

      const instMembership = await prisma.institutionMembership.findUnique({
        where: {
          tenantId_institutionId_userId: {
            tenantId: user.tenantId,
            institutionId,
            userId: user.id,
          },
        },
      });
      expect(instMembership?.status).toBe('ACTIVE');

      // auto-authentication produced a usable access token
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${claim.body.data.accessToken}`)
        .expect(200);
    });

    it('#8 rejects a wrong token at every stage', async () => {
      const email = unique('ob-wrongtoken');
      await provisionUser(email, 'Kemi', 'Lawal');
      const issued = await issueLink(email);
      const linkId = issued.onboardingLink.id;

      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/review`)
        .send({ token: 'not-the-real-token' })
        .expect(400);
      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/confirm`)
        .send({ token: 'not-the-real-token', firstName: 'Kemi', lastName: 'Lawal' })
        .expect(400);
      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/review`)
        .send({ token: issued.onboardingToken })
        .expect(200);
    });

    it('#9 the single-use link cannot be claimed twice', async () => {
      const email = unique('ob-single');
      await provisionUser(email, 'Hana', 'Ibe');
      const issued = await issueLink(email);
      const linkId = issued.onboardingLink.id;

      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/confirm`)
        .send({ token: issued.onboardingToken, firstName: 'Hana', lastName: 'Ibe' })
        .expect(200);
      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/claim`)
        .send({ token: issued.onboardingToken, password: 'Abcd1234!' })
        .expect(200);
      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/claim`)
        .send({ token: issued.onboardingToken, password: 'Abcd1234!' })
        .expect(400);
    });

    it('#10 non-transferable: a different identity cannot confirm or claim the link', async () => {
      const email = unique('ob-transfer');
      await provisionUser(email, 'Ike', 'Jude');
      const issued = await issueLink(email);
      const linkId = issued.onboardingLink.id;

      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/confirm`)
        .send({ token: issued.onboardingToken, firstName: 'Someone', lastName: 'Else' })
        .expect(400);

      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/claim`)
        .send({ token: issued.onboardingToken, password: 'Abcd1234!' })
        .expect(400);

      const row = await prisma.onboardingLink.findUnique({ where: { id: linkId } });
      expect(row?.status).toBe('PENDING');
    });

    it('#11 rejects expired links and marks them EXPIRED', async () => {
      const email = unique('ob-expired');
      await provisionUser(email, 'Lia', 'Musa');
      const issued = await issueLink(email);
      const linkId = issued.onboardingLink.id;

      await prisma.onboardingLink.update({
        where: { id: linkId },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/review`)
        .send({ token: issued.onboardingToken })
        .expect(400);
      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/confirm`)
        .send({ token: issued.onboardingToken, firstName: 'Lia', lastName: 'Musa' })
        .expect(400);
      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/claim`)
        .send({ token: issued.onboardingToken, password: 'Abcd1234!' })
        .expect(400);

      const row = await prisma.onboardingLink.findUnique({ where: { id: linkId } });
      expect(row?.status).toBe('EXPIRED');
    });

    it('#12 issuing a replacement revokes prior pending/confirmed links (replacement semantics)', async () => {
      const email = unique('ob-replace');
      await provisionUser(email, 'Mira', 'Ngozi');
      const first = await issueLink(email);
      const second = await issueLink(email);

      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${first.onboardingLink.id}/claim`)
        .send({ token: first.onboardingToken, password: 'Abcd1234!' })
        .expect(400);

      const firstRow = await prisma.onboardingLink.findUnique({
        where: { id: first.onboardingLink.id },
      });
      expect(firstRow?.status).toBe('REVOKED');

      // the replacement remains usable through the full flow
      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${second.onboardingLink.id}/confirm`)
        .send({ token: second.onboardingToken, firstName: 'Mira', lastName: 'Ngozi' })
        .expect(200);
    });

    it('#13 claim still enforces the tenant password policy', async () => {
      const email = unique('ob-weakpw');
      await provisionUser(email, 'Nia', 'Okoye');
      const issued = await issueLink(email);
      const linkId = issued.onboardingLink.id;

      await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/confirm`)
        .send({ token: issued.onboardingToken, firstName: 'Nia', lastName: 'Okoye' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .post(`/api/v1/onboarding/${linkId}/claim`)
        .send({ token: issued.onboardingToken, password: 'weak' })
        .expect(400);

      expect(res.body.error.details).toBeDefined();
    });
  });

  describe('Platform Admin role guard (D-G5)', () => {
    let adminToken: string;

    beforeAll(async () => {
      adminToken = (await loginAs(app, 'admin@greenfield.edu.ng')).accessToken;
    });

    it('does not allow inviting a user into PLATFORM_ADMIN', async () => {
      const email = unique('pa-invite');

      const res = await request(app.getHttpServer())
        .post('/api/v1/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email, roleId: await roleId('PLATFORM_ADMIN') })
        .expect(409);

      expect(res.body.error.message).toMatch(/Platform Admin role cannot be assigned/);
    });

    it('does not allow registration even from a tampered PLATFORM_ADMIN invitation', async () => {
      const email = unique('pa-register');
      const tenant = await prisma.tenant.findUnique({
        where: { slug: 'greenfield-academy' },
      });
      if (!tenant) throw new Error('Seeded tenant missing');

      const rawToken = randomBytes(32).toString('base64url');
      const forced = await prisma.userInvitation.create({
        data: {
          tenantId: tenant.id,
          email,
          token: hashToken(rawToken),
          roleId: await roleId('PLATFORM_ADMIN'),
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          tenantSlug: 'greenfield-academy',
          email,
          password: 'Abcd1234!',
          firstName: 'Sneaky',
          lastName: 'Admin',
          invitationToken: rawToken,
        })
        .expect(400);

      // no account was created, and no privileged account exists beyond seed
      const count = await prisma.user.count({ where: { tenantId: tenant.id, email } });
      expect(count).toBe(0);
      const platformAdmins = await prisma.userRoleAssignment.count({
        where: { roleId: forced.roleId! },
      });
      expect(platformAdmins).toBe(1);
    });

    it('does not allow issuing an onboarding link into the single platform admin seat', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/onboarding')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'admin@greenfield.edu.ng' })
        .expect(409);
    });
  });

  describe('Login identifier resolution (email, internal email, Student/Staff ID)', () => {
    it('logs in with a Staff ID', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'STF-002',
          password: 'Password@123',
          tenantSlug: 'greenfield-academy',
        })
        .expect(200);
    });

    it('logs in with an institution internal (school) email', async () => {
      const staff = await prisma.staff.findFirst({
        where: { staffNumber: 'STF-002' },
      });
      if (!staff?.internalEmail) throw new Error('Seeded staff internal email missing');

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: staff.internalEmail,
          password: 'Password@123',
          tenantSlug: 'greenfield-academy',
        })
        .expect(200);
    });

    it('logs in with a Student ID within the institution', async () => {
      const tenant = await prisma.tenant.findUnique({
        where: { slug: 'greenfield-academy' },
      });
      if (!tenant) throw new Error('Seeded tenant missing');
      const institution = await prisma.institution.findFirst({
        where: { tenantId: tenant.id },
      });
      if (!institution) throw new Error('Seeded institution missing');

      const password = await (await import('bcrypt')).hash('Abcd1234!', 10);
      const email = unique('studentlogin');
      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email,
          passwordHash: password,
          firstName: 'Login',
          lastName: 'Student',
          status: 'ACTIVE',
          emailVerifiedAt: new Date(),
        },
      });

      const person = await prisma.person.create({
        data: {
          tenantId: tenant.id,
          publicId: testPublicId(),
          firstName: 'Login',
          lastName: 'Student',
          gender: 'MALE',
          email,
        },
      });
      await prisma.student.create({
        data: {
          tenantId: tenant.id,
          institutionId: institution.id,
          userId: user.id,
          personId: person.id,
          publicId: testPublicId('STU'),
          studentNumber: 'STU-E2E-001',
          internalEmail: email,
          status: 'ENROLLED',
        },
      });
      await prisma.organizationMembership.create({
        data: { tenantId: tenant.id, userId: user.id, status: 'ACTIVE' },
      });
      await prisma.institutionMembership.create({
        data: { tenantId: tenant.id, institutionId: institution.id, userId: user.id, status: 'ACTIVE' },
      });

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'STU-E2E-001',
          password: 'Abcd1234!',
          tenantSlug: 'greenfield-academy',
        })
        .expect(200);
    });

    it('rejects an unknown identifier with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'UNKNOWN-ID-999',
          password: 'Password@123',
          tenantSlug: 'greenfield-academy',
        })
        .expect(401);
    });
  });

  describe('D-03 opaque login failures', () => {
    it('returns the identical failure for unknown tenant, unknown user and wrong password', async () => {
      const cases = [
        { email: 'principal@greenfield.edu.ng', password: 'Password@123', tenantSlug: 'no-such-tenant' },
        { email: 'nobody@nowhere.edu.ng', password: 'Password@123', tenantSlug: 'greenfield-academy' },
        { email: 'principal@greenfield.edu.ng', password: 'wrong-password', tenantSlug: 'greenfield-academy' },
      ];

      const bodies: { error: { code: string; message: string } }[] = [];

      for (const payload of cases) {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(payload)
      .expect(401);
    bodies.push(res.body);
      }

      for (const body of bodies) {
        expect(body.error.code).toBe('UNAUTHORIZED');
        expect(body.error.message).toBe('Invalid credentials');
      }
      expect(new Set(bodies.map((b) => b.error.code)).size).toBe(1);
      expect(new Set(bodies.map((b) => b.error.message)).size).toBe(1);
    });
  });

  describe('Cross-organization isolation', () => {
    it('keeps identities and permissions isolated across organizations', async () => {
      // independent organization (spec Â§38: XYZ and Jane in a separate org)
      const xyz = await prisma.tenant.create({
        data: { name: 'XYZ Academy', slug: 'xyz-academy', subdomain: 'xyz' },
      });
      const role = await prisma.role.findUnique({ where: { name: 'TEACHER' } });
      if (!role) throw new Error('TEACHER role missing');

      const password = await (await import('bcrypt')).hash('Password@123', 10);
      const jane = await prisma.user.create({
        data: {
          tenantId: xyz.id,
          email: 'jane@xyz.edu.ng',
          passwordHash: password,
          firstName: 'Jane',
          lastName: 'David',
          status: 'ACTIVE',
          emailVerifiedAt: new Date(),
          roles: { create: { tenantId: xyz.id, roleId: role.id } },
        },
      });
      await prisma.organizationMembership.create({
        data: { tenantId: xyz.id, userId: jane.id, status: 'ACTIVE' },
      });

      const xyzLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'jane@xyz.edu.ng', password: 'Password@123', tenantSlug: 'xyz-academy' })
        .expect(200);

      // Jane (no invitation permission) cannot manage Greenfield invitations
      await request(app.getHttpServer())
        .post('/api/v1/invitations')
        .set('Authorization', `Bearer ${xyzLogin.body.data.accessToken}`)
        .send({ email: unique('isolation') })
        .expect(403);

      await request(app.getHttpServer())
        .get('/api/v1/invitations')
        .set('Authorization', `Bearer ${xyzLogin.body.data.accessToken}`)
        .expect(403);
    });
  });

  describe('Spec identity architecture â€” Examples Aâ€“D', () => {
    let greenfieldTenantId: string;
    let mainInstitutionId: string;

    beforeAll(async () => {
      const tenant = await prisma.tenant.findUnique({
        where: { slug: 'greenfield-academy' },
      });
      if (!tenant) throw new Error('Seeded tenant missing');
      greenfieldTenantId = tenant.id;
      const institution = await prisma.institution.findFirst({
        where: { tenantId: tenant.id },
      });
      if (!institution) throw new Error('Seeded institution missing');
      mainInstitutionId = institution.id;
    });

    async function createActiveIdentity(
      email: string,
      firstName: string,
      lastName: string,
      roleNames: string[],
      tenantId = greenfieldTenantId,
    ) {
      const password = await bcrypt.hash('Abcd1234!', 10);
      const roleAssignments = [];
      for (const name of roleNames) {
        const role = await prisma.role.findUnique({ where: { name } });
        if (!role) throw new Error(`Seeded role ${name} not found`);
        roleAssignments.push({ tenantId, roleId: role.id });
      }
      return prisma.user.create({
        data: {
          tenantId,
          email,
          passwordHash: password,
          firstName,
          lastName,
          status: 'ACTIVE',
          emailVerifiedAt: new Date(),
          ...(roleAssignments.length ? { roles: { create: roleAssignments } } : {}),
        },
      });
    }

    it('A: one identity across two institutions â€” two ACTIVE memberships under one user', async () => {
      const annex = await prisma.institution.create({
        data: {
          tenantId: greenfieldTenantId,
          name: 'Greenfield Annex',
          code: 'GF-ANNEX',
        },
      });

      const jane = await createActiveIdentity(unique('exA'), 'Jane', 'David', ['TEACHER']);
      await prisma.organizationMembership.create({
        data: { tenantId: greenfieldTenantId, userId: jane.id, status: 'ACTIVE' },
      });
      await prisma.institutionMembership.createMany({
        data: [
          { tenantId: greenfieldTenantId, institutionId: mainInstitutionId, userId: jane.id, status: 'ACTIVE' },
          { tenantId: greenfieldTenantId, institutionId: annex.id, userId: jane.id, status: 'ACTIVE' },
        ],
      });

      const memberships = await prisma.institutionMembership.count({
        where: { userId: jane.id, status: 'ACTIVE' },
      });
      expect(memberships).toBe(2);

      const login = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: jane.email, password: 'Abcd1234!', tenantSlug: 'greenfield-academy' })
        .expect(200);

      expect(login.body.data.user.id).toBe(jane.id);
      // institution context resolves to the first ACTIVE institution membership
      expect([mainInstitutionId, annex.id]).toContain(login.body.data.user.institutionId);
    });

    it('B: one identity with multiple roles', async () => {
      const sarah = await createActiveIdentity(
        unique('exB'),
        'Sarah',
        'Bello',
        ['TEACHER', 'PARENT'],
      );
      await prisma.organizationMembership.create({
        data: { tenantId: greenfieldTenantId, userId: sarah.id, status: 'ACTIVE' },
      });

      const login = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: sarah.email, password: 'Abcd1234!', tenantSlug: 'greenfield-academy' })
        .expect(200);

      expect(login.body.data.user.roles).toEqual(
        expect.arrayContaining(['TEACHER', 'PARENT']),
      );

      const assignments = await prisma.userRoleAssignment.count({
        where: { userId: sarah.id },
      });
      expect(assignments).toBe(2);
    });

    it('C: organization-level guardian with children in two institutions', async () => {
      const main = await prisma.institution.findFirst({
        where: { tenantId: greenfieldTenantId },
      });
      if (!main) throw new Error('Main institution missing');
      const annex = await prisma.institution.create({
        data: {
          tenantId: greenfieldTenantId,
          name: 'Greenfield South',
          code: 'GF-SOUTH',
        },
      });

      const guardianUser = await createActiveIdentity(unique('exC'), 'Ngozi', 'Eze', ['PARENT']);
      await prisma.organizationMembership.create({
        data: { tenantId: greenfieldTenantId, userId: guardianUser.id, status: 'ACTIVE' },
      });
      const guardianPerson = await prisma.person.create({
        data: {
          tenantId: greenfieldTenantId,
          publicId: testPublicId(),
          firstName: 'Ngozi',
          lastName: 'Eze',
          gender: 'FEMALE',
          email: guardianUser.email,
          phone: '+234 800 000 0000',
        },
      });
      const guardian = await prisma.guardian.create({
        data: {
          tenantId: greenfieldTenantId,
          institutionId: mainInstitutionId,
          personId: guardianPerson.id,
          userId: guardianUser.id,
          contactPreference: 'EMAIL',
          status: 'ACTIVE',
        },
      });

      const mkStudent = async (institutionId: string, number: string, name: string) => {
        const studentPerson = await prisma.person.create({
          data: {
            tenantId: greenfieldTenantId,
            publicId: testPublicId(),
            firstName: name,
            lastName: 'Eze',
            gender: 'MALE',
            email: `${name.toLowerCase()}.${Date.now()}@test.greenfield.local`,
          },
        });
        const student = await prisma.student.create({
          data: {
            tenantId: greenfieldTenantId,
            institutionId,
            personId: studentPerson.id,
            publicId: testPublicId('STU'),
            studentNumber: `${number}-${Date.now()}`,
            status: 'ENROLLED',
          },
        });
        await prisma.personRelationship.create({
          data: {
            tenantId: greenfieldTenantId,
            institutionId,
            sourcePersonId: guardianPerson.id,
            targetPersonId: studentPerson.id,
            relationshipType: 'PARENT',
            metadata: { roleContext: 'GUARDIAN', isPrimary: true },
          },
        });
        return student;
      };

      const first = await mkStudent(main.id, 'EXC1', 'Chidi');
      const second = await mkStudent(annex.id, 'EXC2', 'Kayode');
      expect(first.id).not.toBe(second.id);

      const links = await prisma.personRelationship.count({
        where: { sourcePersonId: guardianPerson.id },
      });
      expect(links).toBe(2);

      const login = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: guardianUser.email,
          password: 'Abcd1234!',
          tenantSlug: 'greenfield-academy',
        })
        .expect(200);

      // organization-level identity: no single institution context
      expect(login.body.data.user.institutionId).toBeUndefined();
      const orgCount = await prisma.organizationMembership.count({
        where: { userId: guardianUser.id, status: 'ACTIVE' },
      });
      const instCount = await prisma.institutionMembership.count({
        where: { userId: guardianUser.id },
      });
      expect(orgCount).toBe(1);
      expect(instCount).toBe(0);
    });

    it('D: identical external email allowed in two unrelated organizations (org-scoped)', async () => {
      const lambda = await prisma.tenant.create({
        data: { name: 'Lambda International', slug: 'lambda-international', subdomain: 'lambda' },
      });

      const shared = 'shared@common.edu.ng';
      const greenfieldUser = await createActiveIdentity(shared, 'Shared', 'Email', ['TEACHER']);
      await prisma.organizationMembership.create({
        data: { tenantId: greenfieldTenantId, userId: greenfieldUser.id, status: 'ACTIVE' },
      });
      const lambdaUser = await createActiveIdentity(shared, 'Shared', 'Email', ['TEACHER'], lambda.id);
      await prisma.organizationMembership.create({
        data: { tenantId: lambda.id, userId: lambdaUser.id, status: 'ACTIVE' },
      });

      const greenLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: shared, password: 'Abcd1234!', tenantSlug: 'greenfield-academy' })
        .expect(200);
      const lambdaLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: shared, password: 'Abcd1234!', tenantSlug: 'lambda-international' })
        .expect(200);

      expect(greenLogin.body.data.user.email).toBe(lambdaLogin.body.data.user.email);
      expect(greenLogin.body.data.user.tenantId).toBe(greenfieldTenantId);
      expect(lambdaLogin.body.data.user.tenantId).toBe(lambda.id);
      expect(greenLogin.body.data.user.id).not.toBe(lambdaLogin.body.data.user.id);
    });
  });

  describe('Identifier ambiguity across institutions (D-03)', () => {
    it('a Student ID valid in two institutions is unresolvable and fails opaquely', async () => {
      const tenant = await prisma.tenant.findUnique({
        where: { slug: 'greenfield-academy' },
      });
      if (!tenant) throw new Error('Seeded tenant missing');
      const main = await prisma.institution.findFirst({ where: { tenantId: tenant.id } });
      if (!main) throw new Error('Seeded institution missing');
      const annex = await prisma.institution.create({
        data: { tenantId: tenant.id, name: 'Greenfield North', code: 'GF-NORTH' },
      });

      const mk = async (email: string, institutionId: string, name: string) => {
        const password = await bcrypt.hash('Abcd1234!', 10);
        const user = await prisma.user.create({
          data: {
            tenantId: tenant.id,
            email,
            passwordHash: password,
            firstName: name,
            lastName: 'Ambiguous',
            status: 'ACTIVE',
            emailVerifiedAt: new Date(),
          },
        });
        const studentPerson = await prisma.person.create({
          data: {
            tenantId: tenant.id,
            publicId: testPublicId(),
            firstName: name,
            lastName: 'Ambiguous',
            gender: 'MALE',
            email,
          },
        });
        await prisma.student.create({
          data: {
            tenantId: tenant.id,
            institutionId,
            userId: user.id,
            personId: studentPerson.id,
            publicId: testPublicId('STU'),
            studentNumber: 'STU-AMB-001',
            internalEmail: email,
            status: 'ENROLLED',
          },
        });
        await prisma.organizationMembership.create({
          data: { tenantId: tenant.id, userId: user.id, status: 'ACTIVE' },
        });
        await prisma.institutionMembership.create({
          data: {
            tenantId: tenant.id,
            institutionId,
            userId: user.id,
            status: 'ACTIVE',
          },
        });
        return user;
      };

      const a = await mk(unique('ambA'), main.id, 'Ambrose');
      const b = await mk(unique('ambB'), annex.id, 'Bella');

      // ambiguous identifier â†’ opaque failure
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'STU-AMB-001',
          password: 'Abcd1234!',
          tenantSlug: 'greenfield-academy',
        })
        .expect(401);

      // each account still authenticates with its own external email
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: a.email, password: 'Abcd1234!', tenantSlug: 'greenfield-academy' })
        .expect(200);
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: b.email, password: 'Abcd1234!', tenantSlug: 'greenfield-academy' })
        .expect(200);
    });
  });
});