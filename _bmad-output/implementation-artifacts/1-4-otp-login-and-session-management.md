# Story 1.4: OTP Login & Session Management

Status: ready-for-dev

## Story

As a registered member,
I want to log in with my phone number and OTP,
So that I can access the book club system securely.

## Acceptance Criteria

1. **Given** I'm on the login page **When** I enter my registered phone number and tap "Send OTP" **Then** an OTP is sent to my phone via SMS Leopard

2. **Given** I received an OTP **When** I enter it correctly on the verify page **Then** a JWT session is created with `userId`, `role`, `churchId`, `name` and I'm redirected to the app home

3. **Given** my account is `pending_verification` **When** I log in successfully **Then** I see a "Pending verification by your evangelist" banner and can only access limited pages (profile)

4. **Given** my JWT session exists **When** the session approaches expiry **Then** it refreshes automatically without user intervention

5. **Given** I have an active session **When** I navigate to `/login` **Then** I'm redirected to the app home

6. **Given** an invalid or expired OTP **When** I submit it **Then** I see a clear error message and can retry (within the 3-attempt limit)

## Tasks / Subtasks

- [ ] Task 1: Add `status` to JWT token and session (AC: #2, #3)
  - [ ] 1.1: Update `src/lib/auth/config.ts` — add `token.status = user.status` in jwt callback, expose in session callback
  - [ ] 1.2: Update `src/types/auth.ts` — add `status: string` to `Session.user`, `User`, and `JWT` interfaces
  - [ ] 1.3: Update `src/lib/auth/credentials.ts` — return `status` from authorize function

- [ ] Task 2: Configure JWT session timing (AC: #4)
  - [ ] 2.1: In `src/lib/auth/config.ts`, set `session.maxAge` to 30 days and `jwt.maxAge` to 30 days
  - [ ] 2.2: NextAuth v5 handles automatic refresh via the `jwt` callback — verify token renewal works by confirming the callback runs on each request

- [ ] Task 3: Add authenticated redirect from /login (AC: #5)
  - [ ] 3.1: Update `src/middleware.ts` — when user has active session AND navigates to `/login` or `/verify`, redirect to `/` (app home)
  - [ ] 3.2: Add the redirect check AFTER `isPublicRoute` check but BEFORE the `!req.auth` check — when `isPublicRoute(pathname)` is true AND `req.auth` exists AND pathname is `/login` or `/verify`, redirect to `/`

- [ ] Task 4: Create pending verification restriction in middleware (AC: #3)
  - [ ] 4.1: Update `src/middleware.ts` — after RBAC check, if `req.auth.user.status === "pending_verification"` AND route is NOT `/profile` or `/api/auth/*`, redirect to `/profile`
  - [ ] 4.2: This ensures pending users can only access their profile page

- [ ] Task 5: Create PendingVerificationBanner component (AC: #3)
  - [ ] 5.1: Create `src/components/domain/PendingVerificationBanner.tsx` — `"use client"` component
  - [ ] 5.2: Yellow/amber banner: "Your account is pending verification by your evangelist. Some features are limited."
  - [ ] 5.3: Uses `useSession()` from next-auth/react to check `session.user.status === "pending_verification"`
  - [ ] 5.4: Renders at top of app layout, below nav (not on auth pages)

- [ ] Task 6: Create app home page (AC: #2, #5)
  - [ ] 6.1: Create `src/app/(app)/page.tsx` — Server Component, basic landing page for authenticated users
  - [ ] 6.2: Display welcome message with user's name from session
  - [ ] 6.3: This is the redirect target after login — keep it minimal (future stories will add dashboard content)

- [ ] Task 7: Create app layout with session provider (AC: #3)
  - [ ] 7.1: Create `src/app/(app)/layout.tsx` — wraps authenticated pages
  - [ ] 7.2: Include `SessionProvider` from next-auth/react for client-side session access
  - [ ] 7.3: Include `PendingVerificationBanner` (conditionally rendered based on status)
  - [ ] 7.4: Create `src/providers/AuthProvider.tsx` — `"use client"` wrapper around `SessionProvider`

- [ ] Task 8: Create profile page shell (AC: #3)
  - [ ] 8.1: Create `src/app/(app)/profile/page.tsx` — Server Component, minimal profile page
  - [ ] 8.2: Display user name, phone (masked: ****1234), church name, role, status
  - [ ] 8.3: This is the ONLY page pending_verification users can access (besides auth pages)
  - [ ] 8.4: Fetch user data from session (no additional DB query needed for basic info)

- [ ] Task 9: Update RBAC for pending_verification routes (AC: #3)
  - [ ] 9.1: Update `src/lib/auth/rbac.ts` — add helper `isPendingRestricted(status, pathname)` that returns true if status is pending_verification and route is not `/profile`
  - [ ] 9.2: Export for use in middleware

- [ ] Task 10: Write unit tests (all ACs)
  - [ ] 10.1: `src/lib/auth/rbac.test.ts` — test `isPendingRestricted` with pending and active users across routes
  - [ ] 10.2: `src/middleware.test.ts` — test authenticated redirect from /login, pending_verification restriction, RBAC still works
  - [ ] 10.3: `src/components/domain/PendingVerificationBanner.test.tsx` — renders when pending, hidden when active

- [ ] Task 11: Verify build (all ACs)
  - [ ] 11.1: Run `npm run lint` — 0 errors
  - [ ] 11.2: Run `npm run typecheck` — 0 errors
  - [ ] 11.3: Run `npm run build` — production build succeeds
  - [ ] 11.4: Run tests — all passing (existing + new)

## Dev Notes

### What's Already Done (Story 1.3 — DO NOT re-implement)

The following are COMPLETE from Story 1.3 and satisfy ACs #1, #2, #6:

- **Login page** (`/login`) with phone input + "Send OTP" → already works
- **Verify page** (`/verify`) with OTP input + registration fields → already works
- **sendOtp Server Action** — rate limiting, OTP generation, SMS sending → already works
- **verifyOtp Server Action** — OTP verification, user creation, signIn call → already works
- **JWT callbacks** — token populated with `userId`, `role`, `churchId` → already works
- **credentials.ts authorize** — DB lookup by phone, returns user object → already works
- **Rate limiting** — 3 attempts / 15-min window with lockout → already works
- **Error handling** — invalid OTP, expired OTP, rate limited errors → already works

**This story focuses ONLY on: session management, pending_verification flow, auth redirects, and app shell pages.**

### Architecture Compliance

#### JWT Session Configuration

```typescript
// src/lib/auth/config.ts — ADD to existing config:
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
},
```

NextAuth v5 handles JWT refresh automatically. The `jwt` callback runs on EVERY request when using JWT strategy — if the token is close to expiry, NextAuth reissues it. No custom refresh logic needed.
[Source: architecture.md — Authentication, line 168-180]

#### Adding `status` to JWT

```typescript
// Current jwt callback (Story 1.2):
jwt({ token, user }) {
  if (user) {
    token.userId = user.id!;
    token.role = (user as { role: UserRole }).role;
    token.churchId = (user as { churchId: string }).churchId;
  }
  return token;
}

// UPDATE to also include status:
jwt({ token, user }) {
  if (user) {
    token.userId = user.id!;
    token.role = (user as { role: UserRole }).role;
    token.churchId = (user as { churchId: string }).churchId;
    token.status = (user as { status: string }).status;
  }
  return token;
}
```

**CRITICAL:** Also update `src/types/auth.ts` to add `status` to:
- `Session.user` interface — `status: string`
- `User` interface — `status: string`
- `JWT` interface — `status: string`

And update `src/lib/auth/credentials.ts` authorize return to include `status: user.status`.

#### Middleware Auth Redirect (AC: #5)

```typescript
// src/middleware.ts — Add BEFORE the !req.auth check:

// Redirect authenticated users away from auth pages
if (isPublicRoute(pathname) && req.auth) {
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/verify");
  if (isAuthPage) {
    return Response.redirect(new URL("/", req.url));
  }
  return; // Other public routes (like /) still accessible
}
```

**CRITICAL order in middleware:**
1. Check public route + has session → redirect auth pages to home
2. Check public route + no session → allow (login/verify accessible)
3. No session → redirect to /login
4. RBAC check
5. Pending verification check → restrict to /profile

#### Pending Verification Restriction (AC: #3)

```typescript
// src/middleware.ts — Add AFTER RBAC check:

// Pending users can only access /profile
const userStatus = req.auth.user.status;
if (userStatus === "pending_verification") {
  const allowedPaths = ["/profile", "/api/auth"];
  const isAllowed = allowedPaths.some(p => pathname.startsWith(p));
  if (!isAllowed) {
    return Response.redirect(new URL("/profile", req.url));
  }
}
```

#### SessionProvider Setup

```typescript
// src/providers/AuthProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

```typescript
// src/app/(app)/layout.tsx
import { AuthProvider } from "@/providers/AuthProvider";
import { PendingVerificationBanner } from "@/components/domain/PendingVerificationBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PendingVerificationBanner />
      <main>{children}</main>
    </AuthProvider>
  );
}
```

**CRITICAL:** `SessionProvider` is required for `useSession()` in client components. It must wrap the app layout. The `(auth)` layout does NOT need it (auth pages don't use session hooks).

#### PendingVerificationBanner Pattern

```typescript
// src/components/domain/PendingVerificationBanner.tsx
"use client";

import { useSession } from "next-auth/react";

export function PendingVerificationBanner() {
  const { data: session } = useSession();

  if (!session || session.user.status !== "pending_verification") {
    return null;
  }

  return (
    <div role="alert" className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center text-sm text-amber-800">
      Your account is pending verification by your evangelist. Some features are limited.
    </div>
  );
}
```

- Use amber/yellow colors for warning state
- `role="alert"` for accessibility
- Rendered inside `(app)` layout, NOT in `(auth)` layout
[Source: architecture.md — UI Patterns; PRD — Accessibility, WCAG 2.1 AA]

#### App Home Page (Minimal Shell)

```typescript
// src/app/(app)/page.tsx
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
      <p className="mt-2 text-muted-foreground">
        Church Book Club — your reading community.
      </p>
    </div>
  );
}
```

**CRITICAL:** This is a minimal shell. Future stories (Epic 2+) will add dashboard content. Do NOT over-build.

#### Profile Page (Minimal Shell for Pending Users)

```typescript
// src/app/(app)/profile/page.tsx
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { name, phone, role, status, churchId } = session.user;
  const maskedPhone = `****${phone.slice(-4)}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <dl className="mt-4 space-y-2">
        <div><dt className="text-sm text-muted-foreground">Name</dt><dd>{name}</dd></div>
        <div><dt className="text-sm text-muted-foreground">Phone</dt><dd>{maskedPhone}</dd></div>
        <div><dt className="text-sm text-muted-foreground">Role</dt><dd className="capitalize">{role.replace("_", " ")}</dd></div>
        <div><dt className="text-sm text-muted-foreground">Status</dt><dd className="capitalize">{status.replace("_", " ")}</dd></div>
      </dl>
    </div>
  );
}
```

**CRITICAL:** Story 1.7 (Member Profile) will expand this with XP, borrowing history, etc. Keep minimal now.

### Project Structure Notes

Files to create/modify:
```
src/
├── app/
│   └── (app)/
│       ├── layout.tsx          ← NEW: Authenticated app layout with SessionProvider
│       ├── page.tsx            ← NEW: App home page (minimal shell)
│       └── profile/
│           └── page.tsx        ← NEW: Profile page (minimal, for pending users)
├── components/
│   └── domain/
│       └── PendingVerificationBanner.tsx  ← NEW: Amber banner for pending users
├── providers/
│   └── AuthProvider.tsx        ← NEW: SessionProvider wrapper ("use client")
├── lib/
│   └── auth/
│       ├── config.ts           ← MODIFY: Add status to JWT/session, set maxAge
│       ├── credentials.ts      ← MODIFY: Return status from authorize
│       └── rbac.ts             ← MODIFY: Add isPendingRestricted helper
├── types/
│   └── auth.ts                 ← MODIFY: Add status to Session, User, JWT interfaces
└── middleware.ts               ← MODIFY: Auth redirect + pending restriction
```

### Dependencies

No new npm dependencies needed. `next-auth/react` (for `SessionProvider` and `useSession`) is already included with `next-auth@beta`.

### Previous Story Intelligence

#### From Story 1.3 — Key Learnings:
- **Zod v4 breaking change:** `parsed.error.errors` → `parsed.error.issues` — relevant if any new schemas added
- **`vi.hoisted()` pattern** — required for mock variables in Vitest
- **`vi.mock("next-auth")` + `vi.mock("next-auth/jwt")`** — needed in test files importing from auth modules
- **Buffer.from for Base64** — use `Buffer.from().toString("base64")` not `btoa()` in Node.js
- **Rate limit pre-check before OTP work** — pattern established, don't change
- **Registration field validation before OTP consumption** — pattern established, don't change
- **signIn wrapped in try/catch** — pattern established, don't change

#### From Story 1.2 — Key Learnings:
- **Lazy Proxy pattern in db/index.ts** — connection created on first access
- **`server-only` mock** aliased in `vitest.config.ts` → `src/test/server-only-mock.ts`
- **NextAuth type augmentation** in `src/types/auth.ts` — extend `Session`, `User`, `JWT`
- **Middleware already functional** — auth checks + RBAC working, just needs additions

#### From Story 1.1:
- **shadcn CLI**: `npx shadcn@latest add <component>` — no new components needed for 1.4
- **ESLint flat config** (`eslint.config.mjs`)
- **Build uses `--webpack` flag** (Serwist compatibility)

### Testing Patterns

```typescript
// Middleware testing — mock auth() and test redirect behavior
// Use vi.mock for @/lib/auth/config and @/lib/auth/rbac
// Test scenarios:
// 1. Authenticated user hitting /login → redirect to /
// 2. Authenticated user hitting /verify → redirect to /
// 3. Unauthenticated user hitting /login → allow
// 4. pending_verification user hitting / → redirect to /profile
// 5. pending_verification user hitting /profile → allow
// 6. active user hitting / → allow
// 7. RBAC still works (member can't access /admin)

// PendingVerificationBanner — mock useSession
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));
// Test: renders banner when status is "pending_verification"
// Test: returns null when status is "active"
// Test: returns null when no session
```

### References

- [Source: architecture.md — Authentication & Security, lines 168-180]
- [Source: architecture.md — Middleware Configuration, lines 669-675]
- [Source: architecture.md — RBAC, role hierarchy]
- [Source: architecture.md — UI Patterns, lines 322-331]
- [Source: PRD — Pending Verification Banner, member status flow]
- [Source: PRD — Accessibility, WCAG 2.1 AA]
- [Source: epics.md — Story 1.4, lines 345-376]
- [Source: project-context.md — Server Components by default, testing rules]
- [Source: Story 1.3 — Dev Agent Record, all learnings]
- [Source: Story 1.2 — Auth infrastructure, JWT callbacks, middleware, RBAC]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
