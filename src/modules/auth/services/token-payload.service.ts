import { Injectable } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  academic_rank: string;
  roles: string[];
  permissions: string[];
}

@Injectable()
export class TokenPayloadService {
  /**
   * Build the consolidated access-token payload for a user.
   *
   * The `roles` relation of the user MUST be populated by the caller.
   * Permissions are flattened to `"resource:action"` slugs and deduplicated
   * across every role the user holds.
   */
  build(user: User): AuthTokenPayload {
    const roles = new Set<string>();
    const permissions = new Set<string>();

    const userRoles = user.roles ?? [];

    for (const userRole of userRoles) {
      const role = userRole.role;
      if (!role) {
        continue;
      }

      if (role.name) {
        roles.add(role.name);
      }

      const rolePermissions = role.permissions ?? [];
      for (const rolePermission of rolePermissions) {
        const permission = rolePermission.permission;
        if (permission) {
          permissions.add(`${permission.resource}:${permission.action}`);
        }
      }
    }

    return {
      sub: user.id,
      email: user.email,
      academic_rank: user.academicRanck,
      roles: [...roles],
      permissions: [...permissions],
    };
  }
}
