import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { Permissions } from '../auth/decorators';
import { PERMISSIONS } from '../permissions/constants';

/**
 * Admin user management (issue #34).
 * Requires a valid token AND the `users:create` permission (401/403 chain).
 */
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(PERMISSIONS.USERS_CREATE)
  async create(@Body() adminDto: AdminCreateUserDto) {
    return this.usersService.createByAdmin(adminDto);
  }
}
