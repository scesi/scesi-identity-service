import { RbacBootstrapService } from './rbac-bootstrap.service';
import { PERMISSIONS } from './constants';
import { ROLES } from '../auth-roles/constants';

describe('RbacBootstrapService', () => {
  it('ensures the users:create permission and links it to ROLE_ADMIN', async () => {
    const permission = { id: 'perm-1', resource: 'users', action: 'create' };
    const permissionService = {
      ensurePermission: jest.fn().mockResolvedValue(permission),
      ensureRolePermission: jest
        .fn()
        .mockResolvedValue({ idRolePermission: 'x' }),
    };
    const service = new RbacBootstrapService(permissionService as never);

    await service.onApplicationBootstrap();

    expect(permissionService.ensurePermission).toHaveBeenCalledWith(
      'users',
      'create',
    );
    expect(permissionService.ensureRolePermission).toHaveBeenCalledWith(
      ROLES.ADMIN,
      permission,
    );
  });

  it('is idempotent: a second run issues no new errors', async () => {
    const permissionService = {
      ensurePermission: jest.fn().mockResolvedValue({ id: 'perm-1' }),
      ensureRolePermission: jest
        .fn()
        .mockResolvedValue({ idRolePermission: 'x' }),
    };
    const service = new RbacBootstrapService(permissionService as never);

    await service.onApplicationBootstrap();
    await service.onApplicationBootstrap();

    expect(permissionService.ensurePermission).toHaveBeenCalledTimes(2);
    expect(permissionService.ensureRolePermission).toHaveBeenCalledTimes(2);
  });

  it('logs and continues when the bootstrap fails (does not throw)', async () => {
    const permissionService = {
      ensurePermission: jest.fn().mockRejectedValue(new Error('db down')),
      ensureRolePermission: jest.fn(),
    };
    const service = new RbacBootstrapService(permissionService as never);

    await expect(service.onApplicationBootstrap()).resolves.toBeUndefined();
    expect(permissionService.ensureRolePermission).not.toHaveBeenCalled();
  });

  it('uses the shared permission slug constant', () => {
    expect(PERMISSIONS.USERS_CREATE).toBe('users:create');
  });
});
