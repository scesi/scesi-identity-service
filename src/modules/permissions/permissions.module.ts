import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission, RolePermission } from './entities';
import { PermissionService } from './permission.service';
import { RbacBootstrapService } from './rbac-bootstrap.service';
import { AuthRolesModule } from '../auth-roles/auth-roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, RolePermission]),
    AuthRolesModule,
  ],
  providers: [PermissionService, RbacBootstrapService],
  exports: [TypeOrmModule, PermissionService],
})
export class PermissionsModule {}
