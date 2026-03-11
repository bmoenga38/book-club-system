# Story 1.3: Phone Registration & OTP Delivery

Status: done

## Story

As a prospective member,
I want to register with my phone number and receive an OTP,
So that I can create an account and join the church book club.

## Acceptance Criteria

1. **Given** I'm on the registration page (`/login`) **When** I enter my phone number and tap "Send OTP" **Then** an OTP is generated, hashed with bcrypt, stored in `otp_codes` with 5-minute expiry, and sent via SMS Leopard

2. **Given** `lib/sms/service.ts` is created with `sendOtp(phone)` function **When** called with a valid phone number **Then** the SMS is sent immediately (not queued) via SMS Leopard API and the message is under 160 characters

3. **Given** I'm not yet registered **When** I complete OTP verification successfully **Then** a new user record is created with role `member`, status `pending_verification`, and the selected `church_id`

4. **Given** I entered the wrong OTP 3 times within 15 minutes **When** I try again **Then** I see "Too many attempts. Please wait 15 minutes." and the phone is locked

5. **Given** SMS delivery fails **When** I tap "Resend OTP" **Then** a new OTP is generated and sent (subject to the 3-attempt limit per 15 minutes)

6. **Given** I'm already registered **When** I enter my existing phone number **Then** I'm directed to the login/OTP verify flow instead of creating a duplicate account

## Tasks / Subtasks

- [x] Task 1: Create SMS Leopard service (AC: #2)
  - [x] 1.1: Create `src/lib/sms/service.ts` with `import "server-only"` guard
  - [x] 1.2: Implement `sendOtp(phone: string, code: string)` — POST to SMS Leopard API, return success/failure
  - [x] 1.3: SMS message template: `"Your Book Club code is {code}. Expires in 5 minutes."` (under 160 chars)
  - [x] 1.4: Handle API errors gracefully — return `ActionResult`-compatible response, never throw

- [x] Task 2: Create OTP query functions (AC: #1, #4)
  - [x] 2.1: Create `src/lib/db/queries/otpQueries.ts` with `import "server-only"` guard
  - [x] 2.2: Implement `createOtp(phone: string)` — generate 6-digit code, bcrypt hash, insert into `otp_codes` with 5-min expiry, return plain code
  - [x] 2.3: Implement `verifyOtp(phone: string, code: string)` — find latest non-expired OTP for phone, bcrypt compare, increment attempts, return success/failure
  - [x] 2.4: Implement `checkRateLimit(phone: string)` — check if phone has 3+ attempts in last 15 minutes or has active `locked_until`, return locked status
  - [x] 2.5: Implement `lockPhone(phone: string)` — set `locked_until` to now + 15 minutes on latest OTP record (integrated into verifyOtp on 3rd failure)

- [x] Task 3: Create user query functions (AC: #3, #6)
  - [x] 3.1: Create `src/lib/db/queries/userQueries.ts` with `import "server-only"` guard
  - [x] 3.2: Implement `getUserByPhone(phone: string)` — return user or null
  - [x] 3.3: Implement `createUser({ phone, name, churchId })` — insert user with `role: 'member'`, `status: 'pending_verification'`, return user

- [x] Task 4: Create Zod validation schemas (AC: #1, #3)
  - [x] 4.1: Create `src/app/(auth)/login/schemas.ts`
  - [x] 4.2: `sendOtpSchema` — phone: Kenyan format (+254XXXXXXXXX), required
  - [x] 4.3: Create `src/app/(auth)/verify/schemas.ts`
  - [x] 4.4: `verifyOtpSchema` — phone: string, code: 6-digit string, name: string (min 2 chars), churchId: uuid

- [x] Task 5: Create sendOtp Server Action (AC: #1, #4, #6)
  - [x] 5.1: Create `src/app/(auth)/login/actions.ts` with `"use server"` directive
  - [x] 5.2: Implement `sendOtp(formData)` — validate phone, check rate limit, check if user exists (route existing users to login flow), generate OTP, hash + store, send SMS, return `ActionResult`
  - [x] 5.3: If user already exists, return `{ success: true, data: { isExistingUser: true } }` so UI redirects to verify page for login (not registration)

- [x] Task 6: Create verifyOtp Server Action (AC: #3, #4)
  - [x] 6.1: Create `src/app/(auth)/verify/actions.ts` with `"use server"` directive
  - [x] 6.2: Implement `verifyOtp(formData)` — validate input, check rate limit, verify OTP against DB, if valid: create user (new) or fetch user (existing), call `signIn("credentials", ...)` to create JWT session, return `ActionResult`
  - [x] 6.3: On rate limit exceeded, lock phone and return `RATE_LIMITED` error

- [x] Task 7: Update credentials.ts authorize function (AC: #3)
  - [x] 7.1: Update `src/lib/auth/credentials.ts` — implement `authorize` to look up user by phone from DB and return user object with `id`, `role`, `churchId`, `name`, `phone`
  - [x] 7.2: The verify action calls `signIn("credentials", { phone, code })`, which triggers `authorize` — by this point OTP is already verified in the action, so `authorize` just does the DB lookup and returns the user

- [x] Task 8: Create login page UI (AC: #1, #5)
  - [x] 8.1: Create `src/app/(auth)/login/page.tsx` — Server Component rendering the login form
  - [x] 8.2: Create `src/components/domain/LoginForm.tsx` — `"use client"` component with react-hook-form + Zod resolver
  - [x] 8.3: Phone input field with +254 prefix, "Send OTP" button, loading state
  - [x] 8.4: On success, redirect to `/verify?phone={phone}&mode={login|register}`
  - [x] 8.5: Error display via Sonner toast (rate limited, SMS failure)
  - [x] 8.6: "Resend OTP" support (re-calls sendOtp action)

- [x] Task 9: Create verify page UI (AC: #3, #4)
  - [x] 9.1: Create `src/app/(auth)/verify/page.tsx` — Server Component reading `phone` and `mode` from searchParams
  - [x] 9.2: Create `src/components/domain/VerifyForm.tsx` — `"use client"` component with OTP input (6 digits)
  - [x] 9.3: If `mode=register`: show name field + church dropdown (fetched from DB) before OTP input
  - [x] 9.4: If `mode=login`: show only OTP input (name/church already known)
  - [x] 9.5: On successful verification, redirect to `/(app)` home
  - [x] 9.6: Error states: "Invalid OTP", "OTP expired", "Too many attempts. Please wait 15 minutes."
  - [x] 9.7: "Resend OTP" link that calls sendOtp again

- [x] Task 10: Create church query for dropdown (AC: #3)
  - [x] 10.1: Add `getChurches()` to `src/lib/db/queries/churchQueries.ts` with `import "server-only"` guard
  - [x] 10.2: Returns `{ id, name }[]` for the church selection dropdown

- [x] Task 11: Write unit tests (all ACs)
  - [x] 11.1: `src/lib/sms/service.test.ts` — mock fetch, test sendOtp success/failure
  - [x] 11.2: `src/lib/db/queries/otpQueries.test.ts` — mock db, test createOtp, verifyOtp, checkRateLimit
  - [x] 11.3: `src/lib/db/queries/userQueries.test.ts` — mock db, test getUserByPhone, createUser
  - [x] 11.4: `src/app/(auth)/login/actions.test.ts` — mock queries + sms, test sendOtp action (new user, existing user, rate limited)
  - [x] 11.5: `src/app/(auth)/verify/actions.test.ts` — mock queries + signIn, test verifyOtp action (success, wrong code, rate limited)

- [x] Task 12: Verify build (all ACs)
  - [x] 12.1: Run `npm run lint` — 0 errors
  - [x] 12.2: Run `npm run typecheck` — 0 errors
  - [x] 12.3: Run `npm run build` — production build succeeds
  - [x] 12.4: Run tests — all 54 passing

## Dev Notes

### Architecture Compliance

**CRITICAL: This story implements the first user-facing auth flow. Every pattern set here will be replicated in Story 1.4 (Login) and beyond.**

#### SMS Leopard API Integration

```typescript
// src/lib/sms/service.ts
import "server-only";

// SMS Leopard API endpoint
// POST https://api.smsleopard.com/v1/sms/send
// Headers: Authorization: Basic base64(API_KEY:API_SECRET)
// Body: { source: SENDER_ID, destination: phone, message: text }
//
// Response: { success: true, ... } or { success: false, error: "..." }
//
// ENV VARS (already in .env.example):
//   SMSLEOPARD_API_KEY
//   SMSLEOPARD_API_SECRET
//   SMSLEOPARD_SENDER_ID
```

**CRITICAL:**
- `sendOtp` is immediate (NOT queued) — auth-critical path
- Message MUST be under 160 characters (single SMS segment) to minimize cost (~KES 0.50-1.00 per SMS)
- Use Basic Auth: `Authorization: Basic ${btoa(API_KEY + ":" + API_SECRET)}`
- No external HTTP library — use native `fetch()`
- Handle network errors gracefully — return failure, don't throw
[Source: architecture.md — SMS Service Architecture, lines 193-197, 686-689]

#### OTP Generation & Storage Pattern

```typescript
// OTP flow:
// 1. Generate random 6-digit code (crypto.randomInt)
// 2. Hash with bcrypt (import bcrypt from appropriate package — NOTE: bcrypt is NOT in package.json yet, need to install)
// 3. Insert into otp_codes table: { phone, hashed_code, expires_at: now + 5min, attempts: 0 }
// 4. Send plain code via SMS
// 5. On verify: bcrypt.compare(submitted_code, stored_hash)
```

**CRITICAL — bcrypt dependency:**
- `bcrypt` (native) won't work on Vercel Edge/Serverless easily
- Use `bcryptjs` (pure JS) — must be added to package.json: `npm install bcryptjs && npm install -D @types/bcryptjs`
- Or use Web Crypto API `crypto.subtle` with PBKDF2 if you want zero dependencies
- **Recommendation: Use `bcryptjs`** — matches architecture spec ("bcrypt OTP hashing"), pure JS, works everywhere
[Source: architecture.md — Security, line 782]

#### Rate Limiting (DB-backed)

```
Rule: 3 attempts per 15-minute window
Implementation: otp_codes.attempts + otp_codes.locked_until columns (already in schema)

Flow:
1. Before sending OTP: check if phone has locked_until > now → reject
2. Before verifying OTP: check attempts count
3. On failed verify: increment attempts
4. On 3rd failure: set locked_until = now + 15 minutes
5. On successful verify: delete/invalidate old OTP records for this phone
```
[Source: architecture.md — Rate Limiting, line 177; PRD — NFR-S2]

#### Data Access Boundary

```
Client Component → Server Action → Query Function → Drizzle ORM → Neon HTTP → PostgreSQL
                   (validation)    (business logic)   (type-safe)    (stateless)
```

**MUST follow this pattern:**
- Server Actions in `actions.ts` files with `"use server"` — validate with Zod, call query functions, return `ActionResult<T>`
- Query functions in `lib/db/queries/*.ts` — `import "server-only"`, raw Drizzle queries
- NEVER write Drizzle queries directly in actions.ts
- NEVER throw from Server Actions — always return `ActionResult` with `ErrorCode`
[Source: architecture.md — Data Access Layer, lines 291-307, 662-667]

#### Server Action Naming

- `sendOtp` not `handleSendOtp` or `sendOtpAction`
- `verifyOtp` not `handleVerifyOtp` or `verifyOtpAction`
[Source: architecture.md — Server Action Function Naming, lines 272-279]

#### Form Pattern (React Hook Form + Zod)

```typescript
// "use client" component
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const form = useForm<SendOtpInput>({ resolver: zodResolver(sendOtpSchema) });

const onSubmit = async (data: SendOtpInput) => {
  const result = await sendOtp(data);
  if (result.success) {
    router.push(`/verify?phone=${data.phone}&mode=${result.data.isExistingUser ? "login" : "register"}`);
  } else {
    toast.error(result.error.message);
  }
};
```

**CRITICAL:**
- `@hookform/resolvers` — check if installed. If not: `npm install @hookform/resolvers`
- Use Sonner toasts (`toast.success`, `toast.error`) — NEVER `alert()` or `window.confirm()`
- Import Server Actions directly — NEVER use `fetch()` to call them
[Source: architecture.md — Forms, lines 378-384; project-context.md]

#### ActionResult<T> Return Pattern

```typescript
// Already defined in src/types/actions.ts:
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: ErrorCode; message: string; field?: string } };

// ErrorCode enum: VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED, FORBIDDEN, RATE_LIMITED
```

Every Server Action MUST return `ActionResult<T>` — no exceptions.
[Source: architecture.md — Error Handling, lines 421-425]

#### Phone Number Validation

```typescript
// Kenyan phone format: +254XXXXXXXXX (13 chars total)
// Accept: +254700000000, +254712345678
// Reject: 0700000000 (no country code), +1234567890 (wrong country)

const phoneRegex = /^\+254\d{9}$/;

export const sendOtpSchema = z.object({
  phone: z.string().regex(phoneRegex, "Enter a valid Kenyan phone number (+254...)"),
});
```
[Source: PRD — Kenya-specific phone format]

#### NextAuth signIn Integration

```typescript
// In verifyOtp action, after OTP is verified:
// Call signIn to create JWT session
import { signIn } from "@/lib/auth/config";

await signIn("credentials", {
  phone: data.phone,
  code: data.code,  // Already verified at this point
  redirect: false,
});
```

**CRITICAL:** The `authorize` function in `credentials.ts` will be called by NextAuth. Since OTP is already verified in the action, `authorize` just needs to look up the user by phone and return the user object. Do NOT re-verify OTP in `authorize`.

**Pattern:**
1. `verifyOtp` action verifies the OTP against DB
2. `verifyOtp` action creates user if new registration
3. `verifyOtp` action calls `signIn("credentials", { phone })`
4. `authorize` in `credentials.ts` looks up user by phone, returns `{ id, role, churchId, name, phone }`
5. NextAuth JWT callback stores `userId`, `role`, `churchId` in token

[Source: architecture.md — Auth Configuration, lines 168-180]

#### UI Components & Styling

- Use shadcn/ui components: `Button`, `Input`, `Label`, `Card`, `Select`
- `cn()` utility from `@/lib/utils/cn` for conditional Tailwind classes
- Mobile-first: design for 360px+ width
- Touch targets: minimum 44x44px (use `min-h-11 min-w-11` or `p-3` on buttons)
- Auth layout already exists at `src/app/(auth)/layout.tsx` — centered, max-w-md
- No `next/image` needed on auth pages (no images)
[Source: architecture.md — UI Patterns; PRD — Responsive Design, lines 322-331]

#### Constants

```typescript
// Define in the relevant query/service files, not a separate constants file
const OTP_EXPIRY_MS = 5 * 60 * 1000;       // 5 minutes
const OTP_MAX_ATTEMPTS = 3;
const OTP_LOCKOUT_MS = 15 * 60 * 1000;     // 15 minutes
const OTP_CODE_LENGTH = 6;
```
[Source: PRD — NFR-S2; project-context.md — Constants naming: UPPER_SNAKE_CASE]

### Project Structure Notes

Files to create/modify:
```
src/
├── app/
│   └── (auth)/
│       ├── login/
│       │   ├── page.tsx         ← NEW: Login page (Server Component)
│       │   ├── actions.ts       ← NEW: sendOtp Server Action
│       │   ├── actions.test.ts  ← NEW: sendOtp tests
│       │   └── schemas.ts       ← NEW: Zod validation schemas
│       └── verify/
│           ├── page.tsx         ← NEW: OTP verify page (Server Component)
│           ├── actions.ts       ← NEW: verifyOtp Server Action
│           ├── actions.test.ts  ← NEW: verifyOtp tests
│           └── schemas.ts       ← NEW: Zod validation schemas
├── components/
│   └── domain/
│       ├── LoginForm.tsx        ← NEW: Phone input form ("use client")
│       └── VerifyForm.tsx       ← NEW: OTP + registration form ("use client")
├── lib/
│   ├── sms/
│   │   ├── service.ts           ← NEW: SMS Leopard integration
│   │   └── service.test.ts      ← NEW: SMS service tests
│   ├── db/
│   │   └── queries/
│   │       ├── otpQueries.ts        ← NEW: OTP CRUD + rate limit
│   │       ├── otpQueries.test.ts   ← NEW: OTP query tests
│   │       ├── userQueries.ts       ← NEW: User lookup + creation
│   │       ├── userQueries.test.ts  ← NEW: User query tests
│   │       └── churchQueries.ts     ← NEW: Church list for dropdown
│   └── auth/
│       └── credentials.ts      ← MODIFY: Implement authorize (DB lookup)
```

All paths align with architecture.md project structure (lines 491-498, 611-637).

### Dependencies to Install

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
npm install @hookform/resolvers  # Check if already installed first
```

**CRITICAL:** Verify `@hookform/resolvers` is not already in `package.json` before installing. `react-hook-form` and `zod` are already installed.

### Previous Story Intelligence

#### From Story 1.2 — Key Learnings:
- **Lazy Proxy pattern in db/index.ts** — connection created on first property access, not module load. All query files import `db` from `@/lib/db` and it works transparently.
- **`server-only` mock in Vitest** — alias configured in `vitest.config.ts` pointing to `src/test/server-only-mock.ts`. New query files with `import "server-only"` will work in tests automatically.
- **`vi.hoisted()` pattern** — required when mock factory functions need to reference variables. Use for db mocks.
- **`vi.mock("next-auth")` in test files** — needed when importing from files that reference next-auth types.
- **NextAuth type augmentation** — `src/types/auth.ts` extends `Session`, `User`, and `JWT` interfaces. The `authorize` function must return an object matching the `User` interface: `{ id, role, churchId, phone, name }`.

#### From Story 1.2 — Code Review Fixes to Apply:
- H1: Credentials shell was fixed to return `null` without dead DB query — now Story 1.3 adds the real implementation
- H3: `auth/config.ts` has `import "server-only"` — DO NOT import in client components

#### From Story 1.1 — Key Learnings:
- `npm run build` uses `--webpack` flag (Serwist compatibility)
- ESLint uses flat config (`eslint.config.mjs`), not `.eslintrc`
- `shadcn` CLI for adding new UI components: `npx shadcn@latest add button input card select label`

### Testing Patterns from Previous Stories

```typescript
// Pattern from auditQueries.test.ts — use vi.hoisted() for mock variables
const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({ db: mockDb }));
vi.mock("next-auth"); // Prevent next/server resolution failure
```

- Mock `@/lib/db` at module level — never use real DB in unit tests
- Mock `@neondatabase/serverless` if needed
- `server-only` is already aliased to empty mock in vitest.config.ts
- Test each Server Action with: success path, validation error, rate limited, SMS failure

### References

- [Source: architecture.md — Authentication & Security, lines 168-180]
- [Source: architecture.md — SMS Service Architecture, lines 193-197, 686-689]
- [Source: architecture.md — Data Access Layer, lines 291-307, 662-667]
- [Source: architecture.md — Server Action Naming, lines 272-279]
- [Source: architecture.md — Zod Schema Naming, lines 281-287]
- [Source: architecture.md — Form Patterns, lines 378-384]
- [Source: architecture.md — Error Handling, lines 417-425]
- [Source: architecture.md — Enforcement Guidelines, lines 429-449]
- [Source: architecture.md — Project Structure, lines 491-498, 611-637]
- [Source: architecture.md — Rate Limiting, line 177]
- [Source: architecture.md — Security, line 782]
- [Source: PRD — NFR-S2 (OTP expiry/rate limits)]
- [Source: PRD — NFR-I1/I2/I3 (SMS Leopard integration)]
- [Source: PRD — Responsive Design, lines 322-331]
- [Source: PRD — Accessibility, lines 617-625]
- [Source: epics.md — Story 1.3, lines 313-343]
- [Source: Story 1.2 — Dev Agent Record, debug log + code review fixes]
- [Source: project-context.md — TypeScript rules, naming conventions]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed Zod v4 API: `parsed.error.errors` → `parsed.error.issues` (Zod v4 breaking change)
- Fixed missing `afterEach` import in service.test.ts
- Fixed TypeScript error: Drizzle string union not assignable to `UserRole` enum — added `as UserRole` cast in credentials.ts
- lockPhone not implemented as standalone function — locking is integrated into verifyOtp on 3rd failed attempt

### Completion Notes List

- All 12 tasks complete, all 6 ACs satisfied
- 54 tests passing (21 new tests added for Story 1.3 + 33 existing)
- Lint, typecheck, build all pass
- SMS Leopard service uses native fetch with Basic Auth
- OTP hashing uses bcryptjs (pure JS, Vercel-compatible)
- Rate limiting is DB-backed: 3 attempts / 15-min window with lockedUntil column
- credentials.ts authorize now does DB lookup by phone (OTP already verified in action)
- Login page redirects to /verify with mode=login or mode=register based on existing user check
- Verify page conditionally shows name/church fields for registration mode
- shadcn/ui components installed: Button, Input, Label, Card, Select
- Dependencies added: bcryptjs, @types/bcryptjs, @hookform/resolvers

### Change Log

- 2026-03-11: Story 1.3 implementation complete — phone registration, OTP delivery, rate limiting, login/verify UI
- 2026-03-11: Code review — fixed 6 issues (3 HIGH, 3 MEDIUM): btoa→Buffer.from for Node compat, added rate limit pre-check in verifyOtp, moved registration field validation before OTP consumption, added signIn error handling, updated tests

### File List

- src/lib/sms/service.ts (NEW)
- src/lib/sms/service.test.ts (NEW)
- src/lib/db/queries/otpQueries.ts (NEW)
- src/lib/db/queries/otpQueries.test.ts (NEW)
- src/lib/db/queries/userQueries.ts (NEW)
- src/lib/db/queries/userQueries.test.ts (NEW)
- src/lib/db/queries/churchQueries.ts (NEW)
- src/lib/auth/credentials.ts (MODIFIED)
- src/app/(auth)/login/page.tsx (NEW)
- src/app/(auth)/login/actions.ts (NEW)
- src/app/(auth)/login/actions.test.ts (NEW)
- src/app/(auth)/login/schemas.ts (NEW)
- src/app/(auth)/verify/page.tsx (NEW)
- src/app/(auth)/verify/actions.ts (NEW)
- src/app/(auth)/verify/actions.test.ts (NEW)
- src/app/(auth)/verify/schemas.ts (NEW)
- src/components/domain/LoginForm.tsx (NEW)
- src/components/domain/VerifyForm.tsx (NEW)
- src/components/ui/button.tsx (NEW - shadcn)
- src/components/ui/input.tsx (NEW - shadcn)
- src/components/ui/label.tsx (NEW - shadcn)
- src/components/ui/card.tsx (NEW - shadcn)
- src/components/ui/select.tsx (NEW - shadcn)
- package.json (MODIFIED - added bcryptjs, @hookform/resolvers)
