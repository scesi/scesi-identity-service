import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  /**
   * User email (unique)
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * User first name
   */
  @IsString()
  @IsNotEmpty()
  firstName: string;

  /**
   * User last name
   */
  @IsString()
  @IsNotEmpty()
  lastName: string;

  /**
   * User password (must meet security requirements)
   */
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
