# Guía de Migración de Prisma a TypeORM

## Resumen

Se ha completado la migración de Prisma a TypeORM en el proyecto. Este documento describe los cambios realizados y cómo usar la nueva configuración.

## Cambios Realizados

### 1. Dependencias

**Eliminadas:**
- `prisma`
- `@prisma/client`

**Agregadas:**
- `typeorm`
- `@nestjs/typeorm`
- `pg`
- `@types/pg`
- `@nestjs/config`

### 2. Estructura del Proyecto

```
src/
├── modules/
│   ├── users/
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   └── index.ts
│   │   ├── value-objects/
│   │   │   ├── user-status.value-object.ts
│   │   │   ├── scesi-rank.value-object.ts
│   │   │   └── index.ts
│   │   └── users.module.ts
│   │
│   ├── auth/
│   │   ├── entities/
│   │   │   ├── refresh-token.entity.ts
│   │   │   └── index.ts
│   │   └── auth.module.ts
│   │
│   ├── audit-logs/
│   │   ├── entities/
│   │   │   ├── audit-log.entity.ts
│   │   │   └── index.ts
│   │   ├── value-objects/
│   │   │   ├── audit-action.value-object.ts
│   │   │   └── index.ts
│   │   └── audit-logs.module.ts
│   │
│   ├── auth-roles/
│   │   ├── entities/
│   │   │   ├── auth-role.entity.ts
│   │   │   ├── user-role.entity.ts
│   │   │   └── index.ts
│   │   └── auth-roles.module.ts
│   │
│   ├── permissions/
│   │   ├── entities/
│   │   │   ├── permission.entity.ts
│   │   │   ├── role-permission.entity.ts
│   │   │   └── index.ts
│   │   └── permissions.module.ts
│   │
│   ├── xp/
│   │   ├── entities/
│   │   │   ├── xp-rule.entity.ts
│   │   │   ├── xp-history.entity.ts
│   │   │   └── index.ts
│   │   └── xp.module.ts
│   │
│   └── refresh-tokens/
│       └── refresh-tokens.module.ts
│
├── migrations/
│   └── 1783110575654-InitialMigration.ts
│
├── app.module.ts
├── main.ts
└── data-source.ts
```

### 3. Configuración de Variables de Entorno

El archivo `.env` ahora usa las siguientes variables:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=identity
NODE_ENV=development
```

### 4. Scripts Disponibles

```bash
# Generar nueva migración
pnpm db:migrate:generate

# Ejecutar migraciones
pnpm db:migrate:run

# Revertir migración
pnpm db:migrate:revert
```

## Entidades

Todas las entidades de Prisma han sido convertidas a entidades TypeORM:

| Prisma Model | TypeORM Entity | Tabla |
|--------------|----------------|-------|
| `User` | `User` | `users` |
| `RefreshToken` | `RefreshToken` | `refresh_tokens` |
| `AuditLog` | `AuditLog` | `audit_logs` |
| `AuthRole` | `AuthRole` | `auth_roles` |
| `RolePermission` | `RolePermission` | `role_permissions` |
| `Permission` | `Permission` | `permissions` |
| `UserRole` | `UserRole` | `user_roles` |
| `XpRule` | `XpRule` | `xp_rules` |
| `XpHistory` | `XpHistory` | `xp_history` |

## Enums

Los enums se mantienen con los mismos valores:

### AuditAction
- `LOGIN_SUCCESS`
- `LOGIN_FAILED`
- `REGISTER_SUCCESS`
- `TOKEN_REFRESH`
- `TOKEN_REVOKED`
- `LOGOUT`

### UserStatus
- `PENDIENTE`
- `ACTIVO`
- `INACTIVO`

### ScesiRank
- `POSTULANTE`
- `JUNIOR`
- `INTERMEDIO`
- `AVANZADO`
- `HONORARIO`

## Próximos Pasos

1. ~~Ejecutar migración inicial:~~ ✅ COMPLETADO
   ```bash
   pnpm db:migrate:run
   ```

2. **Crear servicios** para cada módulo (pendiente)

3. **Implementar controladores** para endpoints API (pendiente)

4. **Agregar DTOs** para validación de requests (pendiente)

## Uso de TypeORM en NestJS

### Inyección de Repositorios

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
```

### Módulos

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

## Consideraciones

- `synchronize: true` está habilitado solo en desarrollo. En producción, usa migraciones.
- Las relaciones cascada se mantienen según lo definido en el schema original.
- Los nombres de las tablas y columnas se mantienen consistentes con Prisma.
- **Feature-First**: Las entidades viven en sus módulos de dominio, no en carpetas compartidas.
- **Value Objects**: Enums específicos del dominio se mantienen en sus módulos (`UserStatus`, `ScesiRank` en users; `AuditAction` en audit-logs).

## Migración Realizada

La migración inicial `1783110575654-InitialMigration.ts` fue generada y ejecutada exitosamente, creando:

- ✅ 9 tablas en la base de datos
- ✅ 3 enums de PostgreSQL (`users_status_enum`, `users_academic_ranck_enum`, `audit_logs_action_enum`)
- ✅ Tabla de control de migraciones (`migrations`)
- ✅ Extensiones `uuid-ossp` habilitadas
