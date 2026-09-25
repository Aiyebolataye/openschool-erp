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
import { TeachingService } from '../services/teaching.service';
import { TimetableService } from '../services/timetable.service';
import { AuthUser, toAcademicContext } from '../academic.types';
import {
  AssignHomeroomDto,
  CreateArmDto,
  CreateTeachingAssignmentDto,
  CreateTimetableDto,
  CreateTimetableSlotDto,
  UpdateArmDto,
  UpdateTeachingAssignmentDto,
  UpdateTimetableDto,
  UpdateTimetableSlotDto,
} from '../dto/teaching.dto';
import { AcademicIdParamDto, AcademicQueryDto } from '../dto/common.dto';

@ApiTags('academics/teaching')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
@Controller('academics')
export class TeachingController {
  constructor(
    private readonly teaching: TeachingService,
    private readonly timetable: TimetableService,
  ) {}

  // ------------------------------------------------------ teaching assignments
  @Post('teaching-assignments')
  @Permissions('academics:teaching:create')
  createAssignment(@CurrentUser() user: AuthUser, @Body() dto: CreateTeachingAssignmentDto) {
    return this.teaching.createAssignment(toAcademicContext(user), dto);
  }

  @Get('teaching-assignments')
  @Permissions('academics:teaching:list')
  listAssignments(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto & Record<string, string | undefined>) {
    return this.teaching.listAssignments(toAcademicContext(user), {
      termId: query.termId,
      classId: query.classId,
      subjectId: query.subjectId,
      staffPersonId: query.staffPersonId,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('teaching-assignments/:id')
  @Permissions('academics:teaching:read')
  @ObjectScope({ type: 'institution', model: 'teachingAssignment' })
  getAssignment(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.teaching.getAssignment(toAcademicContext(user), params.id);
  }

  @Patch('teaching-assignments/:id')
  @Permissions('academics:teaching:update')
  @ObjectScope({ type: 'institution', model: 'teachingAssignment' })
  updateAssignment(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateTeachingAssignmentDto) {
    return this.teaching.updateAssignment(toAcademicContext(user), params.id, dto);
  }

  @Delete('teaching-assignments/:id')
  @Permissions('academics:teaching:delete')
  @ObjectScope({ type: 'institution', model: 'teachingAssignment' })
  deleteAssignment(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.teaching.deleteAssignment(toAcademicContext(user), params.id);
  }

  // ------------------------------------------------------------------ homeroom
  @Patch('classes/:id/homeroom')
  @Permissions('academics:homeroom:assign')
  @ObjectScope({ type: 'institution', model: 'class' })
  assignHomeroom(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: AssignHomeroomDto) {
    return this.teaching.assignHomeroom(toAcademicContext(user), params.id, dto);
  }

  @Get('classes/:id/homeroom')
  @Permissions('academics:homeroom:read')
  @ObjectScope({ type: 'institution', model: 'class' })
  getHomeroom(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.teaching.getHomeroom(toAcademicContext(user), params.id);
  }

  // ---------------------------------------------------------------------- arms
  @Post('classes/:id/arms')
  @Permissions('academics:arm:create')
  @ObjectScope({ type: 'institution', model: 'class' })
  createArm(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: CreateArmDto) {
    return this.teaching.createArm(toAcademicContext(user), params.id, dto);
  }

  @Get('classes/:id/arms')
  @Permissions('academics:arm:list')
  @ObjectScope({ type: 'institution', model: 'class' })
  listArms(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Query() query: AcademicQueryDto) {
    return this.teaching.listArms(toAcademicContext(user), params.id, query.page, query.limit);
  }

  @Patch('arms/:id')
  @Permissions('academics:arm:update')
  @ObjectScope({ type: 'institution', model: 'arm' })
  updateArm(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateArmDto) {
    return this.teaching.updateArm(toAcademicContext(user), params.id, dto);
  }

  @Delete('arms/:id')
  @Permissions('academics:arm:delete')
  @ObjectScope({ type: 'institution', model: 'arm' })
  deleteArm(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.teaching.deleteArm(toAcademicContext(user), params.id);
  }

  // ---------------------------------------------------------------- timetables
  @Post('timetables')
  @Permissions('academics:timetable:create')
  createTimetable(@CurrentUser() user: AuthUser, @Body() dto: CreateTimetableDto) {
    return this.timetable.createTimetable(toAcademicContext(user), dto);
  }

  @Get('timetables')
  @Permissions('academics:timetable:list')
  listTimetables(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto & Record<string, string | undefined>) {
    return this.timetable.listTimetables(toAcademicContext(user), query.classId, query.termId, query.page, query.limit);
  }

  @Get('timetables/:id')
  @Permissions('academics:timetable:read')
  @ObjectScope({ type: 'institution', model: 'timetable' })
  getTimetable(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.timetable.getTimetable(toAcademicContext(user), params.id);
  }

  @Patch('timetables/:id')
  @Permissions('academics:timetable:update')
  @ObjectScope({ type: 'institution', model: 'timetable' })
  updateTimetable(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateTimetableDto) {
    return this.timetable.updateTimetable(toAcademicContext(user), params.id, dto);
  }

  @Post('timetables/:id/publish')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:timetable:publish')
  @ObjectScope({ type: 'institution', model: 'timetable' })
  publishTimetable(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.timetable.publishTimetable(toAcademicContext(user), params.id);
  }

  @Post('timetables/:id/archive')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:timetable:update')
  @ObjectScope({ type: 'institution', model: 'timetable' })
  archiveTimetable(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.timetable.archiveTimetable(toAcademicContext(user), params.id);
  }

  @Delete('timetables/:id')
  @Permissions('academics:timetable:delete')
  @ObjectScope({ type: 'institution', model: 'timetable' })
  deleteTimetable(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.timetable.deleteTimetable(toAcademicContext(user), params.id);
  }

  // ------------------------------------------------------------- timetable slots
  @Post('timetables/:id/slots')
  @Permissions('academics:timetable:update')
  @ObjectScope({ type: 'institution', model: 'timetable' })
  addSlot(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: CreateTimetableSlotDto) {
    return this.timetable.addSlot(toAcademicContext(user), params.id, dto);
  }

  @Patch('timetable-slots/:id')
  @Permissions('academics:timetable:update')
  @ObjectScope({ type: 'institution', model: 'timetableSlot' })
  updateSlot(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateTimetableSlotDto) {
    return this.timetable.updateSlot(toAcademicContext(user), params.id, dto);
  }

  @Delete('timetable-slots/:id')
  @Permissions('academics:timetable:update')
  @ObjectScope({ type: 'institution', model: 'timetableSlot' })
  removeSlot(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.timetable.removeSlot(toAcademicContext(user), params.id);
  }
}