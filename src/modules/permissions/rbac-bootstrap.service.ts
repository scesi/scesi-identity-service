import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PERMISSIONS } from './constants';
import { ROLES } from '../auth-roles/constants';

/**
 * Startup bootstrap for the RBAC seed data:
 * ensures the `users:create` permission exists and is linked to
 * `ROLE_ADMIN`. Log-and-continue: a failure here must not crash the app.
 */
@Injectable()
export class RbacBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RbacBootstrapService.name);

  constructor(private readonly permissionService: PermissionService) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const [resource, action] = PERMISSIONS.USERS_CREATE.split(':');
      const permission = await this.permissionService.ensurePermission(
        resource,
        action,
      );
      await this.permissionService.ensureRolePermission(
        ROLES.ADMIN,
        permission,
      );
      this.logger.log(
        `RBAC bootstrap complete: ${PERMISSIONS.USERS_CREATE} linked to ${ROLES.ADMIN}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(`RBAC bootstrap failed: ${message}`);
    }
  }
}
