import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { XpRule } from './xp-rule.entity';

@Entity('xp_history')
export class XpHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'rule_id' })
  ruleId: string;

  @Column()
  amount: number;

  @Column({ name: 'multiplier_applied', nullable: true, type: 'float' })
  multiplierApplied: number;

  @Column()
  reason: string;

  @Column({ name: 'allocated_by', nullable: true })
  allocatedBy: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => XpRule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rule_id' })
  rule: XpRule;
}
