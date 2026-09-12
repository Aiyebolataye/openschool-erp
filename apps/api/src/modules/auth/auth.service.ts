import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../cache/cache.service';
import { PasswordService } from './password.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

interface TokenPayload {
  sub: string;
  tenantId: string;
  institutionId?: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private password: PasswordService,
    private cache: CacheService,
  ) {}

  async login(email: string, password: string, tenantSlug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid tenant');
    }

    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email } },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
        staff: true,
        student: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await this.password.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = user.roles.map((r) => r.role.name);
    const permissions = [
      ...new Set(
        user.roles.flatMap((r) =>
          r.role.permissions.map((p) => `${p.permission.resource}:${p.permission.action}`),
        ),
      ),
    ];

    const staff = user.staff;
    const student = user.student;
    const institutionId = staff?.institutionId ?? student?.institutionId;

    const payload: TokenPayload = {
      sub: user.id,
      tenantId: tenant.id,
      institutionId,
      roles,
    };

    const accessToken = await this.jwt.signAsync(payload);
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, type: 'refresh' },
      { expiresIn: this.config.get('jwt.refreshExpiresIn', '7d') },
    );

    const sessionId = uuidv4();
    await this.cache.set(
      `session:${user.id}`,
      { sessionId, refreshToken, roles, permissions },
      { ttl: 604800 },
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: sessionId,
        expiresAt: new Date(Date.now() + 604800000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
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

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const session = await this.cache.get<{ refreshToken: string }>(
        `session:${payload.sub}`,
      );

      if (!session || session.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { roles: { include: { role: true } } },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = await this.jwt.signAsync({
        sub: user.id,
        tenantId: payload.tenantId || user.tenantId,
        roles: user.roles.map((r) => r.role.name),
      });

      return { accessToken, expiresIn: 3600 };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(dto: {
    tenantSlug: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roleName: string;
  }) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.tenantSlug },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid tenant');
    }

    const existing = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: dto.email } },
    });

    if (existing) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await this.password.hash(dto.password);

    const role = await this.prisma.role.findUnique({
      where: { name: dto.roleName },
    });

    if (!role) {
      throw new ConflictException('Role not found');
    }

    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        roles: {
          create: { roleId: role.id },
        },
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}