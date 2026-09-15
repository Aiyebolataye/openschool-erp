import { SetMetadata } from '@nestjs/common';

export const OBJECT_SCOPE_KEY = 'objectScope';

export type ObjectScopeType =
  | 'tenant'       // object must belong to the caller's tenant
  | 'self'         // object must belong to the caller's userId + tenantId
  | 'institution'  // object must belong to the caller's institutionId + tenantId
  | 'none'         // no object-level check (public or pre-auth routes)
  | 'authOnly';    // authentication required, no object-scope check

export interface ObjectScopeOptions {
  type: ObjectScopeType;
  /** Prisma model name to look up (e.g. 'session', 'userInvitation') */
  model?: string;
}

export const ObjectScope = (options: ObjectScopeOptions) =>
  SetMetadata(OBJECT_SCOPE_KEY, options);
