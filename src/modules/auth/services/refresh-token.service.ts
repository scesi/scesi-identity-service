import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { RefreshToken } from '../entities/refresh-token.entity';

export interface RefreshRotation {
  userId: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getTtlDays(): number {
    return Number(
      this.configService.get<number>('REFRESH_TOKEN_TTL_DAYS') || 30,
    );
  }

  private buildExpiresAt(): Date {
    return new Date(Date.now() + this.getTtlDays() * 24 * 60 * 60 * 1000);
  }

  async issue(
    userId: string,
    userAgent?: string,
    deviceInfo?: string,
  ): Promise<string> {
    const token = randomBytes(48).toString('hex');
    const refreshToken = this.refreshTokenRepository.create({
      tokenHash: this.hashToken(token),
      userId,
      userAgent,
      deviceInfo,
      isRevoked: false,
      expiresAt: this.buildExpiresAt(),
    });
    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  async rotate(token: string): Promise<RefreshRotation> {
    const hash = this.hashToken(token);

    const existing = await this.refreshTokenRepository.findOne({
      where: { tokenHash: hash },
    });

    if (!existing) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (existing.isRevoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }
    if (existing.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Atomic conditional revocation: exactly one concurrent caller can flip
    // isRevoked from false to true; a loser updates zero rows and is rejected.
    const result = await this.refreshTokenRepository.update(
      { tokenHash: hash, isRevoked: false },
      { isRevoked: true },
    );
    if (result.affected === 0) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    const newToken = await this.issue(
      existing.userId,
      existing.userAgent,
      existing.deviceInfo,
    );
    return { userId: existing.userId, refreshToken: newToken };
  }

  async revoke(token: string): Promise<void> {
    const hash = this.hashToken(token);
    await this.refreshTokenRepository.update(
      { tokenHash: hash },
      { isRevoked: true },
    );
  }

  async revokeByDevice(userId: string, deviceInfo?: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, deviceInfo, isRevoked: false },
      { isRevoked: true },
    );
  }

  async revokeAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }
}
