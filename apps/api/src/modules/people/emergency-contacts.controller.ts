import {
  Body,
  Controller,
  Delete,
  Get,
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
import { EmergencyContactsService, ActorContext } from './emergency-contacts.service';
import {
  CreateEmergencyContactDto,
  ListEmergencyContactsQueryDto,
  UpdateEmergencyContactDto,
} from './dto/emergency-contact.dto';

interface EmergencyContactUser {
  sub: string;
  tenantId: string;
  institutionId?: string;
}

@ApiTags('people')
@ApiBearerAuth()
@Controller('people/persons/:personId/emergency-contacts')
@UseGuards(AuthGuard('jwt'), PermissionGuard, PeopleScopeGuard)
export class EmergencyContactsController {
  constructor(private readonly emergencyContactsService: EmergencyContactsService) {}

  private actor(user: EmergencyContactUser): ActorContext {
    return { id: user.sub };
  }

  @Get()
  @Permissions('people:emergency_contact:list')
  @PeopleScope({ model: 'emergencyContact' })
  list(
    @CurrentUser() user: EmergencyContactUser,
    @Param('personId') personId: string,
    @Query() query: ListEmergencyContactsQueryDto,
  ) {
    return this.emergencyContactsService.listContacts(user.tenantId, personId, query);
  }

  @Post()
  @Permissions('people:emergency_contact:create')
  @PeopleScope({ model: 'emergencyContact' })
  create(
    @CurrentUser() user: EmergencyContactUser,
    @Param('personId') personId: string,
    @Body() dto: CreateEmergencyContactDto,
  ) {
    return this.emergencyContactsService.createContact(user.tenantId, personId, dto, this.actor(user));
  }

  @Get(':id')
  @Permissions('people:emergency_contact:read')
  @PeopleScope({ model: 'emergencyContact' })
  findOne(
    @CurrentUser() user: EmergencyContactUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.emergencyContactsService.findOne(user.tenantId, personId, id);
  }

  @Put(':id')
  @Permissions('people:emergency_contact:update')
  @PeopleScope({ model: 'emergencyContact' })
  update(
    @CurrentUser() user: EmergencyContactUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmergencyContactDto,
  ) {
    return this.emergencyContactsService.updateContact(user.tenantId, personId, id, dto, this.actor(user));
  }

  @Delete(':id')
  @Permissions('people:emergency_contact:delete')
  @PeopleScope({ model: 'emergencyContact' })
  remove(
    @CurrentUser() user: EmergencyContactUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.emergencyContactsService.removeContact(user.tenantId, personId, id, this.actor(user));
  }
}
