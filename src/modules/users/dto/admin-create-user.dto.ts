import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ASSIGNABLE_ROLES } from '../../permissions/constants';

/**
 * Admin-created user payload (POST /api/v1/admin/users).
 * Optional `role` override, restricted to the assignable-role whitelist.
 */
export class AdminCreateUserDto extends CreateUserDto {
  @ApiPropertyOptional({
    description:
      'Role to assign. Defaults to ROLE_MEMBER when omitted. Must be one of the assignable roles.',
    enum: ASSIGNABLE_ROLES,
    example: 'ROLE_ADMIN',
  })
  @IsOptional()
  @IsString()
  @IsIn(ASSIGNABLE_ROLES, {
    message: 'role must be one of: ' + ASSIGNABLE_ROLES.join(', '),
  })
  role?: (typeof ASSIGNABLE_ROLES)[number];
}
