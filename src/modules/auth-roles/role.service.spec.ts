import { QueryFailedError } from 'typeorm';
import { RoleService } from './role.service';
import { AuthRole } from './entities/auth-role.entity';

const uniqueViolation = () =>
  new QueryFailedError(
    'stmt',
    undefined,
    Object.assign(new Error('duplicate key'), { code: '23505' }),
  );

describe('RoleService', () => {
  it('should be defined', () => {
    expect(new RoleService({} as never)).toBeDefined();
  });

  it('returns the existing role when the name is already registered', async () => {
    const existing = { id: 'role-1', name: 'ROLE_STUDENT' } as AuthRole;
    const repository = {
      findOne: jest.fn().mockResolvedValue(existing),
    };
    const service = new RoleService(repository as never);

    await expect(service.ensureRole('ROLE_STUDENT')).resolves.toBe(existing);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { name: 'ROLE_STUDENT' },
    });
  });

  it('creates the role when it does not exist', async () => {
    const created = { id: 'role-2', name: 'ROLE_MEMBER' } as AuthRole;
    const repository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn(() => ({ name: 'ROLE_MEMBER' })),
      save: jest.fn().mockResolvedValue(created),
    };
    const service = new RoleService(repository as never);

    await expect(service.ensureRole('ROLE_MEMBER')).resolves.toBe(created);
    expect(repository.save).toHaveBeenCalled();
  });

  it('re-selects the role on a concurrent unique violation (23505)', async () => {
    const winner = { id: 'role-3', name: 'ROLE_ADMIN' } as AuthRole;
    const repository = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(winner),
      create: jest.fn(() => ({ name: 'ROLE_ADMIN' })),
      save: jest.fn().mockRejectedValue(uniqueViolation()),
    };
    const service = new RoleService(repository as never);

    await expect(service.ensureRole('ROLE_ADMIN')).resolves.toBe(winner);
  });

  it('re-throws non-unique database errors', async () => {
    const repository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn(() => ({ name: 'X' })),
      save: jest.fn().mockRejectedValue(new Error('db down')),
    };
    const service = new RoleService(repository as never);

    await expect(service.ensureRole('X')).rejects.toThrow('db down');
  });
});
