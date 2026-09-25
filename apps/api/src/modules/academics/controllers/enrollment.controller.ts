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
import { EnrollmentService } from '../services/enrollment.service';
import { AttendanceService } from '../services/attendance.service';
import { AuthUser, toAcademicContext } from '../academic.types';
import {
  CorrectAttendanceDto,
  CreateEnrollmentDto,
  RecordAttendanceDto,
  RegisterSubjectsDto,
  UpdateEnrollmentDto,
  UpdateRegistrationDto,
} from '../dto/activity.dto';
import { AcademicIdParamDto, AcademicQueryDto } from '../dto/common.dto';

@ApiTags('academics/enrollment')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
@Controller('academics')
export class EnrollmentController {
  constructor(
    private readonly enrollment: EnrollmentService,
    private readonly attendance: AttendanceService,
  ) {}

  // ---------------------------------------------------------------- enrollment
  @Post('enrollments')
  @Permissions('academics:enrollment:create')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateEnrollmentDto) {
    return this.enrollment.createEnrollment(toAcademicContext(user), dto);
  }

  @Get('enrollments')
  @Permissions('academics:enrollment:list')
  list(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto & Record<string, string | undefined>) {
    return this.enrollment.listEnrollments(toAcademicContext(user), {
      studentPersonId: query.studentPersonId,
      classId: query.classId,
      termId: query.termId,
      status: query.status as never,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('enrollments/:id')
  @Permissions('academics:enrollment:read')
  @ObjectScope({ type: 'institution', model: 'studentClassEnrollment' })
  get(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.enrollment.getEnrollment(toAcademicContext(user), params.id);
  }

  @Patch('enrollments/:id')
  @Permissions('academics:enrollment:update')
  @ObjectScope({ type: 'institution', model: 'studentClassEnrollment' })
  update(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateEnrollmentDto) {
    return this.enrollment.updateEnrollment(toAcademicContext(user), params.id, dto);
  }

  @Post('enrollments/:id/withdraw')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:enrollment:update')
  @ObjectScope({ type: 'institution', model: 'studentClassEnrollment' })
  withdraw(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.enrollment.withdrawEnrollment(toAcademicContext(user), params.id);
  }

  @Post('enrollments/:id/transfer')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:enrollment:update')
  @ObjectScope({ type: 'institution', model: 'studentClassEnrollment' })
  transfer(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.enrollment.transferEnrollment(toAcademicContext(user), params.id);
  }

  @Delete('enrollments/:id')
  @Permissions('academics:enrollment:delete')
  @ObjectScope({ type: 'institution', model: 'studentClassEnrollment' })
  delete(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.enrollment.deleteEnrollment(toAcademicContext(user), params.id);
  }

  // ------------------------------------------------------ subject registration
  @Post('enrollments/:id/subjects')
  @Permissions('academics:subject-registration:write')
  @ObjectScope({ type: 'institution', model: 'studentClassEnrollment' })
  registerSubjects(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: RegisterSubjectsDto) {
    return this.enrollment.registerSubjects(toAcademicContext(user), params.id, dto);
  }

  @Get('enrollments/:id/subjects')
  @Permissions('academics:subject-registration:read')
  @ObjectScope({ type: 'institution', model: 'studentClassEnrollment' })
  listSubjects(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Query() query: AcademicQueryDto) {
    return this.enrollment.listSubjectRegistrations(toAcademicContext(user), params.id, query.page, query.limit);
  }

  @Delete('enrollments/:id/subjects/:subjectId')
  @Permissions('academics:subject-registration:write')
  @ObjectScope({ type: 'institution', model: 'studentClassEnrollment' })
  unregisterSubject(
    @CurrentUser() user: AuthUser,
    @Param() params: AcademicIdParamDto & { subjectId: string },
  ) {
    return this.enrollment.unregisterSubject(toAcademicContext(user), params.id, params.subjectId);
  }

  @Patch('subject-registrations/:id')
  @Permissions('academics:subject-registration:write')
  @ObjectScope({ type: 'institution', model: 'subjectRegistration' })
  updateRegistration(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateRegistrationDto) {
    return this.enrollment.updateSubjectRegistration(toAcademicContext(user), params.id, dto);
  }

  // ---------------------------------------------------------------- attendance
  @Post('attendance')
  @Permissions('academics:attendance:write')
  recordAttendance(@CurrentUser() user: AuthUser, @Body() dto: RecordAttendanceDto) {
    return this.attendance.record(toAcademicContext(user), dto);
  }

  @Patch('attendance/:id')
  @Permissions('academics:attendance:write')
  @ObjectScope({ type: 'institution', model: 'attendance' })
  correctAttendance(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: CorrectAttendanceDto) {
    return this.attendance.correct(toAcademicContext(user), params.id, dto);
  }

  @Get('attendance')
  @Permissions('academics:attendance:read')
  listAttendance(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto & Record<string, string | undefined>) {
    return this.attendance.list(toAcademicContext(user), {
      enrollmentId: query.enrollmentId,
      staffPersonId: query.staffPersonId,
      subjectId: query.subjectId,
      classId: query.classId,
      date: query.date,
      from: query.from,
      to: query.to,
      page: query.page,
      limit: query.limit,
    });
  }
}