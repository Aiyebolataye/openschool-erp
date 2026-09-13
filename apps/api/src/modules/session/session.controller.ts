import {
  Controller,
  Get,
  Delete,
  UseGuards,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { SessionService } from './session.service';

/**
 * B4 / P1.4 session management endpoints (D-05, spec §9.8). Every operation is
 * scoped to the authenticated caller's own sessions within their tenant: a
 * caller can never list or revoke another user's (or another tenant's)
 * sessions. No token hashes or refresh/access tokens are ever returned.
 */
@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessions: SessionService) {}

  @Get()
  @ApiOperation({ summary: 'List the caller\'s sessions across devices' })
  @ApiResponse({ status: 200, description: 'List of the caller\'s own sessions' })
  async list(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const list = await this.sessions.list(tenantId, userId);
    return { success: true, data: { sessions: list } };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke one of the caller\'s own sessions' })
  @ApiResponse({ status: 200, description: 'Session revoked' })
  @ApiResponse({ status: 404, description: 'Session not found or not owned by caller' })
  async revokeOne(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const revoked = await this.sessions.revokeOne(tenantId, userId, id);
    if (!revoked) {
      throw new NotFoundException('Session not found');
    }
    return { success: true, data: { revoked: true } };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out the caller from every device (this tenant)' })
  @ApiResponse({ status: 200, description: 'All of the caller\'s sessions revoked' })
  async revokeAll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const count = await this.sessions.revokeAll(tenantId, userId);
    return { success: true, data: { revoked: count } };
  }
}