import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key holding the permission slugs required by a route.
 */
export const PERMISSIONS_KEY = 'rbac:permissions';

/**
 * Restricts a route to users whose JWT `permissions` claim contains at least
 * one of the given permission slugs (e.g. `users:create`).
 * Enforced by the global `PermissionsGuard`.
 */
export const Permissions = (...slugs: string[]) =>
  SetMetadata(PERMISSIONS_KEY, slugs);

/**
 * Sugar for requiring a single permission slug.
 */
export const RequirePermission = (slug: string) => Permissions(slug);
