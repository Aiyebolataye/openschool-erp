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
import { ParentsService, ActorContext } from './parents.service';
import { CreateParentDto, ListParentsQueryDto, UpdateParentDto } from './dto/parent.dto';

interface ParentUser {
  sub: string;
  tenantId: string;
  institutionId?: string;
}

@ApiTags('people')
@ApiBearerAuth()
@Controller('people/persons/:personId/parents')
@UseGuards(AuthGuard('jwt'), PermissionGuard, PeopleScopeGuard)
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  private actor(user: ParentUser): ActorContext {
    return { id: user.sub };
  }

  @Get()
  @Permissions('people:parent:list')
  @PeopleScope({ model: 'parent' })
  list(
    @CurrentUser() user: ParentUser,
    @Param('personId') personId: string,
    @Query() query: ListParentsQueryDto,
  ) {
    return this.parentsService.listParents(user.tenantId, user.institutionId, personId, query);
  }

  @Post()
  @Permissions('people:parent:create')
  @PeopleScope({ model: 'parent' })
  create(
    @CurrentUser() user: ParentUser,
    @Param('personId') personId: string,
    @Body() dto: CreateParentDto,
  ) {
    return this.parentsService.createParent(user.tenantId, user.institutionId, personId, dto, this.actor(user));
  }

  @Get(':id')
  @Permissions('people:parent:read')
  @PeopleScope({ model: 'parent' })
  findOne(
    @CurrentUser() user: ParentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.parentsService.findOne(user.tenantId, user.institutionId, personId, id);
  }

  @Put(':id')
  @Permissions('people:parent:update')
  @PeopleScope({ model: 'parent' })
  update(
    @CurrentUser() user: ParentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: UpdateParentDto,
  ) {
    return this.parentsService.updateParent(user.tenantId, user.institutionId, personId, id, dto, this.actor(user));
  }

  @Delete(':id')
  @Permissions('people:parent:delete')
  @PeopleScope({ model: 'parent' })
  remove(
    @CurrentUser() user: ParentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.parentsService.softDeleteParent(user.tenantId, user.institutionId, personId, id, this.actor(user));
  }
}