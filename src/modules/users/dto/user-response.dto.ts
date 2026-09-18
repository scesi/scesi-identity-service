import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../value-objects/user-status.value-object';
import { ScesiRank } from '../value-objects/scesi-rank.value-object';

/**
 * Documentation model for user creation responses.
 * Mirrors the runtime response: the `User` entity without `passwordHash`.
 * Not used for request validation.
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'Unique user identifier (UUID)',
    example: 'f60c251b-c6ad-4e8a-8c17-b98b8e9341fe',
  })
  id: string;

  @ApiProperty({ description: 'User email', example: 'alumno@est.umss.edu' })
  email: string;

  @ApiProperty({ description: 'First name', example: 'Ana' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Pérez' })
  lastName: string;

  @ApiProperty({
    description: 'Academic rank',
    enum: ScesiRank,
    example: ScesiRank.POSTULANTE,
  })
  academicRanck: ScesiRank;

  @ApiProperty({
    description:
      'Account status. ACTIVO for institutional emails (@est.umss.edu), PENDIENTE otherwise',
    enum: UserStatus,
    example: UserStatus.PENDIENTE,
  })
  status: UserStatus;

  @ApiProperty({
    description: 'Creation timestamp (ISO 8601)',
    example: '2026-09-11T00:57:58.508Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp (ISO 8601)',
    example: '2026-09-11T00:57:58.508Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User who last updated the record (null if never)',
    nullable: true,
  })
  updatedBy: string | null;

  @ApiProperty({
    description: 'Soft-delete timestamp (null if active)',
    nullable: true,
  })
  deletedAt: Date | null;

  @ApiProperty({
    description: 'User who deleted the record (null if never)',
    nullable: true,
  })
  deletedBy: string | null;
}
