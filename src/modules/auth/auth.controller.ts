import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { JwtAuthGuard } from './services/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
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
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto.refresh_token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Body() refreshDto: RefreshDto) {
    await this.authService.revokeCurrent(refreshDto.refresh_token);
    return { success: true };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logoutAll(@Req() req: unknown) {
    const user = req as { user: { sub: string } };
    await this.authService.revokeAll(user.user.sub);
    return { success: true };
  }
}
