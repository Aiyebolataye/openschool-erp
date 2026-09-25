import { Module } from '@nestjs/common';
import { PeopleScopeGuard } from './people-scope.guard';
import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { ParentsController } from './parents.controller';
import { ParentsService } from './parents.service';
import { GuardiansController } from './guardians.controller';
import { GuardiansService } from './guardians.service';
import { EmergencyContactsController } from './emergency-contacts.controller';
import { EmergencyContactsService } from './emergency-contacts.service';
import { RelationshipsController } from './relationships.controller';
import { RelationshipsService } from './relationships.service';
import { ApplicantsController } from './applicants.controller';
import { ApplicantsService } from './applicants.service';
import { PeopleDocumentsController } from './people-documents.controller';
import { PeopleDocumentsService } from './people-documents.service';
import { PeopleMergeController } from './people-merge.controller';
import { PeopleMergeService } from './people-merge.service';

@Module({
  controllers: [
    PersonsController,
    StudentsController,
    StaffController,
    ParentsController,
    GuardiansController,
    EmergencyContactsController,
    RelationshipsController,
    ApplicantsController,
    PeopleDocumentsController,
    PeopleMergeController,
  ],
  providers: [
    PersonsService,
    StudentsService,
    StaffService,
    ParentsService,
    GuardiansService,
    EmergencyContactsService,
    RelationshipsService,
    ApplicantsService,
    PeopleDocumentsService,
    PeopleMergeService,
    PeopleScopeGuard,
  ],
  exports: [
    PersonsService,
    StudentsService,
    StaffService,
    ParentsService,
    GuardiansService,
    EmergencyContactsService,
    RelationshipsService,
    ApplicantsService,
    PeopleDocumentsService,
    PeopleMergeService,
  ],
})
export class PeopleModule {}