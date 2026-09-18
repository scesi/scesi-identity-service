import { ApiProperty } from '@nestjs/swagger';

/**
 * Documentation model for login/refresh responses.
 * Mirrors the runtime `AuthTokenPair` returned by the auth service.
 * Not used for request validation.
 */
export class AuthTokensResponseDto {
  @ApiProperty({
    description:
      'JWT access token. Send it as `Authorization: Bearer <token>` on protected routes. Expires in 15 minutes (JWT_EXPIRES_IN).',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description:
      'Opaque refresh token. Store it securely and exchange it via POST /auth/refresh for a new token pair (rotation invalidates the old one).',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  refresh_token: string;
}
