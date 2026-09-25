import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { InstitutionsController } from './institutions.controller';
import { InstitutionConfigurationsController } from './institution-configurations.controller';
import { InstitutionSettingsController } from './institution-settings.controller';
import { InstitutionsService } from './institutions.service';
import { InstitutionConfigurationsService } from './institution-configurations.service';
import { InstitutionSettingsService } from './institution-settings.service';
import { InstitutionScopeGuard } from './institution-scope.guard';

@Module({
  imports: [AuditModule],
  controllers: [
    InstitutionsController,
    InstitutionConfigurationsController,
    InstitutionSettingsController,
  ],
  providers: [
    InstitutionsService,
    InstitutionConfigurationsService,
    InstitutionSettingsService,
    InstitutionScopeGuard,
  ],
  exports: [
    InstitutionsService,
    InstitutionConfigurationsService,
    InstitutionSettingsService,
  ],
})
export class InstitutionsModule {}