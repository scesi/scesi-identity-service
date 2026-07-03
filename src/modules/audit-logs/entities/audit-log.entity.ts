import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { AuditAction } from '../value-objects/audit-action.value-object';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'token_id', nullable: true })
  tokenId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => RefreshToken, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'token_id' })
  refreshToken: RefreshToken;
}
