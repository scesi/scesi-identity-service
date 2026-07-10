import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('xp_rules')
export class XpRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string;

  @Column()
  activity: string;

  @Column({ name: 'sub_activity' })
  subActivity: string;

  @Column({ name: 'base_points', default: 0 })
  basePoints: number;

  @Column({ nullable: true })
  observation: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
