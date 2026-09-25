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
import { GradingService } from '../services/grading.service';
import { ResultsService } from '../services/results.service';
import { AuthUser, toAcademicContext } from '../academic.types';
import {
  AddBoundaryDto,
  AddRemarkDto,
  CompileResultsDto,
  CreateGradeScaleDto,
  GenerateReportCardsDto,
  UpdateBoundaryDto,
  UpdateGradeScaleDto,
  UpdateRemarkDto,
} from '../dto/academic-admin.dto';
import { AcademicIdParamDto, AcademicQueryDto } from '../dto/common.dto';

@ApiTags('academics/grading')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
@Controller('academics')
export class GradingController {
  constructor(
    private readonly grading: GradingService,
    private readonly results: ResultsService,
  ) {}

  // -------------------------------------------------------------- grade scales
  @Post('grade-scales')
  @Permissions('academics:grade-scale:create')
  createScale(@CurrentUser() user: AuthUser, @Body() dto: CreateGradeScaleDto) {
    return this.grading.createScale(toAcademicContext(user), dto);
  }

  @Get('grade-scales')
  @Permissions('academics:grade-scale:list')
  listScales(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto) {
    return this.grading.listScales(toAcademicContext(user), query.page, query.limit);
  }

  @Get('grade-scales/:id')
  @Permissions('academics:grade-scale:read')
  @ObjectScope({ type: 'institution', model: 'gradeScale' })
  getScale(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.grading.getScale(toAcademicContext(user), params.id);
  }

  @Patch('grade-scales/:id')
  @Permissions('academics:grade-scale:update')
  @ObjectScope({ type: 'institution', model: 'gradeScale' })
  updateScale(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateGradeScaleDto) {
    return this.grading.updateScale(toAcademicContext(user), params.id, dto);
  }

  @Post('grade-scales/:id/activate')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:grade-scale:update')
  @ObjectScope({ type: 'institution', model: 'gradeScale' })
  activateScale(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.grading.activateScale(toAcademicContext(user), params.id);
  }

  @Post('grade-scales/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:grade-scale:update')
  @ObjectScope({ type: 'institution', model: 'gradeScale' })
  deactivateScale(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.grading.deactivateScale(toAcademicContext(user), params.id);
  }

  @Delete('grade-scales/:id')
  @Permissions('academics:grade-scale:delete')
  @ObjectScope({ type: 'institution', model: 'gradeScale' })
  deleteScale(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.grading.deleteScale(toAcademicContext(user), params.id);
  }

  // --------------------------------------------------------------- boundaries
  @Post('grade-scales/:id/boundaries')
  @Permissions('academics:grade-scale:update')
  @ObjectScope({ type: 'institution', model: 'gradeScale' })
  addBoundary(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: AddBoundaryDto) {
    return this.grading.addBoundary(toAcademicContext(user), params.id, dto);
  }

  @Get('grade-scales/:id/boundaries')
  @Permissions('academics:grade-scale:read')
  @ObjectScope({ type: 'institution', model: 'gradeScale' })
  listBoundaries(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Query() query: AcademicQueryDto) {
    return this.grading.listBoundaries(toAcademicContext(user), params.id, query.page, query.limit);
  }

  @Patch('grade-boundaries/:id')
  @Permissions('academics:grade-scale:update')
  @ObjectScope({ type: 'institution', model: 'gradeBoundary' })
  updateBoundary(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateBoundaryDto) {
    return this.grading.updateBoundary(toAcademicContext(user), params.id, dto);
  }

  @Delete('grade-boundaries/:id')
  @Permissions('academics:grade-scale:update')
  @ObjectScope({ type: 'institution', model: 'gradeBoundary' })
  removeBoundary(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.grading.removeBoundary(toAcademicContext(user), params.id);
  }

  // ------------------------------------------------------------------- remarks
  @Post('grade-scales/:id/remarks')
  @Permissions('academics:grade-scale:update')
  @ObjectScope({ type: 'institution', model: 'gradeScale' })
  addRemark(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: AddRemarkDto) {
    return this.grading.addRemark(toAcademicContext(user), params.id, dto);
  }

  @Get('grade-scales/:id/remarks')
  @Permissions('academics:grade-scale:read')
  @ObjectScope({ type: 'institution', model: 'gradeScale' })
  listRemarks(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Query() query: AcademicQueryDto) {
    return this.grading.listRemarks(toAcademicContext(user), params.id, query.page, query.limit);
  }

  @Patch('remarks/:id')
  @Permissions('academics:grade-scale:update')
  @ObjectScope({ type: 'institution', model: 'remark' })
  updateRemark(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto, @Body() dto: UpdateRemarkDto) {
    return this.grading.updateRemark(toAcademicContext(user), params.id, dto);
  }

  @Delete('remarks/:id')
  @Permissions('academics:grade-scale:update')
  @ObjectScope({ type: 'institution', model: 'remark' })
  removeRemark(@CurrentUser() user: AuthUser, @Param() params: AcademicIdParamDto) {
    return this.grading.removeRemark(toAcademicContext(user), params.id);
  }

  // -------------------------------------------------------------------- results
  @Post('results/compile')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:result:compile')
  compile(@CurrentUser() user: AuthUser, @Body() dto: CompileResultsDto) {
    return this.results.compile(toAcademicContext(user), dto);
  }

  @Post('results/approve')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:result:approve')
  approve(@CurrentUser() user: AuthUser, @Body() dto: CompileResultsDto) {
    return this.results.approve(toAcademicContext(user), dto);
  }

  @Post('results/publish')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:result:publish')
  publish(@CurrentUser() user: AuthUser, @Body() dto: CompileResultsDto) {
    return this.results.publish(toAcademicContext(user), dto);
  }

  @Get('results')
  @Permissions('academics:result:read')
  listResults(@CurrentUser() user: AuthUser, @Query() query: AcademicQueryDto & Record<string, string | undefined>) {
    return this.results.list(toAcademicContext(user), {
      classId: query.classId,
      termId: query.termId,
      subjectId: query.subjectId,
      enrollmentId: query.enrollmentId,
      status: query.status,
      page: query.page,
      limit: query.limit,
    });
  }

  // -------------------------------------------------------------- report cards
  @Post('report-cards/generate')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:report-card:generate')
  generateReportCards(@CurrentUser() user: AuthUser, @Body() dto: GenerateReportCardsDto) {
    return this.results.generateReportCards(toAcademicContext(user), dto);
  }

  @Post('report-cards/publish')
  @HttpCode(HttpStatus.OK)
  @Permissions('academics:report-card:publish')
  publishReportCards(@CurrentUser() user: AuthUser, @Body() dto: GenerateReportCardsDto) {
    return this.results.publishReportCards(toAcademicContext(user), dto);
  }
}