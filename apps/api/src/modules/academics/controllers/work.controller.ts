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
import { AssignmentService } from '../services/assignment.service';
import { AssessmentService } from '../services/assessment.service';
import { AuthUser, toAcademicContext } from '../academic.types';
import {
  CreateAssignmentDto,
  CreateAssessmentDto,
  CreateSubmissionDto,
  GradeSubmissionDto,
  RecordAssessmentResultDto,
  UpdateAssignmentDto,
  UpdateAssessmentDto,
} from '../dto/activity.dto';
import { AcademicIdParamDto, AcademicQueryDto } from '../dto/common.dto';

@ApiTags('academics/work')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
@Controller('academics')
export class WorkController {
  constructor(
    private readonly assignment: AssignmentService,
    private readonly assessment: AssessmentService,
  ) {}

  // --------------------------------------------------------------- assignments
  @Post('assignments')
  @Permissions('academics:assignment:create')
  createAssignment(@CurrentUser() user: AuthUser, @Body() dto: CreateAssignmentDto) {
    return this.assignment.create(toAcademicContext(user), dto);
  }

  @Get('assignments')
  @Permissions('academics:assignment:list')
  listAssignments(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto & Record<string, string | undefined>) {
    return this.assignment.list(toAcademicContext(user), {
      classId: query.classId,
      termId: query.termId,
      subjectId: query.subjectId,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('assignments/:id')
  @Permissions('academics:assignment:read')
  @ObjectScope({ type: 'institution', model: 'assignment' })
  getAssignment(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.assignment.get(toAcademicContext(user), params.id);
  }

  @Patch('assignments/:id')
  @Permissions('academics:assignment:update')
  @ObjectScope({ type: 'institution', model: 'assignment' })
  updateAssignment(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateAssignmentDto) {
    return this.assignment.update(toAcademicContext(user), params.id, dto);
  }

  @Post('assignments/:id/publish')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:assignment:update')
  @ObjectScope({ type: 'institution', model: 'assignment' })
  publishAssignment(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.assignment.publish(toAcademicContext(user), params.id);
  }

  @Post('assignments/:id/close')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:assignment:update')
  @ObjectScope({ type: 'institution', model: 'assignment' })
  closeAssignment(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.assignment.close(toAcademicContext(user), params.id);
  }

  @Delete('assignments/:id')
  @Permissions('academics:assignment:delete')
  @ObjectScope({ type: 'institution', model: 'assignment' })
  deleteAssignment(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.assignment.delete(toAcademicContext(user), params.id);
  }

  @Post('assignments/:id/submissions')
  @Permissions('academics:assignment:submit')
  @ObjectScope({ type: 'institution', model: 'assignment' })
  submit(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: CreateSubmissionDto) {
    return this.assignment.submit(toAcademicContext(user), params.id, dto);
  }

  @Get('assignments/:id/submissions')
  @Permissions('academics:assignment:read')
  @ObjectScope({ type: 'institution', model: 'assignment' })
  listSubmissions(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Query() query: AcademicQueryDto) {
    return this.assignment.listSubmissions(toAcademicContext(user), params.id, query.page, query.limit);
  }

  @Patch('submissions/:id/grade')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:assignment:grade')
  @ObjectScope({ type: 'institution', model: 'assignmentSubmission' })
  gradeSubmission(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: GradeSubmissionDto) {
    return this.assignment.gradeSubmission(toAcademicContext(user), params.id, dto);
  }

  // --------------------------------------------------------------- assessments
  @Post('assessments')
  @Permissions('academics:assessment:create')
  createAssessment(@CurrentUser() user: AuthUser, @Body() dto: CreateAssessmentDto) {
    return this.assessment.create(toAcademicContext(user), dto);
  }

  @Get('assessments')
  @Permissions('academics:assessment:list')
  listAssessments(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto & Record<string, string | undefined>) {
    return this.assessment.list(toAcademicContext(user), {
      subjectId: query.subjectId,
      termId: query.termId,
      assessmentType: query.assessmentType,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('assessments/:id')
  @Permissions('academics:assessment:read')
  @ObjectScope({ type: 'institution', model: 'assessment' })
  getAssessment(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.assessment.get(toAcademicContext(user), params.id);
  }

  @Patch('assessments/:id')
  @Permissions('academics:assessment:update')
  @ObjectScope({ type: 'institution', model: 'assessment' })
  updateAssessment(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateAssessmentDto) {
    return this.assessment.update(toAcademicContext(user), params.id, dto);
  }

  @Post('assessments/:id/publish')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:assessment:update')
  @ObjectScope({ type: 'institution', model: 'assessment' })
  publishAssessment(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.assessment.publish(toAcademicContext(user), params.id);
  }

  @Delete('assessments/:id')
  @Permissions('academics:assessment:delete')
  @ObjectScope({ type: 'institution', model: 'assessment' })
  deleteAssessment(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.assessment.delete(toAcademicContext(user), params.id);
  }

  @Post('assessments/:id/results')
  @Permissions('academics:assessment:grade')
  @ObjectScope({ type: 'institution', model: 'assessment' })
  recordResult(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: RecordAssessmentResultDto) {
    return this.assessment.recordResult(toAcademicContext(user), params.id, dto);
  }

  @Get('assessments/:id/results')
  @Permissions('academics:assessment:read')
  @ObjectScope({ type: 'institution', model: 'assessment' })
  listResults(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Query() query: AcademicQueryDto) {
    return this.assessment.listResults(toAcademicContext(user), params.id, query.page, query.limit);
  }
}