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
import { PeopleDocumentsService, ActorContext } from './people-documents.service';
import {
  CreatePeopleDocumentDto,
  ListPeopleDocumentsQueryDto,
  UpdatePeopleDocumentDto,
} from './dto/people-document.dto';

interface DocumentUser {
  sub: string;
  tenantId: string;
}

@ApiTags('people')
@ApiBearerAuth()
@Controller('people/persons/:personId/documents')
@UseGuards(AuthGuard('jwt'), PermissionGuard, PeopleScopeGuard)
export class PeopleDocumentsController {
  constructor(private readonly peopleDocumentsService: PeopleDocumentsService) {}

  private actor(user: DocumentUser): ActorContext {
    return { id: user.sub };
  }

  @Get()
  @Permissions('people:document:list')
  @PeopleScope({ model: 'peopleDocument' })
  list(
    @CurrentUser() user: DocumentUser,
    @Param('personId') personId: string,
    @Query() query: ListPeopleDocumentsQueryDto,
  ) {
    return this.peopleDocumentsService.listDocuments(user.tenantId, personId, query);
  }

  @Post()
  @Permissions('people:document:create')
  @PeopleScope({ model: 'peopleDocument' })
  create(
    @CurrentUser() user: DocumentUser,
    @Param('personId') personId: string,
    @Body() dto: CreatePeopleDocumentDto,
  ) {
    return this.peopleDocumentsService.createDocument(user.tenantId, personId, dto, this.actor(user));
  }

  @Get(':id')
  @Permissions('people:document:read')
  @PeopleScope({ model: 'peopleDocument' })
  findOne(
    @CurrentUser() user: DocumentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.peopleDocumentsService.findOne(user.tenantId, personId, id);
  }

  @Put(':id')
  @Permissions('people:document:update')
  @PeopleScope({ model: 'peopleDocument' })
  update(
    @CurrentUser() user: DocumentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePeopleDocumentDto,
  ) {
    return this.peopleDocumentsService.updateDocument(user.tenantId, personId, id, dto, this.actor(user));
  }

  @Delete(':id')
  @Permissions('people:document:delete')
  @PeopleScope({ model: 'peopleDocument' })
  remove(
    @CurrentUser() user: DocumentUser,
    @Param('personId') personId: string,
    @Param('id') id: string,
  ) {
    return this.peopleDocumentsService.removeDocument(user.tenantId, personId, id, this.actor(user));
  }
}