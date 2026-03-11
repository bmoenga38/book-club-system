# Story 1.1: Project Initialization & Configuration

Status: done

## Story

As a developer,
I want the project scaffolded with all dependencies, configuration, and foundational types,
So that all subsequent stories have a consistent, working development environment.

## Acceptance Criteria

1. **Given** the project doesn't exist **When** `npx create-next-app@latest bookclub --yes` is run **Then** a Next.js 16 project is created with TypeScript strict, Tailwind CSS 4, ESLint 9, App Router, `@/*` path alias

2. **Given** the project is initialized **When** all dependencies are installed (shadcn/ui, @neondatabase/serverless, drizzle-orm, drizzle-zod, drizzle-kit, next-auth@beta, @serwist/next, @serwist/precaching, @serwist/sw, idb, react-hook-form, zod, sonner, vitest, @testing-library/react, playwright) **Then** `npm run dev` starts without errors and `npm run build --webpack` succeeds

3. **Given** dependencies are installed **When** configuration files are created (drizzle.config.ts, next.config.ts with Serwist plugin, vercel.json with cron stubs, components.json, .env.example with all required vars) **Then** each config file is valid and referenced correctly

4. **Given** the project structure exists **When** foundational types are created (`src/types/actions.ts` with ActionResult<T> and ErrorCode enum, `src/types/auth.ts` with UserRole enum and Session extensions) **Then** TypeScript compilation passes with `tsc --noEmit`

5. **Given** the project structure exists **When** utility files (`lib/utils/cn.ts`, `lib/utils/dates.ts`), root layout, globals.css, error.tsx, loading.tsx, not-found.tsx, and provider shells (AuthProvider, ThemeProvider) are created **Then** the app renders a styled page with Tailwind CSS 4

## Tasks / Subtasks

- [x] Task 1: Scaffold Next.js 16 project (AC: #1)
  - [x] 1.1: Run `npx create-next-app@latest bookclub --yes`
  - [x] 1.2: Verify TypeScript strict mode, Tailwind CSS 4, ESLint 9, App Router, `@/*` alias are enabled
  - [x] 1.3: Verify `npm run dev` starts without errors

- [x] Task 2: Install all dependencies (AC: #2)
  - [x] 2.1: shadcn/ui init — `npx shadcn@latest init`
  - [x] 2.2: Database layer — `npm install @neondatabase/serverless drizzle-orm drizzle-zod` + `npm install -D drizzle-kit`
  - [x] 2.3: Authentication — `npm install next-auth@beta`
  - [x] 2.4: PWA — `npm install @serwist/next @serwist/precaching @serwist/sw idb`
  - [x] 2.5: Forms + Validation + Toast — `npm install react-hook-form zod sonner`
  - [x] 2.6: Theming — `npm install next-themes`
  - [x] 2.7: Testing — `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
  - [x] 2.8: E2E Testing — `npm install -D playwright @playwright/test`

- [x] Task 3: Configure root-level files (AC: #3)
  - [x] 3.1: Create `drizzle.config.ts`
  - [x] 3.2: Update `next.config.ts` with Serwist `withSerwistInit` wrapper
  - [x] 3.3: Create `vercel.json` with cron job stubs
  - [x] 3.4: Update `tsconfig.json` — add `@serwist/next/typings` to types, `webworker` to lib
  - [x] 3.5: Create `.env.example` with all required placeholder variables
  - [x] 3.6: Update `package.json` scripts

- [x] Task 4: Create foundational types (AC: #4)
  - [x] 4.1: Create `src/types/actions.ts` — `ActionResult<T>`, `ErrorCode` enum
  - [x] 4.2: Create `src/types/auth.ts` — `UserRole` enum, Session type extensions
  - [x] 4.3: Create `src/types/borrowing.ts` — `BorrowStatus`, `PenaltyStage` (shell)
  - [x] 4.4: Create `src/types/sms.ts` — `SmsType`, `SmsStatus` (shell)
  - [x] 4.5: Run `tsc --noEmit` to verify compilation

- [x] Task 5: Create utility files (AC: #5)
  - [x] 5.1: Create `src/lib/utils/cn.ts` — clsx + tailwind-merge
  - [x] 5.2: Create `src/lib/utils/dates.ts` — EAT formatting, due date arithmetic

- [x] Task 6: Create provider shells (AC: #5)
  - [x] 6.1: Create `src/providers/AuthProvider.tsx` — NextAuth SessionProvider wrapper
  - [x] 6.2: Create `src/providers/ThemeProvider.tsx` — next-themes ThemeProvider wrapper
  - [x] 6.3: Create `src/providers/SyncProvider.tsx` — offline sync context shell

- [x] Task 7: Create app shell pages (AC: #5)
  - [x] 7.1: Update `src/app/layout.tsx` — wire providers, fonts, metadata
  - [x] 7.2: Update `src/app/globals.css` — Tailwind CSS 4 imports + CSS variables
  - [x] 7.3: Create `src/app/loading.tsx` — root loading skeleton
  - [x] 7.4: Create `src/app/error.tsx` — root error boundary (`"use client"`)
  - [x] 7.5: Create `src/app/not-found.tsx` — 404 page
  - [x] 7.6: Create `src/app/(auth)/layout.tsx` — auth layout shell (centered, minimal)
  - [x] 7.7: Create `src/app/(app)/layout.tsx` — authenticated app layout shell

- [x] Task 8: Create DB schema shell files
  - [x] 8.1: Create `src/lib/db/schema/auth.ts` — empty shell with structure comment
  - [x] 8.2: Create `src/lib/db/schema/catalog.ts` — empty shell
  - [x] 8.3: Create `src/lib/db/schema/borrowing.ts` — empty shell
  - [x] 8.4: Create `src/lib/db/schema/gamification.ts` — empty shell
  - [x] 8.5: Create `src/lib/db/schema/system.ts` — empty shell
  - [x] 8.6: Create `src/lib/db/schema/relations.ts` — empty shell
  - [x] 8.7: Create `src/lib/db/schema/index.ts` — barrel re-export

- [x] Task 9: Create PWA shell files
  - [x] 9.1: Create `src/sw.ts` — Serwist service worker source shell
  - [x] 9.2: Create `public/manifest.json` — PWA manifest with church-themed config

- [x] Task 10: Create test setup
  - [x] 10.1: Create `src/test/setup.ts` — Vitest global setup
  - [x] 10.2: Create `e2e/playwright.config.ts` — Chromium + Mobile Chrome (Pixel 5)

- [x] Task 11: Verify build
  - [x] 11.1: Run `npm run lint` — ESLint passes
  - [x] 11.2: Run `npm run typecheck` — TypeScript compilation passes
  - [x] 11.3: Run `npm run dev` — dev server starts without errors
  - [x] 11.4: Run `npm run build` — production build succeeds with Webpack

## Dev Notes

### Architecture Compliance

**CRITICAL: Follow these rules from the start. Every subsequent story depends on this foundation.**

#### Starter Template
- **Command:** `npx create-next-app@latest bookclub --yes`
- This creates: Next.js 16.x, TypeScript strict, Tailwind CSS 4, ESLint 9, App Router, Turbopack dev, `@/*` path alias to `src/*`
- **Rationale:** Official starter avoids introducing conflicting opinions (tRPC, Prisma, outdated patterns) — we layer each technology deliberately per architecture

#### Post-Init Dependency Installation Order
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

# 6. Theming
npm install next-themes

# 7. Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D playwright @playwright/test
```

#### Build Tooling
- **Dev server:** `next dev --turbopack` (fast HMR)
- **Production build:** `next build --webpack` (Serwist requires Webpack, NOT Turbopack)
- **IMPORTANT:** Serwist does NOT support Turbopack. The `--webpack` flag is mandatory for production builds.

### Configuration File Specifications

#### `drizzle.config.ts`
```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema/index.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```
[Source: architecture.md — Data Architecture Decisions]

#### `next.config.ts` (with Serwist)
```typescript
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {};

export default withSerwist(nextConfig);
```
- **CRITICAL:** `swSrc` is `"src/sw.ts"` (not `"app/sw.ts"`) because we use `src/` directory
- **CRITICAL:** Disable in development because Serwist requires Webpack and dev uses Turbopack
[Source: architecture.md — PWA Infrastructure; Serwist docs]

#### `tsconfig.json` additions
Add to existing `compilerOptions`:
```json
{
  "compilerOptions": {
    "types": ["@serwist/next/typings"],
    "lib": ["dom", "dom.iterable", "esnext", "webworker"]
  },
  "exclude": ["public/sw.js"]
}
```
[Source: Serwist documentation — TypeScript setup]

#### `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/penalty-check",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/sms-batch",
      "schedule": "0 * * * *"
    }
  ]
}
```
[Source: architecture.md — Infrastructure Decisions]

#### `.env.example`
```
# Database
DATABASE_URL=postgresql://user:password@host/bookclub?sslmode=require

# Authentication
AUTH_SECRET=your-auth-secret-here
AUTH_URL=http://localhost:3000

# SMS Leopard
SMSLEOPARD_API_KEY=your-api-key
SMSLEOPARD_API_SECRET=your-api-secret
SMSLEOPARD_SENDER_ID=BookClub

# Cron Authentication
CRON_SECRET=your-cron-secret-here
```
[Source: architecture.md — Environment Variables; project-context.md]

#### `package.json` scripts
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx src/lib/db/seed.ts"
  }
}
```
[Source: project-context.md — Development Workflow Rules]

### Foundational Type Specifications

#### `src/types/actions.ts`
```typescript
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: ErrorCode; message: string; field?: string } };

export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  RATE_LIMITED = "RATE_LIMITED",
}
```
[Source: architecture.md — Error Handling; project-context.md]

#### `src/types/auth.ts`
```typescript
export enum UserRole {
  MEMBER = "member",
  ASSISTANT_LIBRARIAN = "assistant_librarian",
  CHURCH_ADMIN = "church_admin",
  SUPER_ADMIN = "super_admin",
}

// NextAuth Session extension
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      churchId: string;
      name: string;
      phone: string;
    };
  }

  interface User {
    role: UserRole;
    churchId: string;
    phone: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: UserRole;
    churchId: string;
  }
}
```
[Source: architecture.md — JWT payload: userId, role, churchId, name; 4-tier RBAC]

#### `src/types/borrowing.ts` (shell)
```typescript
export enum BorrowStatus {
  PENDING = "pending",
  APPROVED = "approved",
  ISSUED = "issued",
  RETURNED = "returned",
  OVERDUE = "overdue",
}

export enum PenaltyStage {
  NONE = "none",
  REMINDER = "reminder",       // Day -3
  GENTLE = "gentle",           // Day 1
  WARNING = "warning",         // Day 7 — suspension
  HIGH_RISK = "high_risk",     // Day 14 — evangelist alert
}
```
[Source: PRD — Trust Progression & Penalties; architecture.md]

#### `src/types/sms.ts` (shell)
```typescript
export enum SmsType {
  OTP = "otp",
  APPROVAL = "approval",
  DECLINE = "decline",
  REMINDER = "reminder",
  WARNING = "warning",
  HIGH_RISK = "high_risk",
}

export enum SmsStatus {
  QUEUED = "queued",
  SENT = "sent",
  FAILED = "failed",
}
```
[Source: architecture.md — SMS Integration cross-cutting concern]

### Provider Shell Specifications

#### `src/providers/AuthProvider.tsx`
```typescript
"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```
[Source: architecture.md — Client state: React Context]

#### `src/providers/ThemeProvider.tsx`
```typescript
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
```
[Source: project-context.md — next-themes 0.4.x]

#### `src/providers/SyncProvider.tsx`
```typescript
"use client";

import { createContext, useContext, type ReactNode } from "react";

interface SyncContextValue {
  isOnline: boolean;
  queueCount: number;
}

const SyncContext = createContext<SyncContextValue>({
  isOnline: true,
  queueCount: 0,
});

export function SyncProvider({ children }: { children: ReactNode }) {
  // IMPORTANT: Full implementation in Epic 8 (PWA & Offline)
  // This is a shell provider to wire into root layout now
  return (
    <SyncContext.Provider value={{ isOnline: true, queueCount: 0 }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncContext() {
  return useContext(SyncContext);
}
```
[Source: architecture.md — SyncProvider: Offline sync context]

### Utility File Specifications

#### `src/lib/utils/cn.ts`
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
- **NOTE:** shadcn init may create `lib/utils.ts` — relocate to `lib/utils/cn.ts` per architecture convention
[Source: project-context.md — cn() utility (clsx + tailwind-merge)]

#### `src/lib/utils/dates.ts`
```typescript
/**
 * Date utilities for East African Time (EAT/UTC+3) formatting and due date calculation.
 * No external date libraries — uses Intl.DateTimeFormat + raw Date arithmetic per architecture.
 */

const EAT_FORMATTER = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeZone: "Africa/Nairobi",
});

const EAT_DATETIME_FORMATTER = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Nairobi",
});

export function formatDateEAT(date: Date): string {
  return EAT_FORMATTER.format(date);
}

export function formatDateTimeEAT(date: Date): string {
  return EAT_DATETIME_FORMATTER.format(date);
}

export function calculateDueDate(issueDate: Date, loanPeriodDays: number = 14): Date {
  return new Date(issueDate.getTime() + loanPeriodDays * 86400000);
}

export function daysUntilDue(dueDate: Date): number {
  const now = new Date();
  return Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);
}

export function isOverdue(dueDate: Date): boolean {
  return daysUntilDue(dueDate) < 0;
}
```
- **PROHIBITED:** Do NOT use dayjs or date-fns — `Intl.DateTimeFormat` + raw `Date` per architecture
[Source: architecture.md — Date/Time Handling conventions; anti-patterns]

### DB Schema Shell Structure

Create empty schema files with structural comments. Actual table definitions come in Story 1.2.

```
src/lib/db/schema/
├── auth.ts          # Will contain: users, otp_codes tables
├── catalog.ts       # Will contain: books, categories tables (Epic 2)
├── borrowing.ts     # Will contain: borrowings, penalties tables (Epic 3)
├── gamification.ts  # Will contain: xp_events, levels tables (Epic 5)
├── system.ts        # Will contain: churches, audit_log, sms_log tables
├── relations.ts     # Will contain: Drizzle relations definitions
└── index.ts         # Barrel re-export of all schemas
```
[Source: architecture.md — Schema Domain Split]

### PWA Shell Files

#### `src/sw.ts`
```typescript
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```
[Source: Serwist docs — Next.js getting started]

#### `public/manifest.json`
```json
{
  "name": "Book Club",
  "short_name": "BookClub",
  "description": "SDA Church Library Management System",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a365d",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```
[Source: architecture.md — PWA manifest with church-themed icons]

### Root Layout Wiring

#### `src/app/layout.tsx`
```typescript
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SyncProvider } from "@/providers/SyncProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Book Club",
  description: "SDA Church Library Management System",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1a365d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <SyncProvider>
              {children}
              <Toaster />
            </SyncProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```
- **Provider order:** ThemeProvider (outermost) → AuthProvider → SyncProvider (innermost)
- **Sonner Toaster:** global toast container for all user feedback
[Source: architecture.md — Root layout wraps providers; project-context.md]

### Test Setup

#### `src/test/setup.ts`
```typescript
import "@testing-library/jest-dom/vitest";
```

#### Vitest config in `vitest.config.ts`
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```
[Source: project-context.md — Testing Rules; Vitest with jsdom]

### Project Structure Notes

- All folder paths follow the architecture document exactly
- `components/ui/` is reserved for shadcn auto-generated components — do not manually edit
- `components/domain/` will hold business-specific UI (created as needed in later stories)
- `components/layout/` will hold layout components (OfflineBanner, AppNav, etc.)
- `lib/` uses flat structure — NO barrel exports in `lib/` (barrel only at component library level)
- `hooks/` for custom React hooks (useOnlineStatus, useOfflineQueue, useDebounce)
- `providers/` for context providers — all `"use client"` components

### Detected Variances

- **shadcn init** creates `lib/utils.ts` with `cn()` — architecture wants it at `lib/utils/cn.ts`. After shadcn init, move the file and update the import path in `components.json` to match.
- **Tailwind CSS 4** uses native CSS config (no `tailwind.config.ts` file) — shadcn may reference it. Verify shadcn compatibility with TC4 native CSS approach.
- **Next.js 16 `--yes` flag** auto-accepts all defaults including React Compiler. Verify this doesn't conflict with any architecture choices.

### Latest Technology Notes (Researched 2026-02-26)

- **Next.js 16.1.6** — latest stable. `--yes` flag accepts recommended defaults: TypeScript, ESLint, Tailwind CSS, App Router, Turbopack, React Compiler.
- **Serwist 9.x** — `withSerwistInit` is the correct import from `@serwist/next`. Must disable in dev mode (Turbopack incompatible). Requires `webworker` in tsconfig `lib` array and `@serwist/next/typings` in `types` array.
- **Drizzle ORM** — Use `drizzle-orm/neon-http` driver with `neon()` from `@neondatabase/serverless` for HTTP queries. No TCP connection pool.
- **NextAuth v5** — Still beta (`next-auth@beta`). Environment variables use `AUTH_` prefix (e.g., `AUTH_SECRET`). Credentials provider requires JWT strategy.
- **shadcn/ui** — `npx shadcn@latest init` creates `components.json`, generates `cn()` utility, updates CSS variables in `globals.css`.

### References

- [Source: architecture.md — Starter Template Evaluation]
- [Source: architecture.md — Data Architecture Decisions]
- [Source: architecture.md — Infrastructure Decisions (Vercel Cron)]
- [Source: architecture.md — Complete Project Directory Structure]
- [Source: architecture.md — Cross-Cutting Concerns Mapping]
- [Source: architecture.md — Architectural Boundaries]
- [Source: architecture.md — Date/Time Handling conventions]
- [Source: architecture.md — Error Handling flow]
- [Source: architecture.md — PWA Infrastructure]
- [Source: architecture.md — Enforcement Guidelines]
- [Source: project-context.md — Technology Stack & Versions]
- [Source: project-context.md — Critical Implementation Rules]
- [Source: project-context.md — Development Workflow Rules]
- [Source: prd.md — Web Application Specific Requirements: PWA]
- [Source: prd.md — Performance Targets]
- [Source: epics.md — Story 1.1: Project Initialization & Configuration]
- [Source: Serwist docs — @serwist/next Getting Started]
- [Source: Next.js docs — create-next-app CLI]
- [Source: Drizzle docs — Connect Neon]
- [Source: NextAuth docs — Migrating to v5]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- `create-next-app` refused to run in non-empty directory — scaffolded in temp dir, copied files over
- `shadcn init -y` was interactive — used `-d` (defaults) flag instead
- `next lint` removed in Next.js 16 — updated script to `eslint .`
- Schema shell files needed `export {}` to be valid TypeScript modules for barrel re-export
- `next-auth` module augmentation requires explicit type imports for TypeScript to resolve modules

### Completion Notes List

- All 11 tasks completed successfully
- ESLint: 0 errors, 1 warning (pre-existing file outside project scope)
- TypeScript: 0 errors with `tsc --noEmit`
- Dev server: starts in ~3s with Turbopack
- Production build: compiles in ~14.5s with webpack, Serwist service worker bundled at `/sw.js`
- shadcn `cn()` utility relocated from `lib/utils.ts` to `lib/utils/cn.ts` per architecture spec
- `next-themes` v0.4.6 installed for dark mode support
- Playwright config placed at `e2e/playwright.config.ts` (Chromium + Mobile Chrome Pixel 5)

### Code Review Fixes Applied

- [H1] Added missing `db:seed` script + `tsx` devDependency
- [H2] Fixed `__dirname` → `fileURLToPath` in `vitest.config.ts` for ESM compatibility
- [H3] Added Mobile Chrome (Pixel 5) project to `e2e/playwright.config.ts`
- [M1] Cleaned up unused `DefaultJWT` import in `src/types/auth.ts`
- [M2] Removed `& DefaultSession["user"]` intersection from Session type to match architecture spec
- [M3] Created `public/icons/.gitkeep` placeholder directory for PWA manifest icons
- [M4] Fixed `globals.css` font variables — replaced Geist references with Inter-compatible values
- [L1] Added `book-club-system/**` to eslint globalIgnores
- [L2] Updated File List with previously missing auto-generated files

### File List

- `package.json` — updated name, scripts, dependencies (incl. db:seed + tsx)
- `tsconfig.json` — added Serwist typings, webworker lib
- `next.config.ts` — Serwist withSerwistInit wrapper
- `drizzle.config.ts` — Drizzle Kit configuration
- `vercel.json` — Vercel cron job stubs
- `.env.example` — environment variable placeholders
- `vitest.config.ts` — Vitest configuration with jsdom (ESM-safe path alias)
- `e2e/playwright.config.ts` — Playwright E2E config (Chromium + Mobile Chrome)
- `eslint.config.mjs` — ESLint flat config (updated globalIgnores)
- `postcss.config.mjs` — PostCSS config (auto-generated by Next.js)
- `next-env.d.ts` — Next.js TypeScript declarations (auto-generated)
- `components.json` — shadcn configuration (updated cn path)
- `src/types/actions.ts` — ActionResult<T>, ErrorCode enum
- `src/types/auth.ts` — UserRole enum, NextAuth module augmentation (clean types)
- `src/types/borrowing.ts` — BorrowStatus, PenaltyStage enums
- `src/types/sms.ts` — SmsType, SmsStatus enums
- `src/lib/utils/cn.ts` — clsx + tailwind-merge utility
- `src/lib/utils/dates.ts` — EAT date formatting utilities
- `src/providers/AuthProvider.tsx` — NextAuth SessionProvider wrapper
- `src/providers/ThemeProvider.tsx` — next-themes provider wrapper
- `src/providers/SyncProvider.tsx` — offline sync context shell
- `src/app/globals.css` — Tailwind CSS 4 + shadcn variables (fixed font vars)
- `src/app/layout.tsx` — root layout with providers, metadata, viewport
- `src/app/page.tsx` — landing page
- `src/app/loading.tsx` — root loading spinner
- `src/app/error.tsx` — root error boundary
- `src/app/not-found.tsx` — 404 page
- `src/app/(auth)/layout.tsx` — auth route group layout
- `src/app/(app)/layout.tsx` — app route group layout
- `src/lib/db/schema/auth.ts` — schema shell
- `src/lib/db/schema/catalog.ts` — schema shell
- `src/lib/db/schema/borrowing.ts` — schema shell
- `src/lib/db/schema/gamification.ts` — schema shell
- `src/lib/db/schema/system.ts` — schema shell
- `src/lib/db/schema/relations.ts` — schema shell
- `src/lib/db/schema/index.ts` — schema barrel export
- `src/sw.ts` — Serwist service worker source
- `public/manifest.json` — PWA manifest
- `public/icons/.gitkeep` — placeholder for PWA icons
- `src/test/setup.ts` — Vitest setup
