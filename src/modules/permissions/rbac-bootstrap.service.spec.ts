import { Logger } from '@nestjs/common';
import { RbacBootstrapService } from './rbac-bootstrap.service';
import { PERMISSIONS } from './constants';
import { ROLES } from '../auth-roles/constants';

describe('RbacBootstrapService', () => {
  // The bootstrap logs on purpose; keep that output out of the test report and
  // assert on the calls instead of on the console.
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeAll(() => {
    logSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    logSpy.mockClear();
    errorSpy.mockClear();
  });

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
    expect(logSpy).toHaveBeenCalledWith(
      'RBAC bootstrap complete: users:create linked to ROLE_ADMIN',
    );
    expect(errorSpy).not.toHaveBeenCalled();
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
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('logs and continues when the bootstrap fails (does not throw)', async () => {
    const permissionService = {
      ensurePermission: jest.fn().mockRejectedValue(new Error('db down')),
      ensureRolePermission: jest.fn(),
    };
    const service = new RbacBootstrapService(permissionService as never);

    await expect(service.onApplicationBootstrap()).resolves.toBeUndefined();
    expect(permissionService.ensureRolePermission).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('RBAC bootstrap failed: db down');
  });

  it('uses the shared permission slug constant', () => {
    expect(PERMISSIONS.USERS_CREATE).toBe('users:create');
  });
});
