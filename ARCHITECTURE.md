# Microservice Specification: Identity & Access (ms_auth)

This microservice acts as the central authority for security, authentication, and the core gamification mechanics of the SCESI platform ecosystem. It is the sole owner of user identity records, dynamic permissions, and academic progression data.

---

## 1. Core Capabilities (Main functions)

* **Authentication & Session Lifecycle:** * Handles secure user registration, multi-factor readiness, login processing, and Bcrypt password hashing.
  * Manages stateful **Concurrent Sessions** via token rotation pairs (short-lived JWT Access Tokens + database-persisted Refresh Tokens), allowing a user to stay logged into the Mobile Apps and the Web Dashboard simultaneously without cross-invalidation.
* **Granular Role-Based Access Control (RBAC):** * Implements decoupled, slug-based application permissions (e.g., `chapa:open`, `xp:allocate`) embedded inside the token payload to eradicate hardcoded role checks in downstream microservices.
  * Supports multiple overlapping roles, resolving real-world institutional logic (e.g., a single user being structurally recognized as both an `AVANZADO` member and a current `DIRECTIVA` official or `ADMIN`).
* **Automated Gamification Engine:** * Operates a lookup matrix (`xp_rules`) representing the society's structural point scoring regulations (event management, code contributions, paper publications, and competition placement multipliers).
  * Maintains an unalterable transactional ledger (`xp_history`) that tracks every raw or multiplied score change alongside its allocation source (`SYSTEM` automated triggers or a Board Member user ID).
* **Academic Rank Orchestration:** * Tracks and exposes the user's live consolidated score (`current_xp`).
  * Automates rank progression thresholds through standard institutional tiers (`POSTULANTE`, `JUNIOR`, `INTERMEDIO`, `AVANZADO`, `HONORARIO`).

---

## 2. Core REST API Endpoints (Gateway Integration)

### Authentication & Profile Endpoints

| Method | Endpoint | RBAC Permission | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Registers a new applicant profile. Default status set to `PENDIENTE`. |
| `POST` | `/api/v1/auth/login` | Public | Validates credentials, captures `device_info`, and issues active token pairs. |
| `POST` | `/api/v1/auth/refresh` | Public | Rotates an expired `access_token` utilizing a valid, non-revoked `refresh_token`. |
| `POST` | `/api/v1/auth/logout` | Authenticated | Instantly revokes the active `refresh_token` associated with the current device. |
| `POST` | `/api/v1/auth/logout-all` | Authenticated | Revokes **all** active user sessions across all devices (emergency account lockdown). |
| `GET` | `/api/v1/users/me` | Authenticated | Returns full profile data, active system roles, flattened permissions, rank, and live XP. |

### User Administration Endpoints

| Method | Endpoint | RBAC Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/users` | `users:read` | Lists all users/members in the system with pagination and filters. |
| `PATCH` | `/api/v1/admin/users/:id/status` | `users:write` | Activates, suspends, or deactivates a user account (`ACTIVO`, `INACTIVO`). Ensure that accounts assigned as **HONORARIO** are always set to active. |
| `POST` | `/api/v1/admin/users/:id/roles` | `roles:assign` | Assigns a system role (e.g., `ROLE_ADMIN`) to a specific user. |
| `DELETE` | `/api/v1/admin/users/:id/roles/:roleId` | `roles:assign` | Removes a system role from a user (e.g., when ending a board term). Ensure preserve the record on another table |

### RBAC Management (Data Masters)

| Method | Endpoint | RBAC Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET/POST` | `/api/v1/admin/roles` | `roles:write` | Lists or creates new system roles (`auth_roles`). |
| `GET/POST` | `/api/v1/admin/permissions` | `permissions:write` | Lists or registers new granular security action slugs. |
| `POST` | `/api/v1/admin/roles/:id/permissions` | `roles:write` | Links permissions to a role (Populates `role_permissions`). |

### Gamification & XP Administration

| Method | Endpoint | RBAC Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET/POST` | `/api/v1/admin/xp-rules` | `xprules:write` | Gets or updates the scoring values based on the official matrix image. |
| `PATCH` | `/api/v1/admin/xp-rules/:id` | `xprules:write` | Modifies or deactivates an existing score rule rule dynamically. |
| `POST` | `/api/v1/admin/xp/allocate` | `xp:allocate` | Facilitates manual point injections into a member's ledger. |
| `GET` | `/api/v1/users/:id/xp-history` | `xp:read` | Retrieves the immutable transactional ledger of a member. |

---

## 3. Message Broker Events (Asynchronous Integration)

As established in the global architecture canvas, `ms_auth` acts as the central accounting transactional ledger for actions across external domains.

### Subscribed Events (Events this service listens to)

* **`admissions.applicant.approved`**
  * *Payload:* `{ email: string, firstName: string, lastName: string }`
  * *Reaction:* Dynamically spawns the profile inside `db_auth`, assigns the baseline `ROLE_MEMBER`, sets rank to `JUNIOR`, and switches status to `ACTIVO`.
* **`research.project.mvp_validated`**
  * *Payload:* `{ userId: string, projectSize: string, projectId: string }`
  * *Reaction:* Queries `xp_rules` for the matching metadata index (e.g., 20 XP for medium-sized validated software solutions) and inserts a new audited record into `xp_history`.
* **`events.attendance.registered`**
  * *Payload:* `{ userId: string, eventId: string, category: string }`
  * *Reaction:* Injects corresponding ecosystem points depending on whether it was a large physical conference, medium seminar, or virtual technical workshop.

### Published Events (Events this service emits)

* **`auth.user.rank_upgraded`**
  * *Payload:* `{ userId: string, oldRank: ScesiRank, newRank: ScesiRank }`
  * *Purpose:* Dispatched instantly when a user's accumulated score triggers a rank threshold change. Listened to by notification dispatchers or layout engines.
* **`auth.user.status_changed`**
  * *Payload:* `{ userId: string, status: UserStatus }`
  * *Purpose:* Broadcasts immediate authorization state modifications. Crucial for downstream consumers like `ms_iot` to strip physical room access keys if a member becomes `INACTIVO`.

## External Users & Course Platform Integration (Identity Domain)

This section specifies how `ms_auth` extends its domain boundaries to support external users (Course Students, Event Attendees) seamlessly alongside institutional members without compromising system performance or security.

---

### 1. Data Segmentation Strategy (Data Design) - proposal

To prevent external student registration from cluttering active member workflows, segmentation is achieved natively via the existing `UserStatus`, `ScesiRank`, and the RBAC system:

* **Identity Coexistence:** External students are saved in the central `users` table.
* **Rank Isolation:** They are initialized with `academic_rank = POSTULANTE` (or a new rank `EXTERNO` if absolute separation is desired).
* **System Role Assignment:** They **never** receive the technical role `ROLE_MEMBER`. Instead, they are automatically linked via `user_roles` to a specific system role: **`ROLE_STUDENT`**.

#### Token Permissions Payload Example

When an external student logs into the Mobile app or Web portal, `ms_auth` issues a lightweight JWT containing only their specific access rights:

```json
{
  "sub": "uuid-estudiante-externo",
  "email": "estudiante@gmail.com", // Requires verification, except for .est.umss.edu domains.
  "roles": ["ROLE_STUDENT"],
  "permissions": ["courses:enroll", "courses:view", "certificates:download"]
}
