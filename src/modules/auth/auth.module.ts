import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordHashingService } from './services/password-hashing.service';
import { TokenPayloadService } from './services/token-payload.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './services/jwt.strategy';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthRolesModule } from '../auth-roles/auth-roles.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([RefreshToken]),
    forwardRef(() => UsersModule),
    AuthRolesModule,
    PermissionsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret || !secret.trim()) {
          throw new Error(
            'JWT_SECRET is not configured; set a long random value (e.g. `openssl rand -hex 32`)',
          );
        }
        if (/change[-_]?me/i.test(secret)) {
          throw new Error(
            'JWT_SECRET is still set to a placeholder value; generate a real secret before starting',
          );
        }
        return {
          secret,
          signOptions: {
            expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ||
              '15m') as unknown as JwtModuleOptions['signOptions']['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PasswordHashingService,
    TokenPayloadService,
    RefreshTokenService,
    AuthService,
    JwtStrategy,
  ],
  exports: [PasswordHashingService, AuthService, JwtModule, JwtStrategy],
})
export class AuthModule {}
