import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'User email', example: 'alumno@est.umss.edu' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password', example: 'Passw0rd!x' })
  @IsNotEmpty()
  @MinLength(1)
  password: string;

  @ApiPropertyOptional({
    description: 'Optional device identifier for session tracking',
    example: 'android-device-abc123',
  })
  @IsString()
  @IsOptional()
  deviceInfo?: string;
}
