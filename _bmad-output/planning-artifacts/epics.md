---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
status: 'complete'
completedAt: '2026-02-26'
inputDocuments:
  - prd.md
  - architecture.md
---

# bookclub - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for bookclub, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Member Registration & Identity (6 FRs):**
- FR1: Prospective members can register using their phone number and receive an OTP for verification
- FR2: Registered users can authenticate via phone number + OTP to access the system
- FR3: Evangelists can verify or reject pending member registrations against the church membership list
- FR4: The system can enforce a maximum OTP retry limit with cooldown to prevent abuse
- FR5: Super Admins can assign and change user roles (Member, Assistant Librarian, Church Admin)
- FR6: Members can view their own profile including XP balance, borrowing history, and trust status

**Book Catalog & Inventory (7 FRs):**
- FR7: Members can browse the book catalog with search, filter by category, and view real-time availability
- FR8: Members can view book details including title, author, description, category, and available copies
- FR9: Evangelists and Assistant Librarians can add new books to the catalog
- FR10: Evangelists and Assistant Librarians can edit existing book details
- FR11: Evangelists can remove books from the catalog
- FR12: The system can display real-time availability status for each book (available, all copies borrowed)
- FR13: Members can browse the book catalog offline using cached data

**Borrowing & Returns (10 FRs):**
- FR14: Members can submit a borrow request for an available book (Flow A — remote request)
- FR15: Evangelists can approve or decline pending borrow requests with an optional note
- FR16: Evangelists and Assistant Librarians can issue a book directly to a present member (Flow B — direct issue)
- FR17: Evangelists and Assistant Librarians can mark a book as returned
- FR18: The system can calculate and display the due date based on the configured loan period
- FR19: The system can enforce maximum borrowing limits based on member trust status (1 book for new, 3 for established)
- FR20: The system can block new borrow requests from members with overdue books
- FR21: Members can view their active borrowings and due dates
- FR22: Members can submit borrow requests while offline, with requests queued and synced when connectivity returns
- FR23: The system can decline requests automatically when the requested book has no available copies

**Trust Progression & Penalties (6 FRs):**
- FR24: The system can track consecutive on-time returns per member
- FR25: The system can automatically upgrade a member's borrowing limit from 1 to 3 after 3 consecutive on-time returns
- FR26: The system can reset the consecutive return streak when a book is returned more than 7 days overdue
- FR27: The system can send automatic SMS reminders on a configurable schedule (Day -3, Day 1, Day 7, Day 14)
- FR28: The system can automatically suspend borrowing privileges at Day 7 overdue and restore them upon return
- FR29: The system can flag members as "High Risk" at Day 14 overdue and alert the evangelist

**Gamification (3 FRs):**
- FR30: The system can award XP to members for borrowing actions (+10 request, +25 issued, +40 on-time return)
- FR31: The system can withhold XP for late returns
- FR32: Members can view their XP balance and current level on their profile

**Evangelist Dashboard & Reporting (7 FRs):**
- FR33: Evangelists can view a dashboard showing pending requests, active borrowings, overdue books, and recent returns
- FR34: Evangelists can view member borrowing history and overdue patterns
- FR35: Evangelists can identify repeat offenders (multiple overdue incidents)
- FR36: Evangelists can generate board reports (monthly borrowing summary, overdue summary, inventory status)
- FR37: Evangelists can view popular and underutilized books
- FR38: The system can log all admin actions with timestamp and actor for audit trail
- FR39: The system can send SMS notifications to members for request approvals, declines, and penalty escalations

**System Administration (5 FRs):**
- FR40: Super Admins can create and configure church records in the system
- FR41: Super Admins can assign a member as Church Admin (Evangelist) for a specific church
- FR42: Super Admins can view aggregate statistics across all churches
- FR43: The system can install as a Progressive Web App on members' devices
- FR44: The system can function offline for catalog browsing and queue requests for later sync

### NonFunctional Requirements

**Performance (7 NFRs):**
- NFR-P1: Page load time under 3 seconds on 3G mobile connections
- NFR-P2: Server Action responses under 500ms at the 95th percentile
- NFR-P3: Offline catalog browsing loads instantly from IndexedDB cache
- NFR-P4: Total JavaScript bundle under 200KB gzipped
- NFR-P5: Lighthouse Performance score above 80 on mobile simulation
- NFR-P6: First Contentful Paint under 1.5s, Largest Contentful Paint under 2.5s on 3G
- NFR-P7: Cumulative Layout Shift below 0.1

**Security (8 NFRs):**
- NFR-S1: All data encrypted in transit via TLS 1.2+
- NFR-S2: OTP codes expire after 5 minutes with max 3 attempts per 15-minute window
- NFR-S3: Phone numbers visible only to Evangelist and Super Admin roles
- NFR-S4: Borrowing history is private — members cannot view other members' activity
- NFR-S5: All admin actions logged with timestamp and actor identity
- NFR-S6: JWT tokens with configurable expiry; no sensitive data in token payload
- NFR-S7: Role-based route protection enforced at middleware level
- NFR-S8: UUID v4 primary keys on all entities

**Scalability (4 NFRs):**
- NFR-SC1: System supports up to 500 members and 1,000 books per church
- NFR-SC2: Architecture supports multi-church data isolation without schema changes
- NFR-SC3: SMS sending queued with rate limiting to respect SMS Leopard burst limits
- NFR-SC4: Database queries optimized with indexes on church_id foreign keys

**Accessibility (7 NFRs):**
- NFR-A1: WCAG 2.1 AA compliance for all core flows
- NFR-A2: Minimum 4.5:1 color contrast ratio for text
- NFR-A3: All touch targets minimum 44x44 pixels
- NFR-A4: All interactive elements keyboard-navigable with visible focus indicators
- NFR-A5: Screen reader support via semantic HTML, ARIA labels, and aria-live regions
- NFR-A6: Respects prefers-reduced-motion user preference
- NFR-A7: Base font size 16px, scalable to 200% without layout breakage

**Integration (4 NFRs):**
- NFR-I1: SMS Leopard API: OTP delivery within 30 seconds, graceful retry with exponential backoff
- NFR-I2: SMS messages kept under 160 characters (single segment)
- NFR-I3: SMS spend tracked per church per month for budget visibility
- NFR-I4: Offline queue sync via idempotent endpoint with UUID v4 deduplication

**Reliability (5 NFRs):**
- NFR-R1: 99.5% uptime target
- NFR-R2: Graceful degradation: app remains browsable offline when server is unreachable
- NFR-R3: Zero data loss on offline-to-online sync transitions
- NFR-R4: Penalty escalation advances on calendar days regardless of system availability
- NFR-R5: No admin actions permitted offline

### Additional Requirements

**From Architecture — Starter Template & Project Setup:**
- Architecture specifies `npx create-next-app@latest bookclub --yes` as the initialization command — this must be Epic 1, Story 1
- Post-init setup sequence: shadcn/ui init → database layer (Neon + Drizzle + drizzle-zod) → auth (next-auth@beta) → PWA (Serwist + idb) → forms/validation (RHF + Zod + Sonner) → testing (Vitest + Playwright)
- Production builds require `next build --webpack` (Serwist requires Webpack)

**From Architecture — Database & Schema:**
- Drizzle schema split by domain: auth.ts, catalog.ts, borrowing.ts, gamification.ts, system.ts + relations.ts + index.ts barrel
- `churchId` FK added on all church-scoped entities from day one (multi-church prep)
- All primary keys UUID v4
- Seed data script for development

**From Architecture — Infrastructure:**
- Vercel Cron configuration in `vercel.json` for penalty-check (daily) and sms-batch (hourly)
- Cron routes must validate `CRON_SECRET` header for authentication
- `vercel.json` cron definitions needed

**From Architecture — Cross-Cutting Implementation:**
- `ActionResult<T>` return type + `ErrorCode` enum for all Server Actions
- `import "server-only"` on all files touching DB or secrets
- `logAudit()` call in every admin mutation Server Action
- Data access boundary: Action → Query Function → Drizzle (never raw queries in actions)
- 4-group import ordering convention
- Sonner toasts for all user feedback

**From Architecture — PWA & Offline:**
- Serwist service worker source at `src/sw.ts`
- PWA manifest at `public/manifest.json` with church-themed icons
- IndexedDB via `idb` for catalog cache
- `useOnlineStatus` hook + `OfflineBanner` component
- `/api/sync` endpoint for offline queue processing

### FR Coverage Map

- FR1: Epic 1 — Phone number + OTP registration
- FR2: Epic 1 — Phone number + OTP authentication
- FR3: Epic 1 — Evangelist membership verification
- FR4: Epic 1 — OTP retry limit with cooldown
- FR5: Epic 1 — Super Admin role assignment
- FR6: Epic 1 — Member profile (XP, history, trust status)
- FR7: Epic 2 — Browse catalog with search, filter, availability
- FR8: Epic 2 — Book detail view
- FR9: Epic 2 — Add new books (admin)
- FR10: Epic 2 — Edit book details (admin)
- FR11: Epic 2 — Remove books (evangelist)
- FR12: Epic 2 — Real-time availability display
- FR13: Epic 8 — Offline catalog browsing
- FR14: Epic 3 — Borrow request Flow A (remote)
- FR15: Epic 3 — Approve/decline borrow requests
- FR16: Epic 3 — Direct issue Flow B (in-person)
- FR17: Epic 3 — Mark book returned
- FR18: Epic 3 — Due date calculation
- FR19: Epic 3 — Borrowing limits by trust status
- FR20: Epic 3 — Block requests from overdue members
- FR21: Epic 3 — View active borrowings and due dates
- FR22: Epic 8 — Offline borrow requests with sync
- FR23: Epic 3 — Auto-decline unavailable books
- FR24: Epic 4 — Track consecutive on-time returns
- FR25: Epic 4 — Auto-upgrade borrowing limit (1→3)
- FR26: Epic 4 — Reset streak on late return (>7 days)
- FR27: Epic 4 — Automatic SMS escalation schedule
- FR28: Epic 4 — Auto-suspend at Day 7, restore on return
- FR29: Epic 4 — High-risk flag at Day 14 + evangelist alert
- FR30: Epic 5 — Award XP for borrowing actions
- FR31: Epic 5 — Withhold XP for late returns
- FR32: Epic 5 — XP balance and level on profile
- FR33: Epic 6 — Evangelist dashboard overview
- FR34: Epic 6 — Member borrowing history and patterns
- FR35: Epic 6 — Repeat offender identification
- FR36: Epic 6 — Board reports (monthly, overdue, inventory)
- FR37: Epic 6 — Popular and underutilized books
- FR38: Epic 6 — Admin action audit trail
- FR39: Epic 4 — SMS notifications (approvals, declines, escalations)
- FR40: Epic 7 — Create and configure church records
- FR41: Epic 7 — Assign member as Church Admin
- FR42: Epic 7 — Aggregate statistics across churches
- FR43: Epic 8 — PWA installation
- FR44: Epic 8 — Offline function + request queue sync

## Epic List

### Epic 1: Project Foundation & User Authentication
Members can register with their phone number, authenticate via OTP, get verified by the evangelist, and view their profile with trust status. Includes project initialization, database schema foundation, RBAC middleware, and SMS OTP delivery.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6

### Epic 2: Book Catalog & Inventory Management
Members can browse, search, and filter the book catalog with real-time availability. Evangelists and Assistant Librarians can add, edit, and remove books from the inventory.
**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12

### Epic 3: Borrowing & Returns
Members can request books remotely (Flow A) or receive them in person (Flow B). Admins can approve/decline requests, issue books directly, and process returns. The system enforces borrowing limits based on trust status and blocks overdue members.
**FRs covered:** FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR23

### Epic 4: Trust Progression & Penalty Automation
The system automatically tracks responsible borrowing behavior, upgrades member privileges after 3 consecutive on-time returns, and escalates overdue situations through private SMS reminders — eliminating manual chasing entirely. Includes Vercel Cron infrastructure and SMS queue processing.
**FRs covered:** FR24, FR25, FR26, FR27, FR28, FR29, FR39

### Epic 5: Gamification & Engagement
Members earn XP for responsible borrowing actions (+10 request, +25 issued, +40 on-time return), see their points and current level on their profile, creating positive reinforcement for the reading culture.
**FRs covered:** FR30, FR31, FR32

### Epic 6: Evangelist Dashboard & Reporting
The evangelist has a comprehensive dashboard for all library operations — pending requests, overdue tracking, member borrowing history, repeat offender identification, and board-ready reports with full audit trail visibility.
**FRs covered:** FR33, FR34, FR35, FR36, FR37, FR38

### Epic 7: Church Administration
Super Admin can create and configure churches, assign evangelists as Church Admins, and view aggregate statistics across all churches in the system.
**FRs covered:** FR40, FR41, FR42

### Epic 8: PWA & Offline Experience
The app installs on members' phones as a Progressive Web App and works offline — catalog browsing from IndexedDB cache, borrow requests queued with UUID v4 idempotency keys for later sync, with seamless online/offline transitions.
**FRs covered:** FR13, FR22, FR43, FR44

## Epic 1: Project Foundation & User Authentication

Members can register with their phone number, authenticate via OTP, get verified by the evangelist, and view their profile with trust status. Includes project initialization, database schema foundation, RBAC middleware, and SMS OTP delivery.

### Story 1.1: Project Initialization & Configuration

As a developer,
I want the project scaffolded with all dependencies, configuration, and foundational types,
So that all subsequent stories have a consistent, working development environment.

**Acceptance Criteria:**

**Given** the project doesn't exist
**When** `npx create-next-app@latest bookclub --yes` is run
**Then** a Next.js 16 project is created with TypeScript strict, Tailwind CSS 4, ESLint 9, App Router, `@/*` path alias

**Given** the project is initialized
**When** all dependencies are installed (shadcn/ui, @neondatabase/serverless, drizzle-orm, drizzle-zod, drizzle-kit, next-auth@beta, @serwist/next, @serwist/precaching, @serwist/sw, idb, react-hook-form, zod, sonner, vitest, @testing-library/react, playwright)
**Then** `npm run dev` starts without errors and `npm run build --webpack` succeeds

**Given** dependencies are installed
**When** configuration files are created (drizzle.config.ts, next.config.ts with Serwist plugin, vercel.json with cron stubs, components.json, .env.example with all required vars)
**Then** each config file is valid and referenced correctly

**Given** the project structure exists
**When** foundational types are created (`src/types/actions.ts` with ActionResult<T> and ErrorCode enum, `src/types/auth.ts` with UserRole enum and Session extensions)
**Then** TypeScript compilation passes with `tsc --noEmit`

**Given** the project structure exists
**When** utility files (`lib/utils/cn.ts`, `lib/utils/dates.ts`), root layout, globals.css, error.tsx, loading.tsx, not-found.tsx, and provider shells (AuthProvider, ThemeProvider) are created
**Then** the app renders a styled page with Tailwind CSS 4

### Story 1.2: Database Schema & Auth Infrastructure

As a developer,
I want the database schema and authentication infrastructure configured,
So that user registration, login, and role-based access are architecturally supported.

**Acceptance Criteria:**

**Given** Drizzle is configured with Neon HTTP driver
**When** auth schema (`users`, `otp_codes` tables) and system schema (`churches`, `audit_log` tables) are created with UUID v4 PKs and `church_id` FK
**Then** `npm run db:generate` produces valid migration SQL

**Given** migrations are generated
**When** `npm run db:migrate` is run against Neon
**Then** tables are created in the database with correct columns, types, and indexes

**Given** the db client is configured
**When** `lib/db/index.ts` creates a Drizzle instance with `@neondatabase/serverless`
**Then** queries can execute against Neon PostgreSQL

**Given** NextAuth v5 is configured
**When** `lib/auth/config.ts` sets up Credentials provider with JWT strategy containing `userId`, `role`, `churchId`, `name`
**Then** NextAuth routes respond correctly

**Given** middleware.ts is created
**When** a request hits a protected route without a valid JWT
**Then** the user is redirected to `/login`

**Given** RBAC is configured in `lib/auth/rbac.ts`
**When** a member-role user tries to access an admin route
**Then** middleware blocks access and returns 403/redirect

**Given** `lib/db/queries/auditQueries.ts` exports `logAudit()`
**When** called with actor, action, entityType, entityId
**Then** an audit record is inserted with timestamp

**Given** a seed script exists at `lib/db/seed.ts`
**When** `npm run db:seed` is run
**Then** a default church record and Super Admin user are created

### Story 1.3: Phone Registration & OTP Delivery

As a prospective member,
I want to register with my phone number and receive an OTP,
So that I can create an account and join the church book club.

**Acceptance Criteria:**

**Given** I'm on the registration page (`/login`)
**When** I enter my phone number and tap "Send OTP"
**Then** an OTP is generated, hashed with bcrypt, stored in `otp_codes` with 5-minute expiry, and sent via SMS Leopard

**Given** `lib/sms/service.ts` is created with `sendOtp(phone)` function
**When** called with a valid phone number
**Then** the SMS is sent immediately (not queued) via SMS Leopard API and the message is under 160 characters

**Given** I'm not yet registered
**When** I complete OTP verification successfully
**Then** a new user record is created with role `member`, status `pending_verification`, and the selected `church_id`

**Given** I entered the wrong OTP 3 times within 15 minutes
**When** I try again
**Then** I see "Too many attempts. Please wait 15 minutes." and the phone is locked

**Given** SMS delivery fails
**When** I tap "Resend OTP"
**Then** a new OTP is generated and sent (subject to the 3-attempt limit per 15 minutes)

**Given** I'm already registered
**When** I enter my existing phone number
**Then** I'm directed to the login/OTP verify flow instead of creating a duplicate account

### Story 1.4: OTP Login & Session Management

As a registered member,
I want to log in with my phone number and OTP,
So that I can access the book club system securely.

**Acceptance Criteria:**

**Given** I'm on the login page
**When** I enter my registered phone number and tap "Send OTP"
**Then** an OTP is sent to my phone via SMS Leopard

**Given** I received an OTP
**When** I enter it correctly on the verify page
**Then** a JWT session is created with `userId`, `role`, `churchId`, `name` and I'm redirected to the app home

**Given** my account is `pending_verification`
**When** I log in successfully
**Then** I see a "Pending verification by your evangelist" banner and can only access limited pages (profile)

**Given** my JWT session exists
**When** the session approaches expiry
**Then** it refreshes automatically without user intervention

**Given** I have an active session
**When** I navigate to `/login`
**Then** I'm redirected to the app home

**Given** an invalid or expired OTP
**When** I submit it
**Then** I see a clear error message and can retry (within the 3-attempt limit)

### Story 1.5: Member Verification Queue

As an evangelist (Church Admin),
I want to verify or reject pending member registrations,
So that only confirmed church members can access the borrowing system.

**Acceptance Criteria:**

**Given** I'm logged in as Church Admin
**When** I navigate to the members page
**Then** I see a list of pending verification requests showing member name and registration date

**Given** a pending member exists
**When** I tap "Verify"
**Then** the member status changes to `active`, an audit log entry is created with my ID as actor, and the action is recorded

**Given** a pending member exists
**When** I tap "Reject"
**Then** the member status changes to `rejected` and an audit log entry is created

**Given** I've verified a member
**When** that member next opens the app
**Then** the "pending verification" banner is removed and full member access is granted

**Given** I'm logged in as a regular Member
**When** I try to access the members/verification page
**Then** I'm blocked by middleware (role-based protection)

### Story 1.6: Role Management

As a Super Admin,
I want to assign and change user roles,
So that church operations have the right people in the right positions.

**Acceptance Criteria:**

**Given** I'm logged in as Super Admin
**When** I view a member's detail page
**Then** I see a role dropdown with options: Member, Assistant Librarian, Church Admin

**Given** I select a new role for a user
**When** I confirm the change
**Then** the user's role is updated in the database and an audit log entry is created

**Given** I'm a Church Admin (not Super Admin)
**When** I try to change someone's role
**Then** the role change option is not available (only Super Admin can manage roles)

**Given** a role change is made
**When** the affected user makes their next request
**Then** middleware enforces the new role permissions immediately (JWT re-issued on next login)

### Story 1.7: Member Profile

As a member,
I want to view my profile with XP balance, borrowing history, and trust status,
So that I can track my engagement and borrowing capacity.

**Acceptance Criteria:**

**Given** I'm logged in as any role
**When** I navigate to my profile
**Then** I see my name, phone (masked: ****1234), church name, role, and member-since date

**Given** I'm a new member with no activity
**When** I view my profile
**Then** I see: XP balance (0), trust status ("New Member — 1 book limit"), consecutive on-time returns (0 of 3 for upgrade)

**Given** I have borrowing history
**When** I view my profile
**Then** I see a list of past borrowings with book title, issue date, return date, and on-time/late status

**Given** I'm currently suspended
**When** I view my profile
**Then** I see a suspension notice with the overdue book title and how to resolve it

## Epic 2: Book Catalog & Inventory Management

Members can browse, search, and filter the book catalog with real-time availability. Evangelists and Assistant Librarians can add, edit, and remove books from the inventory.

### Story 2.1: Book Catalog Browsing & Search

As a member,
I want to browse, search, and filter the book catalog with real-time availability,
So that I can find books I want to read.

**Acceptance Criteria:**

**Given** the catalog schema is created (`books`, `categories` tables in `schema/catalog.ts` with `church_id` FK)
**When** I navigate to the books page
**Then** I see a paginated grid of book cards showing title, author, category, and availability badge

**Given** the catalog has books
**When** I type a search query in the search bar
**Then** results are filtered by title or author match, and the search term is encoded in URL `searchParams`

**Given** categories exist
**When** I select a category filter
**Then** only books in that category are shown, and the filter is encoded in URL `searchParams`

**Given** a book has 2 total copies and 1 is currently borrowed
**When** I view the catalog
**Then** the book shows "1 available" with a green badge

**Given** all copies of a book are borrowed
**When** I view the catalog
**Then** the book shows "Unavailable" with a gray badge

**Given** I apply search + category filters
**When** I share the URL or refresh the page
**Then** the same filters are applied (filters are URL-driven, not component state)

### Story 2.2: Book Detail Page

As a member,
I want to view complete book details including availability,
So that I can decide whether to request it.

**Acceptance Criteria:**

**Given** I'm on the catalog page
**When** I tap a book card
**Then** I navigate to `/books/[id]` showing title, author, description, category, ISBN, total copies, and available copies

**Given** the book has available copies
**When** I view the detail page
**Then** I see a "Request" button (for members) to initiate Flow A borrowing

**Given** the book has no available copies
**When** I view the detail page
**Then** the "Request" button is disabled with "Currently Unavailable" text

**Given** the book ID doesn't exist
**When** I navigate to `/books/[invalid-id]`
**Then** I see the not-found page

### Story 2.3: Add New Books to Catalog

As an evangelist or assistant librarian,
I want to add new books to the catalog,
So that the library inventory is up to date.

**Acceptance Criteria:**

**Given** I'm logged in as Church Admin or Assistant Librarian
**When** I navigate to inventory management and tap "Add Book"
**Then** I see a form with fields: title (required), author (required), description, category (select), ISBN, total copies (default 1)

**Given** I fill in valid book details
**When** I submit the form
**Then** the book is created with the correct `church_id`, an audit log entry is created, a success toast appears, and I'm redirected to the inventory list

**Given** I submit with missing required fields
**When** Zod validation runs
**Then** I see inline field-level error messages

**Given** I'm logged in as a regular Member
**When** I try to access the add book page
**Then** I'm blocked by middleware

### Story 2.4: Edit & Remove Books

As an evangelist or assistant librarian,
I want to edit book details and (evangelist only) remove books,
So that the catalog stays accurate.

**Acceptance Criteria:**

**Given** I'm logged in as Church Admin or Assistant Librarian
**When** I navigate to a book's edit page
**Then** I see the form pre-filled with the book's current details

**Given** I change book details and submit
**When** the form passes validation
**Then** the book is updated, an audit log entry is created, and a success toast confirms the change

**Given** I'm logged in as Church Admin (Evangelist)
**When** I view a book's edit page
**Then** I see a "Remove Book" button

**Given** I tap "Remove Book"
**When** I confirm in the AlertDialog
**Then** the book is removed from the catalog, an audit log entry is created, and I'm redirected to the inventory list

**Given** I'm logged in as Assistant Librarian
**When** I view a book's edit page
**Then** the "Remove Book" button is not shown (only Evangelist can remove)

## Epic 3: Borrowing & Returns

Members can request books remotely (Flow A) or receive them in person (Flow B). Admins can approve/decline requests, issue books directly, and process returns. The system enforces borrowing limits based on trust status and blocks overdue members.

### Story 3.1: Borrow Request — Flow A

As a member,
I want to submit a borrow request for an available book,
So that I can get a book without being physically present at the library.

**Acceptance Criteria:**

**Given** the borrowing schema is created (`borrowings` table in `schema/borrowing.ts` with status enum: pending, approved, declined, issued, returned, overdue)
**When** migrations run
**Then** the borrowings table exists with `user_id`, `book_id`, `church_id`, `status`, `requested_at`, `due_date`, `returned_at` columns

**Given** I'm a verified member viewing a book with available copies
**When** I tap "Request" on the book detail page
**Then** a borrowing record is created with status `pending`, a success toast confirms "Request sent", and available copies decrements by 1

**Given** I request a book but all copies are currently borrowed
**When** the Server Action checks availability
**Then** the request is automatically declined with message "No copies available" and no borrowing record is created

**Given** I have an overdue book
**When** I try to submit a new request
**Then** the request is blocked with message "You have an overdue book. Please return it first."

**Given** I've reached my borrowing limit (1 for new, 3 for established)
**When** I try to submit a new request
**Then** the request is blocked with message "Borrowing limit reached (X of Y)"

### Story 3.2: Request Approval & Decline

As an evangelist,
I want to approve or decline pending borrow requests with optional notes,
So that I can manage the library lending process.

**Acceptance Criteria:**

**Given** I'm logged in as Church Admin
**When** I navigate to the requests page
**Then** I see a list of pending borrow requests showing member name, book title, and request date

**Given** a pending request exists
**When** I tap "Approve"
**Then** the borrowing status changes to `approved`, an audit log entry is created, and the member can coordinate pickup

**Given** a pending request exists
**When** I tap "Decline" and enter an optional note (e.g., "Book currently reserved")
**Then** the borrowing status changes to `declined`, the note is saved, available copies increments back, and an audit log entry is created

**Given** a request is for a member with an overdue book
**When** I view the request
**Then** I see a warning: "Member has X overdue book(s)" and the approve button is disabled

### Story 3.3: Direct Issue — Flow B

As an evangelist or assistant librarian,
I want to issue a book directly to a present member,
So that in-person borrowing is quick and efficient.

**Acceptance Criteria:**

**Given** I'm logged in as Church Admin or Assistant Librarian
**When** I navigate to the direct issue page
**Then** I see a member search input and a book search input

**Given** I search for a member by name or phone
**When** results appear
**Then** I see matching members with their trust status and any active borrowings count

**Given** I select a member and a book
**When** I tap "Issue"
**Then** a borrowing record is created with status `issued`, the due date is calculated (issue date + loan period), available copies decrements, and an audit log entry is created

**Given** the selected member has an overdue book
**When** I try to issue
**Then** the action is blocked with "Member has overdue books"

**Given** the selected member has reached their borrowing limit
**When** I try to issue
**Then** the action is blocked with "Member at borrowing limit (X of Y)"

### Story 3.4: Return Processing

As an evangelist or assistant librarian,
I want to mark a book as returned,
So that the book becomes available again and the member's record is updated.

**Acceptance Criteria:**

**Given** I'm logged in as Church Admin or Assistant Librarian
**When** I navigate to the returns page
**Then** I see a member search to find active borrowings

**Given** I search for a member with active borrowings
**When** results appear
**Then** I see their active borrowings with book title, issue date, due date, and days until due (or days overdue in red)

**Given** I select a borrowing to return
**When** I tap "Mark Returned"
**Then** the borrowing status changes to `returned`, `returned_at` is set, available copies increments, and an audit log entry is created

**Given** the book is returned on time (before or on due date)
**When** the return is processed
**Then** the return is flagged as `on_time` for trust tracking purposes

**Given** the book is returned late
**When** the return is processed
**Then** the return is flagged as `late` and the days overdue are recorded

**Given** a member was suspended (Day 7+ overdue)
**When** their overdue book is returned
**Then** borrowing privileges are restored (suspension lifted)

### Story 3.5: Borrowing Rules Engine

As the system,
I want to enforce due dates, borrowing limits, and overdue blocking consistently,
So that lending rules are applied without manual intervention.

**Acceptance Criteria:**

**Given** a book is issued (via Flow A approval or Flow B direct)
**When** the due date is calculated
**Then** it equals the issue date plus the configured loan period (default 14 days) and is displayed in EAT (UTC+3) format

**Given** a new member (trust status: new) has 1 active borrowing
**When** they try to borrow another book
**Then** the request is blocked with "Borrowing limit reached (1 of 1)"

**Given** an established member (trust status: established) has 3 active borrowings
**When** they try to borrow another book
**Then** the request is blocked with "Borrowing limit reached (3 of 3)"

**Given** a member has a borrowing past its due date
**When** they try to submit a new request or receive a direct issue
**Then** both actions are blocked with "You have an overdue book"

**Given** `lib/utils/penalties.ts` exports `calculateEscalationStage(daysOverdue)`
**When** called with days overdue
**Then** it returns the correct stage: reminder (Day -3), gentle (Day 1), warning (Day 7), high-risk (Day 14)

### Story 3.6: Member Active Borrowings View

As a member,
I want to view my active borrowings and due dates,
So that I can manage my returns and avoid overdue penalties.

**Acceptance Criteria:**

**Given** I'm logged in as a member
**When** I navigate to my borrowings page
**Then** I see a list of active borrowings with book title, issue date, due date, and days remaining

**Given** a borrowing is due within 3 days
**When** I view my borrowings
**Then** the due date badge shows in amber/warning color

**Given** a borrowing is overdue
**When** I view my borrowings
**Then** the due date badge shows in red with "X days overdue" and a suspension warning if applicable

**Given** I have no active borrowings
**When** I view my borrowings
**Then** I see an empty state with a link to browse the catalog

**Given** I have past (returned) borrowings
**When** I view my borrowings
**Then** I see a history section with returned books, return dates, and on-time/late status

## Epic 4: Trust Progression & Penalty Automation

Enable the system to automatically track member trustworthiness based on borrowing behavior, enforce escalating penalties for overdue books, and deliver timely SMS notifications — reducing manual evangelist intervention.

### Story 4.1: Trust Tracking & Auto-Upgrade

As the system,
I want to automatically track consecutive on-time returns and upgrade member trust levels,
So that reliable members earn increased borrowing privileges without manual intervention.

**Acceptance Criteria:**

**Given** a member returns a book on or before the due date
**When** the return is processed
**Then** the member's `consecutive_on_time` counter increments by 1

**Given** a member's `consecutive_on_time` reaches 3 and their trust tier is "new"
**When** the return is processed
**Then** the trust tier auto-upgrades to "established" and `max_concurrent_books` increases from 1 to 3

**Given** a member returns a book more than 7 days late
**When** the return is processed
**Then** the `consecutive_on_time` counter resets to 0

**Given** a member accumulates a suspension penalty
**When** the penalty is applied
**Then** the trust tier downgrades to "new" and `max_concurrent_books` resets to 1

**Given** a member's trust tier changes
**When** the upgrade or downgrade occurs
**Then** the change is logged in a `trust_history` record with timestamp, old tier, new tier, and reason

### Story 4.2: SMS Notification Queue & Batch Processing

As an evangelist,
I want the system to queue and batch-send SMS notifications for key borrowing events,
So that members receive timely reminders without overwhelming the SMS gateway.

**Acceptance Criteria:**

**Given** a borrowing event occurs (approval, decline, due-date reminder, overdue notice)
**When** the event triggers an SMS
**Then** a record is inserted into the `sms_log` table with status "queued", recipient phone, message body, and event type

**Given** queued SMS messages exist
**When** the `sms-batch` cron fires (hourly schedule)
**Then** the system sends up to 50 queued messages via SMS Leopard API and updates each record's status to "sent" or "failed" with timestamp

**Given** the `sms-batch` cron route is called
**When** the request does not include a valid `CRON_SECRET` header
**Then** the route returns 401 Unauthorized

**Given** the monthly SMS spend approaches the configured limit
**When** the `sms-batch` cron runs
**Then** any messages beyond the budget are left as "queued" and a warning is logged

**Given** a cron configuration is needed
**When** the story is implemented
**Then** `vercel.json` includes a cron entry for `/api/cron/sms-batch` at a 1-hour interval

### Story 4.3: Penalty Escalation Cron

As the system,
I want to automatically escalate penalties for overdue borrowings on a scheduled basis,
So that members receive progressively urgent reminders and enforcement actions without manual tracking.

**Acceptance Criteria:**

**Given** a borrowing's due date is 3 days away and no "due-soon" SMS has been sent
**When** the `penalty-check` cron fires (daily)
**Then** a "due-soon" reminder SMS is queued for the member

**Given** a borrowing is 1 day overdue and no "overdue" SMS has been sent
**When** the `penalty-check` cron fires
**Then** an "overdue-day1" SMS is queued and the borrowing's `penalty_stage` is set to "reminder"

**Given** a borrowing is 7 days overdue and `penalty_stage` is "reminder"
**When** the `penalty-check` cron fires
**Then** the member's account is auto-suspended, an "account-suspended" SMS is queued, and `penalty_stage` is set to "suspended"

**Given** a borrowing is 14 days overdue and `penalty_stage` is "suspended"
**When** the `penalty-check` cron fires
**Then** the member is flagged as "high-risk", an "escalation-final" SMS is queued, and `penalty_stage` is set to "escalated"

**Given** an SMS has already been sent for a given penalty stage
**When** the `penalty-check` cron fires again
**Then** the same SMS is NOT re-queued (idempotent processing)

**Given** a cron configuration is needed
**When** the story is implemented
**Then** `vercel.json` includes a cron entry for `/api/cron/penalty-check` at a daily interval

## Epic 5: Gamification & Engagement

Motivate consistent reading and library participation through achievement badges, reading streaks, and leaderboards — giving members visible rewards for their borrowing habits.

### Story 5.1: Achievement Badges & Award Engine

As a member,
I want to earn badges for reaching borrowing and reading milestones,
So that I feel recognized for my library engagement and motivated to keep reading.

**Acceptance Criteria:**

**Given** the badge system is implemented
**When** the story is complete
**Then** a `badges` table exists with columns: id, name, description, icon_key, criteria_type, criteria_threshold

**Given** a set of milestone badges are defined (e.g., "First Borrow", "5 Books Read", "10 Books Read", "Perfect Returner — 5 consecutive on-time")
**When** a member completes a qualifying action (return processed, borrow count reached)
**Then** the system checks all unearned badges and awards any whose criteria are met

**Given** a member earns a new badge
**When** the badge is awarded
**Then** a `member_badges` record is created with member_id, badge_id, and earned_at timestamp

**Given** a member earns a new badge
**When** they next visit their profile
**Then** a visual indicator highlights the newly earned badge

**Given** I navigate to my profile
**When** the badges section loads
**Then** I see all earned badges with icons and earned dates, and unearned badges shown as locked/greyed-out

### Story 5.2: Reading Streaks & Leaderboard

As a member,
I want to see my active reading streak and compare my engagement with other members at my church,
So that I stay motivated through friendly competition and consistent borrowing habits.

**Acceptance Criteria:**

**Given** a member borrows at least one book within a rolling 30-day window
**When** the period is evaluated
**Then** their `active_streak_months` counter reflects consecutive months with at least one borrowing

**Given** a member has no borrowing activity in a 30-day window
**When** the next evaluation occurs
**Then** the streak resets to 0

**Given** I navigate to the leaderboard page
**When** the page loads
**Then** I see a ranked list of members at my church sorted by total books borrowed (lifetime), showing rank, member name, book count, and current streak

**Given** I'm viewing the leaderboard
**When** I look for my position
**Then** my row is visually highlighted regardless of my ranking position

**Given** a church has fewer than 3 active members
**When** the leaderboard is viewed
**Then** a message encourages inviting more members rather than showing sparse rankings

### Story 5.3: XP Points Engine & Level Display

As a member,
I want to earn XP for responsible borrowing actions and see my current level,
So that I have a tangible measure of my library engagement alongside badges and streaks.

**Acceptance Criteria:**

**Given** a member submits a borrow request
**When** the request is created
**Then** the member is awarded +10 XP

**Given** a member is issued a book (Flow A approval or Flow B direct issue)
**When** the issue is processed
**Then** the member is awarded +25 XP

**Given** a member returns a book on or before the due date
**When** the return is processed
**Then** the member is awarded +40 XP

**Given** a member returns a book late
**When** the return is processed
**Then** no XP is awarded for the return (XP withheld)

**Given** a member has accumulated XP
**When** they view their profile
**Then** they see their total XP balance and current level (e.g., "Bookworm Lv.1" at 0-99 XP, "Reader Lv.2" at 100-299 XP, "Scholar Lv.3" at 300+ XP)

## Epic 6: Evangelist Dashboard & Reporting

Give evangelists a comprehensive operational dashboard to monitor library health, track overdue books, manage member activity, and generate reports — all from a single screen.

### Story 6.1: Dashboard Overview & Key Metrics

As an evangelist,
I want to see a dashboard with key library metrics at a glance,
So that I can quickly assess library health without digging through individual records.

**Acceptance Criteria:**

**Given** I'm logged in as an evangelist or church admin
**When** I navigate to the dashboard
**Then** I see summary cards showing: total books in catalog, total active borrowings, overdue count, active members count, and books available

**Given** the dashboard loads
**When** metric data is fetched
**Then** each card displays the current value and a trend indicator (up/down/flat) compared to the previous 30-day period

**Given** I click on any metric card
**When** the click is registered
**Then** I'm navigated to the relevant detail page (e.g., clicking "overdue" goes to overdue borrowings list)

### Story 6.2: Overdue & At-Risk Member Tracking

As an evangelist,
I want to view a prioritized list of overdue borrowings and at-risk members,
So that I can take proactive action before penalties escalate.

**Acceptance Criteria:**

**Given** I navigate to the overdue tracking section
**When** the page loads
**Then** I see a table of all overdue borrowings sorted by days overdue (most overdue first), showing member name, book title, due date, days overdue, and current penalty stage

**Given** a member is flagged as "high-risk" (14+ days overdue)
**When** viewing the overdue list
**Then** their row is visually highlighted in red with a "high-risk" badge

**Given** I want to contact an overdue member
**When** I click the "Send Reminder" action on their row
**Then** a reminder SMS is queued for that member and the action button changes to "Reminder Sent" with timestamp

**Given** suspended members exist
**When** I view the at-risk section
**Then** I see a separate list of suspended members with suspension date, reason, and a "Reinstate" action button

**Given** I click "Reinstate" on a suspended member
**When** the action processes
**Then** the member's suspension is lifted, trust tier resets to "new", and a reinstatement SMS is queued

### Story 6.3: Borrowing Activity Reports

As an evangelist,
I want to generate reports on borrowing activity over configurable time periods,
So that I can track library utilization trends and present data to church leadership.

**Acceptance Criteria:**

**Given** I navigate to the reports section
**When** the page loads
**Then** I see filter controls for date range (preset: last 7 days, 30 days, 90 days, custom range)

**Given** I select a date range and apply
**When** the report generates
**Then** I see: total borrowings in period, unique borrowers, most borrowed books (top 10), average borrow duration, on-time return rate percentage

**Given** a report is generated
**When** I click "Export"
**Then** the report data downloads as a CSV file with all displayed metrics and line items

**Given** I want to see member-level activity
**When** I switch to the "Member Activity" tab
**Then** I see a per-member breakdown showing borrow count, return rate, current trust tier, and active streak

### Story 6.4: Book Inventory Report & Low-Stock Alerts

As an evangelist,
I want to see which books are frequently borrowed and which have low available copies,
So that I can make informed decisions about acquiring new copies or titles.

**Acceptance Criteria:**

**Given** I navigate to the inventory report section
**When** the page loads
**Then** I see a list of all books sorted by borrow frequency (most popular first), showing title, total copies, available copies, times borrowed, and current waitlist/demand

**Given** a book has 0 available copies and active borrow requests pending
**When** viewing the inventory report
**Then** the book row shows a "High Demand" badge with the pending request count

**Given** the inventory report is displayed
**When** I toggle to "Low Stock" view
**Then** I see only books where available copies are 0 or where demand exceeds supply

**Given** I want to share inventory data
**When** I click "Export Inventory"
**Then** the full inventory list downloads as a CSV with all columns

## Epic 7: Church Administration

Enable super admins and church admins to manage multi-church operations — registering new churches, managing evangelists, and overseeing cross-church activity.

### Story 7.1: Church Registration & Configuration

As a super admin,
I want to register new churches in the system and configure their basic settings,
So that each SDA church can operate its own independent library within the shared platform.

**Acceptance Criteria:**

**Given** I'm logged in as a super admin
**When** I navigate to church management
**Then** I see a list of all registered churches with name, location, member count, and active status

**Given** I click "Add Church"
**When** I fill in church name, location/address, and primary contact details and submit
**Then** a new church record is created and appears in the church list

**Given** a church is registered
**When** I view its detail page
**Then** I can edit church name, location, contact info, and toggle active/inactive status

**Given** I deactivate a church
**When** the status is saved
**Then** all members of that church can still log in but cannot create new borrowings, and a visual "Inactive" badge appears on the church

**Given** I want to assign the first evangelist to a new church
**When** I search for an existing member or invite a new one
**Then** I can assign them the "evangelist" role scoped to that specific church

### Story 7.2: Evangelist Management & Cross-Church Oversight

As a church admin,
I want to manage evangelists within my church and view cross-church summary data,
So that I can ensure each church library has adequate staffing and oversight.

**Acceptance Criteria:**

**Given** I'm logged in as a church admin
**When** I navigate to evangelist management for my church
**Then** I see a list of all evangelists with name, phone, assigned date, and active status

**Given** I want to promote a member to evangelist
**When** I search for an active verified member and click "Promote to Evangelist"
**Then** the member receives the assistant_librarian role and appears in the evangelist list

**Given** I want to remove an evangelist's privileges
**When** I click "Revoke Evangelist Role" on their record
**Then** their role is downgraded to "member" and they lose access to the evangelist dashboard

**Given** I'm logged in as a super admin
**When** I navigate to the cross-church overview
**Then** I see an aggregated view of all churches showing: church name, total members, total books, active borrowings, and overdue count per church

**Given** I click on a specific church in the cross-church overview
**When** the detail loads
**Then** I see that church's full dashboard as if I were their evangelist (read-only)

## Epic 8: PWA & Offline Experience

Transform the web app into an installable PWA with offline browsing, queued actions, and push-like notifications — ensuring usability in low-connectivity environments common in Kenyan church settings.

### Story 8.1: PWA Shell & Install Experience

As a member,
I want to install the book club app on my phone's home screen and have it launch like a native app,
So that I can access the library quickly without opening a browser.

**Acceptance Criteria:**

**Given** a user visits the app in a supported mobile browser
**When** the service worker registers and the web manifest is detected
**Then** the browser shows an "Add to Home Screen" prompt (or the app meets PWA installability criteria)

**Given** the app is installed on a device
**When** the user launches it from the home screen
**Then** it opens in standalone mode (no browser chrome) with the app's theme color and splash screen

**Given** Serwist is configured as the service worker framework
**When** the app builds
**Then** static assets (JS, CSS, images) are precached and the service worker handles fetch events with a cache-first strategy for static resources

**Given** the app shell is cached
**When** the user opens the app with no network connection
**Then** the app shell loads and displays a meaningful offline indicator rather than a browser error page

### Story 8.2: Offline Catalog Browsing

As a member,
I want to browse the book catalog even when I have no internet connection,
So that I can discover books to borrow later when I'm back online.

**Acceptance Criteria:**

**Given** a member has previously loaded the catalog while online
**When** the catalog data is fetched
**Then** the book list is stored in IndexedDB via the `idb` library for offline access

**Given** the member opens the catalog while offline
**When** the page loads
**Then** the catalog renders from IndexedDB data with a banner indicating "Viewing cached data — last updated [timestamp]"

**Given** the member searches or filters while offline
**When** they enter a search term or select a category
**Then** the search/filter operates against the locally cached catalog data

**Given** the member comes back online
**When** network connectivity is restored
**Then** the catalog automatically refreshes from the server and updates the IndexedDB cache

### Story 8.3: Offline Action Queue & Sync

As a member,
I want to submit borrow requests and other actions while offline and have them sync when I reconnect,
So that I can use the app productively even in areas with poor connectivity.

**Acceptance Criteria:**

**Given** a member submits a borrow request while offline
**When** the action is triggered
**Then** the request is stored in an IndexedDB `offline_queue` with action type, payload, and timestamp, and the user sees a confirmation: "Request queued — will submit when online"

**Given** queued offline actions exist
**When** network connectivity is restored (detected via `navigator.onLine` and/or service worker sync event)
**Then** the queue processes in FIFO order, submitting each action to the server

**Given** a queued action succeeds on sync
**When** the server confirms the action
**Then** the queue entry is removed and the local data is updated to reflect the server state

**Given** a queued action fails on sync (e.g., book no longer available)
**When** the server rejects the action
**Then** the queue entry is marked as "failed" with the error reason, and the user is notified on their next visit

**Given** the member has pending queued actions
**When** they view the app
**Then** a badge or indicator shows the count of pending offline actions awaiting sync
