import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { UsersService } from '../users/users.service';
import { Public } from './decorators';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthTokensResponseDto } from './dto/auth-tokens-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Public self-service registration (issue #33, HU2).
   * @param registerDto - Email, names and password
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Public()
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates an applicant profile with the default ROLE_STUDENT role. Institutional emails (@est.umss.edu) are activated immediately (ACTIVO); any other domain stays PENDIENTE until approval.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() registerDto: RegisterUserDto) {
    return this.usersService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Login with email and password',
    description:
      'Returns a JWT access token (15 min) and a refresh token. The access token carries the consolidated roles and permissions payload.',
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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Rotate the refresh token',
    description:
      'Exchanges a valid refresh token for a new token pair. The presented refresh token is invalidated (rotation).',
  })
  @ApiResponse({
    status: 200,
    description: 'New token pair issued',
    type: AuthTokensResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto.refresh_token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout (revoke current session)',
    description:
      'Revokes the refresh token of the current session. Requires a valid access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Session revoked',
    schema: { example: { success: true } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  async logout(@Body() refreshDto: RefreshDto) {
    await this.authService.revokeCurrent(refreshDto.refresh_token);
    return { success: true };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout from all sessions',
    description:
      'Revokes every refresh token of the authenticated user. Requires a valid access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'All sessions revoked',
    schema: { example: { success: true } },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  async logoutAll(@Req() req: unknown) {
    const user = req as { user: { sub: string } };
    await this.authService.revokeAll(user.user.sub);
    return { success: true };
  }
}
