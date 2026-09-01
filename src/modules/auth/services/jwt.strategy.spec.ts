import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthTokenPayload } from './token-payload.service';

const buildConfigService = (secret: string): ConfigService =>
  ({ get: jest.fn().mockReturnValue(secret) }) as unknown as ConfigService;

describe('JwtStrategy', () => {
  it('should be defined', () => {
    const strategy = new JwtStrategy(buildConfigService('test-secret'));
    expect(strategy).toBeDefined();
  });

  it('returns the validated payload', () => {
    const strategy = new JwtStrategy(buildConfigService('test-secret'));

    const payload: AuthTokenPayload = {
      sub: 'user-1',
      email: 'test@example.com',
      academic_rank: 'JUNIOR',
      roles: ['ROLE_STUDENT'],
      permissions: ['chapa:open', 'xp:read'],
    };

    expect(strategy.validate(payload)).toEqual(payload);
  });
});
