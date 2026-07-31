import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHashingService } from './password-hashing.service';

describe('PasswordHashingService', () => {
  let service: PasswordHashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordHashingService],
    }).compile();

    service = module.get<PasswordHashingService>(PasswordHashingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash()', () => {
    it('should hash a password and return a string', async () => {
      const password = 'TestPassword123!';
      const hash = await service.hash(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).toContain('$argon2id$');
    });

    it('should produce different hashes for the same password (due to salt)', async () => {
      const password = 'SamePassword123!';
      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should hash password successfully', async () => {
      const hash = await service.hash('Test123!');
      expect(hash).toBeDefined();
    });
  });

  describe('verify()', () => {
    it('should return true for correct password', async () => {
      const password = 'SecurePassword456!';
      const hash = await service.hash(password);
      const result = await service.verify(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'SecurePassword456!';
      const hash = await service.hash(password);
      const result = await service.verify('WrongPassword', hash);

      expect(result).toBe(false);
    });

    it('should return false for invalid hash format', async () => {
      const result = await service.verify('Test123!', '$invalidhash');
      expect(result).toBe(false);
    });
  });
});
