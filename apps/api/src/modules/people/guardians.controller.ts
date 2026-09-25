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
import { GuardiansService, ActorContext } from './guardians.service';
import { CreateGuardianDto, ListGuardiansQueryDto, UpdateGuardianDto } from './dto/guardian.dto';

interface GuardianUser {
  sub: string;
  tenantId: string;
  institutionId?: string;
}

@ApiTags('people')
@ApiBearerAuth()
@Controller('people/persons/:personId/guardians')
@UseGuards(AuthGuard('jwt'), PermissionGuard, PeopleScopeGuard)
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  private actor(user: GuardianUser): ActorContext {
    return { id: user.sub };
  }

  @Get()
  @Permissions('people:guardian:list')
  @PeopleScope({ model: 'guardian' })
  list(
    @CurrentUser() user: GuardianUser,
    @Param('personId') personId: string,
    @Query() query: ListGuardiansQueryDto,
  ) {
    return this.guardiansService.listGuardians(user.tenantId, user.institutionId, personId, query);
  }

  @Post()
  @Permissions('people:guardian:create')
  @PeopleScope({ model: 'guardian' })
  create(
    @CurrentUser() user: GuardianUser,
    @Param('personId') personId: string,
    @Body() dto: CreateGuardianDto,
  ) {
    return this.guardiansService.createGuardian(user.tenantId, user.institutionId, personId, dto, this.actor(user));
  }

  @Get(':id')
  @Permissions('people:guardian:read')
  @PeopleScope({ model: 'guardian' })
  findOne(
    @CurrentUser() user: GuardianUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.guardiansService.findOne(user.tenantId, user.institutionId, personId, id);
  }

  @Put(':id')
  @Permissions('people:guardian:update')
  @PeopleScope({ model: 'guardian' })
  update(
    @CurrentUser() user: GuardianUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGuardianDto,
  ) {
    return this.guardiansService.updateGuardian(user.tenantId, user.institutionId, personId, id, dto, this.actor(user));
  }

  @Delete(':id')
  @Permissions('people:guardian:delete')
  @PeopleScope({ model: 'guardian' })
  remove(
    @CurrentUser() user: GuardianUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.guardiansService.softDeleteGuardian(user.tenantId, user.institutionId, personId, id, this.actor(user));
  }
}