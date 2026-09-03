import { createHash } from 'crypto';
import { RefreshTokenService } from './refresh-token.service';

const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

const mockRepository = {
  create: jest.fn((data: Record<string, unknown>) => data),
  save: jest.fn().mockResolvedValue({}),
  findOne: jest.fn(),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('30'),
};

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RefreshTokenService(
      mockRepository as never,
      mockConfigService as never,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('issue()', () => {
    it('persists only the SHA-256 hash and returns the plaintext token', async () => {
      const token = await service.issue('user-1', 'ua', 'device');

      expect(typeof token).toBe('string');
      expect(token).toHaveLength(96);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);

      const created = mockRepository.create.mock.calls[0][0];
      expect(created.tokenHash).toBe(hashToken(token));
      expect(created.userId).toBe('user-1');
      expect(created.isRevoked).toBe(false);
      expect(created.deviceInfo).toBe('device');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('sets expiry based on the configured TTL', async () => {
      await service.issue('user-1');

      const created = mockRepository.create.mock.calls[0][0];
      const diffDays =
        ((created.expiresAt as Date).getTime() - Date.now()) /
        (24 * 60 * 60 * 1000);

      expect(diffDays).toBeCloseTo(30, 0);
    });
  });

  describe('rotate()', () => {
    it('revokes the old token atomically and issues a new one', async () => {
      const token = 'valid-token';
      mockRepository.findOne.mockResolvedValue({
        tokenHash: hashToken(token),
        userId: 'user-1',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000),
        userAgent: undefined,
        deviceInfo: undefined,
      });

      const result = await service.rotate(token);

      expect(result.userId).toBe('user-1');
      expect(result.refreshToken).toHaveLength(96);
      expect(mockRepository.update).toHaveBeenCalledWith(
        { tokenHash: hashToken(token), isRevoked: false },
        { isRevoked: true },
      );
    });

    it('allows exactly one winner when concurrent rotations race', async () => {
      const token = 'raced-token';
      mockRepository.findOne.mockResolvedValue({
        tokenHash: hashToken(token),
        userId: 'user-1',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000),
        userAgent: undefined,
        deviceInfo: undefined,
      });
      // First conditional update flips the row; the second sees zero rows.
      mockRepository.update
        .mockResolvedValueOnce({ affected: 1 })
        .mockResolvedValueOnce({ affected: 0 });

      const [winner, loser] = await Promise.allSettled([
        service.rotate(token),
        service.rotate(token),
      ]);

      expect(winner.status).toBe('fulfilled');
      if (winner.status === 'fulfilled') {
        expect(winner.value.refreshToken).toHaveLength(96);
      }
      expect(loser.status).toBe('rejected');
    });

    it('rejects an unknown token', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.rotate('unknown')).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('rejects a revoked token', async () => {
      mockRepository.findOne.mockResolvedValue({
        tokenHash: hashToken('revoked'),
        userId: 'user-1',
        isRevoked: true,
        expiresAt: new Date(Date.now() + 1000),
      });

      await expect(service.rotate('revoked')).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('rejects an expired token', async () => {
      mockRepository.findOne.mockResolvedValue({
        tokenHash: hashToken('expired'),
        userId: 'user-1',
        isRevoked: false,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.rotate('expired')).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('revoke()', () => {
    it('marks the matching token as revoked by hash', async () => {
      await service.revoke('some-token');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { tokenHash: hashToken('some-token') },
        { isRevoked: true },
      );
    });
  });

  describe('revokeByDevice()', () => {
    it('revokes active sessions for the user and device', async () => {
      await service.revokeByDevice('user-1', 'device');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { userId: 'user-1', deviceInfo: 'device', isRevoked: false },
        { isRevoked: true },
      );
    });
  });

  describe('revokeAll()', () => {
    it('revokes all active sessions for the user', async () => {
      await service.revokeAll('user-1');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { userId: 'user-1', isRevoked: false },
        { isRevoked: true },
      );
    });
  });
});
