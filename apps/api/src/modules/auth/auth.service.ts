import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from './password.service';
import { LoginAttemptsService } from './login-attempts.service';
import { PasswordPolicyService } from '../identity/password-policy.service';
import { SessionService } from '../session/session.service';
import { DELIVERY_PROVIDER, DeliveryProvider } from '../delivery/delivery-provider';
import { currentCorrelationId } from '../../common/interceptors/correlation-id.interceptor';
import { AuthEvents } from '../audit/audit.events';
import {
  generateToken,
  hashToken,
  isPrivilegedRole,
  normalizeEmail,
  normalizeIdentity,
  permissionsFromRoles,
} from '../identity/identity.utils';

interface TokenPayload {
  sub: string;
  tenantId: string;
  institutionId?: string;
  roles: string[];
  /**
   * Per-token nonce. (tenantId, userId, accessTokenHash) is unique per session,
   * and two logins inside the same second would otherwise sign byte-identical
   * HS256 tokens with a colliding SHA-256. Hashing only the opaque-nonce JWT
   * would require recovering the raw token; instead the nonce travels in the
   * token so the DB hash stays valid and unique while the header is still
   * verifiable offline by the strategy.
   */
  jti: string;
}

interface LoginMeta {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private password: PasswordService,
    private policy: PasswordPolicyService,
    private attempts: LoginAttemptsService,
    private sessions: SessionService,
    @Inject(DELIVERY_PROVIDER) private delivery: DeliveryProvider,
    private events: EventEmitter2,
  ) {}

  private isProduction(): boolean {
    return this.config.get<string>('env', 'development') === 'production';
  }

  private emitAuth<T>(event: string, payload: T): void {
    this.events.emit(event, {
      correlationId: currentCorrelationId() ?? null,
      ...payload,
    });
  }

  private verificationTtlMs(): number {
    const minutes = this.config.get<number>('verification.tokenTtlMinutes', 60);
    return minutes * 60 * 1000;
  }

  async login(
    identifier: string,
    password: string,
    tenantSlug: string,
    meta: LoginMeta = {},
  ) {
    // Canonical identifier shared by layer-1 throttling, layer-2 tracking and
    // uniqueness checks so casing variants map to a single identity/key (D-09).
    const canonicalIdentifier = normalizeIdentity(identifier);

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    // D-03: unknown tenant, unknown identity and wrong password are all the
    // same opaque failure. No 'Invalid tenant' distinction. Unknown-tenant
    // attempts carry no tenant scope for layer-2 tracking; they are throttled
    // at layer 1 (pre-auth Redis throttle) only.
    if (!tenant) {
      this.emitAuth(AuthEvents.LoginFailed, {
        tenantId: null,
        actorEmail: canonicalIdentifier,
        reason: 'unknown-tenant',
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.resolveIdentity(identifier, tenant);
    if (!user || user.status !== 'ACTIVE') {
      await this.attempts.record({
        tenantId: tenant.id,
        email: canonicalIdentifier,
        success: false,
        failureReason: 'unknown-identity',
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      });
      this.emitAuth(AuthEvents.LoginFailed, {
        tenantId: tenant.id,
        actorEmail: canonicalIdentifier,
        reason: 'unknown-identity',
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // V-A-03: account must not be locked. Enforced before the password check so
    // the compare cost is not reached and the lock surface is not extendible.
    const lock = this.attempts.lockState(user);
    if (lock.locked) {
      await this.attempts.record({
        tenantId: tenant.id,
        email: canonicalIdentifier,
        userId: user.id,
        success: false,
        failureReason: 'account-locked',
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      });
      this.emitAuth(AuthEvents.LoginLocked, {
        tenantId: tenant.id,
        actorEmail: canonicalIdentifier,
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      });
      throw new HttpException(
        {
          statusCode: 423,
          message: 'Account temporarily locked',
          retryAfter: lock.retryAfterSeconds,
        },
        423,
      );
    }

    const passwordValid = await this.password.compare(password, user.passwordHash);
    if (!passwordValid) {
      await this.attempts.record({
        tenantId: tenant.id,
        email: canonicalIdentifier,
        userId: user.id,
        success: false,
        failureReason: 'invalid-password',
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      });
      this.emitAuth(AuthEvents.LoginFailed, {
        tenantId: tenant.id,
        actorEmail: canonicalIdentifier,
        reason: 'invalid-password',
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      });
      await this.attempts.evaluateLock(tenant.id, canonicalIdentifier, user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = user.roles.map((r) => r.role.name);
    const hasPrivilegedRole = roles.some((role) => isPrivilegedRole(role));
    if (hasPrivilegedRole && !user.emailVerifiedAt) {
      await this.attempts.record({
        tenantId: tenant.id,
        email: canonicalIdentifier,
        userId: user.id,
        success: false,
        failureReason: 'verification-required',
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      });
      this.emitAuth(AuthEvents.LoginFailed, {
        tenantId: tenant.id,
        actorEmail: canonicalIdentifier,
        reason: 'verification-required',
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const permissions = permissionsFromRoles(user.roles);

    const institutionId = await this.resolveInstitutionId(user);

    // Successful authentication: pending failure window/lock state is cleared
    // but historical login_attempts rows are preserved (D-09).
    await this.attempts.record({
      tenantId: tenant.id,
      email: canonicalIdentifier,
      userId: user.id,
      success: true,
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });
    await this.attempts.clearActiveFailureWindow(user.id);

    const payload: TokenPayload = {
      sub: user.id,
      tenantId: tenant.id,
      institutionId,
      roles,
      jti: uuidv4(),
    };

    const accessToken = await this.jwt.signAsync(payload);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // B4 / P1.4: login always creates an authoritative DB session (D-05). The
    // opaque single-use refresh token lives only in the hashed sessions row;
    // the access token's SHA-256 is indexed for immediate revocation. Tokens
    // are never cached in Redis.
    const created = await this.sessions.create({
      tenantId: tenant.id,
      userId: user.id,
      accessToken,
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    this.emitAuth(AuthEvents.LoginSucceeded, {
      tenantId: tenant.id,
      userId: user.id,
      actorEmail: user.email,
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    return {
      accessToken,
      refreshToken: created.refreshToken,
      expiresIn: this.sessions.accessTtlSeconds(),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
        permissions,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        institutionId,
      },
    };
  }

  /**
   * Resolve a login identifier (external email, institution internal email, or
   * Student/Staff ID) to the tenant-scoped user. Identifier lookup is performed
   * before credential checks so that enumeration behaviour stays opaque (D-03).
   */
  private async resolveIdentity(
    identifier: string,
    tenant: { id: string },
  ) {
    const value = identifier.trim();
    const isEmailLike = value.includes('@');

    if (isEmailLike) {
      const email = normalizeEmail(value);
      return this.prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          deletedAt: null,
          OR: [
            { email: { equals: email, mode: 'insensitive' } },
            { staff: { internalEmail: { equals: email, mode: 'insensitive' } } },
            { student: { internalEmail: { equals: email, mode: 'insensitive' } } },
          ],
        },
        include: {
          roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
          institutionMemberships: { where: { deletedAt: null }, select: { institutionId: true, status: true } },
          staff: true,
          student: true,
        },
      });
    }

    const [students, staff] = await Promise.all([
      this.prisma.student.findMany({
        where: { tenantId: tenant.id, studentNumber: value, deletedAt: null },
        select: { userId: true },
      }),
      this.prisma.staff.findMany({
        where: { tenantId: tenant.id, staffNumber: value, deletedAt: null },
        select: { userId: true },
      }),
    ]);

    const userIds = new Set(
      [...students, ...staff].map((r) => r.userId).filter((id): id is string => !!id),
    );
    // An identifier valid in more than one institution must resolve to a single
    // identity; otherwise the attempt is indistinguishable from a wrong password.
    if (userIds.size !== 1) {
      return null;
    }

    const [userId] = userIds.values();
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
        institutionMemberships: { where: { deletedAt: null }, select: { institutionId: true, status: true } },
        staff: true,
        student: true,
      },
    });
  }

  private async resolveInstitutionId(user: {
    id: string;
    institutionMemberships?: { institutionId: string; status: string }[];
    staff?: { institutionId: string } | null;
    student?: { institutionId: string } | null;
  }): Promise<string | undefined> {
    const membership = (
      user.institutionMemberships?.filter((m) => m.status === 'ACTIVE') ?? []
    )[0];
    if (membership) {
      return membership.institutionId;
    }
    return user.staff?.institutionId ?? user.student?.institutionId ?? undefined;
  }

  /**
   * B4 / P1.4 token rotation (D-05). Delegates to the session service, which
   * runs an atomic DB rotation with single-use semantics; a rotating (new)
   * refresh token is returned, and the access token is re-issued inside the
   * same transaction. Any other system in this file must be introduced as the
   * sessions row dictates; unknown/reused/expired/revoked tokens map to a
   * single opaque 401 (D-03).
   */
  async refresh(refreshToken: string) {
    try {
      const result = await this.sessions.rotate(refreshToken, async (session, user) =>
        this.jwt.signAsync({
          sub: user.id,
          tenantId: session.tenantId,
          institutionId: this.resolveInstitutionId(user),
          roles: user.roles.map((r) => r.role.name),
          jti: uuidv4(),
        }),
      );
      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: this.sessions.accessTtlSeconds(),
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Log out the current session (spec logout semantics). Revoking an already
   * inactive session is idempotent and reports success.
   */
  async logout(tenantId: string, userId: string, sessionId: string) {
    await this.sessions.revokeCurrent(tenantId, userId, sessionId);
    return { loggedOut: true };
  }

  async register(dto: {
    tenantSlug: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    invitationToken?: string;
  }) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.tenantSlug },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const email = normalizeEmail(dto.email);
    const publicRoles = this.config.get<string[]>('auth.publicRegistrationRoles') ?? [];

    let roleId: string | null = null;
    let invitationId: string | null = null;

    if (dto.invitationToken) {
      const invitation = await this.prisma.userInvitation.findFirst({
        where: {
          tenantId: tenant.id,
          token: hashToken(dto.invitationToken),
          deletedAt: null,
        },
      });

      if (
        !invitation ||
        invitation.email !== email ||
        invitation.status !== 'PENDING' ||
        invitation.expiresAt.getTime() <= Date.now()
      ) {
        throw new BadRequestException('Invalid or expired invitation token');
      }

      roleId = invitation.roleId;
      invitationId = invitation.id;
    } else if (publicRoles.length > 0) {
      if (publicRoles.length > 1) {
        throw new BadRequestException(
          'Public registration misconfigured: exactly one role allowed',
        );
      }
      const allowedRole = publicRoles[0];
      if (isPrivilegedRole(allowedRole)) {
        throw new BadRequestException(
          'Self-registration into this role is not permitted',
        );
      }
      const role = await this.prisma.role.findUnique({
        where: { name: allowedRole },
      });
      if (!role) {
        throw new BadRequestException('Public registration role is not available');
      }
      roleId = role.id;
    } else {
      throw new BadRequestException('Registration requires a valid invitation token');
    }

    // Platform Admin is a single-account role that can never be granted through
    // registration (D-G5): it exists only via provisioning handled out-of-band.
    if (roleId) {
      const assignedRole = await this.prisma.role.findUnique({
        where: { id: roleId },
      });
      if (assignedRole?.name === 'PLATFORM_ADMIN') {
        throw new BadRequestException('Platform Admin role cannot be assigned');
      }
    }

    // Password policy is evaluated BEFORE the account-existence branch so that
    // every failing/succeeding outcome is indistinguishable whether or not an
    // account already exists (D-03).
    const policyErrors = await this.policy.validateForTenant(tenant.id, dto.password);
    if (policyErrors.length > 0) {
      throw new BadRequestException({
        message: 'Password does not satisfy the tenant policy',
        errors: policyErrors,
      });
    }

    const now = new Date();
    const verificationToken = generateToken();

    const existing = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email } },
    });

    if (existing) {
      // D-03: never disclose that the account already exists. The invitation is
      // still consumed so it remains single-use, and the success envelope is
      // byte-identical to a fresh registration (no per-tenant email/account
      // existence oracle).
      if (invitationId) {
        await this.prisma.userInvitation.update({
          where: { id: invitationId },
          data: { status: 'ACCEPTED', acceptedAt: now },
        });
      }
      return this.registrationResponse(email, verificationToken);
    }

    const passwordHash = await this.password.hash(dto.password);
    const verificationExpiresAt = new Date(now.getTime() + this.verificationTtlMs());

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          status: 'ACTIVE',
          emailVerifiedAt: null,
          ...(roleId ? { roles: { create: { roleId } } } : {}),
          passwordHistory: { create: { passwordHash } },
          emailVerificationTokens: {
            create: {
              token: hashToken(verificationToken),
              expiresAt: verificationExpiresAt,
            },
          },
        },
      });

      if (invitationId) {
        await tx.userInvitation.update({
          where: { id: invitationId },
          data: { status: 'ACCEPTED', acceptedAt: now },
        });
      }

      return created;
    });

    await this.delivery.sendVerificationEmail({
      email,
      token: verificationToken,
      expiresAt: verificationExpiresAt,
    });

    let registrationRole: string | null = null;
    if (roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });
      registrationRole = role?.name ?? null;
    }

    this.emitAuth(AuthEvents.RegistrationSucceeded, {
      tenantId: tenant.id,
      userId: user.id,
      actorEmail: user.email,
      role: registrationRole,
      ipAddress: null,
      userAgent: null,
    });

    this.logger.log(`Registered user ${user.email} in tenant ${tenant.slug}`);

    return this.registrationResponse(email, verificationToken);
  }

  private registrationResponse(
    email: string,
    verificationToken: string,
  ): { success: boolean; data: Record<string, unknown> } {
    const data: Record<string, unknown> = { email };
    if (!this.isProduction()) {
      data.verificationToken = verificationToken;
    }
    return { success: true, data };
  }

  async requestVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerifiedAt) {
      return { success: true, data: { sent: true, verified: true } };
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + this.verificationTtlMs());

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: hashToken(token),
        expiresAt,
      },
    });

    await this.delivery.sendVerificationEmail({
      email: user.email,
      token,
      expiresAt,
    });

    this.emitAuth(AuthEvents.EmailVerificationRequested, {
      tenantId: user.tenantId,
      userId: user.id,
      actorEmail: user.email,
    });

    const data: Record<string, unknown> = { sent: true };
    if (!this.isProduction()) {
      data.verificationToken = token;
    }
    return { success: true, data };
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.emailVerificationToken.findFirst({
      where: { token: hashToken(token), verifiedAt: null },
      include: { user: true },
    });

    if (!record) {
      throw new BadRequestException('Invalid verification token');
    }
    if (record.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Verification token has expired');
    }

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: now },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { verifiedAt: now },
      }),
    ]);

    this.emitAuth(AuthEvents.EmailVerified, {
      tenantId: record.user.tenantId,
      userId: record.userId,
      actorEmail: record.user.email,
    });

    return { success: true, data: { verified: true } };
  }
}