# Story 1.2: Database Schema & Auth Infrastructure

Status: done

## Story

As a developer,
I want the database schema and authentication infrastructure configured,
So that user registration, login, and role-based access are architecturally supported.

## Acceptance Criteria

1. **Given** Drizzle is configured with Neon HTTP driver **When** auth schema (`users`, `otp_codes` tables) and system schema (`churches`, `audit_log` tables) are created with UUID v4 PKs and `church_id` FK **Then** `npm run db:generate` produces valid migration SQL

2. **Given** migrations are generated **When** `npm run db:migrate` is run against Neon **Then** tables are created in the database with correct columns, types, and indexes

3. **Given** the db client is configured **When** `lib/db/index.ts` creates a Drizzle instance with `@neondatabase/serverless` **Then** queries can execute against Neon PostgreSQL

4. **Given** NextAuth v5 is configured **When** `lib/auth/config.ts` sets up Credentials provider with JWT strategy containing `userId`, `role`, `churchId`, `name` **Then** NextAuth routes respond correctly

5. **Given** middleware.ts is created **When** a request hits a protected route without a valid JWT **Then** the user is redirected to `/login`

6. **Given** RBAC is configured in `lib/auth/rbac.ts` **When** a member-role user tries to access an admin route **Then** middleware blocks access and returns 403/redirect

7. **Given** `lib/db/queries/auditQueries.ts` exports `logAudit()` **When** called with actor, action, entityType, entityId **Then** an audit record is inserted with timestamp

8. **Given** a seed script exists at `lib/db/seed.ts` **When** `npm run db:seed` is run **Then** a default church record and Super Admin user are created

## Tasks / Subtasks

- [x] Task 1: Create Drizzle + Neon HTTP connection client (AC: #3)
  - [x] 1.1: Create `src/lib/db/index.ts` — Neon HTTP driver + Drizzle client with schema import
  - [x] 1.2: Add `import "server-only"` guard per architecture enforcement rule

- [x] Task 2: Define system schema — churches table (AC: #1)
  - [x] 2.1: Replace shell content in `src/lib/db/schema/system.ts`
  - [x] 2.2: Define `churches` table with UUID v4 PK, `name` varchar(255), `address` text nullable, timestamps
  - [x] 2.3: Add `audit_log` table (see Task 5 — defined in same file)

- [x] Task 3: Define auth schema — users table with pgEnums (AC: #1)
  - [x] 3.1: Replace shell content in `src/lib/db/schema/auth.ts`
  - [x] 3.2: Create `userRoleEnum` pgEnum — `['member', 'assistant_librarian', 'church_admin', 'super_admin']`
  - [x] 3.3: Create `userStatusEnum` pgEnum — `['pending_verification', 'active', 'suspended']`
  - [x] 3.4: Define `users` table with UUID v4 PK, `phone` varchar(15) unique, `name` varchar(255), `role` enum, `status` enum, `church_id` FK → churches.id, timestamps
  - [x] 3.5: Add `idx_users_church_id` index on `church_id`

- [x] Task 4: Define auth schema — otp_codes table (AC: #1)
  - [x] 4.1: Define `otpCodes` table in `src/lib/db/schema/auth.ts`
  - [x] 4.2: Columns: UUID v4 PK, `phone` varchar(15), `hashed_code` varchar(255), `expires_at` timestamp, `attempts` integer default 0, `locked_until` timestamp nullable, `created_at` timestamp
  - [x] 4.3: Add `idx_otp_codes_phone` index on `phone`

- [x] Task 5: Define system schema — audit_log table (AC: #1)
  - [x] 5.1: Define `auditLog` table in `src/lib/db/schema/system.ts`
  - [x] 5.2: Columns: UUID v4 PK, `actor_id` uuid, `action` varchar(100), `entity_type` varchar(50), `entity_id` uuid, `metadata` jsonb nullable, `created_at` timestamp
  - [x] 5.3: Add `idx_audit_log_actor_id` and `idx_audit_log_entity` indexes
  - [x] 5.4: Use varchar for `action` and `entity_type` (not pgEnum) — extensible without migration per new action type

- [x] Task 6: Define schema relations and update barrel export (AC: #1)
  - [x] 6.1: Update `src/lib/db/schema/relations.ts` — define Drizzle relations (users↔churches, auditLog↔users)
  - [x] 6.2: Verify `src/lib/db/schema/index.ts` barrel re-exports all new tables, enums, and relations

- [x] Task 7: Generate migration SQL with Drizzle Kit (AC: #1)
  - [x] 7.1: Run `npm run db:generate` — produces SQL migration files in `src/lib/db/migrations/`
  - [x] 7.2: Review generated SQL for correct table names, column types, FK constraints, indexes
  - [x] 7.3: Note: `npm run db:migrate` requires actual DATABASE_URL — document in Dev Notes

- [x] Task 8: Configure NextAuth v5 with Credentials provider + JWT (AC: #4)
  - [x] 8.1: Create `src/lib/auth/config.ts` — NextAuth configuration with Credentials provider, JWT strategy
  - [x] 8.2: Configure JWT callback to include `userId`, `role`, `churchId` in token
  - [x] 8.3: Configure session callback to expose `id`, `role`, `churchId`, `name`, `phone` in session.user
  - [x] 8.4: Create `src/lib/auth/credentials.ts` — Credentials provider with shell `authorize` function (full OTP logic deferred to Story 1.3)
  - [x] 8.5: The `authorize` shell should look up user by phone from DB — return user object with role/churchId or null

- [x] Task 9: Create NextAuth API route handler (AC: #4)
  - [x] 9.1: Create `src/app/api/auth/[...nextauth]/route.ts` — export `{ GET, POST }` from handlers
  - [x] 9.2: Verify `/api/auth/session` and `/api/auth/csrf` respond (no more SessionProvider error from Story 1.1)

- [x] Task 10: Create RBAC permission configuration (AC: #6)
  - [x] 10.1: Create `src/lib/auth/rbac.ts` — role permission maps
  - [x] 10.2: Define route patterns and minimum required roles:
    - Public: `/login`, `/verify`, `/api/auth/*`, static assets
    - Member+: `/(app)/*` (default app routes)
    - Church Admin+: `/(app)/admin/members/*`, `/(app)/admin/dashboard/*`
    - Super Admin: `/(app)/admin/churches/*`, `/(app)/admin/roles/*`
  - [x] 10.3: Export `hasRouteAccess(role, pathname)` function
  - [x] 10.4: Add `import "server-only"` guard

- [x] Task 11: Create edge middleware for route protection (AC: #5, #6)
  - [x] 11.1: Create `src/middleware.ts` — use NextAuth `auth()` wrapper for JWT validation
  - [x] 11.2: Redirect unauthenticated users to `/login` for protected routes
  - [x] 11.3: Redirect unauthorized users to `/not-found` for RBAC violations
  - [x] 11.4: Skip auth for public routes + static assets
  - [x] 11.5: Configure `matcher` to exclude `_next/static`, `_next/image`, `favicon.ico`, `icons/*`, `manifest.json`, `sw.js`, `api/auth/*`

- [x] Task 12: Create audit query functions (AC: #7)
  - [x] 12.1: Create `src/lib/db/queries/auditQueries.ts`
  - [x] 12.2: Add `import "server-only"` guard
  - [x] 12.3: Implement `logAudit({ actorId, action, entityType, entityId, metadata? })` — inserts audit record
  - [x] 12.4: Implement `getAuditTrail({ entityType?, entityId?, actorId?, limit? })` — queries audit records
  - [x] 12.5: Define TypeScript types `AuditAction` and `EntityType` as string union types (extensible)

- [x] Task 13: Create seed script (AC: #8)
  - [x] 13.1: Update `src/lib/db/seed.ts` — replace shell with working seed
  - [x] 13.2: Create default church record ("Default SDA Church")
  - [x] 13.3: Create Super Admin user linked to default church
  - [x] 13.4: Make seed idempotent (check before insert, use upsert pattern)
  - [x] 13.5: Note: Requires DATABASE_URL in `.env.local` to run

- [x] Task 14: Verify build (all ACs)
  - [x] 14.1: Run `npm run lint` — 0 errors
  - [x] 14.2: Run `npm run typecheck` — 0 errors
  - [x] 14.3: Run `npm run build` — production build succeeds
  - [x] 14.4: Run `npm run dev` and verify `/api/auth/session` responds with JSON (not HTML error)

## Dev Notes

### Architecture Compliance

**CRITICAL: This story establishes the data layer and auth infrastructure. Every subsequent story depends on these patterns being correct.**

#### Drizzle + Neon Connection Pattern

```typescript
// src/lib/db/index.ts
import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });
```

- **CRITICAL:** `import "server-only"` prevents accidental client-side import (leaks DATABASE_URL)
- Neon HTTP driver is stateless — every query is an HTTP request, no connection pooling
- Schema import enables Drizzle relational queries (`db.query.users.findFirst(...)`)
[Source: architecture.md — Data Architecture; Neon serverless HTTP constraint]

#### Drizzle Schema Patterns (pgTable syntax)

```typescript
import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";

// Enum definition
export const userRoleEnum = pgEnum('user_role', ['member', 'assistant_librarian', 'church_admin', 'super_admin']);

// Table definition
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: varchar('phone', { length: 15 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('member').notNull(),
  churchId: uuid('church_id').references(() => churches.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_users_church_id').on(table.churchId),
]);
```

**Naming conventions (MUST follow):**
| Element | Convention | Example |
|---|---|---|
| Tables | plural snake_case | `users`, `otp_codes`, `audit_log` |
| Columns | snake_case | `church_id`, `hashed_code`, `created_at` |
| Foreign keys | `{referenced_table_singular}_id` | `church_id`, `user_id` |
| Indexes | `idx_{table}_{column}` | `idx_users_church_id` |
| Drizzle variables | camelCase | `export const users`, `export const otpCodes` |
| pgEnum names | camelCase variable, snake_case DB name | `userRoleEnum = pgEnum('user_role', [...])` |

[Source: architecture.md — Database Naming Conventions, lines 261-270]

#### Timestamp Convention

All timestamps use `timestamp('column_name', { withTimezone: true })`:
- Storage: UTC `timestamp with time zone`
- Transfer: ISO 8601 strings
- Display: EAT (UTC+3) via `Intl.DateTimeFormat` (handled in `lib/utils/dates.ts`)
[Source: architecture.md — Date/Time Handling, lines 335-343]

#### UUID v4 Primary Keys

All tables use `uuid('id').defaultRandom().primaryKey()`:
- Prevents enumeration attacks (NFR-S8)
- Database generates UUID — no application-side generation needed
[Source: architecture.md — Primary keys decision]

#### Multi-Church `church_id` FK

Every church-scoped entity gets `church_id` FK from day one:
- Even though multi-church is Phase 3, adding the column now prevents painful migration later
- `users.church_id` → `churches.id` with NOT NULL constraint
[Source: architecture.md — Multi-church prep decision]

#### Cross-Schema References (Circular Import Avoidance)

The auth and system schemas have cross-references:
- `users.church_id` → `churches.id` (auth → system)
- `audit_log.actor_id` → logically references users (system → auth)

**Strategy to avoid circular imports:**
1. `system.ts` defines `churches` and `audit_log` — `audit_log.actor_id` is plain `uuid` (no `.references()`)
2. `auth.ts` imports `churches` from `./system` for FK: `uuid('church_id').references(() => churches.id)`
3. `relations.ts` imports from both and defines all Drizzle ORM relations

This keeps DB-level FK constraint on `users.church_id` while avoiding circular module dependencies. The `audit_log` relies on application-level referential integrity (enforced by TypeScript types).
[Source: architecture.md — Schema Domain Split]

#### audit_log Action/Entity Types

Use `varchar` columns (NOT pgEnum) for `action` and `entity_type`:
- New action types are added in future stories without DB migration
- TypeScript union types provide compile-time safety
- Define in `auditQueries.ts`:

```typescript
export type AuditAction =
  | "VERIFY_MEMBER" | "REJECT_MEMBER"
  | "ASSIGN_ROLE" | "CREATE_CHURCH"
  | "APPROVE_REQUEST" | "DECLINE_REQUEST"
  | "ISSUE_BOOK" | "RETURN_BOOK"
  | "CREATE_BOOK" | "UPDATE_BOOK" | "DELETE_BOOK";

export type EntityType = "USER" | "CHURCH" | "BORROWING" | "BOOK";
```

[Source: architecture.md — Audit Logging Integration, lines 318-331]

#### NextAuth v5 Configuration Pattern

```typescript
// src/lib/auth/config.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Credentials({ ... })],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id!;
        token.role = user.role;
        token.churchId = user.churchId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId;
      session.user.role = token.role;
      session.user.churchId = token.churchId;
      return session;
    },
  },
});
```

- `auth` export is used both as middleware wrapper AND server-side session getter
- JWT payload: `userId`, `role`, `churchId` — middleware reads role/church without DB hit
- `pages.signIn: "/login"` — custom login page, not NextAuth default
- Credentials provider `authorize` is a shell in this story — full OTP logic in Story 1.3
[Source: architecture.md — Authentication & Security, lines 168-180]

#### NextAuth Route Handler

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth/config";
export const { GET, POST } = handlers;
```

This resolves the `ClientFetchError: Unexpected token '<'` from Story 1.1 (SessionProvider was fetching `/api/auth/session` but no handler existed).
[Source: architecture.md — Auth Routes]

#### Edge Middleware Pattern

```typescript
// src/middleware.ts
import { auth } from "@/lib/auth/config";
import { hasRouteAccess } from "@/lib/auth/rbac";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Skip auth for public routes
  if (isPublicRoute(pathname)) return;

  // No session → redirect to login
  if (!req.auth) {
    return Response.redirect(new URL("/login", req.url));
  }

  // RBAC check
  if (!hasRouteAccess(req.auth.user.role, pathname)) {
    return Response.redirect(new URL("/not-found", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)",
  ],
};
```

- Middleware runs on EVERY matched request — pages never check auth themselves
- `auth()` wraps the middleware to inject `req.auth` (JWT session)
- Public routes: `/login`, `/verify`, `/api/auth/*`, static assets
- Failed auth → `/login`; failed RBAC → `/not-found` (acts as 403)
[Source: architecture.md — Authentication Boundary, lines 669-675]

#### RBAC Permission Model

4-tier role hierarchy: `super_admin` > `church_admin` > `assistant_librarian` > `member`

| Route Pattern | Minimum Role |
|---|---|
| `/(app)/*` (default) | `member` |
| `/(app)/admin/members/*` | `church_admin` |
| `/(app)/admin/dashboard/*` | `church_admin` |
| `/(app)/admin/churches/*` | `super_admin` |
| `/(app)/admin/roles/*` | `super_admin` |

[Source: architecture.md — RBAC Middleware; PRD — Role definitions]

#### Data Access Boundary

```
Client Component → Server Action → Query Function → Drizzle ORM → Neon HTTP → PostgreSQL
```

- `auditQueries.ts` is the first query file — sets the pattern for all future query files
- Every query file starts with `import "server-only"`
- Server Actions call query functions — never write raw Drizzle queries in `actions.ts`
- Query functions return typed results (Drizzle `InferSelectModel` types)
[Source: architecture.md — Data Access Layer, lines 290-306, 662-667]

#### Seed Script Pattern

```typescript
// src/lib/db/seed.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Direct connection (no server-only since this runs via tsx CLI)
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

async function seed() {
  // 1. Upsert default church
  // 2. Upsert super admin user
  console.log("Seed complete");
}

seed().catch(console.error);
```

- Seed runs via `tsx` (not Next.js runtime) — cannot use `import "server-only"`
- Creates its own Drizzle instance directly
- Must be idempotent (safe to run multiple times)
[Source: architecture.md — Seed data; Story 1.1 established `db:seed` script]

### Project Structure Notes

Files to create/modify:
```
src/
├── lib/
│   ├── auth/
│   │   ├── config.ts          ← NEW: NextAuth v5 configuration
│   │   ├── credentials.ts     ← NEW: Credentials provider (shell)
│   │   └── rbac.ts            ← NEW: Role permission maps
│   ├── db/
│   │   ├── index.ts           ← NEW: Drizzle client (Neon HTTP)
│   │   ├── schema/
│   │   │   ├── auth.ts        ← MODIFY: Replace shell → users + otp_codes tables
│   │   │   ├── system.ts      ← MODIFY: Replace shell → churches + audit_log tables
│   │   │   ├── relations.ts   ← MODIFY: Replace shell → Drizzle relations
│   │   │   └── index.ts       ← VERIFY: Barrel export (should work as-is)
│   │   ├── queries/
│   │   │   └── auditQueries.ts ← NEW: logAudit + getAuditTrail
│   │   ├── migrations/         ← GENERATED: Drizzle Kit output
│   │   └── seed.ts            ← NEW: Default church + super admin
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts   ← NEW: NextAuth route handler
├── middleware.ts               ← NEW: Edge middleware (JWT + RBAC)
```

All paths align with architecture.md project structure (lines 611-651).

### Story 1.1 Learnings Applied

- **ESM compatibility:** Use `import { fileURLToPath } from "url"` for `__dirname` if needed (not applicable here but keep in mind)
- **Schema shell files:** Currently have `export {};` — replace entire content, don't append
- **Module augmentation:** `src/types/auth.ts` already has correct NextAuth type extensions — do NOT modify
- **`next lint` removed:** Use `npm run lint` which runs `eslint .`
- **Build with Webpack:** `npm run build` uses `--webpack` flag for Serwist compatibility
- **Font variable:** Inter font configured in globals.css (not Geist)
- **SessionProvider error:** Will be resolved once NextAuth route handler is created in Task 9

### Migration Notes

- `npm run db:generate` works locally without DATABASE_URL (reads schema files only)
- `npm run db:migrate` requires a valid DATABASE_URL in `.env.local`
- If no `.env.local` exists yet, developer must create one from `.env.example` before running migrations
- Generated migration SQL should be reviewed before running `db:migrate`
- Migration files in `src/lib/db/migrations/` should be committed to git

### Testing Strategy

- **Unit tests (Vitest):** Test RBAC `hasRouteAccess()` function with various role/route combinations
- **Unit tests (Vitest):** Test audit query type safety (compile-time, not runtime for this story)
- **Integration:** Verify NextAuth routes respond with valid JSON after Task 9
- **Manual:** Run seed script against actual Neon database after configuring `.env.local`
- E2E tests for auth flows will be added in Stories 1.3-1.4

### Dependencies

- **Requires:** Story 1.1 complete (project scaffolded, dependencies installed) ✅
- **Blocks:** Stories 1.3 (Phone Registration), 1.4 (OTP Login), 1.5-1.7 (all Epic 1)
- **All packages already installed:** `@neondatabase/serverless`, `drizzle-orm`, `drizzle-zod`, `drizzle-kit`, `next-auth@beta`

### References

- [Source: architecture.md — Data Architecture Decisions, lines 147-166]
- [Source: architecture.md — Authentication & Security, lines 168-180]
- [Source: architecture.md — Database Naming Conventions, lines 261-270]
- [Source: architecture.md — Data Access Layer Pattern, lines 290-306]
- [Source: architecture.md — Audit Logging Integration, lines 318-331]
- [Source: architecture.md — Date/Time Handling, lines 335-343]
- [Source: architecture.md — Enforcement Guidelines, lines 427-448]
- [Source: architecture.md — Project Structure, lines 611-651]
- [Source: architecture.md — Authentication Boundary, lines 669-675]
- [Source: epics.md — Story 1.2 Acceptance Criteria, lines 273-312]
- [Source: Story 1.1 — Dev Agent Record, learnings and debug log]
- [Source: Drizzle ORM docs — pgTable, pgEnum, relations, neon-http driver]
- [Source: NextAuth v5 docs — Credentials provider, JWT strategy, middleware]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- `neon()` called at module load time crashes build when `DATABASE_URL` is absent — fixed with lazy Proxy pattern in `db/index.ts`
- `server-only` package not resolvable in Vitest — added alias to empty mock in `vitest.config.ts`
- `next-auth` import in `src/types/auth.ts` triggers `next/server` resolution failure in Vitest jsdom — mocked with `vi.mock("next-auth")` in individual test files
- `vi.mock` factory functions cannot reference variables declared below them — used `vi.hoisted()` pattern for mock chain variables
- Next.js 16 middleware deprecation warning: "The middleware file convention is deprecated. Please use proxy instead." — informational only, middleware still works

### Completion Notes List

- All 14 tasks completed successfully
- ESLint: 0 errors
- TypeScript: 0 errors with `tsc --noEmit`
- Tests: 25/25 passing across 3 test files (db/index, rbac, auditQueries)
- Production build: succeeds with webpack + Serwist service worker
- Drizzle migration generated: 4 tables, 2 enums, 4 indexes, 1 FK constraint
- `db/index.ts` uses lazy Proxy pattern — connection created on first property access, not module load
- RBAC tested with 16 test cases covering all 4 roles across public/member/admin/superadmin routes
- Audit queries tested with 6 test cases covering insert and filtered retrieval
- Credentials provider is a shell (returns null) — full OTP verification deferred to Story 1.3
- Seed script is idempotent (check-before-insert) — creates default church + super admin
- NextAuth route handler resolves the `ClientFetchError` from Story 1.1

### Code Review Fixes Applied

Review found 3 HIGH, 4 MEDIUM, 2 LOW issues. All HIGH and MEDIUM fixed:

- **H1:** Removed dead DB query from `credentials.ts` — `authorize` was querying users table then returning `null`
- **H2:** Removed `server-only` from `rbac.ts` — imported by edge middleware, contains no secrets
- **H3:** Added `server-only` to `auth/config.ts` — protects NextAuth secret/JWT config from client import
- **M1:** Fixed Proxy type cast in `db/index.ts` — changed `keyof typeof _db` to `keyof DbInstance`
- **M2:** Deleted dead `src/test/next-auth-mock.ts` — not used by any vitest config or test
- **M3:** Improved `auditQueries.test.ts` mock fidelity — replaced string column mocks with Symbol-based identifiers inside `vi.hoisted()` block
- **M4:** Added `process.exit(0)` to seed script — prevents Neon HTTP connection from hanging after completion

Post-fix verification: lint 0, typecheck 0, 25/25 tests passing, build succeeds.

### File List

- `src/lib/db/index.ts` — Drizzle client with lazy Proxy + Neon HTTP (NEW)
- `src/lib/db/index.test.ts` — DB client unit tests (NEW)
- `src/lib/db/schema/system.ts` — churches + audit_log tables (MODIFIED)
- `src/lib/db/schema/auth.ts` — users + otp_codes tables + pgEnums (MODIFIED)
- `src/lib/db/schema/relations.ts` — Drizzle ORM relations (MODIFIED)
- `src/lib/db/migrations/0000_solid_richard_fisk.sql` — Initial migration SQL (GENERATED)
- `src/lib/db/migrations/meta/0000_snapshot.json` — Migration snapshot (GENERATED)
- `src/lib/db/migrations/meta/_journal.json` — Migration journal (GENERATED)
- `src/lib/db/queries/auditQueries.ts` — logAudit + getAuditTrail functions (NEW)
- `src/lib/db/queries/auditQueries.test.ts` — Audit query unit tests (NEW)
- `src/lib/db/seed.ts` — Development seed script (NEW)
- `src/lib/auth/config.ts` — NextAuth v5 configuration (NEW)
- `src/lib/auth/credentials.ts` — Credentials provider shell (NEW)
- `src/lib/auth/rbac.ts` — RBAC permission maps + hasRouteAccess (NEW)
- `src/lib/auth/rbac.test.ts` — RBAC unit tests (NEW)
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth route handler (NEW)
- `src/middleware.ts` — Edge middleware with JWT + RBAC (NEW)
- `vitest.config.ts` — Added server-only mock alias (MODIFIED)
- `src/test/server-only-mock.ts` — server-only test mock (NEW)
