import { TokenPayloadService } from './token-payload.service';

describe('TokenPayloadService', () => {
  let service: TokenPayloadService;

  beforeEach(() => {
    service = new TokenPayloadService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('builds a payload with identity fields and empty arrays for a role-less user', () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      academicRanck: 'JUNIOR',
      roles: [],
    };

    const payload = service.build(user as never);

    expect(payload).toEqual({
      sub: 'user-1',
      email: 'test@example.com',
      academic_rank: 'JUNIOR',
      roles: [],
      permissions: [],
    });
  });

  it('flattens permissions across multiple roles', () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      academicRanck: 'JUNIOR',
      roles: [
        {
          role: {
            name: 'ROLE_A',
            permissions: [
              { permission: { resource: 'chapa', action: 'open' } },
            ],
          },
        },
        {
          role: {
            name: 'ROLE_B',
            permissions: [{ permission: { resource: 'xp', action: 'read' } }],
          },
        },
      ],
    };

    const payload = service.build(user as never);

    expect(payload.roles.sort()).toEqual(['ROLE_A', 'ROLE_B']);
    expect(payload.permissions.sort()).toEqual(['chapa:open', 'xp:read']);
  });

  it('deduplicates overlapping permissions across roles', () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      academicRanck: 'JUNIOR',
      roles: [
        {
          role: {
            name: 'ROLE_A',
            permissions: [
              { permission: { resource: 'chapa', action: 'open' } },
            ],
          },
        },
        {
          role: {
            name: 'ROLE_B',
            permissions: [
              { permission: { resource: 'chapa', action: 'open' } },
            ],
          },
        },
      ],
    };

    const payload = service.build(user as never);

    expect(payload.permissions).toEqual(['chapa:open']);
  });

  it('collects distinct role names only', () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      academicRanck: 'JUNIOR',
      roles: [
        { role: { name: 'ROLE_A', permissions: [] } },
        { role: { name: 'ROLE_A', permissions: [] } },
      ],
    };

    const payload = service.build(user as never);

    expect(payload.roles).toEqual(['ROLE_A']);
  });
});
