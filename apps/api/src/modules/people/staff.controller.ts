import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { StaffService, ActorContext } from './staff.service';
import {
  CreateStaffDto,
  CreateStaffCertificationDto,
  CreateStaffQualificationDto,
  ListStaffQueryDto,
  StaffEmploymentDetailDto,
  UpdateStaffCertificationDto,
  UpdateStaffDto,
  UpdateStaffQualificationDto,
} from './dto/staff.dto';

interface StaffUser {
  sub: string;
  tenantId: string;
  institutionId?: string;
}

@ApiTags('people')
@ApiBearerAuth()
@Controller('people/persons/:personId/staff')
@UseGuards(AuthGuard('jwt'), PermissionGuard, PeopleScopeGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  private actor(user: StaffUser): ActorContext {
    return { id: user.sub };
  }

  // ---- staff CRUD ----------------------------------------------------------

  @Get()
  @Permissions('people:staff:list')
  @PeopleScope({ model: 'staff' })
  list(
    @CurrentUser() user: StaffUser,
    @Param('personId') personId: string,
    @Query() query: ListStaffQueryDto,
  ) {
    return this.staffService.listStaff(user.tenantId, user.institutionId, personId, query);
  }

  @Post()
  @Permissions('people:staff:create')
  @PeopleScope({ model: 'staff' })
  create(
    @CurrentUser() user: StaffUser,
    @Param('personId') personId: string,
    @Body() dto: CreateStaffDto,
  ) {
    return this.staffService.createStaff(user.tenantId, user.institutionId, personId, dto, this.actor(user));
  }

  @Get(':id')
  @Permissions('people:staff:read')
  @PeopleScope({ model: 'staff' })
  findOne(
    @CurrentUser() user: StaffUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.staffService.findOne(user.tenantId, user.institutionId, personId, id);
  }

  @Put(':id')
  @Permissions('people:staff:update')
  @PeopleScope({ model: 'staff' })
  update(
    @CurrentUser() user: StaffUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.staffService.updateStaff(user.tenantId, user.institutionId, personId, id, dto, this.actor(user));
  }

  @Delete(':id')
  @Permissions('people:staff:delete')
  @PeopleScope({ model: 'staff' })
  remove(
    @CurrentUser() user: StaffUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.staffService.softDeleteStaff(user.tenantId, user.institutionId, personId, id, this.actor(user));
  }

  // ---- employment detail ---------------------------------------------------

  @Get(':id/employment')
  @Permissions('people:staff:read')
  @PeopleScope({ model: 'staff' })
  getEmployment(
    @CurrentUser() user: StaffUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.staffService.getEmploymentDetail(user.tenantId, user.institutionId, personId, id);
  }

  @Put(':id/employment')
  @Permissions('people:staff:update')
  @PeopleScope({ model: 'staff' })
  updateEmployment(
    @CurrentUser() user: StaffUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: StaffEmploymentDetailDto,
  ) {
    return this.staffService.updateEmploymentDetail(user.tenantId, user.institutionId, personId, id, dto, this.actor(user));
  }

  // ---- qualifications ------------------------------------------------------

  @Get(':id/qualifications')
  @Permissions('people:staff:read')
  @PeopleScope({ model: 'staff' })
  listQualifications(
    @CurrentUser() user: StaffUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.staffService.listQualifications(user.tenantId, user.institutionId, personId, id);
  }

  @Post(':id/qualifications')
  @Permissions('people:staff:update')
  @PeopleScope({ model: 'staff' })
  addQualification(
    @CurrentUser() user: StaffUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: CreateStaffQualificationDto,
  ) {
    return this.staffService.addQualification(user.tenantId, user.institutionId, personId, id, dto, this.actor(user));
  }

  @Put(':id/qualifications/:qualificationId')
  @Permissions('people:staff:update')
  @PeopleScope({ model: 'staff' })
  updateQualification(
    @CurrentUser() user: StaffUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Param('qualificationId') qualificationId: string,
    @Body() dto: UpdateStaffQualificationDto,
  ) {
    return this.staffService.updateQualification(
      user.tenantId, user.institutionId, personId, id, qualificationId, dto, this.actor(user),
    );
  }

  @Delete(':id/qualifications/:qualificationId')
  @Permissions('people:staff:update')
  @PeopleScope({ model: 'staff' })
  removeQualification(
    @CurrentUser() user: StaffUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Param('qualificationId') qualificationId: string,
    @Body() dto: { version: number },
  ) {
    return this.staffService.removeQualification(
      user.tenantId, user.institutionId, personId, id, qualificationId, dto, this.actor(user),
    );
  }

  // ---- certifications ------------------------------------------------------

  @Get(':id/certifications')
  @Permissions('people:staff:read')
  @PeopleScope({ model: 'staff' })
  listCertifications(
    @CurrentUser() user: StaffUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.staffService.listCertifications(user.tenantId, user.institutionId, personId, id);
  }

  @Post(':id/certifications')
  @Permissions('people:staff:update')
  @PeopleScope({ model: 'staff' })
  addCertification(
    @CurrentUser() user: StaffUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: CreateStaffCertificationDto,
  ) {
    return this.staffService.addCertification(user.tenantId, user.institutionId, personId, id, dto, this.actor(user));
  }

  @Put(':id/certifications/:certificationId')
  @Permissions('people:staff:update')
  @PeopleScope({ model: 'staff' })
  updateCertification(
    @CurrentUser() user: StaffUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Param('certificationId') certificationId: string,
    @Body() dto: UpdateStaffCertificationDto,
  ) {
    return this.staffService.updateCertification(
      user.tenantId, user.institutionId, personId, id, certificationId, dto, this.actor(user),
    );
  }

  @Delete(':id/certifications/:certificationId')
  @Permissions('people:staff:update')
  @PeopleScope({ model: 'staff' })
  removeCertification(
    @CurrentUser() user: StaffUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Param('certificationId') certificationId: string,
    @Body() dto: { version: number },
  ) {
    return this.staffService.removeCertification(
      user.tenantId, user.institutionId, personId, id, certificationId, dto, this.actor(user),
    );
  }
}