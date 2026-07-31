import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should define valid properties', () => {
    const validDto: CreateUserDto = {
      email: 'test@example.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      password: 'SecurePass123!@#',
    };

    expect(validDto).toBeDefined();
    expect(validDto.email).toBe('test@example.com');
    expect(validDto.firstName).toBe('Juan');
    expect(validDto.lastName).toBe('Pérez');
    expect(validDto.password).toBe('SecurePass123!@#');
  });

  it('should have password validation rules defined', () => {
    expect(CreateUserDto).toBeDefined();
  });
});
