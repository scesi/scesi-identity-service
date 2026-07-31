import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordHashingService } from './services/password-hashing.service';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken])],
  providers: [PasswordHashingService],
  exports: [PasswordHashingService],
})
export class AuthModule {}
