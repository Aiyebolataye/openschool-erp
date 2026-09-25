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
import { CurriculumService } from '../services/curriculum.service';
import { AuthUser, toAcademicContext } from '../academic.types';
import {
  CreateClassDto,
  CreateDepartmentDto,
  CreateStreamDto,
  CreateSubjectDto,
  CreateSubjectGroupDto,
  GradeLevelDto,
  GrantSubjectsDto,
  UpdateClassDto,
  UpdateDepartmentDto,
  UpdateGradeLevelDto,
  UpdateStreamDto,
  UpdateSubjectDto,
  UpdateSubjectGroupDto,
} from '../dto/curriculum.dto';
import { AcademicIdParamDto, AcademicQueryDto } from '../dto/common.dto';

@ApiTags('academics/curriculum')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
@Controller('academics')
export class CurriculumController {
  constructor(private readonly curriculum: CurriculumService) {}

  // ------------------------------------------------------------- departments
  @Post('departments')
  @Permissions('academics:department:create')
  createDepartment(@CurrentUser() user: AuthUser, @Body() dto: CreateDepartmentDto) {
    return this.curriculum.createDepartment(toAcademicContext(user), dto);
  }

  @Get('departments')
  @Permissions('academics:department:list')
  listDepartments(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto) {
    return this.curriculum.listDepartments(toAcademicContext(user), query.page, query.limit);
  }

  @Get('departments/:id')
  @Permissions('academics:department:read')
  @ObjectScope({ type: 'institution', model: 'department' })
  getDepartment(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.curriculum.getDepartment(toAcademicContext(user), params.id);
  }

  @Patch('departments/:id')
  @Permissions('academics:department:update')
  @ObjectScope({ type: 'institution', model: 'department' })
  updateDepartment(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateDepartmentDto) {
    return this.curriculum.updateDepartment(toAcademicContext(user), params.id, dto);
  }

  @Delete('departments/:id')
  @Permissions('academics:department:delete')
  @ObjectScope({ type: 'institution', model: 'department' })
  deleteDepartment(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.curriculum.deleteDepartment(toAcademicContext(user), params.id);
  }

  // ---------------------------------------------------------------- subjects
  @Post('subjects')
  @Permissions('academics:subject:create')
  createSubject(@CurrentUser() user: AuthUser, @Body() dto: CreateSubjectDto) {
    return this.curriculum.createSubject(toAcademicContext(user), dto);
  }

  @Get('subjects')
  @Permissions('academics:subject:list')
  listSubjects(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto & { departmentId?: string }) {
    return this.curriculum.listSubjects(toAcademicContext(user), query.page, query.limit, query.departmentId);
  }

  @Get('subjects/:id')
  @Permissions('academics:subject:read')
  @ObjectScope({ type: 'institution', model: 'subject' })
  getSubject(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.curriculum.getSubject(toAcademicContext(user), params.id);
  }

  @Patch('subjects/:id')
  @Permissions('academics:subject:update')
  @ObjectScope({ type: 'institution', model: 'subject' })
  updateSubject(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateSubjectDto) {
    return this.curriculum.updateSubject(toAcademicContext(user), params.id, dto);
  }

  @Post('subjects/:id/activate')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:subject:update')
  @ObjectScope({ type: 'institution', model: 'subject' })
  activateSubject(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.curriculum.activateSubject(toAcademicContext(user), params.id);
  }

  @Post('subjects/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:subject:update')
  @ObjectScope({ type: 'institution', model: 'subject' })
  deactivateSubject(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.curriculum.deactivateSubject(toAcademicContext(user), params.id);
  }

  @Delete('subjects/:id')
  @Permissions('academics:subject:delete')
  @ObjectScope({ type: 'institution', model: 'subject' })
  deleteSubject(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.curriculum.deleteSubject(toAcademicContext(user), params.id);
  }

  // ----------------------------------------------------------- subject groups
  @Post('subject-groups')
  @Permissions('academics:subject-group:create')
  createSubjectGroup(@CurrentUser() user: AuthUser, @Body() dto: CreateSubjectGroupDto) {
    return this.curriculum.createSubjectGroup(toAcademicContext(user), dto);
  }

  @Get('subject-groups')
  @Permissions('academics:subject-group:list')
  listSubjectGroups(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto) {
    return this.curriculum.listSubjectGroups(toAcademicContext(user), query.page, query.limit);
  }

  @Get('subject-groups/:id')
  @Permissions('academics:subject-group:read')
  @ObjectScope({ type: 'institution', model: 'subjectGroup' })
  getSubjectGroup(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.curriculum.getSubjectGroup(toAcademicContext(user), params.id);
  }

  @Patch('subject-groups/:id')
  @Permissions('academics:subject-group:update')
  @ObjectScope({ type: 'institution', model: 'subjectGroup' })
  updateSubjectGroup(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateSubjectGroupDto) {
    return this.curriculum.updateSubjectGroup(toAcademicContext(user), params.id, dto);
  }

  @Post('subject-groups/:id/subjects')
  @Permissions('academics:subject-group:update')
  @ObjectScope({ type: 'institution', model: 'subjectGroup' })
  addSubjects(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: GrantSubjectsDto) {
    return this.curriculum.addSubjectsToGroup(toAcademicContext(user), params.id, dto);
  }

  @Delete('subject-groups/:id/subjects/:subjectId')
  @Permissions('academics:subject-group:update')
  @ObjectScope({ type: 'institution', model: 'subjectGroup' })
  removeSubject(
    @CurrentUser() user: AuthUser,
    @Param() params: AcademicIdParamDto & { subjectId: string },
  ) {
    return this.curriculum.removeSubjectFromGroup(toAcademicContext(user), params.id, params.subjectId);
  }

  @Delete('subject-groups/:id')
  @Permissions('academics:subject-group:delete')
  @ObjectScope({ type: 'institution', model: 'subjectGroup' })
  deleteSubjectGroup(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.curriculum.deleteSubjectGroup(toAcademicContext(user), params.id);
  }

  // ------------------------------------------------------------- grade levels
  @Post('grade-levels')
  @Permissions('academics:grade-level:create')
  createGradeLevel(@CurrentUser() user: AuthUser, @Body() dto: GradeLevelDto) {
    return this.curriculum.createGradeLevel(toAcademicContext(user), dto);
  }

  @Get('grade-levels')
  @Permissions('academics:grade-level:list')
  listGradeLevels(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto) {
    return this.curriculum.listGradeLevels(toAcademicContext(user), query.page, query.limit);
  }

  @Get('grade-levels/:id')
  @Permissions('academics:grade-level:read')
  @ObjectScope({ type: 'institution', model: 'gradeLevel' })
  getGradeLevel(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.curriculum.getGradeLevel(toAcademicContext(user), params.id);
  }

  @Patch('grade-levels/:id')
  @Permissions('academics:grade-level:update')
  @ObjectScope({ type: 'institution', model: 'gradeLevel' })
  updateGradeLevel(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateGradeLevelDto) {
    return this.curriculum.updateGradeLevel(toAcademicContext(user), params.id, dto);
  }

  @Delete('grade-levels/:id')
  @Permissions('academics:grade-level:delete')
  @ObjectScope({ type: 'institution', model: 'gradeLevel' })
  deleteGradeLevel(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.curriculum.deleteGradeLevel(toAcademicContext(user), params.id);
  }

  // ------------------------------------------------------------------ streams
  @Post('grade-levels/:id/streams')
  @Permissions('academics:stream:create')
  @ObjectScope({ type: 'institution', model: 'gradeLevel' })
  createStream(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: CreateStreamDto) {
    return this.curriculum.createStream(toAcademicContext(user), params.id, dto);
  }

  @Get('streams')
  @Permissions('academics:stream:list')
  listStreams(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto & { gradeLevelId?: string }) {
    return this.curriculum.listStreams(toAcademicContext(user), query.gradeLevelId, query.page, query.limit);
  }

  @Patch('streams/:id')
  @Permissions('academics:stream:update')
  @ObjectScope({ type: 'institution', model: 'stream' })
  updateStream(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateStreamDto) {
    return this.curriculum.updateStream(toAcademicContext(user), params.id, dto);
  }

  @Delete('streams/:id')
  @Permissions('academics:stream:delete')
  @ObjectScope({ type: 'institution', model: 'stream' })
  deleteStream(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.curriculum.deleteStream(toAcademicContext(user), params.id);
  }

  // ------------------------------------------------------------------- classes
  @Post('classes')
  @Permissions('academics:class:create')
  createClass(@CurrentUser() user: AuthUser, @Body() dto: CreateClassDto) {
    return this.curriculum.createClass(toAcademicContext(user), dto);
  }

  @Get('classes')
  @Permissions('academics:class:list')
  listClasses(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto & { gradeLevelId?: string }) {
    return this.curriculum.listClasses(toAcademicContext(user), query.gradeLevelId, query.page, query.limit);
  }

  @Get('classes/:id')
  @Permissions('academics:class:read')
  @ObjectScope({ type: 'institution', model: 'class' })
  getClass(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.curriculum.getClass(toAcademicContext(user), params.id);
  }

  @Patch('classes/:id')
  @Permissions('academics:class:update')
  @ObjectScope({ type: 'institution', model: 'class' })
  updateClass(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateClassDto) {
    return this.curriculum.updateClass(toAcademicContext(user), params.id, dto);
  }

  @Post('classes/:id/activate')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:class:update')
  @ObjectScope({ type: 'institution', model: 'class' })
  activateClass(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.curriculum.activateClass(toAcademicContext(user), params.id);
  }

  @Post('classes/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:class:update')
  @ObjectScope({ type: 'institution', model: 'class' })
  deactivateClass(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.curriculum.deactivateClass(toAcademicContext(user), params.id);
  }

  @Delete('classes/:id')
  @Permissions('academics:class:delete')
  @ObjectScope({ type: 'institution', model: 'class' })
  deleteClass(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.curriculum.deleteClass(toAcademicContext(user), params.id);
  }
}