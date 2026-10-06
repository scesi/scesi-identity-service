import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthRole, UserRole } from './entities';
import { RoleService } from './role.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuthRole, UserRole])],
  providers: [RoleService],
  exports: [TypeOrmModule, RoleService],
})
export class AuthRolesModule {}
