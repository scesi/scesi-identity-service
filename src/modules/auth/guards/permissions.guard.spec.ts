import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSIONS_KEY } from '../decorators';

const handler = () => undefined;
const testController = class TestController {};

const buildContext = (
  user: { permissions?: string[] } = {},
): ExecutionContext =>
  ({
    getHandler: () => handler,
    getClass: () => testController,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

const buildReflector = (
  requiredPermissions: string[] | undefined,
): { reflector: Reflector; calls: unknown[][] } => {
  const calls: unknown[][] = [];
  const reflector = {
    getAllAndOverride: (...args: unknown[]) => {
      calls.push(args);
      return requiredPermissions;
    },
  } as unknown as Reflector;
  return { reflector, calls };
};

describe('PermissionsGuard', () => {
  it('should be defined', () => {
    expect(
      new PermissionsGuard(buildReflector(undefined).reflector),
    ).toBeDefined();
  });

  it('allows the request when the user has a required permission', () => {
    const guard = new PermissionsGuard(
      buildReflector(['users:create']).reflector,
    );
    expect(
      guard.canActivate(
        buildContext({ permissions: ['xp:read', 'users:create'] }),
      ),
    ).toBe(true);
  });

  it('throws ForbiddenException when the user lacks every required permission', () => {
    const guard = new PermissionsGuard(
      buildReflector(['users:create']).reflector,
    );
    expect(() =>
      guard.canActivate(buildContext({ permissions: ['xp:read'] })),
    ).toThrow('Insufficient permissions to access this resource');
  });

  it('throws ForbiddenException when the user has no permissions claim', () => {
    const guard = new PermissionsGuard(
      buildReflector(['users:create']).reflector,
    );
    expect(() => guard.canActivate(buildContext({}))).toThrow(
      'Insufficient permissions to access this resource',
    );
  });

  it('passes through when no permission metadata is declared', () => {
    const guard = new PermissionsGuard(buildReflector(undefined).reflector);
    expect(guard.canActivate(buildContext({ permissions: [] }))).toBe(true);
  });

  it('passes through when the permission metadata is an empty array', () => {
    const guard = new PermissionsGuard(buildReflector([]).reflector);
    expect(guard.canActivate(buildContext({}))).toBe(true);
  });

  it('reads metadata via the reflector for handler and class', () => {
    const { reflector, calls } = buildReflector(['users:create']);
    const guard = new PermissionsGuard(reflector);
    const context = buildContext({ permissions: ['users:create'] });

    guard.canActivate(context);

    expect(calls).toEqual([[PERMISSIONS_KEY, [handler, testController]]]);
  });
});
