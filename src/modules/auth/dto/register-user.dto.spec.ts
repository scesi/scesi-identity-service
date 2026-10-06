import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';

const validateDto = async (dto: Partial<RegisterUserDto>) =>
  validate(plainToInstance(RegisterUserDto, dto));

describe('RegisterUserDto', () => {
  it('accepts a valid payload', async () => {
    const errors = await validateDto({
      email: 'alumno@est.umss.edu',
      firstName: 'Ana',
      lastName: 'Pérez',
      password: 'Passw0rd!x',
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const errors = await validateDto({
      email: 'not-an-email',
      firstName: 'Ana',
      lastName: 'Pérez',
      password: 'Passw0rd!x',
    });
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('rejects a weak password (no special character)', async () => {
    const errors = await validateDto({
      email: 'a@b.com',
      firstName: 'Ana',
      lastName: 'Pérez',
      password: 'Password1',
    });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects a short password', async () => {
    const errors = await validateDto({
      email: 'a@b.com',
      firstName: 'Ana',
      lastName: 'Pérez',
      password: 'Ab1!x',
    });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects empty names', async () => {
    const errors = await validateDto({
      email: 'a@b.com',
      firstName: '',
      lastName: '',
      password: 'Passw0rd!x',
    });
    expect(errors.some((e) => e.property === 'firstName')).toBe(true);
    expect(errors.some((e) => e.property === 'lastName')).toBe(true);
  });
});
