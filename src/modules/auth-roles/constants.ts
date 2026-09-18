/**
 * System role names (rows in `auth_roles`).
 */
export const ROLES = {
  STUDENT: 'ROLE_STUDENT',
  MEMBER: 'ROLE_MEMBER',
  ADMIN: 'ROLE_ADMIN',
  DIRECTIVA: 'ROLE_DIRECTIVA',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];
