import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Permissions } from '../auth/decorators';
import { PERMISSIONS } from '../permissions/constants';

/**
 * Admin user management (issue #34).
 * Requires a valid token AND the `users:create` permission (401/403 chain).
 */
@ApiTags('Admin — Users')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(PERMISSIONS.USERS_CREATE)
  @ApiOperation({
    summary: 'Create a member manually',
    description:
      'Creates a member bypassing the application process. Requires the users:create permission (held by ROLE_ADMIN). Default role is ROLE_MEMBER; an explicit whitelisted role may be provided. Institutional emails (@est.umss.edu) are ACTIVO, otherwise PENDIENTE.',
  })
  @ApiResponse({
    status: 201,
    description: 'Member created',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({
    status: 403,
    description: 'Missing users:create permission',
  })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async create(@Body() adminDto: AdminCreateUserDto) {
    return this.usersService.createByAdmin(adminDto);
  }
}
