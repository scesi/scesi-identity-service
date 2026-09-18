import { QueryFailedError } from 'typeorm';
import { PermissionService } from './permission.service';
import { Permission } from './entities/permission.entity';

const uniqueViolation = () =>
  new QueryFailedError(
    'stmt',
    undefined,
    Object.assign(new Error('duplicate key'), { code: '23505' }),
  );

describe('PermissionService', () => {
  it('should be defined', () => {
    expect(
      new PermissionService({} as never, {} as never, {} as never),
    ).toBeDefined();
  });

  it('returns the existing permission for (resource, action)', async () => {
    const existing = {
      id: 'perm-1',
      resource: 'users',
      action: 'create',
    } as Permission;
    const permissionRepository = {
      findOne: jest.fn().mockResolvedValue(existing),
    };
    const service = new PermissionService(
      permissionRepository as never,
      {} as never,
      {} as never,
    );

    await expect(service.ensurePermission('users', 'create')).resolves.toBe(
      existing,
    );
  });

  it('creates the permission when missing', async () => {
    const created = {
      id: 'perm-2',
      resource: 'xp',
      action: 'read',
    } as Permission;
    const permissionRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((dto: unknown) => dto),
      save: jest.fn().mockResolvedValue(created),
    };
    const service = new PermissionService(
      permissionRepository as never,
      {} as never,
      {} as never,
    );

    await expect(service.ensurePermission('xp', 'read')).resolves.toBe(created);
    expect(permissionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ resource: 'xp', action: 'read' }),
    );
  });

  it('re-selects the permission on a concurrent unique violation', async () => {
    const winner = { id: 'perm-3', resource: 'a', action: 'b' } as Permission;
    const permissionRepository = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(winner),
      create: jest.fn((dto: unknown) => dto),
      save: jest.fn().mockRejectedValue(uniqueViolation()),
    };
    const service = new PermissionService(
      permissionRepository as never,
      {} as never,
      {} as never,
    );

    await expect(service.ensurePermission('a', 'b')).resolves.toBe(winner);
  });

  it('ensureRolePermission links role and permission when missing', async () => {
    const role = { id: 'role-1', name: 'ROLE_ADMIN' };
    const permission = { id: 'perm-1', resource: 'users', action: 'create' };
    const link = {
      idRolePermission: 'x',
      roleId: 'role-1',
      permissionId: 'perm-1',
    };
    const rolePermissionRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((dto: unknown) => dto),
      save: jest.fn().mockResolvedValue(link),
    };
    const roleService = {
      ensureRole: jest.fn().mockResolvedValue(role),
    };
    const service = new PermissionService(
      {} as never,
      rolePermissionRepository as never,
      roleService as never,
    );

    await expect(
      service.ensureRolePermission('ROLE_ADMIN', permission as Permission),
    ).resolves.toBe(link);
    expect(roleService.ensureRole).toHaveBeenCalledWith('ROLE_ADMIN');
    expect(rolePermissionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ roleId: 'role-1', permissionId: 'perm-1' }),
    );
  });

  it('ensureRolePermission is idempotent when the link exists', async () => {
    const role = { id: 'role-1', name: 'ROLE_ADMIN' };
    const permission = { id: 'perm-1' };
    const existing = {
      idRolePermission: 'y',
      roleId: 'role-1',
      permissionId: 'perm-1',
    };
    const rolePermissionRepository = {
      findOne: jest.fn().mockResolvedValue(existing),
      save: jest.fn(),
    };
    const roleService = {
      ensureRole: jest.fn().mockResolvedValue(role),
    };
    const service = new PermissionService(
      {} as never,
      rolePermissionRepository as never,
      roleService as never,
    );

    await expect(
      service.ensureRolePermission('ROLE_ADMIN', permission as Permission),
    ).resolves.toBe(existing);
    expect(rolePermissionRepository.save).not.toHaveBeenCalled();
  });

  it('re-selects the link on a concurrent unique violation', async () => {
    const role = { id: 'role-1' };
    const permission = { id: 'perm-1' };
    const winner = { idRolePermission: 'z' };
    const rolePermissionRepository = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(winner),
      create: jest.fn((dto: unknown) => dto),
      save: jest.fn().mockRejectedValue(uniqueViolation()),
    };
    const roleService = {
      ensureRole: jest.fn().mockResolvedValue(role),
    };
    const service = new PermissionService(
      {} as never,
      rolePermissionRepository as never,
      roleService as never,
    );

    await expect(
      service.ensureRolePermission('R', permission as Permission),
    ).resolves.toBe(winner);
  });
});
