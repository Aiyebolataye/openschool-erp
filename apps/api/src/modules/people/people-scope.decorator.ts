import { SetMetadata } from '@nestjs/common';

export const PEOPLE_SCOPE_KEY = 'peopleScope';

export type PeopleScopeTarget =
  | 'person'
  | 'student'
  | 'staff'
  | 'parent'
  | 'guardian'
  | 'personRelationship'
  | 'emergencyContact'
  | 'applicant'
  | 'peopleDocument';

export interface PeopleScopeOptions {
  /**
   * People target model resolved from the route's `:id` parameter when present.
   * When no `:id` exists on the route the guard short-circuits and the
   * controller/service enforces ownership from trusted state.
   */
  model: PeopleScopeTarget;
}

export const PeopleScope = (options: PeopleScopeOptions) =>
  SetMetadata(PEOPLE_SCOPE_KEY, options);