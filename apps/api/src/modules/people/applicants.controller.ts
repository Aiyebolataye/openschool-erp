import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { PeopleScope } from './people-scope.decorator';
import { PeopleScopeGuard } from './people-scope.guard';
import { ApplicantsService, ActorContext } from './applicants.service';
import {
  AcceptApplicantDto,
  CreateApplicantDto,
  ListApplicantsQueryDto,
  RejectApplicantDto,
  UpdateApplicantDto,
} from './dto/applicant.dto';

interface ApplicantUser {
  sub: string;
  tenantId: string;
  institutionId?: string;
}

@ApiTags('people')
@ApiBearerAuth()
@Controller('people/persons/:personId/applicants')
@UseGuards(AuthGuard('jwt'), PermissionGuard, PeopleScopeGuard)
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  private actor(user: ApplicantUser): ActorContext {
    return { id: user.sub };
  }

  @Get()
  @Permissions('people:applicant:list')
  @PeopleScope({ model: 'applicant' })
  list(
    @CurrentUser() user: ApplicantUser,
    @Param('personId') personId: string,
    @Query() query: ListApplicantsQueryDto,
  ) {
    return this.applicantsService.listApplicants(user.tenantId, user.institutionId, personId, query, this.actor(user));
  }

  @Post()
  @Permissions('people:applicant:create')
  @PeopleScope({ model: 'applicant' })
  create(
    @CurrentUser() user: ApplicantUser,
    @Param('personId') personId: string,
    @Body() dto: CreateApplicantDto,
  ) {
    return this.applicantsService.createApplicant(user.tenantId, user.institutionId, personId, dto, this.actor(user));
  }

  @Get(':id')
  @Permissions('people:applicant:read')
  @PeopleScope({ model: 'applicant' })
  findOne(
    @CurrentUser() user: ApplicantUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.applicantsService.findOne(user.tenantId, user.institutionId, personId, id, this.actor(user));
  }

  @Put(':id')
  @Permissions('people:applicant:update')
  @PeopleScope({ model: 'applicant' })
  update(
    @CurrentUser() user: ApplicantUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: UpdateApplicantDto,
  ) {
    return this.applicantsService.updateApplicant(user.tenantId, user.institutionId, personId, id, dto, this.actor(user));
  }

  @Delete(':id')
  @Permissions('people:applicant:delete')
  @PeopleScope({ model: 'applicant' })
  remove(
    @CurrentUser() user: ApplicantUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.applicantsService.softDeleteApplicant(user.tenantId, user.institutionId, personId, id, this.actor(user));
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  @Permissions('people:applicant:accept')
  @PeopleScope({ model: 'applicant' })
  accept(
    @CurrentUser() user: ApplicantUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: AcceptApplicantDto,
  ) {
    return this.applicantsService.acceptApplicant(user.tenantId, user.institutionId, personId, id, dto, this.actor(user));
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @Permissions('people:applicant:reject')
  @PeopleScope({ model: 'applicant' })
  reject(
    @CurrentUser() user: ApplicantUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: RejectApplicantDto,
  ) {
    return this.applicantsService.rejectApplicant(user.tenantId, user.institutionId, personId, id, dto, this.actor(user));
  }
}