import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { RefreshTokenService } from './refresh-token.service';
import { TokenPayloadService } from './token-payload.service';

export interface AuthTokenPair {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly tokenPayloadService: TokenPayloadService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
    userAgent?: string,
    deviceInfo?: string,
  ): Promise<AuthTokenPair> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.usersService.verifyPassword(
      password,
      user.passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userWithRoles = await this.usersService.findByIdWithRoles(user.id);
    if (!userWithRoles) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = this.tokenPayloadService.build(userWithRoles);
    const access_token = this.jwtService.sign(payload);
    const refresh_token = await this.refreshTokenService.issue(
      user.id,
      userAgent,
      deviceInfo,
    );

    return { access_token, refresh_token };
  }

  async refresh(refreshToken: string): Promise<AuthTokenPair> {
    const { userId } = await this.refreshTokenService.rotate(refreshToken);

    const userWithRoles = await this.usersService.findByIdWithRoles(userId);
    if (!userWithRoles) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = this.tokenPayloadService.build(userWithRoles);
    const access_token = this.jwtService.sign(payload);
    const refresh_token = await this.refreshTokenService.issue(userId);

    return { access_token, refresh_token };
  }

  async revokeCurrent(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revoke(refreshToken);
  }

  async revokeAll(userId: string): Promise<void> {
    await this.refreshTokenService.revokeAll(userId);
  }
}
