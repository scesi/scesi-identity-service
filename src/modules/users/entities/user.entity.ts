import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserStatus } from '../value-objects/user-status.value-object';
import { ScesiRank } from '../value-objects/scesi-rank.value-object';
import { BaseAuditEntity } from '../../../core/base/entities/base-audit.entity';
import { UserRole } from '../../auth-roles/entities/user-role.entity';

@Entity('users')
export class User extends BaseAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({
    name: 'academic_ranck',
    type: 'enum',
    enum: ScesiRank,
    default: ScesiRank.POSTULANTE,
  })
  academicRanck: ScesiRank;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDIENTE,
  })
  status: UserStatus;

  @OneToMany(() => UserRole, (userRole) => userRole.user, {
    onDelete: 'CASCADE',
  })
  roles: UserRole[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;
}
