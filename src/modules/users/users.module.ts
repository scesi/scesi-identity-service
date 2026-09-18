import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../auth-roles/entities/user-role.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminUsersController } from './admin-users.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthRolesModule } from '../auth-roles/auth-roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole]),
    forwardRef(() => AuthModule),
    AuthRolesModule,
  ],
  exports: [TypeOrmModule, UsersService],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
})
export class UsersModule {}
