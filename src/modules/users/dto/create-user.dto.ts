import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  /**
   * User email (unique)
   */
  @ApiProperty({
    description: 'User email (unique)',
    example: 'alumno@est.umss.edu',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * User first name
   */
  @ApiProperty({ description: 'First name', example: 'Ana' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  /**
   * User last name
   */
  @ApiProperty({ description: 'Last name', example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  /**
   * User password (must meet security requirements)
   */
  @ApiProperty({
    description:
      'Password. Minimum 8 characters with at least one uppercase letter, one lowercase letter, one digit, and one special character.',
    example: 'Passw0rd!x',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  @Matches(/.*[A-Z].*/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/.*[a-z].*/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/.*\d.*/, {
    message: 'Password must contain at least one digit',
  })
  @Matches(/.*[^A-Za-z0-9].*/, {
    message: 'Password must contain at least one special character',
  })
  password: string;
}
