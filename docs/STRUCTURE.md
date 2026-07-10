# Estructura del Proyecto - NestJS + TypeORM

## Estructura Final (Feature-First)

```
src/
├── modules/                        # Módulos de negocio (Feature-First)
│   │
│   ├── users/                      # Feature: Gestión de usuarios
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   └── index.ts
│   │   ├── value-objects/
│   │   │   ├── user-status.value-object.ts
│   │   │   ├── scesi-rank.value-object.ts
│   │   │   └── index.ts
│   │   └── users.module.ts
│   │
│   ├── auth/                       # Feature: Autenticación
│   │   ├── entities/
│   │   │   ├── refresh-token.entity.ts
│   │   │   └── index.ts
│   │   └── auth.module.ts
│   │
│   ├── audit-logs/                 # Feature: Auditoría
│   │   ├── entities/
│   │   │   ├── audit-log.entity.ts
│   │   │   └── index.ts
│   │   ├── value-objects/
│   │   │   ├── audit-action.value-object.ts
│   │   │   └── index.ts
│   │   └── audit-logs.module.ts
│   │
│   ├── auth-roles/                 # Feature: Roles
│   │   ├── entities/
│   │   │   ├── auth-role.entity.ts
│   │   │   ├── user-role.entity.ts
│   │   │   └── index.ts
│   │   └── auth-roles.module.ts
│   │
│   ├── permissions/                # Feature: Permisos
│   │   ├── entities/
│   │   │   ├── permission.entity.ts
│   │   │   ├── role-permission.entity.ts
│   │   │   └── index.ts
│   │   └── permissions.module.ts
│   │
│   ├── xp/                         # Feature: Sistema XP
│   │   ├── entities/
│   │   │   ├── xp-rule.entity.ts
│   │   │   ├── xp-history.entity.ts
│   │   │   └── index.ts
│   │   └── xp.module.ts
│   │
│   └── refresh-tokens/             # Feature: Refresh Tokens
│       └── refresh-tokens.module.ts
│
├── migrations/                      # Migraciones TypeORM
│   └── 1783110575654-InitialMigration.ts
│
├── app.module.ts                    # Módulo principal
├── main.ts                          # Entry point
└── data-source.ts                   # TypeORM CLI
```

## Principios de Diseño Aplicados

### 1. **Feature-First Architecture** ✅
Cada característica de negocio tiene su propio módulo con:
- Entidades relacionadas
- Value Objects (enums) específicos
- Controladores, servicios y DTOs (pendientes)

### 2. **Entidades en sus Módulos** ✅
- `User` → `modules/users/entities/`
- `RefreshToken` → `modules/auth/entities/`
- `AuditLog` → `modules/audit-logs/entities/`
- `AuthRole`, `UserRole` → `modules/auth-roles/entities/`
- `Permission`, `RolePermission` → `modules/permissions/entities/`
- `XpRule`, `XpHistory` → `modules/xp/entities/`

### 3. **Value Objects por Dominio** ✅
- **Users**: `UserStatus`, `ScesiRank`
- **Audit**: `AuditAction`
- **Compartidos**: Se quedan en `shared/` solo si son usados por múltiples módulos

### 4. **Módulos Autocontenidos**
Cada módulo importa solo lo que necesita:
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule],
})
export class UsersModule {}
```

### 5. **Sin Core/Database Module** ✅
TypeORM se configura directamente en `app.module.ts` con `TypeOrmModule.forRoot()`.
No es necesario un módulo de base de datos separado.

## Scripts Disponibles

```bash
# Desarrollo
pnpm start:dev          # NestJS con watch
pnpm build              # Compilar TypeScript
pnpm lint               # Eslint

# Base de datos
pnpm db:migrate:generate  # Generar migración
pnpm db:migrate:run       # Ejecutar migraciones
pnpm db:migrate:revert    # Revertir migración
```

## Entidades por Dominio

| Dominio | Entidades | Value Objects |
|---------|-----------|---------------|
| `users` | User | UserStatus, ScesiRank |
| `auth` | RefreshToken | - |
| `audit-logs` | AuditLog | AuditAction |
| `auth-roles` | AuthRole, UserRole | - |
| `permissions` | Permission, RolePermission | - |
| `xp` | XpRule, XpHistory | - |

## Variables de Entorno

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=identity
NODE_ENV=development
```

## Referencias

- [NestJS Best Practices 2026](https://encore.dev/articles/nestjs-project-structure-best-practices)
- [Feature-First Architecture](https://medium.com/@rahmounidev/architecting-a-scalable-nestjs-application-with-a-feature-first-approach-092234485a51)
- [NestJS Modular Architecture](https://capitalcompute.com/building-a-modular-and-maintainable-backend-with-nestjs-a-practical-guide)
