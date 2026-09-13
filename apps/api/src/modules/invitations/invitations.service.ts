import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DELIVERY_PROVIDER, DeliveryProvider } from '../delivery/delivery-provider';
import { generateToken, hashToken, normalizeEmail } from '../identity/identity.utils';
import { CreateInvitationDto, ListInvitationsQueryDto } from './dto/invitation.dto';

export type InvitationStatusValue = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface InvitationClaim {
  email: string;
  roleName?: string;
  roleId?: string;
  expiresAt: Date;
}

function listEnvelope(items: unknown[], total: number, page: number, limit: number) {
  return { success: true, data: { items, total, page, limit } };
}

function singleEnvelope(data: unknown) {
  return { success: true, data };
}

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    @Inject(DELIVERY_PROVIDER) private delivery: DeliveryProvider,
  ) {}

  private isProduction(): boolean {
    return this.config.get<string>('env', 'development') === 'production';
  }

  private inviteScope(invitation: {
    roleId: string | null;
    role: { name: string } | null;
    id: string;
    tenantId: string;
    email: string;
    status: InvitationStatusValue;
    expiresAt: Date;
    acceptedAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: invitation.id,
      email: invitation.email,
      roleId: invitation.roleId,
      roleName: invitation.role?.name ?? null,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
      createdAt: invitation.createdAt,
    };
  }

  async create(
    tenantId: string,
    dto: CreateInvitationDto,
  ): Promise<{ success: boolean; data: Record<string, unknown> }> {
    const email = normalizeEmail(dto.email);

    const existingUser = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
      select: { id: true, deletedAt: true },
    });
    if (existingUser && !existingUser.deletedAt) {
      throw new ConflictException('An account with this email already exists');
    }

    const existingInvitation = await this.prisma.userInvitation.findFirst({
      where: {
        tenantId,
        email,
        status: { in: ['PENDING', 'ACCEPTED'] },
        deletedAt: null,
      },
      select: { id: true },
    });
    if (existingInvitation) {
      throw new ConflictException('An invitation already exists for this email');
    }

    const pendingCount = await this.prisma.userInvitation.count({
      where: { tenantId, status: 'PENDING', deletedAt: null },
    });
    const maxPending = this.config.get<number>('invitation.maxPending', 50);
    if (pendingCount >= maxPending) {
      throw new ConflictException('Maximum pending invitations reached');
    }

    let roleId: string | undefined;
    if (dto.roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
      if (!role) {
        throw new BadRequestException('Specified role does not exist');
      }
      if (role.name === 'PLATFORM_ADMIN') {
        throw new ConflictException('Platform Admin role cannot be assigned');
      }
      roleId = role.id;
    }

    const now = new Date();
    const expiryDays = dto.expiresInDays ?? this.config.get<number>('invitation.expiryDays', 7);
    const rawToken = generateToken();
    const expiresAt = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);

    const invitation = await this.prisma.userInvitation.create({
      data: {
        tenantId,
        email,
        token: hashToken(rawToken),
        roleId,
        status: 'PENDING',
        expiresAt,
      },
      include: { role: { select: { name: true } } },
    });

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });

    await this.delivery.sendInvitationEmail({
      tenantName: tenant?.name ?? '',
      email,
      roleName: invitation.role?.name,
      token: rawToken,
      expiresAt,
    });

    const result: Record<string, unknown> = {
      invitation: this.inviteScope({
        ...invitation,
        role: invitation.role,
      }),
    };
    if (!this.isProduction()) {
      result.invitationToken = rawToken;
    }

    this.logger.log(`Invitation created for ${email} (tenant ${tenantId})`);
    return singleEnvelope(result) as { success: boolean; data: Record<string, unknown> };
  }

  async list(tenantId: string, query: ListInvitationsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.UserInvitationWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, invitations] = await Promise.all([
      this.prisma.userInvitation.count({ where }),
      this.prisma.userInvitation.findMany({
        where,
        include: { role: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return listEnvelope(
      invitations.map((i) =>
        this.inviteScope({
          ...i,
          role: i.role as { name: string } | null,
        }),
      ),
      total,
      page,
      limit,
    );
  }

  async findOne(tenantId: string, id: string) {
    const invitation = await this.prisma.userInvitation.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { role: { select: { name: true } } },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return singleEnvelope(
      this.inviteScope({
        ...invitation,
        role: invitation.role as { name: string } | null,
      }),
    );
  }

  async resend(tenantId: string, id: string) {
    const existing = await this.prisma.userInvitation.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Invitation not found');
    }
    if (existing.status === 'ACCEPTED') {
      throw new ConflictException('Invitation has already been accepted');
    }
    if (existing.status === 'REVOKED') {
      throw new ConflictException('Invitation has been revoked');
    }

    const rawToken = generateToken();
    const expiryDays = this.config.get<number>('invitation.expiryDays', 7);
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    const invitation = await this.prisma.userInvitation.update({
      where: { id },
      data: {
        token: hashToken(rawToken),
        expiresAt,
        status: 'PENDING',
        acceptedAt: null,
      },
      include: { role: { select: { name: true } } },
    });

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });

    await this.delivery.sendInvitationEmail({
      tenantName: tenant?.name ?? '',
      email: invitation.email,
      roleName: invitation.role?.name,
      token: rawToken,
      expiresAt,
    });

    const result: Record<string, unknown> = {
      invitation: this.inviteScope({
        ...invitation,
        role: invitation.role as { name: string } | null,
      }),
    };
    if (!this.isProduction()) {
      result.invitationToken = rawToken;
    }
    return singleEnvelope(result) as { success: boolean; data: Record<string, unknown> };
  }

  async revoke(tenantId: string, id: string) {
    const existing = await this.prisma.userInvitation.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Invitation not found');
    }
    if (existing.status === 'ACCEPTED') {
      throw new ConflictException('Cannot revoke an accepted invitation');
    }

    const invitation = await this.prisma.userInvitation.update({
      where: { id },
      data: { status: 'REVOKED' },
    });

    return singleEnvelope({
      id: invitation.id,
      status: invitation.status,
    });
  }

  async getClaim(id: string, token: string): Promise<InvitationClaim> {
    const invitation = await this.prisma.userInvitation.findFirst({
      where: { id, deletedAt: null },
      include: { role: { select: { name: true } } },
    });

    if (!invitation || invitation.token !== hashToken(token)) {
      throw new BadRequestException('Invalid invitation token');
    }
    if (invitation.status === 'ACCEPTED' || invitation.status === 'REVOKED') {
      throw new BadRequestException('Invalid invitation token');
    }
    if (invitation.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Invalid invitation token');
    }

    return {
      email: invitation.email,
      roleId: invitation.roleId ?? undefined,
      roleName: invitation.role?.name,
      expiresAt: invitation.expiresAt,
    };
  }
}