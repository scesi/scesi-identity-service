import {
  Controller,
  forwardRef,
  Inject,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/services/auth.service';
import { LoginDto } from '../auth/dto/login.dto';

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
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * User login endpoint. Thin wrapper over the auth login flow.
   * @param loginDto - Email, password and optional device info
   */
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
}
