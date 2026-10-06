import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { QueryFailedError, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RoleService } from '../auth-roles/role.service';

const isUniqueViolation = (error: unknown): boolean =>
  error instanceof QueryFailedError &&
  (error.driverError as { code?: string } | undefined)?.code === '23505';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    private readonly roleService: RoleService,
  ) {}

  /**
   * Find a permission by (resource, action) or create it. Idempotent.
   */
  async ensurePermission(
    resource: string,
    action: string,
  ): Promise<Permission> {
    const existing = await this.permissionRepository.findOne({
      where: { resource, action },
    });
    if (existing) {
      return existing;
    }

    try {
      return await this.permissionRepository.save(
        this.permissionRepository.create({ resource, action }),
      );
    } catch (error) {
      if (isUniqueViolation(error)) {
        const retry = await this.permissionRepository.findOne({
          where: { resource, action },
        });
        if (retry) {
          return retry;
        }
      }
      throw error;
    }
  }

  /**
   * Link a role to a permission if the link does not exist yet. Idempotent.
   */
  async ensureRolePermission(
    roleName: string,
    permission: Permission,
  ): Promise<RolePermission> {
    const role = await this.roleService.ensureRole(roleName);

    const existing = await this.rolePermissionRepository.findOne({
      where: { roleId: role.id, permissionId: permission.id },
    });
    if (existing) {
      return existing;
    }

    try {
      return await this.rolePermissionRepository.save(
        this.rolePermissionRepository.create({
          idRolePermission: randomUUID(),
          roleId: role.id,
          permissionId: permission.id,
          role,
          permission,
        }),
      );
    } catch (error) {
      if (isUniqueViolation(error)) {
        const retry = await this.rolePermissionRepository.findOne({
          where: { roleId: role.id, permissionId: permission.id },
        });
        if (retry) {
          return retry;
        }
      }
      throw error;
    }
  }
}
