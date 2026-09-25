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
import { SummerSchoolService } from '../services/summer-school.service';
import { AuthUser, toAcademicContext } from '../academic.types';
import {
  CreateSummerSchoolDto,
  RecordSummerSchoolResultDto,
  RegisterForSummerSchoolDto,
  StageSummerSchoolDto,
  UpdateSummerSchoolDto,
} from '../dto/academic-admin.dto';
import { AcademicIdParamDto, AcademicQueryDto } from '../dto/common.dto';

@ApiTags('academics/summer-school')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
@Controller('academics/summer-school')
export class SummerSchoolController {
  constructor(private readonly summerSchool: SummerSchoolService) {}

  @Post('sessions')
  @Permissions('academics:summer-school:manage')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSummerSchoolDto) {
    return this.summerSchool.createSession(toAcademicContext(user), dto);
  }

  @Get('sessions')
  @Permissions('academics:summer-school:read')
  list(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto & { termId?: string }) {
    return this.summerSchool.listSessions(toAcademicContext(user), query.termId, query.page, query.limit);
  }

  @Get('sessions/:id')
  @Permissions('academics:summer-school:read')
  @ObjectScope({ type: 'institution', model: 'summerSchoolSession' })
  get(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.summerSchool.getSession(toAcademicContext(user), params.id);
  }

  @Patch('sessions/:id')
  @Permissions('academics:summer-school:manage')
  @ObjectScope({ type: 'institution', model: 'summerSchoolSession' })
  update(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateSummerSchoolDto) {
    return this.summerSchool.updateSession(toAcademicContext(user), params.id, dto);
  }

  @Post('sessions/:id/stage')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:summer-school:manage')
  @ObjectScope({ type: 'institution', model: 'summerSchoolSession' })
  stage(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: StageSummerSchoolDto) {
    return this.summerSchool.stageSession(toAcademicContext(user), params.id, dto);
  }

  @Delete('sessions/:id')
  @Permissions('academics:summer-school:manage')
  @ObjectScope({ type: 'institution', model: 'summerSchoolSession' })
  delete(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.summerSchool.deleteSession(toAcademicContext(user), params.id);
  }

  @Post('sessions/:id/registrations')
  @Permissions('academics:summer-school:manage')
  @ObjectScope({ type: 'institution', model: 'summerSchoolSession' })
  register(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: RegisterForSummerSchoolDto) {
    return this.summerSchool.register(toAcademicContext(user), params.id, dto);
  }

  @Get('sessions/:id/registrations')
  @Permissions('academics:summer-school:read')
  @ObjectScope({ type: 'institution', model: 'summerSchoolSession' })
  listRegistrations(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Query() query: AcademicQueryDto) {
    return this.summerSchool.listRegistrations(toAcademicContext(user), params.id, query.page, query.limit);
  }

  @Patch('registrations/:id')
  @Permissions('academics:summer-school:manage')
  @ObjectScope({ type: 'institution', model: 'summerSchoolRegistration' })
  updateRegistration(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: RegisterForSummerSchoolDto) {
    return this.summerSchool.updateRegistration(toAcademicContext(user), params.id, dto);
  }

  @Post('registrations/:id/results')
  @Permissions('academics:summer-school:manage')
  @ObjectScope({ type: 'institution', model: 'summerSchoolRegistration' })
  recordResult(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: RecordSummerSchoolResultDto) {
    return this.summerSchool.recordResult(toAcademicContext(user), params.id, dto);
  }

  @Post('registrations/:id/results/publish')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:summer-school:manage')
  @ObjectScope({ type: 'institution', model: 'summerSchoolRegistration' })
  publishResults(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.summerSchool.publishResults(toAcademicContext(user), params.id);
  }

  @Get('registrations/:id/results')
  @Permissions('academics:summer-school:read')
  @ObjectScope({ type: 'institution', model: 'summerSchoolRegistration' })
  listResults(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Query() query: AcademicQueryDto) {
    return this.summerSchool.listResults(toAcademicContext(user), params.id, query.page, query.limit);
  }
}