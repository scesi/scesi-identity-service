import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key holding the role names required by a route.
 */
export const ROLES_KEY = 'rbac:roles';

/**
 * Restricts a route to users whose JWT `roles` claim contains at least one
 * of the given role names. Enforced by the global `RolesGuard`.
 */
export const Roles = (...roleNames: string[]) =>
  SetMetadata(ROLES_KEY, roleNames);
