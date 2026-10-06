/**
 * Permission slugs used across the platform (`resource:action`).
 */
export const PERMISSIONS = {
  USERS_CREATE: 'users:create',
} as const;

/**
 * Roles an admin may assign when creating a user.
 */
export const ASSIGNABLE_ROLES = [
  'ROLE_MEMBER',
  'ROLE_STUDENT',
  'ROLE_ADMIN',
  'ROLE_DIRECTIVA',
] as const;
