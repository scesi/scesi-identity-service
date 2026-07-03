import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission, RolePermission } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, RolePermission])],
  exports: [TypeOrmModule],
})
export class PermissionsModule {}
