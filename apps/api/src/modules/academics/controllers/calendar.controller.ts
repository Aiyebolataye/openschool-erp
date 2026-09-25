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
import { CalendarService } from '../services/calendar.service';
import { AuthUser, toAcademicContext } from '../academic.types';
import {
  CreateAcademicYearDto,
  CreateSessionDto,
  CreateTermDto,
  UpdateAcademicYearDto,
  UpdateSessionDto,
  UpdateTermDto,
} from '../dto/calendar.dto';
import { AcademicIdParamDto, AcademicQueryDto } from '../dto/common.dto';

@ApiTags('academics/calendar')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
@Controller('academics')
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  // ------------------------------------------------------------------ years
  @Post('years')
  @Permissions('academics:year:create')
  createYear(@CurrentUser() user: AuthUser, @Body() dto: CreateAcademicYearDto) {
    return this.calendar.createYear(toAcademicContext(user), dto);
  }

  @Get('years')
  @Permissions('academics:year:list')
  listYears(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto) {
    return this.calendar.listYears(toAcademicContext(user), query.page, query.limit);
  }

  @Get('years/:id')
  @Permissions('academics:year:read')
  @ObjectScope({ type: 'institution', model: 'academicYear' })
  getYear(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.calendar.getYear(toAcademicContext(user), params.id);
  }

  @Patch('years/:id')
  @Permissions('academics:year:update')
  @ObjectScope({ type: 'institution', model: 'academicYear' })
  updateYear(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateAcademicYearDto) {
    return this.calendar.updateYear(toAcademicContext(user), params.id, dto);
  }

  @Post('years/:id/activate')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:year:update')
  @ObjectScope({ type: 'institution', model: 'academicYear' })
  activateYear(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.calendar.activateYear(toAcademicContext(user), params.id);
  }

  @Post('years/:id/close')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:year:update')
  @ObjectScope({ type: 'institution', model: 'academicYear' })
  closeYear(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.calendar.closeYear(toAcademicContext(user), params.id);
  }

  @Delete('years/:id')
  @Permissions('academics:year:delete')
  @ObjectScope({ type: 'institution', model: 'academicYear' })
  deleteYear(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.calendar.deleteYear(toAcademicContext(user), params.id);
  }

  // ---------------------------------------------------------------- sessions
  @Post('years/:id/sessions')
  @Permissions('academics:session:create')
  @ObjectScope({ type: 'institution', model: 'academicYear' })
  createSession(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: CreateSessionDto) {
    return this.calendar.createSession(toAcademicContext(user), params.id, dto);
  }

  @Get('years/:id/sessions')
  @Permissions('academics:session:list')
  @ObjectScope({ type: 'institution', model: 'academicYear' })
  listSessions(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Query() query: AcademicQueryDto) {
    return this.calendar.listSessions(toAcademicContext(user), params.id, query.page, query.limit);
  }

  @Post('sessions/:id/activate')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:session:update')
  @ObjectScope({ type: 'institution', model: 'academicSession' })
  activateSession(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.calendar.activateSession(toAcademicContext(user), params.id);
  }

  @Post('sessions/:id/close')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:session:update')
  @ObjectScope({ type: 'institution', model: 'academicSession' })
  closeSession(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.calendar.closeSession(toAcademicContext(user), params.id);
  }

  @Patch('sessions/:id')
  @Permissions('academics:session:update')
  @ObjectScope({ type: 'institution', model: 'academicSession' })
  updateSession(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateSessionDto) {
    return this.calendar.updateSession(toAcademicContext(user), params.id, dto);
  }

  @Get('sessions/:id')
  @Permissions('academics:session:read')
  @ObjectScope({ type: 'institution', model: 'academicSession' })
  getSession(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.calendar.getSession(toAcademicContext(user), params.id);
  }

  @Delete('sessions/:id')
  @Permissions('academics:session:delete')
  @ObjectScope({ type: 'institution', model: 'academicSession' })
  deleteSession(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.calendar.deleteSession(toAcademicContext(user), params.id);
  }

  // ------------------------------------------------------------------- terms
  @Post('sessions/:id/terms')
  @Permissions('academics:term:create')
  @ObjectScope({ type: 'institution', model: 'academicSession' })
  createTerm(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: CreateTermDto) {
    return this.calendar.createTerm(toAcademicContext(user), params.id, dto);
  }

  @Get('sessions/:id/terms')
  @Permissions('academics:term:list')
  @ObjectScope({ type: 'institution', model: 'academicSession' })
  listTerms(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Query() query: AcademicQueryDto) {
    return this.calendar.listTerms(toAcademicContext(user), params.id, query.page, query.limit);
  }

  @Post('terms/:id/activate')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:term:update')
  @ObjectScope({ type: 'institution', model: 'term' })
  activateTerm(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.calendar.activateTerm(toAcademicContext(user), params.id);
  }

  @Post('terms/:id/close')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:term:update')
  @ObjectScope({ type: 'institution', model: 'term' })
  closeTerm(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.calendar.closeTerm(toAcademicContext(user), params.id);
  }

  @Patch('terms/:id')
  @Permissions('academics:term:update')
  @ObjectScope({ type: 'institution', model: 'term' })
  updateTerm(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateTermDto) {
    return this.calendar.updateTerm(toAcademicContext(user), params.id, dto);
  }

  @Get('terms/:id')
  @Permissions('academics:term:read')
  @ObjectScope({ type: 'institution', model: 'term' })
  getTerm(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.calendar.getTerm(toAcademicContext(user), params.id);
  }

  @Delete('terms/:id')
  @Permissions('academics:term:delete')
  @ObjectScope({ type: 'institution', model: 'term' })
  deleteTerm(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.calendar.deleteTerm(toAcademicContext(user), params.id);
  }
}