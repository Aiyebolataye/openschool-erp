import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import { PeopleMergeService, ActorContext } from './people-merge.service';
import {
  ListMergeHistoryQueryDto,
  ListMergeSuggestionsQueryDto,
  MergePeopleDto,
} from './dto/merge.dto';

interface MergeUser {
  sub: string;
  tenantId: string;
}

/**
 * Collection-level merge endpoints (spec §10.3 Person Merge). These routes
 * carry no `:id`: the PeopleScopeGuard short-circuits and the service enforces
 * same-tenant resolution from trusted state. Admin-only (`people:person:merge`
 * is granted exclusively to admin roles).
 */
@ApiTags('people')
@ApiBearerAuth()
@Controller('people/merge')
@UseGuards(AuthGuard('jwt'), PermissionGuard, PeopleScopeGuard)
export class PeopleMergeController {
  constructor(private readonly peopleMergeService: PeopleMergeService) {}

  private actor(user: MergeUser): ActorContext {
    return { id: user.sub };
  }

  @Get('suggestions')
  @Permissions('people:person:merge')
  @PeopleScope({ model: 'person' })
  suggestions(
    @CurrentUser() user: MergeUser,
    @Query() query: ListMergeSuggestionsQueryDto,
  ) {
    return this.peopleMergeService.getSuggestions(user.tenantId, query);
  }

  @Post()
  @Permissions('people:person:merge')
  @HttpCode(HttpStatus.OK)
  @PeopleScope({ model: 'person' })
  merge(@CurrentUser() user: MergeUser, @Body() dto: MergePeopleDto) {
    return this.peopleMergeService.mergePeople(user.tenantId, dto, this.actor(user));
  }

  @Get('history')
  @Permissions('people:person:merge')
  @PeopleScope({ model: 'person' })
  history(@CurrentUser() user: MergeUser, @Query() query: ListMergeHistoryQueryDto) {
    return this.peopleMergeService.getMergeHistory(user.tenantId, query);
  }
}