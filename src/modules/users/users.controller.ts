import {
  Controller,
  forwardRef,
  Inject,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AuthService } from '../auth/services/auth.service';
import { LoginDto } from '../auth/dto/login.dto';
import { AuthTokensResponseDto } from '../auth/dto/auth-tokens-response.dto';
import { Public } from '../auth/decorators';

@ApiTags('Users (legacy)')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   * Register a new user
   * @param createUserDto - User data and password
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Public()
  @ApiOperation({
    summary: 'Create a user (legacy)',
    description:
      'LEGACY endpoint, superseded by POST /auth/register. Kept for backward compatibility. Creates a user without role assignment; duplicate emails are rejected with 409.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * User login endpoint. Thin wrapper over the auth login flow.
   * @param loginDto - Email, password and optional device info
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'User login (legacy)',
    description:
      'LEGACY endpoint, superseded by POST /auth/login. Kept for backward compatibility. Returns the same token pair as the auth login endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token pair issued',
    type: AuthTokensResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(
      loginDto.email,
      loginDto.password,
      undefined,
      loginDto.deviceInfo,
    );
  }
}
