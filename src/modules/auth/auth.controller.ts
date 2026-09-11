import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { UsersService } from '../users/users.service';
import { Public } from './decorators';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterUserDto } from './dto/register-user.dto';

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
  async register(@Body() registerDto: RegisterUserDto) {
    return this.usersService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
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
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto.refresh_token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() refreshDto: RefreshDto) {
    await this.authService.revokeCurrent(refreshDto.refresh_token);
    return { success: true };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(@Req() req: unknown) {
    const user = req as { user: { sub: string } };
    await this.authService.revokeAll(user.user.sub);
    return { success: true };
  }
}
