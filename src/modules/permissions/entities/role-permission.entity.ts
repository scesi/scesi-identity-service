import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { AuthRole } from '../../auth-roles/entities/auth-role.entity';
import { Permission } from './permission.entity';

@Entity('role_permissions')
@Unique(['roleId', 'permissionId'])
export class RolePermission {
  @PrimaryColumn('uuid', { name: 'id_role_permission' })
  idRolePermission: string;

  @Column({ name: 'role_id' })
  roleId: string;

  @Column({ name: 'permission_id' })
  permissionId: string;

  @ManyToOne(() => AuthRole, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: AuthRole;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
