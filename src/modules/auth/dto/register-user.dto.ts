import { CreateUserDto } from '../../users/dto/create-user.dto';

/**
 * Public self-service registration payload (POST /api/v1/auth/register).
 * Reuses the same field policy as the legacy CreateUserDto.
 */
export class RegisterUserDto extends CreateUserDto {}
