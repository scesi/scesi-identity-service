import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { QueryFailedError as TypeOrmQueryFailedError } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserRole } from '../auth-roles/entities/user-role.entity';
import { RoleService } from '../auth-roles/role.service';
import { UserStatus } from './value-objects/user-status.value-object';
import { ROLES } from '../auth-roles/constants';

const buildService = (
  overrides: {
    existingUser?: User | null;
    savedUser?: Partial<User>;
    saveError?: unknown;
  } = {},
) => {
  const usersRepository = {
    findOne: jest.fn().mockResolvedValue(overrides.existingUser ?? null),
    create: jest.fn((dto: Partial<User>) => ({ ...dto, id: 'user-1' })),
    save: jest.fn().mockImplementation((entity: Partial<User>) => {
      if (overrides.saveError) {
        throw overrides.saveError;
      }
      return { ...entity, ...overrides.savedUser };
    }),
  };

  const userRoleRepository = {
    create: jest.fn((dto: unknown) => dto),
    save: jest.fn().mockResolvedValue({ id: 'ur-1' }),
  };

  const passwordHashingService = {
    hash: jest.fn().mockResolvedValue('hashed-password'),
    verify: jest.fn().mockResolvedValue(true),
  };

  const roleService = {
    ensureRole: jest
      .fn()
      .mockResolvedValue({ id: 'role-1', name: ROLES.STUDENT }),
  };

  const service = new UsersService(
    usersRepository as unknown as Repository<User>,
    userRoleRepository as unknown as Repository<UserRole>,
    passwordHashingService,
    roleService as unknown as RoleService,
  );

  return {
    service,
    usersRepository,
    userRoleRepository,
    passwordHashingService,
    roleService,
  };
};

const uniqueViolation = () =>
  new TypeOrmQueryFailedError(
    'stmt',
    undefined,
    Object.assign(new Error('duplicate key'), { code: '23505' }),
  );

describe('UsersService.register', () => {
  it('throws ConflictException (409) when the email already exists', async () => {
    const { service } = buildService({
      existingUser: { id: 'u0', email: 'dup@gmail.com' } as User,
    });

    await expect(
      service.register({
        email: 'dup@gmail.com',
        firstName: 'F',
        lastName: 'L',
        password: 'Passw0rd!x',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('maps a concurrent unique violation (23505) to ConflictException', async () => {
    const { service } = buildService({ saveError: uniqueViolation() });

    await expect(
      service.register({
        email: 'race@gmail.com',
        firstName: 'F',
        lastName: 'L',
        password: 'Passw0rd!x',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('re-throws other database errors', async () => {
    const { service } = buildService({ saveError: new Error('db down') });

    await expect(
      service.register({
        email: 'x@gmail.com',
        firstName: 'F',
        lastName: 'L',
        password: 'Passw0rd!x',
      }),
    ).rejects.toThrow('db down');
  });

  it('assigns ROLE_STUDENT and PENDIENTE status for non-institutional emails', async () => {
    const { service, roleService, usersRepository, userRoleRepository } =
      buildService();

    const result = await service.register({
      email: 'persona@gmail.com',
      firstName: 'F',
      lastName: 'L',
      password: 'Passw0rd!x',
    });

    expect(roleService.ensureRole).toHaveBeenCalledWith(ROLES.STUDENT);
    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: UserStatus.PENDIENTE }),
    );
    expect(userRoleRepository.save).toHaveBeenCalled();
    expect(result).not.toHaveProperty('passwordHash');
    expect(result.email).toBe('persona@gmail.com');
  });

  it('assigns ACTIVO status for institutional emails (@est.umss.edu)', async () => {
    const { service, usersRepository } = buildService();

    await service.register({
      email: 'alumno@est.umss.edu',
      firstName: 'F',
      lastName: 'L',
      password: 'Passw0rd!x',
    });

    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: UserStatus.ACTIVO }),
    );
  });

  it('treats the institutional domain case-insensitively', async () => {
    const { service, usersRepository } = buildService();

    await service.register({
      email: 'Alumno@EST.UMSS.EDU',
      firstName: 'F',
      lastName: 'L',
      password: 'Passw0rd!x',
    });

    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: UserStatus.ACTIVO }),
    );
  });

  it('never returns the password hash', async () => {
    const { service } = buildService();

    const result = await service.register({
      email: 'ok@gmail.com',
      firstName: 'F',
      lastName: 'L',
      password: 'Passw0rd!x',
    });

    expect(result).not.toHaveProperty('passwordHash');
  });
});

describe('UsersService.createByAdmin', () => {
  it('defaults to ROLE_MEMBER when no role is provided', async () => {
    const { service, roleService } = buildService();

    await service.createByAdmin({
      email: 'admin-created@gmail.com',
      firstName: 'F',
      lastName: 'L',
      password: 'Passw0rd!x',
    });

    expect(roleService.ensureRole).toHaveBeenCalledWith(ROLES.MEMBER);
  });

  it('honors an explicit role override', async () => {
    const { service, roleService } = buildService();

    await service.createByAdmin({
      email: 'admin-created2@gmail.com',
      firstName: 'F',
      lastName: 'L',
      password: 'Passw0rd!x',
      role: ROLES.ADMIN,
    });

    expect(roleService.ensureRole).toHaveBeenCalledWith(ROLES.ADMIN);
  });

  it('applies institutional-domain status rules', async () => {
    const { service, usersRepository } = buildService();

    await service.createByAdmin({
      email: 'directivo@est.umss.edu',
      firstName: 'F',
      lastName: 'L',
      password: 'Passw0rd!x',
      role: ROLES.DIRECTIVA,
    });

    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: UserStatus.ACTIVO }),
    );
  });

  it('throws ConflictException (409) on duplicate email', async () => {
    const { service } = buildService({
      existingUser: { id: 'u0', email: 'dup-admin@gmail.com' } as User,
    });

    await expect(
      service.createByAdmin({
        email: 'dup-admin@gmail.com',
        firstName: 'F',
        lastName: 'L',
        password: 'Passw0rd!x',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('never returns the password hash', async () => {
    const { service } = buildService();

    const result = await service.createByAdmin({
      email: 'admin-ok@gmail.com',
      firstName: 'F',
      lastName: 'L',
      password: 'Passw0rd!x',
    });

    expect(result).not.toHaveProperty('passwordHash');
  });
});
