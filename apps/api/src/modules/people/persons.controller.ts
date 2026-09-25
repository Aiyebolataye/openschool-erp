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
import { PersonsService, ActorContext } from './persons.service';
import {
  CreatePersonDto,
  InstitutionAssignmentDto,
  ListPeopleQueryDto,
  PersonProfileDto,
  UpdatePersonDto,
} from './dto/person.dto';
import { UploadProfilePhotoDto } from './dto/photo.dto';

@ApiTags('people')
@ApiBearerAuth()
@Controller('people/persons')
@UseGuards(AuthGuard('jwt'), PermissionGuard, PeopleScopeGuard)
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  private actor(user: { sub: string; tenantId: string }): ActorContext {
    return { id: user.sub };
  }

  @Get()
  @Permissions('people:person:list')
  @PeopleScope({ model: 'person' })
  list(@CurrentUser() user: { sub: string; tenantId: string }, @Query() query: ListPeopleQueryDto) {
    return this.personsService.list(user.tenantId, query);
  }

  @Get('search')
  @Permissions('people:person:search')
  @PeopleScope({ model: 'person' })
  search(@CurrentUser() user: { sub: string; tenantId: string }, @Query() query: ListPeopleQueryDto) {
    return this.personsService.search(user.tenantId, query);
  }

  @Post()
  @Permissions('people:person:create')
  @PeopleScope({ model: 'person' })
  create(
    @CurrentUser() user: { sub: string; tenantId: string },
    @Body() dto: CreatePersonDto,
  ) {
    return this.personsService.create(user.tenantId, dto, this.actor(user));
  }

  @Get(':id')
  @Permissions('people:person:read')
  @PeopleScope({ model: 'person' })
  findOne(@CurrentUser() user: { sub: string; tenantId: string }, @Param('id') id: string) {
    return this.personsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @Permissions('people:person:update')
  @PeopleScope({ model: 'person' })
  update(
    @CurrentUser() user: { sub: string; tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdatePersonDto,
  ) {
    return this.personsService.update(user.tenantId, id, dto, this.actor(user));
  }

  @Delete(':id')
  @Permissions('people:person:delete')
  @PeopleScope({ model: 'person' })
  remove(@CurrentUser() user: { sub: string; tenantId: string }, @Param('id') id: string) {
    return this.personsService.softDelete(user.tenantId, id, this.actor(user));
  }

  @Post(':id/restore')
  @Permissions('people:person:update')
  @PeopleScope({ model: 'person' })
  restore(@CurrentUser() user: { sub: string; tenantId: string }, @Param('id') id: string) {
    return this.personsService.restore(user.tenantId, id, this.actor(user));
  }

  @Get(':id/profile')
  @Permissions('people:person:read')
  @PeopleScope({ model: 'person' })
  getProfile(@CurrentUser() user: { sub: string; tenantId: string }, @Param('id') id: string) {
    return this.personsService.getProfile(user.tenantId, id);
  }

  @Put(':id/profile')
  @Permissions('people:person:update')
  @PeopleScope({ model: 'person' })
  updateProfile(
    @CurrentUser() user: { sub: string; tenantId: string },
    @Param('id') id: string,
    @Body() dto: PersonProfileDto,
  ) {
    return this.personsService.updateProfile(user.tenantId, id, dto, this.actor(user));
  }

  // ---- profile photo (reference-only; §5.9 assumption 7) -------------------

  @Post(':id/profile/photo')
  @Permissions('people:person:update')
  @PeopleScope({ model: 'person' })
  uploadPhoto(
    @CurrentUser() user: { sub: string; tenantId: string },
    @Param('id') id: string,
    @Body() dto: UploadProfilePhotoDto,
  ) {
    return this.personsService.uploadPhoto(user.tenantId, id, dto, this.actor(user));
  }

  @Delete(':id/profile/photo')
  @Permissions('people:person:update')
  @PeopleScope({ model: 'person' })
  removePhoto(
    @CurrentUser() user: { sub: string; tenantId: string },
    @Param('id') id: string,
  ) {
    return this.personsService.removePhoto(user.tenantId, id, this.actor(user));
  }

  @Get(':id/institutions')
  @Permissions('people:person:read')
  @PeopleScope({ model: 'person' })
  listInstitutions(@CurrentUser() user: { sub: string; tenantId: string }, @Param('id') id: string) {
    return this.personsService.listInstitutions(user.tenantId, id);
  }

  @Post(':id/institutions')
  @Permissions('people:person:update')
  @PeopleScope({ model: 'person' })
  assignInstitution(
    @CurrentUser() user: { sub: string; tenantId: string },
    @Param('id') id: string,
    @Body() dto: InstitutionAssignmentDto,
  ) {
    return this.personsService.assignInstitution(user.tenantId, id, dto, this.actor(user));
  }

  @Delete(':id/institutions/:institutionId')
  @Permissions('people:person:update')
  @PeopleScope({ model: 'person' })
  removeInstitution(
    @CurrentUser() user: { sub: string; tenantId: string },
    @Param('id') id: string,
    @Param('institutionId') institutionId: string,
  ) {
    return this.personsService.removeInstitution(user.tenantId, id, institutionId, this.actor(user));
  }
}