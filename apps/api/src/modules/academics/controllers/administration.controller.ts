import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { ObjectScopeGuard } from '../../../common/guards/object-scope.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { ObjectScope } from '../../../common/decorators/object-scope.decorator';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { ProgressionService } from '../services/progression.service';
import { PolicyService } from '../services/policy.service';
import { AuthUser, toAcademicContext } from '../academic.types';
import {
  CreatePolicyDto,
  EffectivePolicyParamsDto,
  EvaluateProgressionDto,
  UpdatePolicyDto,
  UpdateProgressionDto,
} from '../dto/academic-admin.dto';
import { AcademicIdParamDto, AcademicQueryDto } from '../dto/common.dto';

@ApiTags('academics/administration')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
@Controller('academics')
export class AdministrationController {
  constructor(
    private readonly progression: ProgressionService,
    private readonly policy: PolicyService,
  ) {}

  // -------------------------------------------------------------- progressions
  @Post('progressions')
  @Permissions('academics:progression:manage')
  evaluate(@CurrentUser() user: AuthUser, @Body() dto: EvaluateProgressionDto) {
    return this.progression.evaluate(toAcademicContext(user), dto);
  }

  @Get('progressions')
  @Permissions('academics:progression:read')
  list(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto & Record<string, string | undefined>) {
    return this.progression.list(toAcademicContext(user), {
      studentPersonId: query.studentPersonId,
      termId: query.termId,
      progressionType: query.progressionType,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('progressions/:id')
  @Permissions('academics:progression:read')
  @ObjectScope({ type: 'institution', model: 'academicProgression' })
  get(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.progression.get(toAcademicContext(user), params.id);
  }

  @Patch('progressions/:id')
  @Permissions('academics:progression:manage')
  @ObjectScope({ type: 'institution', model: 'academicProgression' })
  update(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateProgressionDto) {
    return this.progression.update(toAcademicContext(user), params.id, dto);
  }

  @Post('progressions/:id/approve')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:progression:approve')
  @ObjectScope({ type: 'institution', model: 'academicProgression' })
  approve(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.progression.approve(toAcademicContext(user), params.id);
  }

  @Delete('progressions/:id')
  @Permissions('academics:progression:manage')
  @ObjectScope({ type: 'institution', model: 'academicProgression' })
  delete(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.progression.delete(toAcademicContext(user), params.id);
  }

  // -------------------------------------------------------------------- policy
  @Post('policies')
  @Permissions('academics:policy:create')
  createPolicy(@CurrentUser() user: AuthUser, @Body() dto: CreatePolicyDto) {
    return this.policy.create(toAcademicContext(user), dto);
  }

  @Get('policies')
  @Permissions('academics:policy:read')
  listPolicies(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto & Record<string, string | undefined>) {
    return this.policy.list(toAcademicContext(user), {
      policyType: query.policyType,
      policyKey: query.policyKey,
      status: query.status,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('policies/:id')
  @Permissions('academics:policy:read')
  @ObjectScope({ type: 'institution', model: 'academicPolicy' })
  getPolicy(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.policy.get(toAcademicContext(user), params.id);
  }

  @Patch('policies/:id')
  @Permissions('academics:policy:update')
  @ObjectScope({ type: 'institution', model: 'academicPolicy' })
  updatePolicy(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdatePolicyDto) {
    return this.policy.update(toAcademicContext(user), params.id, dto);
  }

  @Post('policies/:id/publish')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:policy:update')
  @ObjectScope({ type: 'institution', model: 'academicPolicy' })
  publishPolicy(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.policy.publish(toAcademicContext(user), params.id);
  }

  @Get('policies/effective/:policyType/:policyKey')
  @Permissions('academics:policy:read')
  @ObjectScope({ type: 'institution' })
  effectivePolicy(@CurrentUser() user: AuthUser, @Param() params: EffectivePolicyParamsDto) {
    return this.policy.effective(toAcademicContext(user), params.policyType, params.policyKey);
  }

  @Delete('policies/:id')
  @Permissions('academics:policy:delete')
  @ObjectScope({ type: 'institution', model: 'academicPolicy' })
  deletePolicy(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.policy.delete(toAcademicContext(user), params.id);
  }
}