import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key marking a route as public (bypasses JwtAuthGuard and RBAC guards).
 */
export const IS_PUBLIC_KEY = 'rbac:public';

/**
 * Marks a route handler or controller as public: the global authentication
 * guard and the RBAC guards skip it entirely.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
