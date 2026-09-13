import { Injectable, Inject, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../cache/cache.service';
import { parseDurationToMs } from '../../config/configuration';
import { hashToken, generateToken } from '../identity/identity.utils';
import { currentCorrelationId } from '../../common/interceptors/correlation-id.interceptor';
import { SessionEvents } from './session.events';

export interface CreateSessionInput {
  tenantId: string;
  userId: string;
  accessToken: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface SessionListEntry {
  id: string;
  isActive: boolean;
  deviceInfo: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  lastActivityAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface RotateSession {
  id: string;
  tenantId: string;
  userId: string;
}

interface RotateUser {
  id: string;
  status: string;
  roles: { role: { name: string } }[];
  institutionMemberships?: { institutionId: string; status: string }[];
  staff?: { institutionId: string } | null;
  student?: { institutionId: string } | null;
}

/**
 * B4 / P1.4 session service (D-05).
 *
 * The database `sessions` table is the single source of truth for session
 * validity. Redis holds only a cache/index (access-token hash → session id) and
 * is never consulted to decide whether a session is valid. Every validation
 * path reads the authoritative DB row, so missing, stale, or evicted Redis
 * state can never make an invalid DB session valid.
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly config: ConfigService,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
  ) {}

  /** Access-token TTL in seconds (config-driven, D-04). */
  accessTtlSeconds(): number {
    return Math.round(parseDurationToMs(this.config.get('jwt.expiresIn', '15m')) / 1000);
  }

  /** Refresh-token / session lifetime in milliseconds (config-driven, D-04). */
  refreshTtlMs(): number {
    return parseDurationToMs(this.config.get('jwt.refreshExpiresIn', '7d'));
  }

  private maxSessions(): number {
    return this.config.get<number>('session.maxSessions', 5);
  }

  private accessKey(accessTokenHash: string): string {
    return `session:access:${accessTokenHash}`;
  }

  private userSetKey(userId: string): string {
    return `session:user:${userId}`;
  }

  private emit(event: string, payload: Record<string, unknown>): void {
    this.eventEmitter.emit(event, {
      emittedAt: new Date().toISOString(),
      ...(currentCorrelationId()
        ? { correlationId: currentCorrelationId() }
        : {}),
      ...payload,
    });
  }

  private async invalidateAccessIndex(accessTokenHash: string): Promise<void> {
    await this.cache.del(this.accessKey(accessTokenHash));
  }

  /**
   * Enforce the per-user concurrent-session limit (ADR-013, default 5): when a
   * new session would exceed the limit, the oldest/inactive sessions are
   * revoked first (never deleted). Returns the revoked sessions so the caller
   * can invalidate their Redis index and emit revocation events.
   */
  private async enforceLimit(
    tenantId: string,
    userId: string,
    excludingSessionIds: string[],
    now: Date,
  ): Promise<{ id: string; accessTokenHash: string }[]> {
    const limit = this.maxSessions();
    const active = await this.prisma.session.findMany({
      where: {
        tenantId,
        userId,
        isActive: true,
        id: { notIn: excludingSessionIds },
      },
      orderBy: { lastActivityAt: 'asc' },
      select: { id: true, accessTokenHash: true },
    });

    const excess = active.length - (limit - 1);
    if (excess <= 0) {
      return [];
    }

    const oldest = active.slice(0, excess).map((s) => s.id);
    await this.prisma.session.updateMany({
      where: { id: { in: oldest } },
      data: { isActive: false, updatedAt: now },
    });
    return active.slice(0, excess);
  }

  async create(input: CreateSessionInput): Promise<{
    refreshToken: string;
    sessionId: string;
    expiresAt: Date;
  }> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.refreshTtlMs());
    const accessTokenHash = hashToken(input.accessToken);
    const refreshToken = generateToken();
    const refreshTokenHash = hashToken(refreshToken);

    const session = await this.prisma.$transaction(async (tx) => {
      const limit = this.maxSessions();
      const active = await tx.session.findMany({
        where: { tenantId: input.tenantId, userId: input.userId, isActive: true },
        orderBy: { lastActivityAt: 'asc' },
        select: { id: true, accessTokenHash: true },
      });
      const excess = active.length - (limit - 1);
      const toRevoke = excess > 0 ? active.slice(0, excess) : [];

      if (toRevoke.length > 0) {
        await tx.session.updateMany({
          where: { id: { in: toRevoke.map((s) => s.id) } },
          data: { isActive: false, updatedAt: now },
        });
      }

      const created = await tx.session.create({
        data: {
          tenantId: input.tenantId,
          userId: input.userId,
          accessTokenHash,
          refreshTokenHash,
          isActive: true,
          lastActivityAt: now,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
          expiresAt,
        },
        select: { id: true },
      });

      return { created, toRevoke };
    });

    const ttl = Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000));
    await this.cache.set(this.accessKey(accessTokenHash), {
      sessionId: session.created.id,
      tenantId: input.tenantId,
      userId: input.userId,
    }, { ttl });
    await this.cache.sadd(this.userSetKey(input.userId), session.created.id, ttl);

    this.emit(SessionEvents.Created, {
      sessionId: session.created.id,
      tenantId: input.tenantId,
      userId: input.userId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      reason: 'created',
    });

    for (const revoked of session.toRevoke) {
      await this.invalidateAccessIndex(revoked.accessTokenHash);
      this.emit(SessionEvents.Revoked, {
        sessionId: revoked.id,
        tenantId: input.tenantId,
        userId: input.userId,
        reason: 'limit-exceeded',
      });
    }

    return { refreshToken, sessionId: session.created.id, expiresAt };
  }

  /**
   * Atomically rotate a refresh token (D-05).
   *
   * The presented opaque refresh token is matched by its SHA-256 hash against
   * the authoritative `sessions` row. Rotation swaps both token hashes in a
   * single conditional `UPDATE ... WHERE refreshTokenHash = <old>` so two
   * concurrent requests using the same token cannot both succeed: the loser
   * matches zero rows and is treated as token reuse, which revokes the entire
   * session (D-05 "reuse detection revokes the whole session").
   *
   * A presented hash that is not the *current* token of any active session but
   * exists in the append-only `refresh_token_history` ledger was already
   * consumed → reuse → revoke. A hash in neither place was never issued and is
   * rejected without side effects.
   */
  async rotate(
    refreshToken: string,
    issueAccess: (session: RotateSession, user: RotateUser) => Promise<string>,
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const presentedHash = hashToken(refreshToken);

    type Outcome =
      | { kind: 'rotated'; sessionId: string; accessToken: string; newRefreshToken: string; newAccessHash: string; oldAccessHash: string; tenantId: string; userId: string; expiresAt: Date }
      | { kind: 'reuse'; sessionId: string; tenantId: string; userId: string; revokedAccessHash?: string }
      | { kind: 'expired'; sessionId: string; tenantId: string; userId: string; expiredAccessHash: string }
      | { kind: 'invalid' | 'revoked' | 'inactive-user' };

    const outcome = await this.prisma.$transaction(async (tx): Promise<Outcome> => {
      const session = await tx.session.findUnique({
        where: { refreshTokenHash: presentedHash },
      });

      if (!session) {
        const history = await tx.refreshTokenHistory.findUnique({
          where: { refreshTokenHash: presentedHash },
        });
        if (history) {
          const target = await tx.session.findUnique({
            where: { id: history.sessionId },
            select: { id: true, isActive: true, accessTokenHash: true, tenantId: true, userId: true },
          });
          if (target?.isActive) {
            await tx.session.updateMany({
              where: { id: target.id },
              data: { isActive: false, updatedAt: new Date() },
            });
            return {
              kind: 'reuse',
              sessionId: target.id,
              tenantId: target.tenantId,
              userId: target.userId,
              revokedAccessHash: target.accessTokenHash,
            };
          }
          return {
            kind: 'reuse',
            sessionId: target?.id ?? history.sessionId,
            tenantId: target?.tenantId ?? '',
            userId: target?.userId ?? '',
          };
        }
        return { kind: 'invalid' };
      }

      if (!session.isActive) {
        return { kind: 'revoked' };
      }

      if (session.expiresAt.getTime() <= Date.now()) {
        await tx.session.updateMany({
          where: { id: session.id, isActive: true },
          data: { isActive: false, updatedAt: new Date() },
        });
        return {
          kind: 'expired',
          sessionId: session.id,
          tenantId: session.tenantId,
          userId: session.userId,
          expiredAccessHash: session.accessTokenHash,
        };
      }

      const user = await tx.user.findUnique({
        where: { id: session.userId },
        include: {
          roles: { select: { role: { select: { name: true } } } },
          institutionMemberships: {
            where: { deletedAt: null },
            select: { institutionId: true, status: true },
          },
          staff: { select: { institutionId: true } },
          student: { select: { institutionId: true } },
        },
      });

      if (!user || user.status !== 'ACTIVE') {
        return { kind: 'inactive-user' };
      }

      const accessToken = await issueAccess(session, user);
      const newRefreshToken = generateToken();
      const newAccessHash = hashToken(accessToken);
      const now = new Date();

      const updated = await tx.session.updateMany({
        where: {
          id: session.id,
          refreshTokenHash: presentedHash,
          isActive: true,
          expiresAt: { gt: now },
        },
        data: {
          refreshTokenHash: hashToken(newRefreshToken),
          accessTokenHash: newAccessHash,
          lastActivityAt: now,
          updatedAt: now,
        },
      });

      if (updated.count === 0) {
        // A concurrent rotation already consumed this token → reuse/race.
        await tx.session.updateMany({
          where: { id: session.id, isActive: true },
          data: { isActive: false, updatedAt: new Date() },
        });
        return {
          kind: 'reuse',
          sessionId: session.id,
          tenantId: session.tenantId,
          userId: session.userId,
          revokedAccessHash: session.accessTokenHash,
        };
      }

      await tx.refreshTokenHistory
        .create({ data: { sessionId: session.id, refreshTokenHash: presentedHash } })
        .catch(() => {
          // Already recorded by the winning concurrent rotation.
        });

      return {
        kind: 'rotated',
        sessionId: session.id,
        accessToken,
        newRefreshToken,
        newAccessHash,
        oldAccessHash: session.accessTokenHash,
        tenantId: session.tenantId,
        userId: session.userId,
        expiresAt: session.expiresAt,
      };
    });

    if (outcome.kind === 'rotated') {
      await this.invalidateAccessIndex(outcome.oldAccessHash);
      const ttl = Math.max(1, Math.ceil((outcome.expiresAt.getTime() - Date.now()) / 1000));
      await this.cache.set(this.accessKey(outcome.newAccessHash), {
        sessionId: outcome.sessionId,
        tenantId: outcome.tenantId,
        userId: outcome.userId,
      }, { ttl });
      this.emit(SessionEvents.RefreshRotated, {
        sessionId: outcome.sessionId,
        tenantId: outcome.tenantId,
        userId: outcome.userId,
        reason: 'rotated',
      });
      return {
        accessToken: outcome.accessToken,
        refreshToken: outcome.newRefreshToken,
        sessionId: outcome.sessionId,
      };
    }

    if (outcome.kind === 'reuse') {
      if (outcome.revokedAccessHash) {
        await this.invalidateAccessIndex(outcome.revokedAccessHash);
      }
      this.emit(SessionEvents.RefreshReuseDetected, {
        sessionId: outcome.sessionId,
        tenantId: outcome.tenantId,
        userId: outcome.userId,
        reason: 'reuse',
      });
      this.emit(SessionEvents.Revoked, {
        sessionId: outcome.sessionId,
        tenantId: outcome.tenantId,
        userId: outcome.userId,
        reason: 'reuse',
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (outcome.kind === 'expired') {
      await this.invalidateAccessIndex(outcome.expiredAccessHash);
      this.emit(SessionEvents.Expired, {
        sessionId: outcome.sessionId,
        tenantId: outcome.tenantId,
        userId: outcome.userId,
        reason: 'expired-on-refresh',
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    // invalid / revoked / inactive-user: opaque rejection, no side effects,
    // no token-validity oracle (D-03).
    throw new UnauthorizedException('Invalid refresh token');
  }

  /**
   * Authoritative DB lookup for access-token validation (D-05 §6, V-S-03/04).
   * The access token maps to its session via tenant + user + SHA-256(token);
   * the DB row must be present, active and unexpired.
   */
  async lookupForAccess(
    tenantId: string,
    userId: string,
    accessTokenHash: string,
  ): Promise<{ id: string } | null> {
    const session = await this.prisma.session.findUnique({
      where: {
        tenantId_userId_accessTokenHash: { tenantId, userId, accessTokenHash },
      },
      select: { id: true, isActive: true, expiresAt: true },
    });

    if (!session || !session.isActive || session.expiresAt.getTime() <= Date.now()) {
      return null;
    }
    return { id: session.id };
  }

  /** Logout the current session (D-05, spec §9.8 step 5). */
  async revokeCurrent(
    tenantId: string,
    userId: string,
    sessionId: string,
  ): Promise<boolean> {
    const session = await this.revokeScoped(tenantId, userId, sessionId);
    if (!session) {
      return false;
    }
    await this.invalidateAccessIndex(session.accessTokenHash);
    this.emit(SessionEvents.Logout, {
      sessionId: session.id,
      tenantId,
      userId,
      reason: 'logout',
    });
    this.emit(SessionEvents.Revoked, {
      sessionId: session.id,
      tenantId,
      userId,
      reason: 'logout',
    });
    return true;
  }

  /** Revoke one of the caller's own sessions (tenant + user boundary). */
  async revokeOne(tenantId: string, userId: string, sessionId: string): Promise<boolean> {
    const session = await this.revokeScoped(tenantId, userId, sessionId);
    if (!session) {
      return false;
    }
    await this.invalidateAccessIndex(session.accessTokenHash);
    this.emit(SessionEvents.Revoked, {
      sessionId: session.id,
      tenantId,
      userId,
      reason: 'revoked',
    });
    return true;
  }

  /** Logout-all within the current tenant context (spec logout-all contract). */
  async revokeAll(tenantId: string, userId: string): Promise<number> {
    const active = await this.prisma.session.findMany({
      where: { tenantId, userId, isActive: true },
      select: { id: true, accessTokenHash: true },
    });

    if (active.length === 0) {
      this.emit(SessionEvents.LogoutAll, {
        tenantId,
        userId,
        reason: 'logout_all',
        count: 0,
      });
      return 0;
    }

    const now = new Date();
    await this.prisma.session.updateMany({
      where: { id: { in: active.map((s) => s.id) } },
      data: { isActive: false, updatedAt: now },
    });
    await Promise.all(active.map((s) => this.invalidateAccessIndex(s.accessTokenHash)));
    this.emit(SessionEvents.LogoutAll, {
      tenantId,
      userId,
      reason: 'logout_all',
      count: active.length,
    });
    return active.length;
  }

  /**
   * Deactivation integration primitive. A user is a single global identity, so
   * deactivating a user revokes sessions across every tenant. The admin
   * lifecycle pathway that calls this is post-Phase-1; access and refresh paths
   * already hard-block non-ACTIVE users regardless.
   */
  async revokeAllSessionsForUser(userId: string): Promise<number> {
    const active = await this.prisma.session.findMany({
      where: { userId, isActive: true },
      select: { id: true, accessTokenHash: true, tenantId: true },
    });
    if (active.length === 0) {
      return 0;
    }
    const now = new Date();
    await this.prisma.session.updateMany({
      where: { id: { in: active.map((s) => s.id) } },
      data: { isActive: false, updatedAt: now },
    });
    await Promise.all(active.map((s) => this.invalidateAccessIndex(s.accessTokenHash)));
    for (const s of active) {
      this.emit(SessionEvents.Revoked, {
        sessionId: s.id,
        tenantId: s.tenantId,
        userId,
        reason: 'deactivation',
      });
    }
    return active.length;
  }

  /** Authenticated session listing — caller's own sessions only, no secrets. */
  async list(tenantId: string, userId: string): Promise<SessionListEntry[]> {
    const sessions = await this.prisma.session.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        isActive: true,
        deviceInfo: true,
        ipAddress: true,
        userAgent: true,
        lastActivityAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return sessions;
  }

  /**
   * Idempotent, retry-safe, tenant-aware sweep of expired sessions for the
   * cleanup worker (spec I-22). Only `isActive = true` rows are touched; reruns
   * are no-ops. Rows are transitioned to inactive — never deleted.
   */
  async sweepExpired(tenantId?: string): Promise<{ revoked: number; sessionIds: string[] }> {
    const now = new Date();
    const expired = await this.prisma.session.findMany({
      where: {
        isActive: true,
        expiresAt: { lte: now },
        ...(tenantId ? { tenantId } : {}),
      },
      select: { id: true, tenantId: true, userId: true, accessTokenHash: true },
    });

    if (expired.length === 0) {
      return { revoked: 0, sessionIds: [] };
    }

    await this.prisma.session.updateMany({
      where: { id: { in: expired.map((s) => s.id) } },
      data: { isActive: false, updatedAt: now },
    });
    await Promise.all(expired.map((s) => this.invalidateAccessIndex(s.accessTokenHash)));

    for (const s of expired) {
      this.emit(SessionEvents.Expired, {
        sessionId: s.id,
        tenantId: s.tenantId,
        userId: s.userId,
        reason: 'expired-cleanup',
      });
      await this.cache.srem(this.userSetKey(s.userId), s.id);
    }

    return { revoked: expired.length, sessionIds: expired.map((s) => s.id) };
  }

  private async revokeScoped(tenantId: string, userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, tenantId, userId },
      select: { id: true, isActive: true, accessTokenHash: true },
    });
    if (!session || !session.isActive) {
      return null;
    }
    await this.prisma.session.updateMany({
      where: { id: session.id },
      data: { isActive: false, updatedAt: new Date() },
    });
    return session;
  }
}