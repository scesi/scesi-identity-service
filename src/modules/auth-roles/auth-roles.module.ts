import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthRole, UserRole } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([AuthRole, UserRole])],
  exports: [TypeOrmModule],
})
export class AuthRolesModule {}
