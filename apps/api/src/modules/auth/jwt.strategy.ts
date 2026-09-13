import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { SessionService } from '../session/session.service';
import { hashToken, permissionsFromRoles } from '../identity/identity.utils';

interface JwtPayload {
  sub: string;
  tenantId: string;
  institutionId?: string;
  roles: string[];
}

/**
 * Session-aware access-token validation (D-05, V-S-03/04).
 *
 * The JWT's signature/expiry is verified by passport-jwt; then the access token
 * itself is hashed and must resolve to an active, unexpired `sessions` row for
 * the SAME tenant + user. Without that authoritative DB match the request is
 * rejected, so revocation, logout and session expiry take effect immediately —
 * Redis misses/evictions can never resurrect a revoked session.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
    private sessions: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: config.get('jwt.secret'),
    });
  }

  async validate(req: { headers: Record<string, string | string[] | undefined> }, payload: JwtPayload) {
    const rawToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req as never);
    if (!rawToken) {
      throw new UnauthorizedException();
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: {
          include: {
            role: { include: { permissions: { include: { permission: true } } } },
          },
        },
      },
    });

    if (!user || user.deletedAt || user.status !== 'ACTIVE') {
      throw new UnauthorizedException();
    }

    const session = await this.sessions.lookupForAccess(
      payload.tenantId,
      user.id,
      hashToken(rawToken),
    );

    if (!session) {
      throw new UnauthorizedException();
    }

    const permissions = permissionsFromRoles(user.roles);

    return {
      sub: payload.sub,
      tenantId: user.tenantId,
      institutionId: payload.institutionId,
      roles: user.roles.map((r) => r.role.name),
      permissions,
      sessionId: session.id,
    };
  }
}