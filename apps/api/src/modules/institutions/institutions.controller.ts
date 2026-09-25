import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ObjectScopeGuard } from '../../common/guards/object-scope.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ObjectScope } from '../../common/decorators/object-scope.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto, UpdateInstitutionDto } from './dto/institution.dto';
import { InstitutionIdParamDto } from './dto/institution-id-param.dto';
import { ListInstitutionsQueryDto } from './dto/list-institutions-query.dto';

type AuthUser = { sub: string; tenantId: string };

/**
 * P4.1 — institutions admin API.
 *
 * Authorization stack (frozen Phase 2): AuthGuard('jwt') resolves the trusted
 * identity from the session-aware JWT strategy; PermissionGuard enforces the
 * admin-only `institution:institution:*` catalogue; ObjectScopeGuard resolves
 * the target institution server-side and fails closed on cross-tenant access.
 * Nested configuration/settings routes live in their own controllers with the
 * additional InstitutionScopeGuard membership requirement.
 */
@ApiTags('institutions')
@ApiBearerAuth()
@Controller('institutions')
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
export class InstitutionsController {
  private readonly logger = new Logger(InstitutionsController.name);

  constructor(private readonly institutions: InstitutionsService) {}

  @Post()
  @Permissions('institution:institution:create')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateInstitutionDto) {
    return this.institutions.create(dto, user.tenantId, user.sub);
  }

  @Get()
  @Permissions('institution:institution:list')
  findAll(@CurrentUser() user: AuthUser, @Query() query: ListInstitutionsQueryDto) {
    return this.institutions.findAll(user.tenantId, query);
  }

  @Get(':id')
  @Permissions('institution:institution:read')
  @ObjectScope({ type: 'tenant', model: 'institution' })
  findOne(@CurrentUser() user: AuthUser, @Param() params: InstitutionIdParamDto) {
    return this.institutions.findOne(params.id, user.tenantId);
  }

  @Patch(':id')
  @Permissions('institution:institution:update')
  @ObjectScope({ type: 'tenant', model: 'institution' })
  update(
    @CurrentUser() user: AuthUser,
    @Param() params: InstitutionIdParamDto,
    @Body() dto: UpdateInstitutionDto,
  ) {
    return this.institutions.update(params.id, dto, user.tenantId, user.sub);
  }

  @Delete(':id')
  @Permissions('institution:institution:delete')
  @ObjectScope({ type: 'tenant', model: 'institution' })
  remove(@CurrentUser() user: AuthUser, @Param() params: InstitutionIdParamDto) {
    return this.institutions.remove(params.id, user.tenantId, user.sub);
  }

  @Post(':id/provision')
  @HttpCode(HttpStatus.OK)
  @Permissions('institution:institution:activate')
  @ObjectScope({ type: 'tenant', model: 'institution' })
  provision(@CurrentUser() user: AuthUser, @Param() params: InstitutionIdParamDto) {
    return this.institutions.activate(params.id, user.tenantId, user.sub);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @Permissions('institution:institution:suspend')
  @ObjectScope({ type: 'tenant', model: 'institution' })
  suspend(@CurrentUser() user: AuthUser, @Param() params: InstitutionIdParamDto) {
    return this.institutions.suspend(params.id, user.tenantId, user.sub);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @Permissions('institution:institution:restore')
  @ObjectScope({ type: 'tenant', model: 'institution' })
  restore(@CurrentUser() user: AuthUser, @Param() params: InstitutionIdParamDto) {
    return this.institutions.restore(params.id, user.tenantId, user.sub);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @Permissions('institution:institution:archive')
  @ObjectScope({ type: 'tenant', model: 'institution' })
  archive(@CurrentUser() user: AuthUser, @Param() params: InstitutionIdParamDto) {
    return this.institutions.archive(params.id, user.tenantId, user.sub);
  }
}