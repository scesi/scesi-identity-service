import { IS_PUBLIC_KEY, Public } from './public.decorator';
import { ROLES_KEY, Roles } from './roles.decorator';
import {
  PERMISSIONS_KEY,
  Permissions,
  RequirePermission,
} from './permissions.decorator';

const handler = () => undefined;

describe('RBAC decorators', () => {
  describe('Public', () => {
    it('sets the public metadata flag to true', () => {
      Public()(handler);
      expect(Reflect.getMetadata(IS_PUBLIC_KEY, handler)).toBe(true);
    });
  });

  describe('Roles', () => {
    it('stores the required role names under the roles metadata key', () => {
      Roles('ROLE_ADMIN', 'ROLE_DIRECTIVA')(handler);
      expect(Reflect.getMetadata(ROLES_KEY, handler)).toEqual([
        'ROLE_ADMIN',
        'ROLE_DIRECTIVA',
      ]);
    });
  });

  describe('Permissions', () => {
    it('stores the required permission slugs under the permissions metadata key', () => {
      Permissions('users:create', 'users:read')(handler);
      expect(Reflect.getMetadata(PERMISSIONS_KEY, handler)).toEqual([
        'users:create',
        'users:read',
      ]);
    });
  });

  describe('RequirePermission', () => {
    it('is sugar for a single-slug Permissions decorator', () => {
      RequirePermission('users:create')(handler);
      expect(Reflect.getMetadata(PERMISSIONS_KEY, handler)).toEqual([
        'users:create',
      ]);
    });
  });
});
