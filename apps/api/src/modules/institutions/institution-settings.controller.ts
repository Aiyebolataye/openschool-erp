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
import { InstitutionSettingsService } from './institution-settings.service';
import { InstitutionSettingUpsertDto, InstitutionSettingPathDto } from './dto/institution-setting.dto';
import { InstitutionIdParamDto } from './dto/institution-id-param.dto';

type AuthUser = { sub: string; tenantId: string };

/**
 * P4.1 — nested institution settings API.
 *
 * Same authorization stack as the configuration controller: server-derived
 * tenant/institution ownership (ObjectScopeGuard), active institution
 * membership (InstitutionScopeGuard) and `institution:setting:*` permissions.
 * Values are kind-typed (STRING/NUMBER/BOOLEAN/JSON) and versioned with
 * optimistic concurrency.
 */
@ApiTags('institutions-settings')
@ApiBearerAuth()
@Controller('institutions/:id/settings')
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard, InstitutionScopeGuard)
export class InstitutionSettingsController {
  private readonly logger = new Logger(InstitutionSettingsController.name);

  constructor(private readonly settings: InstitutionSettingsService) {}

  @Get()
  @Permissions('institution:setting:list')
  @ObjectScope({ type: 'tenant', model: 'institution' })
  list(@CurrentUser() user: AuthUser, @Param() params: InstitutionIdParamDto) {
    return this.settings.list(user.tenantId, params.id);
  }

  @Get(':key')
  @Permissions('institution:setting:read')
  @ObjectScope({ type: 'tenant', model: 'institution' })
  findByKey(@CurrentUser() user: AuthUser, @Param() params: InstitutionSettingPathDto) {
    return this.settings.findByKey(user.tenantId, params.id, params.key);
  }

  @Put(':key')
  @Permissions('institution:setting:update')
  @ObjectScope({ type: 'tenant', model: 'institution' })
  upsert(
    @CurrentUser() user: AuthUser,
    @Param() params: InstitutionSettingPathDto,
    @Body() dto: InstitutionSettingUpsertDto,
  ) {
    return this.settings.upsert(user.tenantId, params.id, params.key, dto, user.sub);
  }

  @Delete(':key')
  @Permissions('institution:setting:delete')
  @ObjectScope({ type: 'tenant', model: 'institution' })
  remove(@CurrentUser() user: AuthUser, @Param() params: InstitutionSettingPathDto) {
    return this.settings.remove(user.tenantId, params.id, params.key, user.sub);
  }
}