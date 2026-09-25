import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ObjectScopeGuard } from '../../common/guards/object-scope.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ObjectScope } from '../../common/decorators/object-scope.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { InstitutionScopeGuard } from './institution-scope.guard';
import { InstitutionConfigurationsService } from './institution-configurations.service';
import { InstitutionConfigurationUpsertDto, InstitutionConfigurationPathDto } from './dto/institution-config.dto';
import { InstitutionIdParamDto } from './dto/institution-id-param.dto';

type AuthUser = { sub: string; tenantId: string };

/**
 * P4.1 — nested institution configuration API.
 *
 * Routes sit under /institutions/:id/configuration. ObjectScopeGuard resolves
 * the `:id` institution server-side (tenant ownership fails closed), then
 * InstitutionScopeGuard enforces the active-institution-membership requirement
 * for this institution-scoped data, and PermissionGuard enforces
 * `institution:config:*` (admin roles only).
 */
@ApiTags('institutions-configuration')
@ApiBearerAuth()
@Controller('institutions/:id/configuration')
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard, InstitutionScopeGuard)
export class InstitutionConfigurationsController {
  private readonly logger = new Logger(InstitutionConfigurationsController.name);

  constructor(private readonly configurations: InstitutionConfigurationsService) {}

  @Get()
  @Permissions('institution:config:list')
  @ObjectScope({ type: 'tenant', model: 'institution' })
  list(@CurrentUser() user: AuthUser, @Param() params: InstitutionIdParamDto) {
    return this.configurations.list(user.tenantId, params.id);
  }

  @Get(':key')
  @Permissions('institution:config:read')
  @ObjectScope({ type: 'tenant', model: 'institution' })
  findByKey(@CurrentUser() user: AuthUser, @Param() params: InstitutionConfigurationPathDto) {
    return this.configurations.findByKey(user.tenantId, params.id, params.key);
  }

  @Put(':key')
  @Permissions('institution:config:update')
  @ObjectScope({ type: 'tenant', model: 'institution' })
  upsert(
    @CurrentUser() user: AuthUser,
    @Param() params: InstitutionConfigurationPathDto,
    @Body() dto: InstitutionConfigurationUpsertDto,
  ) {
    return this.configurations.upsert(user.tenantId, params.id, params.key, dto, user.sub);
  }

  @Delete(':key')
  @Permissions('institution:config:delete')
  @ObjectScope({ type: 'tenant', model: 'institution' })
  remove(@CurrentUser() user: AuthUser, @Param() params: InstitutionConfigurationPathDto) {
    return this.configurations.remove(user.tenantId, params.id, params.key, user.sub);
  }
}