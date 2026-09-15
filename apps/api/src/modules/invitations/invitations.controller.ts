import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ObjectScope } from '../../common/decorators/object-scope.decorator';
import { ObjectScopeGuard } from '../../common/guards/object-scope.guard';
import { InvitationsService } from './invitations.service';
import {
  AcceptInvitationDto,
  CreateInvitationDto,
  ListInvitationsQueryDto,
} from './dto/invitation.dto';

@ApiTags('invitations')
@Controller('invitations')
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Get()
  @Permissions('identity:invitation:list')
  @ObjectScope({ type: 'tenant', model: 'userInvitation' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List invitations for the current tenant' })
  list(@CurrentUser('tenantId') tenantId: string, @Query() query: ListInvitationsQueryDto) {
    return this.invitations.list(tenantId, query);
  }

  @Get(':id')
  @Permissions('identity:invitation:read')
  @ObjectScope({ type: 'tenant', model: 'userInvitation' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single invitation' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.invitations.findOne(tenantId, id);
  }

  @Post()
  @Permissions('identity:invitation:create')
  @ObjectScope({ type: 'tenant', model: 'userInvitation' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an invitation' })
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateInvitationDto) {
    return this.invitations.create(tenantId, dto);
  }

  @Post(':id/resend')
  @Permissions('identity:invitation:create')
  @ObjectScope({ type: 'tenant', model: 'userInvitation' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend an invitation (regenerates the token)' })
  resend(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.invitations.resend(tenantId, id);
  }

  @Delete(':id')
  @Permissions('identity:invitation:revoke')
  @ObjectScope({ type: 'tenant', model: 'userInvitation' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke an invitation' })
  revoke(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.invitations.revoke(tenantId, id);
  }
}

@ApiTags('invitations')
@Controller('invitations')
export class PublicInvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate an invitation token and return claim details for registration',
  })
  async accept(@Param('id') id: string, @Body() dto: AcceptInvitationDto) {
    const claim = await this.invitations.getClaim(id, dto.token);
    return { success: true, data: claim };
  }
}