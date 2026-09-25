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
import { RelationshipsService, ActorContext } from './relationships.service';
import { CreateRelationshipDto, ListRelationshipsQueryDto, UpdateRelationshipDto } from './dto/relationship.dto';

interface RelationshipUser {
  sub: string;
  tenantId: string;
  institutionId?: string;
}

@ApiTags('people')
@ApiBearerAuth()
@Controller('people/persons/:personId/relationships')
@UseGuards(AuthGuard('jwt'), PermissionGuard, PeopleScopeGuard)
export class RelationshipsController {
  constructor(private readonly relationshipsService: RelationshipsService) {}

  private actor(user: RelationshipUser): ActorContext {
    return { id: user.sub };
  }

  @Get()
  @Permissions('people:relationship:list')
  @PeopleScope({ model: 'personRelationship' })
  list(
    @CurrentUser() user: RelationshipUser,
    @Param('personId') personId: string,
    @Query() query: ListRelationshipsQueryDto,
  ) {
    return this.relationshipsService.listRelationships(user.tenantId, user.institutionId, personId, query);
  }

  @Post()
  @Permissions('people:relationship:create')
  @PeopleScope({ model: 'personRelationship' })
  create(
    @CurrentUser() user: RelationshipUser,
    @Param('personId') personId: string,
    @Body() dto: CreateRelationshipDto,
  ) {
    return this.relationshipsService.createRelationship(user.tenantId, user.institutionId, personId, dto, this.actor(user));
  }

  @Get(':id')
  @Permissions('people:relationship:read')
  @PeopleScope({ model: 'personRelationship' })
  findOne(
    @CurrentUser() user: RelationshipUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.relationshipsService.findOne(user.tenantId, user.institutionId, personId, id);
  }

  @Put(':id')
  @Permissions('people:relationship:update')
  @PeopleScope({ model: 'personRelationship' })
  update(
    @CurrentUser() user: RelationshipUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRelationshipDto,
  ) {
    return this.relationshipsService.updateRelationship(user.tenantId, user.institutionId, personId, id, dto, this.actor(user));
  }

  @Delete(':id')
  @Permissions('people:relationship:delete')
  @PeopleScope({ model: 'personRelationship' })
  remove(
    @CurrentUser() user: RelationshipUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.relationshipsService.revokeRelationship(user.tenantId, user.institutionId, personId, id, this.actor(user));
  }
}