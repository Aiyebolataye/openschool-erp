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
import { StudentsService, ActorContext } from './students.service';
import {
  CreateStudentDto,
  EnrollmentDetailDto,
  GraduationDetailDto,
  ListStudentsQueryDto,
  TransferDetailDto,
  UpdateStudentDto,
  WithdrawalDetailDto,
} from './dto/student.dto';

interface StudentUser {
  sub: string;
  tenantId: string;
  institutionId?: string;
}

@ApiTags('people')
@ApiBearerAuth()
@Controller('people/persons/:personId/students')
@UseGuards(AuthGuard('jwt'), PermissionGuard, PeopleScopeGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  private actor(user: StudentUser): ActorContext {
    return { id: user.sub };
  }

  @Get()
  @Permissions('people:student:list')
  @PeopleScope({ model: 'student' })
  list(
    @CurrentUser() user: StudentUser,
    @Param('personId') personId: string,
    @Query() query: ListStudentsQueryDto,
  ) {
    return this.studentsService.listStudents(user.tenantId, user.institutionId, personId, query);
  }

  @Post()
  @Permissions('people:student:create')
  @PeopleScope({ model: 'student' })
  create(
    @CurrentUser() user: StudentUser,
    @Param('personId') personId: string,
    @Body() dto: CreateStudentDto,
  ) {
    return this.studentsService.createStudent(user.tenantId, user.institutionId, personId, dto, this.actor(user));
  }

  @Get(':id')
  @Permissions('people:student:read')
  @PeopleScope({ model: 'student' })
  findOne(
    @CurrentUser() user: StudentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.studentsService.findOne(user.tenantId, user.institutionId, personId, id);
  }

  @Patch(':id')
  @Permissions('people:student:update')
  @PeopleScope({ model: 'student' })
  update(
    @CurrentUser() user: StudentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.updateStudent(user.tenantId, user.institutionId, personId, id, dto, this.actor(user));
  }

  @Delete(':id')
  @Permissions('people:student:update')
  @PeopleScope({ model: 'student' })
  remove(
    @CurrentUser() user: StudentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.studentsService.softDeleteStudent(user.tenantId, user.institutionId, personId, id, this.actor(user));
  }

  @Get(':id/enrollment')
  @Permissions('people:student:read')
  @PeopleScope({ model: 'student' })
  getEnrollment(
    @CurrentUser() user: StudentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.studentsService.getEnrollmentDetail(user.tenantId, user.institutionId, personId, id);
  }

  @Put(':id/enrollment')
  @Permissions('people:student:update')
  @PeopleScope({ model: 'student' })
  updateEnrollment(
    @CurrentUser() user: StudentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: EnrollmentDetailDto,
  ) {
    return this.studentsService.updateEnrollmentDetail(user.tenantId, user.institutionId, personId, id, dto, this.actor(user));
  }

  @Get(':id/graduation')
  @Permissions('people:student:read')
  @PeopleScope({ model: 'student' })
  getGraduation(
    @CurrentUser() user: StudentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.studentsService.resolveStudentDetails(user.tenantId, user.institutionId, personId, id, 'graduation');
  }

  @Put(':id/graduation')
  @Permissions('people:student:update')
  @PeopleScope({ model: 'student' })
  graduate(
    @CurrentUser() user: StudentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: GraduationDetailDto,
  ) {
    return this.studentsService.graduateStudent(user.tenantId, user.institutionId, personId, id, dto, this.actor(user));
  }

  @Get(':id/transfer')
  @Permissions('people:student:read')
  @PeopleScope({ model: 'student' })
  getTransfer(
    @CurrentUser() user: StudentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.studentsService.resolveStudentDetails(user.tenantId, user.institutionId, personId, id, 'transfer');
  }

  @Put(':id/transfer')
  @Permissions('people:student:update')
  @PeopleScope({ model: 'student' })
  transfer(
    @CurrentUser() user: StudentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: TransferDetailDto,
  ) {
    return this.studentsService.transferStudent(user.tenantId, user.institutionId, personId, id, dto, this.actor(user));
  }

  @Get(':id/withdrawal')
  @Permissions('people:student:read')
  @PeopleScope({ model: 'student' })
  getWithdrawal(
    @CurrentUser() user: StudentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.studentsService.resolveStudentDetails(user.tenantId, user.institutionId, personId, id, 'withdrawal');
  }

  @Put(':id/withdrawal')
  @Permissions('people:student:update')
  @PeopleScope({ model: 'student' })
  withdraw(
    @CurrentUser() user: StudentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: WithdrawalDetailDto,
  ) {
    return this.studentsService.withdrawStudent(user.tenantId, user.institutionId, personId, id, dto, this.actor(user));
  }
}