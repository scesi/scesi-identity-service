import { IsIn, IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ASSIGNABLE_ROLES } from '../../permissions/constants';

/**
 * Admin-created user payload (POST /api/v1/admin/users).
 * Optional `role` override, restricted to the assignable-role whitelist.
 */
export class AdminCreateUserDto extends CreateUserDto {
  @IsOptional()
  @IsString()
  @IsIn(ASSIGNABLE_ROLES, {
    message: 'role must be one of: ' + ASSIGNABLE_ROLES.join(', '),
  })
  role?: (typeof ASSIGNABLE_ROLES)[number];
}
