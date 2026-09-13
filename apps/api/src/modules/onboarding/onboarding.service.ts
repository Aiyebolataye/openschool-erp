import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../auth/password.service';
import { AuthService } from '../auth/auth.service';
import { PasswordPolicyService } from '../identity/password-policy.service';
import { DELIVERY_PROVIDER, DeliveryProvider } from '../delivery/delivery-provider';
import { generateToken, hashToken, normalizeEmail } from '../identity/identity.utils';

function singleEnvelope(data: unknown) {
  return { success: true, data };
}

/**
 * Admin-provisioned account onboarding (spec §20–§24).
 *
 * An onboarding link is a six-month, single-use, hashed credential issued by a
 * school/organization admin for an existing (provisioned) account. Claiming it
 * proves control of the external email AND is the initial email verification
 * (no separate EmailVerificationToken flow at onboarding time), activates the
 * account, establishes the organization/institution memberships and
 * auto-authenticates the user.
 */
@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private policy: PasswordPolicyService,
    private password: PasswordService,
    private auth: AuthService,
    @Inject(DELIVERY_PROVIDER) private delivery: DeliveryProvider,
  ) {}

  private isProduction(): boolean {
    return this.config.get<string>('env', 'development') === 'production';
  }

  private expiryFromNow(): Date {
    const days = this.config.get<number>('onboarding.expiryDays', 182);
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  /**
   * Admin operation: issue an onboarding link for an existing account. Creating
   * a new link immediately invalidates any previous pending links for the same
   * account (replacement semantics). Admin flows are explicit (not subject to
   * the public enumeration rules), so unknown accounts surface as 404.
   */
  async create(tenantId: string, dto: { email: string; institutionId?: string }) {
    const email = normalizeEmail(dto.email);

    const user = await this.prisma.user.findFirst({
      where: { tenantId, email, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerifiedAt && user.status === 'ACTIVE') {
      throw new ConflictException('Account is already active');
    }

    if (dto.institutionId) {
      const institution = await this.prisma.institution.findFirst({
        where: { id: dto.institutionId, tenantId, deletedAt: null },
      });
      if (!institution) {
        throw new BadRequestException('Specified institution does not exist');
      }
    }

    // Replacement semantics: a fresh link invalidates every previous link that
    // has not yet been completed (PENDING or CONFIRMED).
    await this.prisma.onboardingLink.updateMany({
      where: { userId: user.id, status: { in: ['PENDING', 'CONFIRMED'] }, deletedAt: null },
      data: { status: 'REVOKED' },
    });

    const rawToken = generateToken();
    const expiresAt = this.expiryFromNow();

    const link = await this.prisma.onboardingLink.create({
      data: {
        tenantId,
        userId: user.id,
        institutionId: dto.institutionId ?? null,
        email,
        token: hashToken(rawToken),
        status: 'PENDING',
        expiresAt,
      },
    });

    await this.delivery.sendOnboardingEmail({ email, token: rawToken, expiresAt });

    const data: Record<string, unknown> = {
      onboardingLink: {
        id: link.id,
        email: link.email,
        status: link.status,
        expiresAt: link.expiresAt,
        institutionId: link.institutionId,
      },
    };
    if (!this.isProduction()) {
      data.onboardingToken = rawToken;
    }

    this.logger.log(`Onboarding link issued for ${email} (tenant ${tenantId})`);
    return singleEnvelope(data);
  }

  /**
   * Normalize a human-provided name for echo-matching during confirmation.
   * Only whitespace/case/canonical form differences are tolerated; the value
   * must otherwise equal the administrator-provisioned name (spec §20.5).
   */
  private normalizeName(value: string): string {
    return value.trim().normalize('NFKC').toLowerCase();
  }

  /**
   * Validate that a link exists, the token matches, it is still usable and has
   * not expired. Returns the link (with its user) or throws `Invalid onboarding
   * link` — identical for bad token, consumed, revoked and expired-so-marked.
   */
  private async loadUsableLink(
    id: string,
    token: string,
    requiredStatus: 'PENDING' | 'CONFIRMED',
  ) {
    const link = await this.prisma.onboardingLink.findUnique({
      where: { id },
      include: { user: true, institution: { select: { name: true } } },
    });

    if (!link || link.token !== hashToken(token)) {
      throw new BadRequestException('Invalid onboarding link');
    }
    if (link.status !== requiredStatus) {
      throw new BadRequestException('Invalid onboarding link');
    }
    if (link.expiresAt.getTime() <= Date.now()) {
      await this.prisma.onboardingLink.update({
        where: { id: link.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Invalid onboarding link');
    }
    return link;
  }

  /**
   * Public review (spec §20.4 B): opens the welcome/link screen. Reveals only
   * the provisioned identity data bound to this token — no password, token or
   * provisioning details. Does not consume the link.
   */
  async review(id: string, dto: { token: string }) {
    const link = await this.loadUsableLink(id, dto.token, 'PENDING');
    const user = link.user;

    if (!user || user.deletedAt || user.email !== link.email) {
      throw new BadRequestException('Invalid onboarding link');
    }

    const roleNames = await this.prisma.userRoleAssignment.findMany({
      where: { userId: user.id },
      select: { role: { select: { name: true } } },
    });

    return singleEnvelope({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      institutionId: link.institutionId,
      institutionName: link.institution?.name ?? null,
      roleNames: roleNames.map((r) => r.role.name),
    });
  }

  /**
   * Public confirmation (spec §20.4 C): the user confirms the provisioned
   * personal information before setting a password. The confirmation echoes the
   * provisioned values and must match exactly; it never silently replaces
   * administrator-provisioned identity data. Also proves non-transferability:
   * a different identity cannot confirm someone else's link.
   */
  async confirm(id: string, dto: { token: string; firstName: string; lastName: string }) {
    const link = await this.loadUsableLink(id, dto.token, 'PENDING');
    const user = link.user;

    if (!user || user.deletedAt || user.email !== link.email) {
      throw new BadRequestException('Invalid onboarding link');
    }

    const firstNameMatches =
      this.normalizeName(dto.firstName) === this.normalizeName(user.firstName);
    const lastNameMatches =
      this.normalizeName(dto.lastName) === this.normalizeName(user.lastName);

    if (!firstNameMatches || !lastNameMatches) {
      throw new BadRequestException(
        'Name confirmation does not match the provisioned account',
      );
    }

    const now = new Date();
    await this.prisma.onboardingLink.update({
      where: { id: link.id },
      data: { status: 'CONFIRMED', confirmedAt: now },
    });

    return singleEnvelope({ confirmed: true, email: user.email });
  }

  /**
   * Public claim: only after the information is confirmed. Sets the password,
   * performs the initial email verification, activates the account,
   * establishes the memberships and auto-authenticates (spec §21–§22).
   */
  async claim(id: string, dto: { token: string; password: string }) {
    const link = await this.loadUsableLink(id, dto.token, 'CONFIRMED');
    const user = link.user;

    if (!user || user.deletedAt || user.email !== link.email) {
      throw new BadRequestException('Invalid onboarding link');
    }

    const policyErrors = await this.policy.validateForTenant(link.tenantId, dto.password);
    if (policyErrors.length > 0) {
      throw new BadRequestException({
        message: 'Password does not satisfy the tenant policy',
        errors: policyErrors,
      });
    }

    const passwordHash = await this.password.hash(dto.password);
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.onboardingLink.updateMany({
        where: { userId: user.id, status: 'PENDING' },
        data: { status: 'REVOKED' },
      }),
      this.prisma.onboardingLink.updateMany({
        where: { userId: user.id, status: 'CONFIRMED' },
        data: { status: 'REVOKED' },
      }),
      this.prisma.onboardingLink.update({
        where: { id: link.id },
        data: { status: 'COMPLETED', acceptedAt: now },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          status: 'ACTIVE',
          emailVerifiedAt: now,
          passwordHash,
        },
      }),
      this.prisma.passwordHistory.create({
        data: { userId: user.id, passwordHash },
      }),
      this.prisma.organizationMembership.upsert({
        where: { tenantId_userId: { tenantId: link.tenantId, userId: user.id } },
        update: { status: 'ACTIVE', deletedAt: null },
        create: { tenantId: link.tenantId, userId: user.id, status: 'ACTIVE' },
      }),
      ...(link.institutionId
        ? [
            this.prisma.institutionMembership.upsert({
              where: {
                tenantId_institutionId_userId: {
                  tenantId: link.tenantId,
                  institutionId: link.institutionId,
                  userId: user.id,
                },
              },
              update: { status: 'ACTIVE', deletedAt: null },
              create: {
                tenantId: link.tenantId,
                institutionId: link.institutionId,
                userId: user.id,
                status: 'ACTIVE',
              },
            }),
          ]
        : []),
    ]);

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: link.tenantId },
    });

    // Automatic authentication (spec §22). The account is now verified + active,
    // so the privileged-role login gate passes for admin accounts.
    const login = await this.auth.login(user.email, dto.password, tenant?.slug ?? '');

    return singleEnvelope({
      onboarded: true,
      accessToken: login.accessToken,
      refreshToken: login.refreshToken,
      expiresIn: login.expiresIn,
      user: login.user,
    });
  }
}