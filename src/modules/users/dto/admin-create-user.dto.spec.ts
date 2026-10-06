import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AdminCreateUserDto } from './admin-create-user.dto';

const validateDto = async (dto: Partial<AdminCreateUserDto>) =>
  validate(plainToInstance(AdminCreateUserDto, dto));

const base = {
  email: 'a@b.com',
  firstName: 'Ana',
  lastName: 'Pérez',
  password: 'Passw0rd!x',
};

describe('AdminCreateUserDto', () => {
  it('accepts a payload without role', async () => {
    expect(await validateDto(base)).toHaveLength(0);
  });

  it('accepts each whitelisted role', async () => {
    for (const role of [
      'ROLE_MEMBER',
      'ROLE_STUDENT',
      'ROLE_ADMIN',
      'ROLE_DIRECTIVA',
    ] as const) {
      expect(await validateDto({ ...base, role })).toHaveLength(0);
    }
  });

  it('rejects a role outside the whitelist', async () => {
    const errors = await validateDto({
      ...base,
      role: 'ROLE_SUPERUSER' as never,
    });
    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('rejects a non-string role', async () => {
    const errors = await validateDto({ ...base, role: 42 as never });
    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('keeps the base user validation rules', async () => {
    const errors = await validateDto({ ...base, password: 'abc' });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});
