---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments:
  - product-brief-bookclub-2026-02-25.md
  - project-context.md
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 0
  projectContext: 1
classification:
  projectType: web_app
  domain: community_organizational
  complexity: medium
  projectContext: brownfield
workflowType: 'prd'
date: 2026-02-26
author: brian
---

# Product Requirements Document - bookclub

**Author:** brian
**Date:** 2026-02-26

## Executive Summary

Book Club is a mobile-first PWA that replaces manual book borrowing in SDA (Seventh-day Adventist) church libraries with a digital system built around accountability, engagement, and operational simplicity. The current process — physical logbooks, no availability visibility, no return tracking — causes books to disappear permanently, discourages borrowing, and overwhelms the volunteer evangelist who manages the library alone.

The system serves four user tiers: Members browse and request books from their phones any day of the week; the Evangelist approves requests, issues books, and monitors the library through a real-time dashboard; Assistant Librarians handle day-to-day issue/receive operations; and Super Admins manage system-level configuration. Sabbath School teachers and youth leaders use the same member interface with group reservation capabilities planned post-MVP.

Members register via phone number + OTP, are verified as church members, and enter a trust-based borrowing progression: new members borrow 1 book at a time, auto-upgrading to 3 after 3 consecutive on-time returns. Overdue books trigger a fully automatic SMS escalation (3-day reminder → Day 1 → Day 7 suspension → Day 14 high-risk flag) that replaces manual chasing entirely. A gamification layer awards XP for borrowing (+10), receiving (+25), and returning on time (+40), with future phases adding levels, streaks, referral bonuses, and XP redemption for premium materials.

Two borrowing flows cover all scenarios: Flow A (remote request → evangelist approval → coordinated pickup) and Flow B (direct issue when member is physically present). The evangelist dashboard provides real-time visibility into active borrowings, overdue books, popular titles, and member borrowing history — with basic board reports included in MVP.

### What Makes This Special

Book Club is not a generic library tool adapted for churches. It is purpose-built around how SDA church communities operate — the evangelist as trusted gatekeeper, membership verification as a prerequisite, and spiritual reading incentivized through gamification rather than enforced through rules. The trust-based borrowing progression solves the specific problem of book loss in community lending: instead of blanket restrictions, new members earn capacity through demonstrated responsibility. The automatic SMS penalty escalation eliminates the evangelist's biggest time drain (chasing overdue books) while maintaining respectful, private accountability — no public shaming, board involvement only for repeat offenders. The core insight is that the manual process doesn't just lose books — it kills the reading culture. By making borrowing frictionless and adding positive reinforcement, the library transforms from a shrinking shelf into an active discipleship tool.

## Project Classification

- **Project Type:** Web Application (Progressive Web App with offline support)
- **Domain:** Community/Organizational Management (SDA church library operations)
- **Complexity:** Medium — multi-role RBAC, SMS integration, gamification engine, offline sync, trust progression state machine, penalty escalation automation, multi-church expansion architecture
- **Project Context:** Brownfield — existing vanilla HTML/JS/CSS prototype (`book-club-system/`) being completely rebuilt on Next.js 16 / TypeScript / Neon PostgreSQL / Drizzle ORM / NextAuth v5 / Tailwind CSS 4 / shadcn / Serwist PWA stack

## Success Criteria

### User Success

| Criteria | Target (3 months) | Target (6 months) |
|---|---|---|
| Digital transaction rate (% borrows via app vs manual) | 80% | 95% |
| Evangelist notebook elimination | Fully stopped within 1 month | N/A |
| On-time return rate (returned before due date) | 50% | 65% |
| Average request-to-approval time | < 4 hours | < 2 hours |
| Members checking due dates in-app | 50% | 70% |
| Repeat borrowing rate (borrow again within 60 days) | 40% | 55% |
| New member registration (% within 4 weeks of joining church) | 60% | 75% |

**User "Aha!" Moments:**
- Member: Finds a book in seconds, taps "Request," gets approved within hours — no physical visit required
- Evangelist: Opens dashboard Monday morning, sees all overdue books auto-reminded — zero manual chasing needed
- New member: Sees "Recommended for New Members" section, borrows first book with one tap, earns first XP

### Business Success

**3-Month Objectives:**
- App fully replaces manual borrowing for the pilot church
- Evangelist operates entirely through the dashboard — no physical notebook
- Overdue rate drops below 15% via automatic SMS escalation
- Church board receives first data-driven library report
- At least 30% of church members registered

**6-Month Objectives:**
- 50%+ of church members registered and active
- Lost books under 2 per quarter
- Borrowing volume up 25% vs pre-app baseline
- At least 1 other church requests the system (multi-church validation)
- Board makes at least 1 data-based decision per quarter (e.g., new book purchases based on popularity data)
- Evangelist reports 60%+ admin time reduction

### Technical Success

| Criteria | Target |
|---|---|
| Page load time (3G connection) | < 3 seconds |
| PWA installability | Passes Lighthouse PWA audit |
| Offline catalog browsing | Cached and functional without network |
| Offline-to-online data sync | Zero data loss, idempotent queue processing |
| SMS delivery confirmation rate | > 95% |
| Uptime | 99.5% (< 3.6 hours downtime/month) |
| TypeScript strict mode compliance | Zero `any` types, `tsc --noEmit` passes |
| Test coverage (Server Actions) | 100% of success + error paths |
| Lighthouse Performance score | > 80 (mobile) |
| Build time | < 60 seconds |

### Measurable Outcomes

**Library Health:**

| Metric | Target (3 months) | Target (6 months) |
|---|---|---|
| Lost books per quarter | Under 3 | Under 2 |
| Overdue rate (% past due date) | Under 15% | Under 10% |
| Books returned within 7 days of due | 85% | 90% |
| Inventory accuracy (system vs physical) | 90% | 97% |
| Average overdue duration | Under 10 days | Under 5 days |

**Growth & Adoption:**

| Metric | Target (3 months) | Target (6 months) |
|---|---|---|
| Member registration rate (% of church) | 30% min / 50% strong | 50% min / 65% exceptional |
| Active borrowers per week (per 100 members) | 10–20 | 15–25 |
| Multiple user types active | 3 of 4 types | All 4 types |
| Monthly active user retention | 60% month-over-month | 70% month-over-month |

**Engagement & Gamification:**

| Metric | Target (3 months) | Target (6 months) |
|---|---|---|
| Streak participation (% maintaining on-time streaks) | 25% | 40% |
| New member engagement (% borrowing within 60 days) | 50% | 65% |
| XP redemption rate (% eligible redeeming) | 15% | 30% |
| Referral-driven registrations | 10% of new signups | 20% of new signups |

**Leading Indicators:** Registration rate trending upward weekly, repeat borrowing > 40%, referral registrations growing, streak participation increasing

**Lagging Indicators:** Lost books per quarter under target, overdue rate under target, admin time reduction confirmed, board engagement with reports

## User Journeys

### Journey 1: Mary Kaari — "A Book for the Week" (Member Happy Path)

**Opening Scene:** It's Sunday afternoon. Mary just finished lunch and is thinking about the sermon from yesterday's Sabbath service on family worship. She wants a book on family devotions but doesn't want to wait until next Sabbath to check the library. She pulls out her phone.

**Rising Action:** Mary opens the Book Club app. She taps "Browse" and filters by "Family & Devotional." Three books appear — two available, one borrowed. She taps *Family Worship Made Simple* by Mark Finley, reads the description, and hits "Request." The app confirms: "Request sent to Brother Peter. You'll be notified when approved."

Twenty minutes later, her phone buzzes — SMS from the system: "Your request for *Family Worship Made Simple* has been approved. Please coordinate pickup with the library." She messages Brother Peter on WhatsApp: "I'll pick it up tomorrow after work." He replies with a thumbs up.

Monday evening, Mary picks up the book. Brother Peter opens the app, searches "Mary Kaari," taps "Issue" next to the pending request. The system records the issue date and calculates the due date: March 12. Mary sees +10 XP (request) and +25 XP (issued) appear on her profile. Her total is now 185 XP.

**Climax:** Eleven days later — 3 days before the due date — Mary gets an SMS: "Friendly reminder: *Family Worship Made Simple* is due on March 12. Return on time to earn +40 XP!" She finishes the last chapter that evening. Next Sabbath, she hands the book back to Brother Peter, who marks it "Returned" in the app. +40 XP. Her streak counter ticks up to 4 consecutive on-time returns.

**Resolution:** Mary's profile now shows 225 XP, Level 2 (Consistent Reader). She's already browsing for her next book. The library isn't something she dreads visiting anymore — it's part of her weekly rhythm.

**Requirements Revealed:** Book catalog with search/filter, borrow request flow, SMS notifications, XP award engine, due date calculation, return processing, streak tracking, member profile with XP display.

---

### Journey 2: Mary Kaari — "The Forgotten Book" (Member Edge Case — Overdue Recovery)

**Opening Scene:** Mary borrowed *Steps to Christ* three weeks ago. Life got busy — sick child, extra shifts at work. The book is sitting on her nightstand, forgotten. She's now 7 days overdue.

**Rising Action:** The system has already been working. On Day -3 (3 days before due): "Friendly reminder: *Steps to Christ* is due March 5." Mary saw it but forgot. On Day 1 overdue: "Gentle reminder: *Steps to Christ* was due yesterday. Please return to keep your streak." Mary thought she'd return it next Sabbath. On Day 7 overdue: "Warning: *Steps to Christ* is now 7 days overdue. Your borrowing privileges have been suspended until the book is returned."

Mary opens the app to request a new book for her daughter. She sees a banner: "Borrowing Suspended — 1 overdue book." She can't request anything. Her consecutive return streak has reset to 0.

**Climax:** Mary feels the weight of it. Not shame — the message was private, just between her and the system. No announcement at church. She finds the book, brings it to Brother Peter after Wednesday prayer meeting. He marks it returned. The app shows: "Borrowing privileges restored. Your on-time streak has been reset." No XP for this return — the late penalty is simply the lost streak and the suspension period.

**Resolution:** Mary borrows again the following week. She sets a personal phone reminder this time. She's determined to rebuild her streak. The system didn't punish her publicly — it just enforced accountability privately. She respects that.

**Requirements Revealed:** Automatic SMS escalation state machine (Day -3, Day 1, Day 7, Day 14), borrowing suspension logic, streak reset trigger, suspension banner in UI, privilege restoration on return, no XP for late returns, overdue status tracking per member.

---

### Journey 3: James — "First Book, First Steps" (New Member Onboarding)

**Opening Scene:** James was baptized two weeks ago. During the church welcome, the head elder mentioned the Book Club app. Daniel (youth leader) showed him the QR code on the church noticeboard. James scans it on his phone.

**Rising Action:** The PWA loads. James taps "Register," enters his phone number, receives an OTP via SMS, and verifies. The app asks him to select his church from a dropdown — "SDA Church Nyeri Central." His registration goes to Brother Peter for membership verification.

Brother Peter opens his dashboard, sees "New Registration: James Mwangi." He cross-references the church membership list, taps "Verify." James gets an SMS: "Welcome to Book Club! You're verified as a member of SDA Church Nyeri Central. You can now borrow 1 book at a time."

James opens the app and sees a "Recommended for New Members" banner (post-MVP, but the category filter still works). He browses "Doctrine & Fundamentals," finds *Steps to Christ*, and taps "Request." The app confirms: "1 of 1 book slots used."

**Climax:** James returns the book on time. +40 XP. The app shows: "1 of 3 on-time returns toward borrowing upgrade." He borrows again, returns on time. "2 of 3." Third book — returned 2 days early. "Congratulations! You've earned trust status. You can now borrow up to 3 books at a time."

**Resolution:** James feels welcomed and trusted. The system didn't treat him as a risk — it gave him a clear path to earn capacity. He tells a friend from the youth group about the app. Three months later, James is at Level 3 with a 6-book streak.

**Requirements Revealed:** OTP registration flow, church selection, membership verification queue (evangelist approval), new member borrowing limit (1 book), trust progression counter (3 on-time returns → upgrade), upgrade notification, borrowing slot display, verification status tracking.

---

### Journey 4: Brother Peter — "Monday Morning Dashboard" (Evangelist Admin Operations)

**Opening Scene:** It's Monday morning. Brother Peter sits down with his tea and opens the Book Club app on his phone. The evangelist dashboard loads.

**Rising Action:** The dashboard shows at a glance: 4 pending borrow requests, 2 overdue books, 47 active borrowings, 3 books returned over the weekend. He starts with the pending requests.

Request 1: Sister Grace wants *Sabbath School Commentary Q2*. Available. He taps "Approve." Request 2: Daniel wants *Youth Leadership Essentials*. Available. Approve. Request 3: A member wants *Health Reform Handbook* — but they have an overdue book. The system has already blocked this request and shows a note: "Member has 1 overdue book. Request cannot be approved until overdue item is returned." Peter doesn't need to do anything — the system handled it.

Request 4: James wants *The Great Controversy* — only 1 copy and it's currently borrowed by another member (due back in 3 days). Peter taps "Decline" with a note: "Book currently unavailable. Will notify you when returned." James gets an SMS.

Peter checks the overdue list. Member A is at Day 5 — the system already sent Day 1 reminder. Member B is at Day 8 — borrowing suspended automatically, warning SMS sent yesterday. Peter doesn't need to chase anyone. He notes Member B is a repeat offender (3rd overdue in 6 months) — he'll mention it privately at the next board meeting.

After Sabbath service, a member walks up with a book to return and another member wants to borrow. Peter opens the app, searches the returning member, marks the book returned. Then searches the new borrower, finds the book they want, and taps "Issue Directly" — no request step needed since they're standing right there.

**Climax:** End of the month. The church board meeting is tomorrow. Peter opens "Reports" — a summary showing: 52 total borrows this month, 89% on-time return rate, 3 books overdue, 2 most popular titles, 5 books never borrowed. He screenshots the summary for the board WhatsApp group.

**Resolution:** Peter used to spend 2 hours every Sabbath plus midweek follow-ups managing the library notebook. Now he spends 15 minutes on Monday approvals and occasional direct issues on Sabbath. His notebook is in a drawer. He hasn't opened it in 3 months.

**Requirements Revealed:** Evangelist dashboard (pending requests, overdue list, active borrowings, returns), request approval/decline with notes, automatic block on overdue members, direct issue flow (Flow B), return processing, overdue repeat offender tracking, board reports (monthly summary, popular books, unused inventory), SMS decline notification.

---

### Journey 5: Sister Grace — "Preparing for Sabbath School" (Teacher Mid-Week Flow)

**Opening Scene:** It's Tuesday. Sister Grace is preparing her Sabbath School lesson on the book of Daniel for this coming Sabbath. She needs the *Adult Sabbath School Bible Study Guide* commentary and a reference book on Daniel's prophecies.

**Rising Action:** Grace opens the app, searches "Daniel prophecy." Two results: *God Cares Vol. 1 — Daniel* (available) and *Daniel and Revelation Committee Series* (borrowed, due back Thursday). She requests *God Cares Vol. 1* immediately. For the second book, she makes a note to check back Thursday.

Brother Peter approves within an hour. Grace coordinates pickup — she'll swing by the church office Wednesday afternoon since she passes it on her way from work. Wednesday she picks up the book; Peter issues it from his phone.

Thursday evening, Grace checks the app — *Daniel and Revelation Committee Series* is now showing "Available." The previous borrower returned it on time. Grace requests it. Approved. She picks it up Friday afternoon.

**Climax:** Sabbath morning, Grace teaches a rich, well-researched class on Daniel 2. Members are engaged. One member asks where she found that insight about Nebuchadnezzar's dream — Grace says it's from the church library and shows them the Book Club app on her phone. Two members download it after service.

**Resolution:** Grace has both books ready to return next Sabbath, well within the 14-day window. She earned XP on both transactions. More importantly, her teaching quality improved because she had timely access to the right materials — something that was hit-or-miss before the app.

**Requirements Revealed:** Search by topic/keyword, real-time availability status updates, multi-book borrowing for established members, availability change tracking, mid-week borrowing workflow (not Sabbath-dependent), organic word-of-mouth discovery path.

---

### Journey 6: Super Admin — "Setting Up a New Church" (System Setup)

**Opening Scene:** The pilot church has been running for 4 months. A neighboring SDA church — Nyeri West — has heard about Book Club and wants to join. The Super Admin (brian) needs to set up their church in the system.

**Rising Action:** Brian logs into the admin panel. He navigates to "Churches" → "Add New Church." He enters: Church name (SDA Church Nyeri West), location, contact details, and a unique church code (NYERI-WEST). The church record is created.

Next, he needs to assign a Church Admin. The Nyeri West evangelist — Sister Wanjiku — has already registered as a member. Brian searches her account, changes her role from "Member" to "Church Admin (Evangelist)," and assigns her to the Nyeri West church. Sister Wanjiku receives an SMS: "You've been assigned as Church Admin for SDA Church Nyeri West. Log in to set up your library."

Brian then configures the SMS gateway for the new church — verifying the SMS Leopard API credentials are shared across the system (single-tenant, shared gateway). He reviews the default borrowing settings: 14-day loan period, 3 books max for established, 1 for new members. These are system defaults — Sister Wanjiku can adjust them per her church's needs.

**Climax:** Sister Wanjiku logs in, sees her evangelist dashboard — empty but ready. She starts by adding books: manually entering 15 titles from her church's shelf. By the following Sabbath, she announces the app to her congregation with the QR code. Within a week, 12 members have registered.

**Resolution:** Two churches now run on Book Club with isolated data. Brian can see both churches in his Super Admin view — aggregate stats, per-church health. This is the beginning of the district expansion. The architecture holds.

**Requirements Revealed:** Super Admin church management (create, configure), role assignment (promote member to Church Admin), church-scoped data isolation, SMS gateway configuration, default borrowing policy settings (overridable per church), Super Admin aggregate dashboard, church onboarding workflow, book inventory manual entry.

---

### Journey Requirements Summary

| Capability Area | Journeys That Require It |
|---|---|
| Book catalog (browse, search, filter, availability) | 1, 2, 4, 5 |
| Borrow request flow (Flow A) | 1, 3, 5 |
| Direct issue flow (Flow B) | 4 |
| SMS notifications (approval, reminder, escalation) | 1, 2, 3, 4 |
| XP engine (award, display, streak) | 1, 2, 3 |
| Trust progression (1→3 book upgrade) | 3 |
| Penalty escalation state machine | 2, 4 |
| Borrowing suspension/restoration | 2, 4 |
| Evangelist dashboard (requests, overdue, reports) | 4 |
| OTP registration + membership verification | 3 |
| Role management + church setup | 6 |
| Board reports | 4 |
| Return processing | 1, 2, 4 |
| Overdue block on new requests | 2, 4 |
| Multi-church data isolation | 6 |

## Domain-Specific Requirements

### Data Privacy & Community Sensitivity

- **Borrowing history is private** — no member can see another member's borrowing activity, overdue status, or XP balance
- **Penalty escalation is private** — SMS reminders go only to the borrower; no public notifications, leaderboards of shame, or group announcements about overdue books
- **Board-level visibility is aggregate only** — board reports show summary statistics (overdue count, return rates), not individual member names, unless the evangelist specifically flags a repeat offender for private board discussion
- **Phone numbers are not displayed** to other members — only the evangelist and Super Admin can see member contact details
- **Member deletion/deactivation** must anonymize borrowing history (retain aggregate stats but remove personal identifiers)

### SMS Integration Constraints

- **SMS Leopard API** — per-message cost (~KES 0.50–1.00 per SMS); system must track SMS spend per church per month
- **Delivery failures** — SMS may fail silently (no delivery receipt from all carriers); the escalation state machine must not advance penalty stages based on "message sent" alone — it advances based on **calendar days**, regardless of delivery status
- **Rate limiting** — SMS Leopard has burst limits; batch SMS (e.g., sending 50 reminders at once) must be queued with delay between sends
- **OTP reliability** — if SMS delivery fails during registration, provide a retry mechanism with 15-min cooldown and max 3 attempts before lockout
- **SMS content limits** — keep messages under 160 characters (1 SMS segment) to minimize cost; avoid Unicode characters that double segment size

### Church Organizational Authority

- **Evangelist has significant power** — can verify/reject members, approve/decline borrows, suspend privileges, flag members as high-risk. All admin actions must be logged with timestamp and actor for audit trail
- **Role escalation protection** — only Super Admin can promote a member to Church Admin; Church Admins cannot self-promote or promote others to their level
- **Assistant Librarian is intentionally limited** — can issue/receive books and view inventory, but cannot change system settings, remove members, or access board reports. This protects against unauthorized changes when the evangelist delegates
- **Member removal** — only Church Admin can remove a member; requires all borrowed books to be returned or marked as lost first

### Connectivity & Offline Considerations

- **Target users are in Kenya** — mobile data costs are significant; minimize data transfer per interaction
- **Rural church areas** may have 2G/3G only — pages must load under 3s on 3G (already in Technical Success criteria)
- **Offline catalog browsing** — book catalog cached via service worker; members can browse and prepare requests offline, with requests queued and synced when connectivity returns
- **Offline queue idempotency** — every queued action must have a UUID v4 idempotency key to prevent double-processing when sync fires
- **No offline admin actions** — evangelist approvals, direct issues, and returns require live connectivity (these modify authoritative state and must not conflict)

### Cultural & Operational Patterns

- **Sabbath sensitivity** — the system operates 7 days/week, but the primary in-person interaction window is Sabbath (Saturday). The UI should not emphasize or de-emphasize any particular day, but the evangelist's busiest period for direct issues (Flow B) will be Sabbath
- **Church calendar integration** — future phases should consider aligning book recommendations with the SDA quarterly Sabbath School lesson cycle and camp meeting/youth week schedules
- **Trust-based community** — the penalty system works because it's private and proportional. If members feel surveilled or shamed, adoption will collapse. The UX must communicate "accountability" not "policing"
- **Volunteer-operated** — the evangelist is a volunteer, not a professional librarian. The dashboard must be simple enough for a low-to-moderate tech-savvy user to operate without training beyond a brief walkthrough

## Web Application Specific Requirements

### Project-Type Overview

Book Club is a **Progressive Web App (PWA)** built with Next.js App Router. The architecture is hybrid: Server Components render on the server for fast initial loads, while client-side navigation provides SPA-like transitions. The app is installed on members' phones via the PWA install prompt and runs offline for catalog browsing via Serwist service worker caching.

### Browser Support Matrix

| Browser | Priority | Minimum Version | Notes |
|---|---|---|---|
| Chrome (Android) | Primary | 90+ | Target audience — most Kenyan church members use Android |
| Safari (iOS) | Secondary | 15+ | iPhone users, PWA install via "Add to Home Screen" |
| Chrome (Desktop) | Secondary | 90+ | Evangelist dashboard usage from laptop/desktop |
| Firefox (Desktop) | Low | Latest | Not actively tested but should work |
| Edge (Desktop) | Low | Latest | Not actively tested but should work |
| IE11 / Legacy | Not supported | N/A | No support needed |

### Responsive Design

- **Mobile-first design** — all layouts designed for 360px+ width first, then scaled up
- **Breakpoints:** Mobile (< 640px), Tablet (640px–1024px), Desktop (> 1024px)
- **Primary interaction device:** Mobile phone (member browsing, requesting, viewing due dates)
- **Secondary interaction device:** Mobile phone or tablet (evangelist dashboard, approvals, direct issue)
- **Tertiary interaction device:** Desktop (Super Admin church management, reports)
- **Touch targets:** Minimum 44x44px for all interactive elements (buttons, links, form fields)
- **No horizontal scrolling** on any viewport size
- **Evangelist dashboard** must be fully functional on mobile — Brother Peter uses his phone, not a laptop

### Performance Targets

| Metric | Target | Measurement Method |
|---|---|---|
| First Contentful Paint (3G) | < 1.5s | Lighthouse mobile simulation |
| Largest Contentful Paint (3G) | < 2.5s | Lighthouse mobile simulation |
| Time to Interactive (3G) | < 3.0s | Lighthouse mobile simulation |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Total bundle size (JS) | < 200KB gzipped | Build output analysis |
| Lighthouse Performance | > 80 | Lighthouse mobile audit |
| Lighthouse PWA | Pass all criteria | Lighthouse PWA audit |

**Performance Strategies:**
- Server Components by default — minimize client JS
- Dynamic imports for heavy components (reports, charts)
- `next/image` with responsive sizing and lazy loading
- Serwist precaching for static assets and app shell
- Neon serverless HTTP — no connection pooling overhead, but cold start awareness (show loading states)

### SEO Strategy

**Not applicable.** Book Club is a closed community app behind OTP authentication. The only public-facing page is the login/registration screen. No search engine indexing needed. Set `robots.txt` to disallow all and `noindex` meta tags on all pages except the landing/login page.

### Accessibility Level

**Target: WCAG 2.1 AA compliance** — detailed criteria in Non-Functional Requirements § Accessibility.

Web-app-specific considerations:
- **Forms:** Proper `<label>` associations, error messages linked via `aria-describedby`, field validation announced to screen readers
- **Dynamic updates:** `aria-live` regions for XP earned, request status changes, and borrowing state changes
- **PWA context:** Accessibility must work identically in standalone PWA mode and browser mode

### Implementation Considerations

**PWA Installation:**
- Custom install prompt on first visit after registration (not before — members need to see value first)
- PWA manifest with church-themed icons, `display: standalone`, `theme_color` matching brand
- iOS: Guide users through "Add to Home Screen" flow (Safari doesn't auto-prompt)

**Offline Architecture:**
- **Serwist service worker** (`src/sw.ts` → `public/sw.js`) precaches app shell and static assets
- **Book catalog** cached in IndexedDB via `idb` library for offline browsing
- **Offline request queue** — borrow requests made offline are queued with UUID v4 idempotency keys, synced via `/api/sync` when connectivity returns
- **Never cache** API responses, Server Action results, or auth tokens in service worker
- **`useOnlineStatus` hook** + `OfflineBanner` component for network state UI feedback

**Authentication Architecture:**
- **NextAuth v5** with Credentials provider — phone number + OTP flow
- **Session strategy:** JWT (stateless, edge-compatible with Neon serverless)
- **Middleware** validates JWT on every request, checks role-based route permissions
- **OTP flow:** Enter phone → send OTP via SMS Leopard → verify → create/resume session
- **Session refresh:** Automatic JWT refresh, configurable session duration

**Data Architecture:**
- **Neon PostgreSQL** via `@neondatabase/serverless` HTTP driver — stateless, no TCP connections
- **Drizzle ORM** for type-safe queries, schema definition, and migrations
- **UUID v4** for all primary keys — prevents enumeration attacks
- **Integer cents** for any monetary values (SMS costs tracking)
- **Drizzle Zod** for automatic input validation schemas from DB schema

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP — solve the core pain (books disappearing, no visibility, manual chasing) with the minimum feature set that makes manual notebooks unnecessary.

**Guiding Principle:** If Brother Peter can stop using his physical notebook within the first month, the MVP is a success. Everything else is growth.

**Resource Requirements:** Solo developer (brian), leveraging Next.js 16 / Neon serverless / Drizzle stack for maximum developer velocity. No dedicated QA, design, or ops — the developer wears all hats. Estimated MVP timeline: focused build sprints with continuous deployment.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

| Journey | MVP Support | Notes |
|---|---|---|
| Journey 1: Member Happy Path | Full | Browse, request, receive, return, earn XP |
| Journey 2: Overdue Recovery | Full | Automatic SMS escalation, suspension, restoration |
| Journey 3: New Member Onboarding | Full | OTP registration, verification, trust progression |
| Journey 4: Evangelist Dashboard | Full | Approvals, overdue tracking, direct issue, basic reports |
| Journey 5: Teacher Mid-Week Flow | Full | Search, multi-book borrowing, availability tracking |
| Journey 6: Multi-Church Setup | Partial | Single church only in MVP; multi-church architecture deferred |

**Must-Have Capabilities:**

*Authentication & Membership:*
- Phone number + OTP registration (SMS Leopard)
- Church membership verification (evangelist approval or pre-uploaded member list)
- 4 role levels: Super Admin, Church Admin (Evangelist), Assistant Librarian, Member
- Role-based access control and route protection via middleware

*Book Catalog:*
- Browse, search, filter by category with real-time availability
- Book details (title, author, description, category, ISBN, copies)
- Inventory management (add, edit, remove books)

*Borrowing System:*
- Flow A: Remote request → evangelist approval → coordinate pickup → mark issued
- Flow B: Direct issue when physically present (search member → issue immediately)
- Configurable loan period (default 14 days), due date auto-calculation
- Max 3 books (established) / 1 book (new members), overdue block
- Trust-based progression: 1 → 3 books after 3 consecutive on-time returns
- Streak reset if overdue beyond 7 days

*SMS Escalation (Fully Automatic):*
- Day -3: friendly reminder
- Day 1 overdue: gentle reminder
- Day 7 overdue: warning + borrowing suspended
- Day 14 overdue: "High Risk" flag + evangelist alert + return/replace required

*Evangelist Dashboard:*
- Approve/decline borrow requests, view active borrowings/returns/overdue
- Track popular vs underutilized books, member history, repeat offenders
- Basic board reports (borrowing summary, overdue summary, inventory status)

*Basic XP System:*
- +10 XP on borrow request, +25 on issued, +40 on on-time return
- Points and current level displayed on member profile

*PWA & Offline:*
- Installable progressive web app, offline catalog browsing (Serwist + IndexedDB)
- Offline request queue with UUID v4 idempotency keys

**Explicitly Deferred from MVP:**
- Reading levels, level progression, badges, streaks, leaderboards
- Referral program and XP redemption
- Book recommendations and curated sections ("New This Week")
- Group reservations for teachers/youth leaders
- CSV/Excel book import
- Multi-church support and district-level oversight
- Push notifications (SMS only in MVP)
- Advanced analytics and trend reporting
- Audiobook access
- Per-category loan periods

### Post-MVP Features

**Phase 2 (Growth — Post-MVP):**
- Reading levels and progression (Rookie Reader → Library Legend)
- Weekly quests, streaks, and streak-based rewards
- Referral program (bonus XP on referral's first borrow)
- XP redemption for premium materials
- Book recommendations and curated sections
- Group reservations for Sabbath School teachers and youth leaders
- CSV/Excel book import for bulk inventory entry
- Advanced gamification (badges, milestones, leaderboards)
- Push notifications alongside SMS

**Phase 3 (Expansion — Multi-Church & Scale):**
- Multi-church support with isolated data per church
- District-level oversight and conference analytics
- Standardized borrowing policy templates
- Per-category configurable loan periods
- Audiobook access via XP redemption
- Advanced analytics and trend reporting
- Offline sync queue for poor connectivity areas
- Partnership integrations with Adventist publishing houses

**Ultimate Vision:** Scalable, standardized digital accountability system for SDA church libraries across Kenya, expanding regionally across East Africa.

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Impact | Mitigation |
|---|---|---|
| SMS delivery failures | Penalties advance without member awareness | Escalation advances on calendar days, not delivery confirmation; members can check status in-app |
| Neon cold starts | Slow first request after idle | Show loading states; Serwist precaches app shell so perceived performance stays high |
| PWA install friction (iOS) | Lower adoption on iPhones | Provide clear "Add to Home Screen" guidance; app works in browser regardless |
| Offline sync conflicts | Data inconsistency | UUID v4 idempotency keys on all queued actions; no offline admin actions (live connectivity required) |

**Market Risks:**

| Risk | Impact | Mitigation |
|---|---|---|
| Evangelist adoption resistance | System unused, falls back to notebook | Design dashboard to be simpler than the notebook; involve Brother Peter as design partner |
| Low member registration | Insufficient user base for viability | Leverage church announcement channels; QR code on noticeboard; youth leaders as adoption champions |
| Cold start (empty library) | No books → no value → no engagement | Prioritize book entry UX; pre-load with common SDA titles if evangelist approves |

**Resource Risks:**

| Risk | Impact | Mitigation |
|---|---|---|
| Solo developer bottleneck | Slow progress, burnout | Tight MVP scope; leverage framework conventions (Next.js, shadcn) to minimize custom code |
| SMS cost escalation | Church budget concern (~KES 2,000–5,000/month for active church) | Track SMS spend per church per month; keep messages under 160 chars (1 segment); batch sends with delays |
| Scope creep | MVP never ships | Strict phase boundaries; "deferred" list is a commitment, not a suggestion |

## Functional Requirements

### Member Registration & Identity

- FR1: Prospective members can register using their phone number and receive an OTP for verification
- FR2: Registered users can authenticate via phone number + OTP to access the system
- FR3: Evangelists can verify or reject pending member registrations against the church membership list
- FR4: The system can enforce a maximum OTP retry limit with cooldown to prevent abuse
- FR5: Super Admins can assign and change user roles (Member, Assistant Librarian, Church Admin)
- FR6: Members can view their own profile including XP balance, borrowing history, and trust status

### Book Catalog & Inventory

- FR7: Members can browse the book catalog with search, filter by category, and view real-time availability
- FR8: Members can view book details including title, author, description, category, and available copies
- FR9: Evangelists and Assistant Librarians can add new books to the catalog
- FR10: Evangelists and Assistant Librarians can edit existing book details
- FR11: Evangelists can remove books from the catalog
- FR12: The system can display real-time availability status for each book (available, all copies borrowed)
- FR13: Members can browse the book catalog offline using cached data

### Borrowing & Returns

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

### Trust Progression & Penalties

- FR24: The system can track consecutive on-time returns per member
- FR25: The system can automatically upgrade a member's borrowing limit from 1 to 3 after 3 consecutive on-time returns
- FR26: The system can reset the consecutive return streak when a book is returned more than 7 days overdue
- FR27: The system can send automatic SMS reminders on a configurable schedule (Day -3, Day 1, Day 7, Day 14)
- FR28: The system can automatically suspend borrowing privileges at Day 7 overdue and restore them upon return
- FR29: The system can flag members as "High Risk" at Day 14 overdue and alert the evangelist

### Gamification

- FR30: The system can award XP to members for borrowing actions (+10 request, +25 issued, +40 on-time return)
- FR31: The system can withhold XP for late returns
- FR32: Members can view their XP balance and current level on their profile

### Evangelist Dashboard & Reporting

- FR33: Evangelists can view a dashboard showing pending requests, active borrowings, overdue books, and recent returns
- FR34: Evangelists can view member borrowing history and overdue patterns
- FR35: Evangelists can identify repeat offenders (multiple overdue incidents)
- FR36: Evangelists can generate board reports (monthly borrowing summary, overdue summary, inventory status)
- FR37: Evangelists can view popular and underutilized books
- FR38: The system can log all admin actions with timestamp and actor for audit trail
- FR39: The system can send SMS notifications to members for request approvals, declines, and penalty escalations

### System Administration

- FR40: Super Admins can create and configure church records in the system
- FR41: Super Admins can assign a member as Church Admin (Evangelist) for a specific church
- FR42: Super Admins can view aggregate statistics across all churches
- FR43: The system can install as a Progressive Web App on members' devices
- FR44: The system can function offline for catalog browsing and queue requests for later sync

## Non-Functional Requirements

### Performance

- Page load time under 3 seconds on 3G mobile connections
- Server Action responses under 500ms at the 95th percentile
- Offline catalog browsing loads instantly from IndexedDB cache
- Total JavaScript bundle under 200KB gzipped
- Lighthouse Performance score above 80 on mobile simulation
- First Contentful Paint under 1.5 seconds, Largest Contentful Paint under 2.5 seconds on 3G
- Cumulative Layout Shift below 0.1

### Security

- All data encrypted in transit via TLS 1.2+
- OTP codes expire after 5 minutes with a maximum of 3 attempts per 15-minute window
- Phone numbers visible only to Evangelist and Super Admin roles
- Borrowing history is private — members cannot view other members' activity or overdue status
- All admin actions (approvals, role changes, suspensions) logged with timestamp and actor identity
- JWT tokens with configurable expiry; no sensitive data stored in token payload
- Role-based route protection enforced at middleware level before page rendering
- UUID v4 primary keys on all entities to prevent enumeration attacks

### Scalability

- System supports up to 500 members and 1,000 books per church without performance degradation
- Architecture supports multi-church data isolation without schema changes (Phase 3 readiness)
- SMS sending queued with rate limiting to respect SMS Leopard burst limits
- Database queries optimized for single-church scoping with indexes on church_id foreign keys

### Accessibility

- WCAG 2.1 AA compliance for all core flows (registration, browsing, requesting, returning)
- Minimum 4.5:1 color contrast ratio for text, 3:1 for large text and UI components
- All touch targets minimum 44x44 pixels
- All interactive elements keyboard-navigable with visible focus indicators
- Screen reader support via semantic HTML, ARIA labels on icons, and `aria-live` regions for dynamic updates
- Respects `prefers-reduced-motion` user preference — disables animations and transitions
- Base font size 16px, scalable to 200% without layout breakage

### Integration

- SMS Leopard API: OTP delivery within 30 seconds, graceful retry with exponential backoff on failure
- SMS messages kept under 160 characters (single segment) to minimize per-message cost
- SMS spend tracked per church per month for budget visibility and alerting
- Offline queue sync via idempotent endpoint processing with UUID v4 deduplication

### Reliability

- 99.5% uptime target (under 3.6 hours unplanned downtime per month)
- Graceful degradation: app remains browsable offline when server is unreachable
- Zero data loss on offline-to-online sync transitions
- Penalty escalation state machine advances on calendar days regardless of system availability or SMS delivery status
- No admin actions permitted offline — prevents conflicting state mutations
