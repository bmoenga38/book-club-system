---
project_name: 'bookclub'
user_name: 'brian'
date: '2026-02-25'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'critical_dont_miss']
status: 'complete'
rule_count: 80
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript (strict mode) | 5.x |
| Runtime | React | 19.x |
| Database | Neon PostgreSQL (serverless HTTP) | @neondatabase/serverless |
| ORM | Drizzle ORM + Drizzle Zod + Drizzle Kit | 0.45.x |
| Auth | NextAuth v5 (credentials + OTP) | 5.x-beta |
| UI Framework | Tailwind CSS 4 | 4.x |
| Component Library | shadcn + Radix UI | latest |
| Icons | Lucide React | latest |
| Forms | React Hook Form + Zod | RHF 7.x / Zod 4.x |
| Toasts | Sonner | 2.x |
| PWA | Serwist + @serwist/next | 9.x |
| Offline Storage | idb (IndexedDB) | 8.x |
| Unit Testing | Vitest + Testing Library | latest |
| E2E Testing | Playwright | latest |
| Linting | ESLint 9 + eslint-config-next | 9.x |
| Theming | next-themes | 0.4.x |

### Architecture Decisions

- **Single-tenant** application (no subdomain routing or multi-tenant DB resolution)
- **OTP/phone-based authentication** via SMS (SMS Leopard integration)
- **PWA with offline support** — service worker caching, IndexedDB offline queue, sync endpoint
- **Neon serverless HTTP driver** — no persistent TCP connections, edge-ready
- **Supabase** used for backend services (storage, etc.) — not as control plane
- **Vercel deployment** target

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

- **Strict mode** — `strict: true`, no `any` types allowed
- **Path aliases** — `@/*` maps to `src/*`
- **`import "server-only"`** at the top of any module with sensitive logic (DB queries, auth config, secrets)
- **Named exports** preferred over default exports for utilities and types
- **Barrel exports** (`index.ts`) only at component library level, never in `lib/`
- **`ActionResult<T>`** for all Server Action return types:
  - `{ success: true; data: T }` or `{ success: false; error: { code, message, field? } }`
- **PascalCase** for types/interfaces; type-branded primitives for domain values (e.g., `MoneyCents`)
- **Never throw from Server Actions** — always return `ActionResult` with error
- **ErrorCode enum**: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `RATE_LIMITED`
- **Always `await`** Next.js dynamic APIs: `await headers()`, `await cookies()`
- **`async/await`** over raw Promises — no `.then()` chains
- **`"use server"`** directive on all Server Action files

### Framework-Specific Rules (Next.js + React)

- **Server Components by default** — pages and layouts are RSC, no `"use client"` unless interactivity required
- **`"use client"`** only for: event handlers, hooks, browser APIs, form state
- **Server Actions** in dedicated `actions.ts` files with `"use server"` — never inline in components
- **Data fetching** in Server Components directly — no `useEffect` for initial data
- **Client Components** receive data as props from Server Components
- **Mutations** via Server Actions only — never direct API calls from client
- **Root layout** wraps providers: `AuthProvider`, `SyncProvider`, theme provider — all `"use client"` components
- **Middleware** handles: JWT validation, auth checks, role-based route protection, static asset exclusion
- **App Router structure**: `(auth)/` group for login/verify, `api/` for routes, role-based folders for protected pages
- **PWA**: Serwist service worker in `src/sw.ts` → `public/sw.js`
- **Offline queue**: `useOfflineQueue` hook + IndexedDB with idempotency keys, `/api/sync` processes on reconnect
- **`useOnlineStatus`** hook for network detection, `OfflineBanner` component for UI feedback
- **Custom hooks** in `src/hooks/` — camelCase filenames, must handle cleanup in `useEffect`
- **No data fetching in hooks** for initial load — Server Components handle that

### Testing Rules

- **Colocated tests** — `*.test.ts` / `*.test.tsx` alongside source files
- **E2E tests** in dedicated `e2e/` directory at project root
- **Test setup** in `src/test/setup.ts`
- **Vitest** with `jsdom` environment for component tests
- **`@testing-library/react`** for rendering — never test implementation details
- **`@testing-library/user-event`** for interaction simulation
- **Mock externals** at module level: `@neondatabase/serverless`, `next-auth`
- **`fake-indexeddb`** for offline queue tests
- **Test Server Actions** by importing directly — mock DB layer, not the action
- **Playwright E2E**: Chromium + Mobile Chrome (Pixel 5), HTML reporter
- **Offline E2E scenarios** with `page.context().setOffline(true)`
- **Unit test scope**: pure functions, hooks, validators, utilities
- **Component test scope**: render + interaction, mock Server Actions
- **E2E test scope**: full user flows — login, borrow, return, admin
- **Always test**: all Server Actions (success + every error path), Zod validators with edge cases, offline queue enqueue/dequeue/sync, role-based access redirects

### Code Quality & Style Rules

- **Component files**: PascalCase — `BookCard.tsx`, `BorrowModal.tsx`
- **Utility files**: camelCase — `bookQueries.ts`, `validators.ts`
- **Hook files**: camelCase with `use` prefix — `useOfflineQueue.ts`
- **Server Action files**: `actions.ts` inside route folders
- **Types**: PascalCase — `BookRecord`, `BorrowStatus`, `UserRole`
- **Constants**: UPPER_SNAKE_CASE — `MAX_OTP_ATTEMPTS`, `OTP_EXPIRY_MS`
- **Drizzle enums**: camelCase name, lowercase values — `borrowStatus: ['pending', 'confirmed', 'returned']`
- **Folder structure**: `app/` (routes), `components/{ui,domain,layout}/`, `hooks/`, `lib/{auth,db,sync}/`, `providers/`, `types/`
- **shadcn components** in `components/ui/` — auto-generated, do not manually edit
- **Domain components** in `components/domain/` — business-specific UI
- **ESLint 9** + eslint-config-next — `npm run lint` before commit
- **`tsc --noEmit`** must pass — `npm run typecheck`
- **`cn()` utility** (clsx + tailwind-merge) for conditional Tailwind classes
- **No inline styles** — all styling via Tailwind utility classes
- **Components under 150 lines** — extract sub-components if larger
- **No JSDoc everywhere** — only on non-obvious public APIs
- **`// IMPORTANT:`** comments for critical business logic gotchas

### Development Workflow Rules

- **Branch naming**: `feat/short-description`, `fix/short-description`, `chore/short-description`
- **Commit messages**: Conventional commits — `feat: add book borrowing flow`, `fix: OTP expiry check`
- **No direct commits to `main`** — always feature branches
- **PR checklist**: lint passes, typecheck passes, tests pass, no `any` types
- **Scripts**: `dev` (Turbopack), `build` (Webpack), `lint`, `typecheck`, `test`, `test:watch`, `test:e2e`, `db:generate`, `db:migrate`, `db:push`, `db:studio`
- **Schema changes**: edit `src/lib/db/schema.ts` → `db:generate` → review SQL → `db:migrate`
- **Never `db:push` in production** — migrations only
- **Seed data** via `src/lib/db/seed.ts` for development
- **`.env.local`** for local dev (never committed), **`.env.example`** committed with placeholders
- **Required env vars**: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `SMSLEOPARD_*`
- **Vercel deployment** — preview on PR branches, production on merge to `main`

### Critical Don't-Miss Rules

**Anti-Patterns:**
- **NEVER `fetch()` from client to call Server Actions** — import and call directly
- **NEVER store secrets in `NEXT_PUBLIC_*` env vars** — exposed to browser
- **NEVER use floating-point for money** — always integer cents (5000 = KES 50.00)
- **NEVER use `localStorage` for auth** — NextAuth handles sessions via HTTP-only cookies
- **NEVER create API routes for CRUD** when Server Actions suffice — API routes only for webhooks, cron, sync, push
- **NEVER import `server-only` modules in `"use client"` files** — build fails silently or at runtime

**Edge Cases:**
- **OTP rate limiting**: 15-min cooldown, max 3 attempts before lockout, 5-min expiry
- **Offline queue**: items must have idempotency keys (UUID v4) to prevent double-processing
- **Neon cold starts**: first query after idle may be slow — show loading states
- **Service worker caching**: never cache API responses or Server Action results — static assets and offline page only

**Security:**
- **OTP hashed in DB** — never store plain-text
- **`server-only`** on all DB query modules, auth config, secret-handling code
- **Validate all inputs server-side with Zod** — client validation is UX only
- **UUID v4 for all primary keys** — never sequential integers (prevents enumeration)
- **CSRF protection** built into Server Actions — no additional tokens needed

**Performance:**
- **Neon HTTP is stateless** — no connection pooling, each query is HTTP request
- **Avoid N+1 queries** — use Drizzle joins or batch queries
- **`React.memo`** only when profiler confirms re-render problems
- **`next/image`** with proper width/height — never raw `<img>` tags

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-02-25
