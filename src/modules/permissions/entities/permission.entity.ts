import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { BaseAuditEntity } from '../../../core/base/entities/base-audit.entity';

@Entity('permissions')
@Unique(['resource', 'action'])
export class Permission extends BaseAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  resource: string;

  @Column()
  action: string;
}
