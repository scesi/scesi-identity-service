import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('permissions')
@Unique(['resource', 'action'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  resource: string;

  @Column()
  action: string;
}
