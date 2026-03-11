---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
inputDocuments:
  - prd.md
  - product-brief-bookclub-2026-02-25.md
  - project-context.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-26'
project_name: 'bookclub'
user_name: 'brian'
date: '2026-02-26'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
44 FRs across 7 capability areas. The heaviest architectural lift is in Borrowing & Returns (10 FRs including two distinct flows, offline queuing, automatic blocking) and Trust Progression & Penalties (6 FRs implementing two calendar-driven state machines). Registration, Catalog, and Gamification are relatively straightforward CRUD + calculation. The Dashboard aggregates data from all other areas, making it a read-heavy composite view.

**Non-Functional Requirements:**
6 categories drive architecture: Performance (< 3s on 3G, < 200KB JS, < 500ms Server Actions), Security (OTP hashing, JWT, RBAC middleware, UUID v4 PKs, audit trail), Scalability (500 members / 1,000 books per church, multi-church prep), Accessibility (WCAG 2.1 AA), Integration (SMS Leopard with rate limiting and cost tracking), Reliability (99.5% uptime, zero-loss offline sync, calendar-based penalty advancement regardless of system availability).

**Scale & Complexity:**

- Primary domain: Full-stack PWA (server-dominant Next.js App Router)
- Complexity level: Medium
- Estimated architectural components: ~12-15 (auth, catalog, borrowing engine, trust state machine, penalty state machine, SMS service, XP engine, dashboard aggregator, offline sync, audit logger, role middleware, scheduled jobs, church management)

### Technical Constraints & Dependencies

- **Neon serverless HTTP** — stateless, no connection pooling. Every DB call is an HTTP request. Cold starts possible after idle. Architecture must show loading states and avoid N+1 queries.
- **NextAuth v5 beta** — Credentials provider only (phone + OTP). JWT session strategy (no DB sessions). Edge-compatible.
- **Serwist service worker** — precaches app shell and static assets. IndexedDB for catalog cache. Never caches API responses or Server Action results.
- **SMS Leopard** — external dependency for both auth (OTP) and business logic (penalties). Rate-limited. Per-message cost (~KES 0.50-1.00). Must queue batch sends with delays.
- **Vercel deployment** — serverless functions, edge middleware, no persistent processes. Scheduled jobs (penalty escalation, SMS sends) need Vercel Cron or equivalent.
- **Server Components by default** — `"use client"` only for interactivity. Server Actions for all mutations. No API routes for CRUD.

### Cross-Cutting Concerns Identified

1. **Authentication & Authorization** — JWT validation + role-based route protection on every request (middleware). 4-tier RBAC with scoped visibility rules.
2. **Offline Support** — Dual strategy: service worker for static assets + IndexedDB for catalog data. Request queue with idempotency keys. Sync endpoint. Online status detection + UI feedback.
3. **SMS Integration** — Shared across OTP delivery, penalty escalation, approval notifications, and decline notifications. Needs centralized SMS service with rate limiting, cost tracking, retry logic.
4. **Audit Logging** — Every admin mutation (approvals, role changes, suspensions, book edits) logged with timestamp + actor. Cross-cuts all write operations.
5. **Data Privacy** — Role-scoped data visibility baked into queries, not just UI. Member data isolated. Board reports aggregate-only.
6. **Error Handling** — `ActionResult<T>` pattern on all Server Actions. `ErrorCode` enum. No thrown errors from server boundary.
7. **Scheduled Processing** — Penalty escalation and SMS batch sends need cron-triggered execution. Must be idempotent (safe to re-run).

## Starter Template Evaluation

### Primary Technology Domain

Full-stack PWA (Next.js 16 App Router, server-dominant architecture) — based on project requirements and pre-established technology stack in project context (80 implementation rules).

### Starter Options Considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| `create-next-app --yes` | Official, clean, Next.js 16 native, no opinions to strip | Manual setup for DB/auth/PWA layers | **Selected** |
| `create-t3-app` (v7.40.0) | Batteries-included, well-maintained | tRPC conflicts with Server Actions pattern; Prisma default conflicts with Drizzle choice | Rejected |
| Vercel Drizzle Starter | Closest stack match | Targets Next.js 14, not 16; maintenance unclear | Rejected |
| Community templates | Pre-integrated stacks | Unknown maintenance, not Next.js 16 / Tailwind 4 | Rejected |

### Selected Starter: `create-next-app` (Official Next.js CLI v16.1.6)

**Rationale:** The project context defines 80 implementation rules with a fully specified stack. Using the minimal official starter avoids introducing conflicting opinions (tRPC, Prisma, outdated patterns) and lets us layer each technology deliberately according to project context rules.

**Initialization Command:**

```bash
npx create-next-app@latest bookclub --yes
```

This creates: Next.js 16, TypeScript strict, Tailwind CSS 4, ESLint 9, App Router, Turbopack dev, `@/*` path alias.

**Post-Init Setup Sequence:**

```bash
# 1. shadcn/ui (components + theming)
npx shadcn@latest init

# 2. Database layer
npm install @neondatabase/serverless drizzle-orm drizzle-zod
npm install -D drizzle-kit

# 3. Authentication
npm install next-auth@beta

# 4. PWA
npm install @serwist/next @serwist/precaching @serwist/sw idb

# 5. Forms + Validation + Toast
npm install react-hook-form zod sonner

# 6. Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D playwright @playwright/test
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:** TypeScript 5.x with strict mode, React 19, `@/*` path alias to `src/*`

**Styling Solution:** Tailwind CSS 4 (native CSS config, no `tailwind.config.ts`), extended by shadcn/ui (Radix primitives + `cn()` utility + CSS variables for theming)

**Build Tooling:** Turbopack for dev server (fast HMR), Webpack for production builds (required by Serwist service worker compilation). Scripts: `next dev --turbopack` for dev, `next build --webpack` for production.

**Testing Framework:** Vitest with jsdom environment (unit/component), Playwright with Chromium + Mobile Chrome (E2E). Colocated `*.test.ts` files alongside source.

**Code Organization:** App Router `src/app/` structure with route groups: `(auth)/` for login/verify, role-based folders for protected pages. Components split: `components/ui/` (shadcn auto-generated), `components/domain/` (business UI), `components/layout/`. Server logic: `lib/auth/`, `lib/db/`, `lib/sync/`. Hooks: `hooks/`. Providers: `providers/`.

**Development Experience:** Turbopack HMR, ESLint 9 + eslint-config-next, `tsc --noEmit` type checking, Drizzle Studio for DB inspection.

**Note:** Project initialization using this command sequence should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. Schema organization: Split by domain with barrel re-export
2. Multi-church `churchId` FK: Added now on all church-scoped entities
3. OTP storage: Hashed in `otp_codes` table with attempts + expiry
4. JWT payload: `userId`, `role`, `churchId`, `name` only
5. Scheduled jobs: Vercel Cron for penalty check + SMS batch
6. SMS architecture: Centralized service with DB-backed queue

**Important Decisions (Shape Architecture):**
1. Client state: React Context (global) + URL state (filters) + component state (forms)
2. Caching: React `cache()` for request deduplication only, no external cache
3. Rate limiting: DB-backed for OTP, no general API rate limiting in MVP
4. Loading patterns: `loading.tsx`/`error.tsx` per route + `useActionState` for actions

**Deferred Decisions (Post-MVP):**
1. External error tracking (Sentry)
2. General API rate limiting (Upstash Redis)
3. Advanced caching (ISR, external cache)
4. Push notification infrastructure
5. Multi-church tenant routing

### Data Architecture

| Decision | Choice | Version | Rationale |
|---|---|---|---|
| Database | Neon PostgreSQL | Serverless HTTP | Pre-decided: stateless, edge-ready, no connection pool overhead |
| ORM | Drizzle ORM | 0.45.x | Pre-decided: type-safe, SQL-first, Zod integration |
| Schema organization | Split by domain | N/A | ~15 tables cluster naturally into auth, catalog, borrowing, gamification, system domains |
| Primary keys | UUID v4 | N/A | Pre-decided: prevents enumeration attacks |
| Multi-church prep | `churchId` FK now | N/A | One column per table prevents painful Phase 3 migration |
| Caching | React `cache()` only | N/A | 500 members / 1000 books doesn't justify external cache layer |
| Migrations | Drizzle Kit generate + migrate | N/A | Pre-decided: `db:generate` → review SQL → `db:migrate` |
| Money values | Integer cents | N/A | Pre-decided: SMS cost tracking in cents (KES) |

**Schema Domain Split:**
- `schema/auth.ts` — users, otp_codes, sessions (if needed)
- `schema/catalog.ts` — books, categories
- `schema/borrowing.ts` — borrowings, penalties, trust_status
- `schema/gamification.ts` — xp_events, levels
- `schema/system.ts` — churches, audit_log, sms_log
- `schema/index.ts` — barrel re-export of all schemas + relations

### Authentication & Security

| Decision | Choice | Rationale |
|---|---|---|
| Auth provider | NextAuth v5 beta, Credentials | Pre-decided: phone + OTP, no OAuth needed |
| Session strategy | JWT (stateless) | Pre-decided: edge-compatible, no DB session lookups |
| OTP storage | bcrypt-hashed in `otp_codes` table | Matches password hashing best practices; table tracks attempts + expiry + lockout |
| JWT payload | `userId`, `role`, `churchId`, `name` | Middleware reads role/church without DB hit; no sensitive data in token |
| Route protection | Edge Middleware | Pre-decided: validates JWT, checks role-based permissions before page render |
| Rate limiting (OTP) | DB-backed (`otp_codes.attempts` + `locked_until`) | Simple, reliable, no external dependency; 3 attempts per 15-min window |
| Rate limiting (API) | None in MVP | Server Actions have CSRF protection; auth required on all mutations; defer to Upstash if needed |
| Data encryption | TLS 1.2+ in transit, Neon encryption at rest | Pre-decided: standard for Neon serverless |
| Audit trail | `audit_log` table (actor, action, entity, timestamp) | Every admin mutation logged; queryable for board reports |

### API & Communication Patterns

| Decision | Choice | Rationale |
|---|---|---|
| Mutation pattern | Server Actions with `ActionResult<T>` | Pre-decided: type-safe, no API routes for CRUD |
| Scheduled jobs | Vercel Cron (2 routes) | `/api/cron/penalty-check` (daily) + `/api/cron/sms-batch` (hourly); idempotent; free tier sufficient |
| SMS architecture | Centralized `lib/sms/service.ts` + `sms_log` DB queue | Single module for OTP, reminders, warnings, approvals; rate-limited dispatch; cost tracking per church |
| Offline sync | `/api/sync` POST endpoint + IndexedDB queue | Pre-decided: UUID v4 idempotency keys, process on reconnect |
| Error handling | `ActionResult<T>` + `ErrorCode` enum | Pre-decided: never throw from Server Actions |
| API routes (non-CRUD) | `/api/cron/*`, `/api/sync`, `/api/webhooks/*` (future) | Only for cron, sync, and external webhooks |

**SMS Service Design:**
- `sendOtp(phone)` — immediate send, no queue (auth-critical)
- `queueReminder(borrowingId, type)` — inserts into `sms_log` as pending
- `processSmsQueue()` — cron-triggered, rate-limited batch dispatch
- `getSmsSpend(churchId, month)` — aggregation for budget tracking

**Penalty Escalation Cron Logic:**
- Runs daily via Vercel Cron
- Queries all active borrowings where `dueDate` has passed
- For each, calculates days overdue and determines escalation stage
- Idempotent: checks `sms_log` for already-sent messages before queuing
- Updates borrowing status (suspended at Day 7, high-risk at Day 14)

### Frontend Architecture

| Decision | Choice | Rationale |
|---|---|---|
| Server Components | Default for all pages/layouts | Pre-decided: minimize client JS |
| Client state (global) | React Context (`SyncProvider`, `AuthProvider`) | Lightweight, built-in, sufficient for online status + sync queue + session |
| Client state (filters) | URL state via `useSearchParams` | Shareable, bookmarkable, SSR-compatible |
| Client state (forms) | React Hook Form + `useState` | Pre-decided: RHF for complex forms, useState for simple interactions |
| Loading states | `loading.tsx` / `error.tsx` per route segment | Next.js App Router convention; Suspense boundaries |
| Action feedback | `useActionState` hook | Pending/error states for Server Action mutations |
| Offline UI | `useOnlineStatus` + `OfflineBanner` | Pre-decided: network detection + visual feedback |
| Component size | Max 150 lines, extract sub-components | Pre-decided: maintainability rule |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|---|---|---|
| Hosting | Vercel | Pre-decided: serverless functions, edge middleware, preview deployments |
| Build | Turbopack (dev) + Webpack (production) | Turbopack for fast HMR; Webpack required by Serwist |
| CI/CD | Vercel Git integration | Auto-deploy: preview on PR, production on merge to `main` |
| Env vars | `.env.local` (dev) + Vercel env vars (preview/prod) | Pre-decided: `.env.example` committed with placeholders |
| Monitoring (MVP) | Vercel Analytics (Web Vitals) | Built-in, free tier, no bundle impact |
| Logging (MVP) | Structured console logging | No external service; Vercel function logs for debugging |
| Error tracking | Deferred (Sentry post-MVP) | Adds ~30KB bundle; not justified for solo dev MVP |
| SMS cost monitoring | Built-in via `sms_log` aggregation | Dashboard query, no external monitoring needed |

### Decision Impact Analysis

**Implementation Sequence:**
1. Project init (create-next-app + dependency layers)
2. Database schema (Drizzle schema split by domain, migrations)
3. Authentication (NextAuth + OTP flow + middleware RBAC)
4. Book catalog (CRUD + search + offline caching)
5. Borrowing engine (Flow A + Flow B + trust progression)
6. Penalty state machine (escalation logic + SMS queue)
7. XP engine (award calculations + profile display)
8. Evangelist dashboard (aggregation queries + reports)
9. PWA setup (Serwist + offline queue + sync endpoint)
10. Cron jobs (penalty check + SMS batch processing)

**Cross-Component Dependencies:**
- Auth → everything (middleware protects all routes)
- SMS service → OTP (auth) + penalties (borrowing) + notifications (approvals)
- Audit log → all admin Server Actions
- `churchId` → all entity queries (scoping)
- Offline queue → borrowing requests + sync endpoint

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 18 areas where AI agents could make different choices, organized into 5 categories: Naming (6), Structure (4), Format (3), Communication (3), Process (2).

### Naming Patterns

**Database Naming Conventions (Drizzle Schema):**

| Element | Convention | Example |
|---|---|---|
| Tables | plural snake_case | `users`, `books`, `borrowings`, `xp_events`, `sms_log` |
| Columns | snake_case | `user_id`, `due_date`, `created_at`, `church_id` |
| Foreign keys | `{referenced_table_singular}_id` | `user_id`, `book_id`, `church_id` |
| Indexes | `idx_{table}_{column}` | `idx_borrowings_user_id`, `idx_books_church_id` |
| Drizzle table variables | camelCase | `export const users = pgTable('users', {...})` |
| Drizzle enums | camelCase name, lowercase values | `borrowStatus: ['pending', 'approved', 'issued', 'returned']` |

**Server Action Function Naming:**

| Convention | Pattern | Examples |
|---|---|---|
| Action functions | `{verb}{Entity}` | `createBook`, `approveRequest`, `returnBorrowing`, `sendOtp` |
| No `handle` prefix | Reserved for component event handlers | `handleClick`, `handleSubmit` (components only) |
| No `Action` suffix | Redundant in `actions.ts` files | `createBook` not `createBookAction` |
| Grouping | Related actions in one file per route | `app/books/actions.ts` → `createBook`, `updateBook`, `deleteBook` |

**Zod Schema Naming:**

| Convention | Pattern | Examples |
|---|---|---|
| Schema names | `{entity}{Action}Schema` | `bookCreateSchema`, `borrowRequestSchema`, `otpVerifySchema` |
| Location | Colocated with actions or adjacent `schemas.ts` | `app/books/schemas.ts` if complex, otherwise in `actions.ts` |
| Drizzle Zod | `createInsertSchema` / `createSelectSchema` | For DB-driven validation base schemas |

### Structure Patterns

**Data Access Layer:**

```
src/lib/db/queries/
  bookQueries.ts      → getBookById, getBooksByChurch, searchBooks
  borrowingQueries.ts  → getActiveBorrowings, getOverdueBorrowings, getBorrowingHistory
  userQueries.ts       → getUserById, getUsersByChurch, getPendingVerifications
  dashboardQueries.ts  → getDashboardStats, getMonthlyReport, getPopularBooks
  auditQueries.ts      → logAudit, getAuditTrail
  smsQueries.ts        → queueSms, getPendingSms, getSmsSpend
```

- Every query file starts with `import "server-only"`
- Server Actions call query functions — never write raw Drizzle queries in `actions.ts`
- Query functions return typed results (Drizzle `InferSelectModel` types)
- This separation enables independent testing of query logic

**Server Action File Organization:**

```
src/app/books/actions.ts        → createBook, updateBook, deleteBook
src/app/borrowing/actions.ts    → requestBorrow, approveBorrow, declineBorrow, returnBook, issueBook
src/app/admin/actions.ts        → verifyMember, assignRole, createChurch
src/app/auth/actions.ts         → sendOtp, verifyOtp
src/app/profile/actions.ts      → updateProfile
```

**Audit Logging Integration:**

```typescript
// lib/db/queries/auditQueries.ts
export async function logAudit(params: {
  actorId: string;
  action: AuditAction;   // 'APPROVE_REQUEST' | 'DECLINE_REQUEST' | 'ISSUE_BOOK' | ...
  entityType: EntityType; // 'BORROWING' | 'BOOK' | 'USER' | ...
  entityId: string;
  metadata?: Record<string, unknown>;
}) { ... }
```

Called at the end of every admin Server Action after the mutation succeeds.

### Format Patterns

**Date/Time Handling:**

| Concern | Convention | Example |
|---|---|---|
| Storage | UTC `timestamp with time zone` | Drizzle: `timestamp('created_at', { withTimezone: true })` |
| Transfer | ISO 8601 strings | `"2026-03-15T10:30:00.000Z"` |
| Display | EAT (UTC+3) via `Intl.DateTimeFormat` | `new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium' })` |
| Due date calc | Raw Date arithmetic | `new Date(issueDate.getTime() + loanPeriodDays * 86400000)` |
| Library | None in MVP | No dayjs/date-fns — `Intl` + `Date` sufficient |

**Pagination:**

| Concern | Convention |
|---|---|
| Strategy | Offset-based (sufficient for 500 members / 1000 books) |
| URL params | `page` (1-indexed) + `pageSize` (default 20) |
| Return shape | `{ items: T[], total: number, page: number, pageSize: number }` |
| Server Component reads | `searchParams` → query function → render |

**Search/Filter Pattern:**
- All filters encoded in URL `searchParams` (category, search query, status, page)
- Server Component reads params → passes to query function → renders results
- Client Component handles filter UI → updates URL via `router.push()`
- Never store filter state in `useState` — always URL

### Communication Patterns

**Toast Notifications (Sonner):**

| Scenario | Pattern |
|---|---|
| Success | `toast.success("Book added to catalog")` |
| Error | `toast.error(result.error.message)` — from `ActionResult` |
| Loading | `toast.loading("Saving...")` for long-running actions |
| Confirmations | shadcn `AlertDialog` — never `alert()` or `window.confirm()` |

**Form → Server Action Connection:**

```typescript
// Pattern 1: Simple forms (useActionState)
const [state, action, pending] = useActionState(createBook, initialState);

// Pattern 2: Complex forms (RHF + manual call)
const form = useForm<BookCreateInput>({ resolver: zodResolver(bookCreateSchema) });
const onSubmit = async (data: BookCreateInput) => {
  const result = await createBook(data);
  if (result.success) { toast.success("..."); router.push("..."); }
  else { toast.error(result.error.message); }
};
```

**Import Ordering:**

```typescript
// 1. React/Next.js
import { Suspense } from 'react';
import { redirect } from 'next/navigation';

// 2. Third-party libraries
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// 3. Internal modules (path alias)
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { BookCard } from '@/components/domain/BookCard';

// 4. Relative imports (same feature)
import { bookCreateSchema } from './schemas';
```

### Process Patterns

**Loading State Hierarchy:**

| Level | Mechanism | Use Case |
|---|---|---|
| Route-level | `loading.tsx` (skeleton UI) | Page transitions, initial data loading |
| Action-level | `useActionState` pending flag | Form submissions, mutations |
| Component-level | `useState` | Local interactions (dropdown, modal, toggle) |
| Network-level | `useOnlineStatus` + `OfflineBanner` | Offline detection, sync status |

**Error Handling Flow:**

| Layer | Pattern |
|---|---|
| Server Action | Return `ActionResult<T>` with `ErrorCode` — never throw |
| Query function | Throw on unexpected DB errors (caught by action) |
| Route segment | `error.tsx` boundary catches unhandled errors |
| Client component | Check `result.success` → toast error or success |
| Global | Root `error.tsx` as catch-all fallback |

### Enforcement Guidelines

**All AI Agents MUST:**
1. Run `npm run lint` + `npm run typecheck` after any code generation
2. Follow data access pattern: Action → Query function → Drizzle (never raw SQL in actions)
3. Use `ActionResult<T>` for every Server Action return — no exceptions
4. Add `import "server-only"` on any file touching DB or secrets
5. Call `logAudit()` in every admin mutation Server Action
6. Encode all list filters in URL `searchParams`, never component state
7. Use Sonner toasts for user feedback, never `alert()`
8. Use snake_case for all DB table/column names, camelCase for Drizzle variables
9. Name Server Action functions as `{verb}{Entity}` — no `handle` or `Action` suffixes

**Anti-Patterns (Agents Must NOT):**
- Write Drizzle queries directly in Server Actions (use query functions in `lib/db/queries/`)
- Create API routes for CRUD operations (use Server Actions)
- Store filter/pagination state in `useState` (use URL params)
- Use `any` type or skip Zod validation on Server Action inputs
- Mix snake_case and camelCase in the same DB table definition
- Create utility files in `lib/` with barrel exports (barrel only at component library level)
- Use `dayjs` or `date-fns` (use `Intl.DateTimeFormat` + raw `Date`)
- Use `alert()`, `window.confirm()`, or `console.log` for user-facing feedback

## Project Structure & Boundaries

### Complete Project Directory Structure

```
bookclub/
├── .env.example                          # Committed: DATABASE_URL, AUTH_SECRET, SMSLEOPARD_*
├── .env.local                            # Local dev only (never committed)
├── .eslintrc.json                        # ESLint 9 config
├── .gitignore
├── drizzle.config.ts                     # Drizzle Kit configuration
├── next.config.ts                        # Next.js 16 + Serwist plugin
├── package.json
├── tsconfig.json                         # TypeScript strict mode
├── vercel.json                           # Vercel Cron job definitions
├── components.json                       # shadcn/ui configuration
│
├── e2e/                                  # Playwright E2E tests
│   ├── auth.spec.ts                      # OTP login, registration, verification
│   ├── borrowing.spec.ts                 # Flow A, Flow B, return, overdue
│   ├── catalog.spec.ts                   # Browse, search, filter, offline
│   ├── dashboard.spec.ts                 # Evangelist dashboard operations
│   └── playwright.config.ts              # Chromium + Mobile Chrome (Pixel 5)
│
├── public/
│   ├── sw.js                             # Generated by Serwist (do not edit)
│   ├── manifest.json                     # PWA manifest
│   ├── icons/                            # PWA icons (192, 512, maskable)
│   └── images/                           # Static images
│
├── src/
│   ├── sw.ts                             # Serwist service worker source
│   ├── middleware.ts                      # JWT validation + RBAC route protection
│   │
│   ├── app/
│   │   ├── globals.css                   # Tailwind CSS 4 imports + CSS variables
│   │   ├── layout.tsx                    # Root layout: providers, fonts, metadata
│   │   ├── loading.tsx                   # Root loading skeleton
│   │   ├── error.tsx                     # Root error boundary
│   │   ├── not-found.tsx                 # 404 page
│   │   │
│   │   ├── (auth)/                       # Auth route group (public)
│   │   │   ├── layout.tsx                # Auth layout (centered, minimal)
│   │   │   ├── login/
│   │   │   │   ├── page.tsx              # Phone number input → send OTP
│   │   │   │   └── actions.ts            # sendOtp
│   │   │   └── verify/
│   │   │       ├── page.tsx              # OTP input → verify
│   │   │       └── actions.ts            # verifyOtp
│   │   │
│   │   ├── (app)/                        # Authenticated route group
│   │   │   ├── layout.tsx                # App layout: nav, offline banner
│   │   │   │
│   │   │   ├── books/                    # Book catalog (FR7-FR13)
│   │   │   │   ├── page.tsx              # Browse, search, filter
│   │   │   │   ├── loading.tsx           # Catalog skeleton
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx          # Book detail + request button
│   │   │   │   │   └── actions.ts        # requestBorrow
│   │   │   │   └── actions.ts            # (none needed — read-only page)
│   │   │   │
│   │   │   ├── borrowing/                # My borrowings (FR14, FR21-FR22)
│   │   │   │   ├── page.tsx              # Active borrows, due dates, history
│   │   │   │   └── loading.tsx
│   │   │   │
│   │   │   ├── profile/                  # Member profile (FR6, FR30-FR32)
│   │   │   │   ├── page.tsx              # XP, level, trust status, streak
│   │   │   │   ├── actions.ts            # updateProfile
│   │   │   │   └── loading.tsx
│   │   │   │
│   │   │   ├── admin/                    # Evangelist + Assistant routes
│   │   │   │   ├── layout.tsx            # Admin layout (role guard)
│   │   │   │   ├── dashboard/            # Evangelist dashboard (FR33)
│   │   │   │   │   ├── page.tsx          # Stats, pending, overdue, returns
│   │   │   │   │   └── loading.tsx
│   │   │   │   ├── requests/             # Borrow requests (FR15)
│   │   │   │   │   ├── page.tsx          # Pending requests list
│   │   │   │   │   └── actions.ts        # approveBorrow, declineBorrow
│   │   │   │   ├── issue/                # Direct issue Flow B (FR16)
│   │   │   │   │   ├── page.tsx          # Search member → issue book
│   │   │   │   │   └── actions.ts        # issueBook
│   │   │   │   ├── returns/              # Return processing (FR17)
│   │   │   │   │   ├── page.tsx          # Search member → mark returned
│   │   │   │   │   └── actions.ts        # returnBook
│   │   │   │   ├── inventory/            # Book management (FR9-FR11)
│   │   │   │   │   ├── page.tsx          # Book list with CRUD
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx      # Add book form
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx      # Edit book form
│   │   │   │   │   │   └── actions.ts    # updateBook, deleteBook
│   │   │   │   │   └── actions.ts        # createBook
│   │   │   │   ├── members/              # Member management (FR3, FR34-FR35)
│   │   │   │   │   ├── page.tsx          # Member list, verification queue
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx      # Member detail + history
│   │   │   │   │   └── actions.ts        # verifyMember, rejectMember
│   │   │   │   └── reports/              # Board reports (FR36-FR37)
│   │   │   │       ├── page.tsx          # Monthly summary, popular books
│   │   │   │       └── loading.tsx
│   │   │   │
│   │   │   └── super-admin/              # Super Admin routes
│   │   │       ├── layout.tsx            # Super admin role guard
│   │   │       ├── churches/             # Church management (FR40-FR41)
│   │   │       │   ├── page.tsx          # Church list + aggregate stats
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx      # Create church form
│   │   │       │   ├── [id]/
│   │   │       │   │   └── page.tsx      # Church config + assign admin
│   │   │       │   └── actions.ts        # createChurch, assignChurchAdmin
│   │   │       └── system/               # System settings (FR42)
│   │   │           └── page.tsx          # System-wide stats, SMS config
│   │   │
│   │   └── api/                          # API routes (non-CRUD only)
│   │       ├── cron/
│   │       │   ├── penalty-check/
│   │       │   │   └── route.ts          # Daily: penalty escalation (FR27-FR29)
│   │       │   └── sms-batch/
│   │       │       └── route.ts          # Hourly: process SMS queue (FR39)
│   │       └── sync/
│   │           └── route.ts              # Offline queue sync (FR22, FR44)
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui (auto-generated, do not edit)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...                       # Added as needed via shadcn CLI
│   │   ├── domain/                       # Business-specific UI
│   │   │   ├── BookCard.tsx              # Book display card
│   │   │   ├── BookGrid.tsx              # Catalog grid layout
│   │   │   ├── BorrowButton.tsx          # Request / issue trigger
│   │   │   ├── BorrowingCard.tsx         # Active borrowing display
│   │   │   ├── DueDateBadge.tsx          # Due date with color coding
│   │   │   ├── XpDisplay.tsx             # XP points + level badge
│   │   │   ├── TrustProgressBar.tsx      # Trust progression indicator
│   │   │   ├── MemberSearchInput.tsx     # Admin member search
│   │   │   ├── RequestCard.tsx           # Pending request card (admin)
│   │   │   ├── OverdueAlert.tsx          # Overdue warning display
│   │   │   ├── StatsCard.tsx             # Dashboard statistics card
│   │   │   └── OtpInput.tsx              # OTP digit input
│   │   └── layout/                       # Layout components
│   │       ├── AppNav.tsx                # Main navigation
│   │       ├── AdminNav.tsx              # Admin sidebar/nav
│   │       ├── OfflineBanner.tsx         # Network status banner
│   │       ├── SuspensionBanner.tsx      # Borrowing suspended notice
│   │       └── PageHeader.tsx            # Consistent page headers
│   │
│   ├── hooks/
│   │   ├── useOnlineStatus.ts            # Network detection
│   │   ├── useOfflineQueue.ts            # IndexedDB queue management
│   │   └── useDebounce.ts                # Search input debounce
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── config.ts                 # NextAuth v5 configuration
│   │   │   ├── credentials.ts            # Credentials provider (OTP)
│   │   │   └── rbac.ts                   # Role permission maps
│   │   ├── db/
│   │   │   ├── index.ts                  # Drizzle client (Neon HTTP)
│   │   │   ├── schema/
│   │   │   │   ├── auth.ts               # users, otp_codes
│   │   │   │   ├── catalog.ts            # books, categories
│   │   │   │   ├── borrowing.ts          # borrowings, penalties
│   │   │   │   ├── gamification.ts       # xp_events, levels
│   │   │   │   ├── system.ts             # churches, audit_log, sms_log
│   │   │   │   ├── relations.ts          # Drizzle relations definitions
│   │   │   │   └── index.ts              # Barrel re-export
│   │   │   ├── queries/
│   │   │   │   ├── bookQueries.ts        # Book CRUD + search
│   │   │   │   ├── borrowingQueries.ts   # Borrowing operations + trust
│   │   │   │   ├── userQueries.ts        # User CRUD + verification
│   │   │   │   ├── dashboardQueries.ts   # Aggregation queries
│   │   │   │   ├── auditQueries.ts       # Audit log operations
│   │   │   │   ├── smsQueries.ts         # SMS queue operations
│   │   │   │   ├── xpQueries.ts          # XP award + level queries
│   │   │   │   └── churchQueries.ts      # Church CRUD
│   │   │   ├── migrations/               # Drizzle Kit generated SQL
│   │   │   └── seed.ts                   # Development seed data
│   │   ├── sms/
│   │   │   └── service.ts                # SMS Leopard integration
│   │   ├── sync/
│   │   │   └── processor.ts              # Offline queue sync logic
│   │   └── utils/
│   │       ├── cn.ts                     # clsx + tailwind-merge
│   │       ├── dates.ts                  # Due date calculation, EAT formatting
│   │       └── penalties.ts              # Escalation stage calculator
│   │
│   ├── providers/
│   │   ├── AuthProvider.tsx              # NextAuth SessionProvider
│   │   ├── SyncProvider.tsx              # Offline sync context
│   │   └── ThemeProvider.tsx             # next-themes provider
│   │
│   ├── types/
│   │   ├── auth.ts                       # UserRole, Session extensions
│   │   ├── actions.ts                    # ActionResult<T>, ErrorCode
│   │   ├── borrowing.ts                  # BorrowStatus, PenaltyStage
│   │   └── sms.ts                        # SmsType, SmsStatus
│   │
│   └── test/
│       └── setup.ts                      # Vitest global setup
```

### Architectural Boundaries

**Data Access Boundary:**
```
Client Component → Server Action → Query Function → Drizzle ORM → Neon HTTP → PostgreSQL
                   (validation)    (business logic)   (type-safe)    (stateless)
```
No component or Server Action writes raw SQL. All DB access goes through `lib/db/queries/*.ts`.

**Authentication Boundary:**
```
Request → middleware.ts → JWT validation → Role check → Page render
                          ↓ fail           ↓ fail
                          → /login          → /not-found (403)
```
Middleware runs on every request. Pages never check auth themselves — it's pre-validated.

**Offline Boundary:**
```
Online: Component → Server Action → DB
Offline: Component → useOfflineQueue → IndexedDB → [reconnect] → /api/sync → DB
```
Only catalog browsing and borrow requests work offline. Admin actions require live connectivity.

**SMS Boundary:**
```
Server Action / Cron → lib/sms/service.ts → sms_log table → [cron batch] → SMS Leopard API
                       (single entry point)   (DB queue)      (rate limited)   (external)
```
All SMS goes through `lib/sms/service.ts`. No direct SMS Leopard API calls from actions.

### Requirements to Structure Mapping

**FR Category → Directory Mapping:**

| FR Category | Route | Actions | Queries | Components |
|---|---|---|---|---|
| Registration & Identity (FR1-FR6) | `(auth)/login`, `(auth)/verify`, `profile/` | `sendOtp`, `verifyOtp`, `updateProfile` | `userQueries.ts` | `OtpInput`, `XpDisplay` |
| Book Catalog (FR7-FR13) | `books/`, `books/[id]/` | (read-only pages) | `bookQueries.ts` | `BookCard`, `BookGrid` |
| Borrowing & Returns (FR14-FR23) | `books/[id]/`, `borrowing/`, `admin/requests/`, `admin/issue/`, `admin/returns/` | `requestBorrow`, `approveBorrow`, `declineBorrow`, `issueBook`, `returnBook` | `borrowingQueries.ts` | `BorrowButton`, `BorrowingCard`, `RequestCard` |
| Trust & Penalties (FR24-FR29) | `api/cron/penalty-check/` | (cron-triggered) | `borrowingQueries.ts`, `smsQueries.ts` | `TrustProgressBar`, `SuspensionBanner`, `DueDateBadge` |
| Gamification (FR30-FR32) | `profile/` | (triggered within borrowing actions) | `xpQueries.ts` | `XpDisplay` |
| Dashboard & Reports (FR33-FR39) | `admin/dashboard/`, `admin/reports/`, `admin/members/` | `verifyMember`, `rejectMember` | `dashboardQueries.ts`, `auditQueries.ts` | `StatsCard`, `OverdueAlert` |
| System Admin (FR40-FR44) | `super-admin/churches/`, `super-admin/system/` | `createChurch`, `assignChurchAdmin` | `churchQueries.ts` | (standard forms) |

**Cross-Cutting Concerns Mapping:**

| Concern | Files |
|---|---|
| Authentication | `middleware.ts`, `lib/auth/*`, `providers/AuthProvider.tsx` |
| Offline Support | `src/sw.ts`, `hooks/useOfflineQueue.ts`, `hooks/useOnlineStatus.ts`, `components/layout/OfflineBanner.tsx`, `api/sync/route.ts`, `lib/sync/processor.ts` |
| SMS Integration | `lib/sms/service.ts`, `lib/db/queries/smsQueries.ts`, `api/cron/sms-batch/route.ts` |
| Audit Logging | `lib/db/queries/auditQueries.ts`, `lib/db/schema/system.ts` |
| Error Handling | `types/actions.ts` (ActionResult, ErrorCode), `app/error.tsx`, route-level `error.tsx` |

### Integration Points

**External Integrations:**

| Service | Integration Point | Used By |
|---|---|---|
| Neon PostgreSQL | `lib/db/index.ts` | All query functions |
| SMS Leopard | `lib/sms/service.ts` | OTP delivery, penalty reminders, notifications |
| Vercel Cron | `vercel.json` → `api/cron/*` | Penalty escalation, SMS batch |
| Vercel Analytics | Auto-injected | Web Vitals monitoring |

**Data Flow — Borrow Request (Flow A):**
```
Member: books/[id]/page.tsx → requestBorrow (action) → borrowingQueries.createBorrowing → DB
  ↓ SMS notification
Evangelist: admin/requests/page.tsx → approveBorrow (action) → borrowingQueries.updateStatus → DB
  ↓ SMS notification to member
  ↓ logAudit()
Member: borrowing/page.tsx → sees approved request with due date
```

**Data Flow — Penalty Escalation:**
```
Vercel Cron (daily) → api/cron/penalty-check/route.ts
  → borrowingQueries.getOverdueBorrowings()
  → penalties.calculateEscalationStage(daysOverdue)
  → smsQueries.queueSms() (if not already sent)
  → borrowingQueries.updateStatus() (suspend at Day 7, high-risk at Day 14)

Vercel Cron (hourly) → api/cron/sms-batch/route.ts
  → smsQueries.getPendingSms()
  → sms/service.ts → SMS Leopard API (rate-limited)
  → smsQueries.updateSmsStatus()
```

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:**
All technology choices are mutually compatible. Next.js 16 App Router + React 19 supports Server Actions natively. Drizzle ORM 0.45.x works with `@neondatabase/serverless` HTTP driver without TCP pool complexity. NextAuth v5 beta integrates with App Router middleware for RBAC. Tailwind CSS 4 + shadcn/ui + Radix provide a consistent component layer. Serwist 9.x handles PWA service worker with the documented `--webpack` production build flag. `idb` provides IndexedDB access for offline queue without framework conflicts.

**Pattern Consistency:**
All naming conventions align — snake_case for database (tables, columns, indexes), camelCase for TypeScript/React, PascalCase for components and types. Server Action naming (`{verb}{Entity}`) and Zod schema naming (`{entity}{Action}Schema`) follow a single consistent convention. The 4-group import ordering rule applies uniformly. The `ActionResult<T>` return pattern is used by all Server Actions without exception.

**Structure Alignment:**
The project directory structure directly supports all architectural decisions. Route groups `(auth)/` and `(app)/` enforce the authentication boundary. The `lib/db/schema/` split by domain (auth, catalog, borrowing, gamification, system) mirrors the Drizzle schema organization decision. The `lib/db/queries/` layer enforces the data access boundary (Action → Query → Drizzle). The `lib/sms/service.ts` centralisation matches the SMS architecture decision. Providers directory supports the Context-based state management choice.

### Requirements Coverage Validation

**Functional Requirements Coverage (44/44):**

| FR Range | Capability Area | Key Files |
|---|---|---|
| FR-REG-001 to FR-REG-004 | Registration & Onboarding | `(auth)/`, `lib/auth/`, `lib/db/schema/auth.ts` |
| FR-CAT-001 to FR-CAT-005 | Book Catalog | `(app)/books/`, `lib/db/queries/catalog.ts` |
| FR-BOR-001 to FR-BOR-010 | Borrowing & Returns | `(app)/borrowing/`, `(app)/admin/requests/`, `lib/db/queries/borrowing.ts` |
| FR-TRU-001 to FR-TRU-006 | Trust & Penalties | `lib/db/queries/penalties.ts`, `api/cron/penalty-check/` |
| FR-GAM-001 to FR-GAM-005 | Gamification | `lib/db/queries/gamification.ts`, `components/domain/` |
| FR-DSH-001 to FR-DSH-008 | Dashboard | `(app)/admin/dashboard/`, `(app)/page.tsx` |
| FR-ADM-001 to FR-ADM-006 | Administration | `(app)/admin/`, `(app)/super-admin/` |

**Non-Functional Requirements Coverage (6/6):**

| NFR Category | Architectural Support |
|---|---|
| Performance | Neon HTTP driver (no connection pool), React cache(), `<Suspense>` streaming, `loading.tsx` skeletons, < 200KB JS target |
| Security | NextAuth v5 JWT + RBAC middleware, bcrypt OTP hashing, UUID v4 PKs, audit trail in system schema, `CRON_SECRET` header validation |
| Scalability | `churchId` FK on all entities (multi-church prep), Drizzle schema split by domain, stateless HTTP driver |
| Accessibility | shadcn/ui + Radix (WCAG 2.1 AA built-in), semantic HTML, keyboard navigation |
| Integration | SMS Leopard via centralized `lib/sms/service.ts`, DB-backed queue, rate limiting, cost tracking |
| Reliability | Serwist PWA caching, IndexedDB offline queue with UUID idempotency, calendar-based penalty advancement via Vercel Cron |

### Implementation Readiness Validation

**Decision Completeness:**
All critical decisions are documented with specific versions (Next.js 16, React 19, Drizzle 0.45.x, NextAuth v5 beta, Tailwind CSS 4, Serwist 9.x, idb 8.x). Implementation patterns are comprehensive with concrete code examples for Server Actions, Zod schemas, query functions, audit logging, and form patterns. Consistency rules cover all 18 identified conflict points.

**Structure Completeness:**
The project tree defines ~80 files across all directories. Every route, component, hook, library file, provider, type file, and configuration file is specified. Integration points (cron routes, sync endpoint, SMS service) are explicitly placed in the structure.

**Pattern Completeness:**
All potential conflict points are addressed with explicit rules: naming (database, API, code), structure (tests co-located, feature-based components), format (API responses, dates, pagination), communication (state management, error handling), and process (loading states, error recovery, import ordering). Anti-patterns are documented to prevent common mistakes.

### Gap Analysis Results

**Critical Gaps:** None identified.

**Important Gaps (2):**

1. **Vercel Cron Route Authentication** — The cron routes (`api/cron/penalty-check/`, `api/cron/sms-batch/`) need `CRON_SECRET` header validation to prevent unauthorized invocation. Pattern: check `request.headers.get('Authorization') === Bearer ${process.env.CRON_SECRET}` and return 401 if invalid. This is a straightforward implementation detail.

2. **SMS Leopard API Specifics** — The exact API endpoint URLs, request/response formats, and error codes for SMS Leopard are deferred to implementation. The architecture defines the centralised service boundary (`lib/sms/service.ts`) and DB-backed queue pattern. API-specific details will be resolved during Epic implementation using SMS Leopard documentation.

**Nice-to-Have Gaps:**
- Sentry error monitoring integration deferred post-MVP
- E2E test framework selection deferred to implementation phase
- Bundle analysis tooling can be added during optimization

### Validation Issues Addressed

No critical or blocking issues were found. The two important gaps identified above are implementation-level details that do not affect architectural decisions. The architecture document provides sufficient guidance for AI agents to resolve these during development.

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed (44 FRs, 6 NFR categories)
- [x] Scale and complexity assessed (Medium, Full-stack PWA)
- [x] Technical constraints identified (80 project context rules)
- [x] Cross-cutting concerns mapped (7 concerns to specific locations)

**Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified (11 core technologies)
- [x] Integration patterns defined (SMS, Cron, Offline Sync)
- [x] Performance considerations addressed (caching, streaming, bundle size)

**Implementation Patterns**

- [x] Naming conventions established (database, API, code)
- [x] Structure patterns defined (co-located tests, feature-based)
- [x] Communication patterns specified (state management, events)
- [x] Process patterns documented (error handling, loading, imports)

**Project Structure**

- [x] Complete directory structure defined (~80 files)
- [x] Component boundaries established (4 architectural boundaries)
- [x] Integration points mapped (cron, sync, SMS)
- [x] Requirements to structure mapping complete (44 FRs mapped)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — based on zero critical gaps, comprehensive pattern coverage, and complete requirements mapping.

**Key Strengths:**
- Every FR has a clear home in the project structure
- 18 AI agent conflict points explicitly resolved with patterns
- State machines (penalty escalation, trust progression) have detailed flow documentation
- Offline-first architecture fully specified with sync strategy
- Multi-church preparation baked in from the start via `churchId` FK

**Areas for Future Enhancement:**
- Sentry integration for production error monitoring (post-MVP)
- E2E testing framework selection and setup
- Bundle optimization and analysis tooling
- Advanced caching strategies as usage patterns emerge

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries — never bypass the data access layer
- Refer to this document for all architectural questions
- When in doubt, check the 9 enforcement rules in the Implementation Patterns section

**First Implementation Priority:**
Run `npx create-next-app@latest bookclub --yes` then layer in dependencies as documented in the Starter Template Evaluation section. Set up the Drizzle schema files first to establish the data foundation.
