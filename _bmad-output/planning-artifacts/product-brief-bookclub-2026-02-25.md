---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: complete
inputDocuments: []
date: 2026-02-25
author: brian
---

# Product Brief: bookclub

## Executive Summary

Book Club is a purpose-built digital library management system for SDA (Seventh-day Adventist) church communities. It replaces the manual, paper-based book borrowing process — which leads to lost books, forgotten returns, and an underutilized library — with a mobile-first PWA that lets church members browse, request, and track book borrowings from their phones. The system introduces gamification (XP points, reading levels, streaks, weekly quests, and a referral program) to encourage consistent reading and timely returns, while giving the church evangelist (library manager) full visibility into the library's status through a dedicated dashboard with overdue notifications and borrowing analytics. Accumulated XP can be redeemed for access to premium materials and special collections.

---

## Core Vision

### Problem Statement

SDA church libraries are managed manually through physical logbooks or informal sign-out systems. The church evangelist responsible for the library has no reliable way to track who has which book, when it's due, or whether it's been returned. Members cannot check book availability without physically visiting the library, and there is no accountability system for timely returns.

### Problem Impact

- **Books disappear permanently** — with no tracking, borrowed books are never returned and the library shrinks over time
- **Members stop using the library** — the disorganized process discourages borrowing, especially among youth and new members
- **Duplicate purchases** — the church buys books it already owns because nobody knows what's available
- **Sabbath School teachers, evangelists, and youth leaders struggle** to find and reserve specific materials for programs
- **The evangelist is overwhelmed** — manually tracking borrowings across a growing congregation is unsustainable

### Why Existing Solutions Fall Short

Generic library management tools (Libib, LibraryThing, etc.) are designed for personal collections or public libraries. They lack church-specific features: membership verification, spiritual reading gamification, group reservations for church programs, evangelist notification dashboards, and the trust-based borrowing progression that prevents book loss in a community setting. No existing solution combines borrowing management with spiritual engagement incentives.

### Proposed Solution

A mobile-first PWA where church members can:
- Browse the full library catalog from their phone, seeing real-time availability
- Request a book with one tap — any day of the week, not just Sabbath
- Earn XP points for borrowing, returning on time, and maintaining reading streaks
- Progress through reading levels (Rookie Reader → Library Legend) that unlock borrowing capacity
- New members start with a one-book limit; timely returns and accumulated XP unlock additional borrowing slots
- Borrowing is blocked if a member has an overdue book — encouraging accountability
- Refer fellow church members to join — earn bonus XP when referrals register and complete their first borrow
- Redeem accumulated XP points for access to premium materials, special collections, audiobooks, or other library perks

The evangelist (library manager) can:
- Approve/reject borrow requests with overdue notifications
- Track all active borrowings, returns, and overdue books from a dashboard
- See which books are popular vs. underutilized
- Manage the book catalog (add, edit, remove books)
- Configure loan periods (default 14 days), maximum books per member, and penalty rules
- Issue books directly when physically present (no request step needed)

Additional capabilities:
- Youth leaders and Sabbath School teachers can reserve books for upcoming programs
- Church membership verification required before borrowing
- Fully automatic SMS penalty escalation system
- Offline support via PWA for members with limited connectivity

### Key Differentiators

- **Purpose-built for SDA church communities** — designed around how church members, teachers, evangelists, and youth leaders actually use a church library
- **Trust-based borrowing progression** — new members limited to one book; earn XP through timely returns to unlock more capacity; borrowing blocked if overdue
- **Gamification as spiritual encouragement** — XP, levels, streaks, weekly quests, referral bonuses, and a points redemption system that unlocks premium library materials
- **Referral-driven growth** — members incentivized to invite fellow church members, growing the library community organically
- **Evangelist dashboard** — real-time visibility into library health with overdue notifications
- **Group reservations** — youth leaders and teachers can reserve materials for programs
- **Mobile-first PWA with offline support** — works even with spotty connectivity
- **Church membership gating** — only verified members can borrow, protecting the collection

---

## Target Users

### Primary Users

#### 1. Church Member (General Borrower)
**Persona: Mary Kaari** — Age 30–45, moderate tech-savvy (WhatsApp, mobile banking)

**Context:** A church mother who wants to grow spiritually and help her family grow. She borrows devotionals, marriage & family books, parenting guides, health message books, and Ellen G. White writings. She borrows any day of the week — sometimes right after Sabbath, sometimes during the week when she has time.

**Current Pain:** Has to physically search shelves, ask the evangelist if a book is available, and hope nobody else took it. No reminders, no tracking — books pile up at home forgotten.

**Success Vision:** Opens the app any day, finds a book in seconds, taps "Request," gets approval from the evangelist, and coordinates pickup. Receives automatic due-date reminders (3 days before, Day 1 overdue, Day 7 escalation). Sees her XP increase and reading streak grow. Refers friends for bonus XP and redeems points for premium materials.

**What keeps her returning:** Simple booking, real-time availability, personalized recommendations, automatic reminders, feeling spiritually encouraged, XP rewards and redemption.

#### 2. Evangelist / Library Manager (Church Admin)
**Persona: Brother Peter Mutuma** — Age 40–60, low-to-moderate tech-savvy

**Context:** Volunteer library manager. Currently spends 1–2 hours every Sabbath plus extra time chasing overdue books. Keeps records in a physical notebook.

**Current Pain:** No way to track who has what. Books go missing. Manual record-keeping is stressful. Spends time chasing members instead of ministry.

**Admin Setup:** System owner creates his account. He configures borrowing duration (default 14 days), maximum books per member, SMS integration, and penalty rules. Uploads book inventory or imports from spreadsheet.

**Daily Usage:** Receives borrow requests any day of the week. Approves/declines from phone. When physically present, can issue books directly without the request step (search member → issue immediately). During the week, checks overdue dashboard — system auto-sends SMS reminders at each escalation level.

**Success Vision:** No more notebook tracking. Automatic overdue reminders go out without his intervention. Members return on time. Can track repeat offenders. Reports ready for board meetings. Inventory losses reduce significantly.

#### 3. Sabbath School Teacher
**Persona: Sister Grace** — Age 28–50, moderate tech-savvy

**Context:** Teaches Sabbath School classes. Borrows early in the week (Sunday–Wednesday) to prepare. Needs lesson commentaries, reference books, study guides, and children's materials.

**Current Pain:** Can't check availability remotely. Sometimes arrives to find needed books already borrowed.

**Success Vision:** Searches by topic from her phone on Sunday, reserves the commentary she needs, coordinates pickup. Sees suggested resources for the current quarter.

#### 4. Youth Leader
**Persona: Daniel** — Age 22–35, high tech-savvy (expects smooth UX)

**Context:** Leads youth programs. Needs leadership books, Christian living for youth, relationship guidance, mental health resources, inspirational biographies. Borrows before youth week, camp meetings, and youth day programs.

**Current Pain:** Difficult to find relevant youth materials. Can't reserve multiple books for a program.

**Success Vision:** Smooth mobile UX for search, group reservations for programs, book recommendations to youth members, notifications for new youth-relevant arrivals.

#### 5. New Member
**Persona: James** — Age 20–40, moderate tech-savvy

**Context:** Recently baptized, in early discipleship phase. Needs basic doctrine books, church fundamentals, Christian living guides, Bible study materials.

**System Rules:**
- Limited to 1 book at a time
- After 3 consecutive on-time returns → auto-upgrade to 3 books
- Streak resets if overdue beyond 7 days

**Success Vision:** Opens app, sees "Recommended for New Members" section, borrows first book with one tap. Earns trust through responsible borrowing. Feels welcomed and supported.

### Secondary Users

#### Super Admin (System Owner)
**Role:** Creates churches, assigns church admins, configures SMS gateway, manages system-level settings, views system-wide analytics. Future expansion to multi-church oversight.

#### Assistant Librarian
**Role:** Supports the evangelist. Can issue/receive books and view inventory. Cannot change system settings or remove members. Reduces evangelist workload during busy periods.

#### Church Board / Pastor
**Role:** Receives periodic reports on library usage, popular books, borrowing trends. Uses data to justify new book purchases. Does not interact with the app daily.

#### Referral Contacts
**Role:** Existing members who refer new members. Earn bonus XP when referrals register and complete their first borrow.

### Role Hierarchy

| Role | Permissions |
|---|---|
| **Super Admin** | Create churches, assign church admins, system settings, SMS config, system-wide analytics |
| **Church Admin (Evangelist)** | Approve borrows, issue/receive books, manage penalties, add/edit books, view reports, manage members |
| **Assistant Librarian** | Issue/receive books, view inventory — no system settings or member removal |
| **Member** | Browse books, request borrow, view due dates, borrowing history, receive notifications |

### Operational Rules

#### Borrowing Policy
- **Default loan period:** 14 days (configurable by evangelist)
- **Maximum books:** 3 for established members, 1 for new members
- **New member upgrade:** Auto-upgrade to 3 books after 3 consecutive on-time returns
- **Streak reset:** Overdue beyond 7 days resets the consecutive return count
- **Overdue block:** Cannot borrow new books while any book is overdue

#### Penalty Escalation (Fully Automatic SMS)
| Trigger | Action |
|---|---|
| 3 days before due | Friendly reminder SMS |
| Day 1 overdue | Gentle reminder SMS |
| Day 7 overdue | Warning SMS + borrowing privileges suspended |
| Day 14 overdue | Marked "High Risk" + evangelist alert + return or replace required |

**Design Principle:** No public shaming. Board-level discussion only for repeated offenders or lost books. Restrict privileges and require replacement — keep escalation internal and respectful.

#### Borrowing Flows
**Flow A — Remote Request (Any Day):**
1. Member browses and taps "Request"
2. Evangelist receives notification and approves
3. Member coordinates pickup (church office or agreed location)
4. Evangelist hands physical book and marks as "Issued"

**Flow B — Immediate Issue (Physically Present):**
1. Member comes to library in person
2. Evangelist searches member in system
3. Issues book directly — no request step needed
4. System records issue date and due date

#### Multi-Church Strategy
- **Phase 1 (Launch):** Single church — build, validate, refine
- **Phase 2 (Expansion):** Multi-church with isolated data per church, unique church ID during registration, district-level oversight

### User Journey

#### Mary's Journey (Member)
- **Discovery:** Church announcement → QR code → WhatsApp group message
- **Onboarding:** Opens PWA → registers with phone → OTP → selects church → evangelist verifies (or auto-verify from member list)
- **First Borrow:** Browses → "Request" → evangelist approves → coordinates pickup → book handed over → system records dates
- **Success Moment:** Found book instantly, got fast approval, received automatic reminders, saw XP increase
- **Long-term:** Weekly habit, reading streak, refers friends, redeems XP for premium materials

#### Brother Peter's Journey (Evangelist)
- **Onboarding:** Account created by system owner → tutorial → configures loan period, max books, SMS, penalties → uploads inventory
- **Daily Flow:** Receives requests → approves on phone → hands books (or issues directly when present) → system handles reminders
- **Weekly Flow:** Checks overdue dashboard → reviews trends → adds new books
- **Success Moment:** No notebook, auto-reminders, members return on time, board reports ready, losses drop

**Key Design Principle:** The app does not replace the physical library. It removes confusion, manual tracking, and the need to chase people.

---

## Success Metrics

### User Success Metrics

| Metric | Target (3 months) | Target (6 months) |
|---|---|---|
| Digital transaction rate (% borrows via app vs manual) | 80% | 95% |
| Evangelist notebook elimination | Fully stopped within 1 month | N/A |
| New member registration (% within 4 weeks of joining church) | 60% | 75% |
| On-time return rate (returned before due date) | 50% | 65% |
| Repeat borrowing rate (borrow again within 60 days) | 40% | 55% |
| Average request-to-approval time | < 4 hours | < 2 hours |
| Members checking due dates in-app | 50% | 70% |

### Library Health Metrics

| Metric | Target (3 months) | Target (6 months) |
|---|---|---|
| Lost books per quarter | Under 3 | Under 2 |
| Overdue rate (% of borrows past due date) | Under 15% | Under 10% |
| Books returned within 7 days of due date | 85% | 90% |
| Inventory accuracy (system matches physical count) | 90% | 97% |
| Average overdue duration | Under 10 days | Under 5 days |
| Admin time reduction for evangelist | 40% reduction | 60% reduction |
| Borrowing volume increase (vs pre-app baseline) | +15% | +25% |

### Growth & Adoption KPIs

| Metric | Target (3 months) | Target (6 months) |
|---|---|---|
| Member registration rate (% of total church members) | 30% (minimum) / 50% (strong) | 50% (minimum) / 65% (exceptional) |
| Active borrowers per week (per 100 members) | 10–20 | 15–25 |
| Referral-driven registrations | 10% of new signups | 20% of new signups |
| Multiple user types active (member, teacher, youth leader) | 3 of 4 types active | All 4 types active |
| Monthly active user consistency | 60% month-over-month retention | 70% retention |

### Engagement & Gamification KPIs

| Metric | Target (3 months) | Target (6 months) |
|---|---|---|
| Streak participation (% maintaining on-time return streaks) | 25% | 40% |
| New member engagement (% borrowing within 60 days of joining) | 50% | 65% |
| XP redemption rate (% of eligible members redeeming) | 15% | 30% |
| Weekly quest completion rate | 20% | 35% |

### Business Objectives

**3-Month Objectives:**
- App fully replaces manual borrowing for the pilot church
- Evangelist operates entirely through the dashboard — no physical notebook
- Overdue rate drops below 15% via automatic SMS escalation
- Church board receives first data-driven library report

**6-Month Objectives:**
- 50%+ of church members registered and active
- Lost books under 2 per quarter
- Borrowing volume up 25% vs pre-app baseline
- At least 1 other church requests the system (multi-church validation)
- Board makes at least 1 data-based decision per quarter (e.g., new book purchases based on popularity data)

### Key Performance Indicators Summary

**Leading Indicators (predict future success):**
- Registration rate trending upward weekly
- Repeat borrowing rate above 40%
- Referral registrations growing month-over-month
- Streak participation increasing

**Lagging Indicators (confirm success achieved):**
- Lost books per quarter under target
- Overdue rate under target
- Admin time reduction confirmed
- Board engagement with reports

---

## MVP Scope

### Core Features (MVP — Phase 1)

**Authentication & Membership:**
- Member registration with phone number + OTP verification
- Church membership verification (evangelist approves or auto-verify from pre-uploaded member list)
- 4 role levels: Super Admin, Church Admin (Evangelist), Assistant Librarian, Member
- Role-based access control and route protection

**Book Catalog:**
- Browse, search, and filter books by category
- Real-time availability display
- Book details (title, author, description, category, ISBN, copies)
- Book inventory management (add, edit, remove books)

**Borrowing System:**
- Flow A: Remote request → evangelist approval → coordinate pickup → mark issued
- Flow B: Direct issue when member is physically present
- Per-book loan deadlines (default 14 days, configurable by evangelist)
- Due date auto-calculation on issue
- Maximum 3 books for established members, 1 for new members
- Overdue block — cannot borrow while any book is overdue
- New member auto-upgrade to 3 books after 3 consecutive on-time returns
- Streak reset if overdue beyond 7 days

**SMS Escalation System (Fully Automatic):**
- 3 days before due: friendly reminder
- Day 1 overdue: gentle reminder
- Day 7 overdue: warning + borrowing privileges suspended
- Day 14 overdue: "High Risk" flag + evangelist alert + return or replace required

**Evangelist Dashboard:**
- Approve/decline borrow requests
- View all active borrowings, returns, and overdue books
- Track which books are popular vs. underutilized
- Member management (verify, view history, see repeat offenders)
- Basic reports for church board (borrowing summary, overdue summary, inventory status)

**Basic XP System:**
- Earn XP on borrow request (+10)
- Earn XP on book issued (+25)
- Earn XP on on-time return (+40)
- Display points and current level on member profile

**PWA:**
- Installable progressive web app
- Offline browsing of catalog (cached)
- Service worker for static asset caching

### Out of Scope for MVP

**Deferred to Phase 1.5 (Post-Launch Enhancement):**
- Reading levels / level progression (Rookie Reader → Library Legend)
- Weekly quests and streaks
- Referral program with bonus XP
- XP redemption for premium materials
- Book recommendations / "New This Week" section
- "Recommended for New Members" section
- Group reservations for youth leaders / teachers
- Book import from spreadsheet
- Advanced gamification mechanics

**Deferred to Phase 2 (Multi-Church):**
- Multi-church support with isolated data per church
- Unique church ID during registration
- District-level oversight and analytics
- Standardized borrowing policy templates across churches
- Conference-level visibility into engagement metrics

**Deferred to Phase 3 (Scale):**
- Per-category configurable loan periods
- Audiobook access via XP redemption
- Push notifications (in addition to SMS)
- Advanced analytics and trend reporting
- Offline sync queue for poor connectivity areas
- Partnership integrations with Adventist publishing houses

### MVP Success Criteria

**Go/No-Go Gates (must be met to proceed beyond MVP):**
- 80% of borrowing transactions done through the app within 3 months
- Evangelist fully stops using physical notebook within 1 month
- Overdue rate drops below 15% within 3 months
- At least 30% of church members registered within 3 months
- Church board receives and engages with at least 1 data-driven report
- Lost books under 3 per quarter

**Signals to Scale:**
- Multiple user types actively using the system (members, teachers, youth leaders)
- At least 1 other church inquires about the system
- Evangelist reports significant admin time reduction
- Repeat borrowing rate above 40%

### Future Vision

**Year 1:** Fully adopted in pilot church. Overdue rates under 10%. Lost books near zero. Board actively using reports. Stable multi-church architecture ready.

**Year 2:** Rolled out to multiple SDA churches within the district. Conference-level visibility into library engagement metrics. Standardized borrowing policy template across churches.

**Year 3:** Adopted across conference-level churches. Recognized as the default SDA church library management system. Data used to identify reading trends and resource gaps. Potential partnership with Adventist publishing houses.

**Ultimate Vision:** A scalable, standardized digital accountability system for church libraries across Kenya, possibly expanding regionally across East Africa.
