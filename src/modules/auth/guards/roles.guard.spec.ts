import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators';

const handler = () => undefined;
const testController = class TestController {};

const buildContext = (user: { roles?: string[] } = {}): ExecutionContext =>
  ({
    getHandler: () => handler,
    getClass: () => testController,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

const buildReflector = (
  requiredRoles: string[] | undefined,
): { reflector: Reflector; calls: unknown[][] } => {
  const calls: unknown[][] = [];
  const reflector = {
    getAllAndOverride: (...args: unknown[]) => {
      calls.push(args);
      return requiredRoles;
    },
  } as unknown as Reflector;
  return { reflector, calls };
};

describe('RolesGuard', () => {
  it('should be defined', () => {
    expect(new RolesGuard(buildReflector(undefined).reflector)).toBeDefined();
  });

  it('allows the request when the user has a required role', () => {
    const guard = new RolesGuard(buildReflector(['ROLE_ADMIN']).reflector);
    expect(
      guard.canActivate(buildContext({ roles: ['ROLE_MEMBER', 'ROLE_ADMIN'] })),
    ).toBe(true);
  });

  it('throws ForbiddenException when the user lacks every required role', () => {
    const guard = new RolesGuard(
      buildReflector(['ROLE_ADMIN', 'ROLE_DIRECTIVA']).reflector,
    );
    expect(() =>
      guard.canActivate(buildContext({ roles: ['ROLE_MEMBER'] })),
    ).toThrow('Insufficient roles to access this resource');
  });

  it('throws ForbiddenException when the user has no roles claim', () => {
    const guard = new RolesGuard(buildReflector(['ROLE_ADMIN']).reflector);
    expect(() => guard.canActivate(buildContext({}))).toThrow(
      'Insufficient roles to access this resource',
    );
  });

  it('passes through when no roles metadata is declared', () => {
    const guard = new RolesGuard(buildReflector(undefined).reflector);
    expect(guard.canActivate(buildContext({ roles: [] }))).toBe(true);
  });

  it('passes through when the roles metadata is an empty array', () => {
    const guard = new RolesGuard(buildReflector([]).reflector);
    expect(guard.canActivate(buildContext({}))).toBe(true);
  });

  it('reads metadata via the reflector for handler and class', () => {
    const { reflector, calls } = buildReflector(['ROLE_ADMIN']);
    const guard = new RolesGuard(reflector);
    const context = buildContext({ roles: ['ROLE_ADMIN'] });

    guard.canActivate(context);

    expect(calls).toEqual([[ROLES_KEY, [handler, testController]]]);
  });
});
