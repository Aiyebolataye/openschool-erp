export const InstitutionEvents = {
  Created: 'institution.created',
  Updated: 'institution.updated',
  Activated: 'institution.activated',
  Deactivated: 'institution.deactivated',
  Provisioned: 'institution.provisioned',
  Suspended: 'institution.suspended',
  Restored: 'institution.restored',
  Archived: 'institution.archived',
  Deleted: 'institution.deleted',
  ConfigurationChanged: 'institution.configuration.changed',
  ConfigurationRemoved: 'institution.configuration.removed',
  SettingChanged: 'institution.setting.changed',
  SettingRemoved: 'institution.setting.removed',
} as const;

export type InstitutionEventKey = (typeof InstitutionEvents)[keyof typeof InstitutionEvents];
