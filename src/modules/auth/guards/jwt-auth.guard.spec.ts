import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators';

const handler = () => undefined;
const testController = class TestController {};

const buildContext = (): ExecutionContext =>
  ({
    getHandler: () => handler,
    getClass: () => testController,
    switchToHttp: () => ({ getRequest: () => ({}) }),
  }) as unknown as ExecutionContext;

const buildReflector = (
  isPublic: boolean | undefined,
): { reflector: Reflector; calls: unknown[][] } => {
  const calls: unknown[][] = [];
  const reflector = {
    getAllAndOverride: (...args: unknown[]) => {
      calls.push(args);
      return isPublic;
    },
  } as unknown as Reflector;
  return { reflector, calls };
};

describe('JwtAuthGuard', () => {
  it('should be defined', () => {
    const guard = new JwtAuthGuard(buildReflector(undefined).reflector);
    expect(guard).toBeDefined();
  });

  it('skips authentication for routes marked @Public()', () => {
    const guard = new JwtAuthGuard(buildReflector(true).reflector);
    expect(guard.canActivate(buildContext())).toBe(true);
  });

  it('reads the public metadata for handler and class', async () => {
    const { reflector, calls } = buildReflector(true);
    const guard = new JwtAuthGuard(reflector);
    const context = buildContext();

    await guard.canActivate(context);

    expect(calls).toEqual([[IS_PUBLIC_KEY, [handler, testController]]]);
  });
});
