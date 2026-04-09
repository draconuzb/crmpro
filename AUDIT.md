# CRM Pro — Comprehensive System Audit

> **Date:** 2026-04-08
> **Scope:** Full-stack audit of /Users/asad/Projects/crmpro/

---

## CRITICAL (Fix Immediately)

### C-01: Production Credentials Committed to Repo
- **FILE:** `.env.production.bak`
- **ISSUE:** Contains real production database password (`CRMpr0_s3cur3_2026x`), JWT secrets, Redis password. File is NOT in `.gitignore`.
- **IMPACT:** Anyone with repo access has full production database and auth access.
- **FIX:** Delete file, add `*.bak` to `.gitignore`, rotate ALL production credentials immediately. Run `git filter-branch` or `bfg` to purge from git history.

### C-02: Multi-Tenant Data Breach — Lead.findOne() No Branch Check
- **FILE:** `apps/api/src/modules/lead/lead.service.ts:173-184`
- **ISSUE:** `findOne(id)` uses `findUnique({ where: { id } })` without branchId filter. Any authenticated user can access/convert leads from any branch by guessing IDs.
- **IMPACT:** Cross-branch data access. Manager of Branch A can view/modify leads in Branch B.
- **FIX:** Add `where: { id, branchId }` to all single-record queries.

### C-03: Multi-Tenant Data Breach — Write-off Without Branch Validation
- **FILE:** `apps/api/src/modules/finance/lesson-payment.service.ts:135-158`
- **ISSUE:** `writeOff()` doesn't verify the lesson payment belongs to the user's branch.
- **IMPACT:** Manager can write off lesson payments from other branches.
- **FIX:** Add branchId check before write-off.

### C-04: WebSocket CORS Wildcard
- **FILE:** `apps/api/src/modules/notification/notification.gateway.ts:14-16`
- **ISSUE:** CORS configured with `origin: '*'`. Any domain can connect to WebSocket.
- **IMPACT:** Cross-origin WebSocket hijacking. Users can subscribe to notifications for branches they don't have access to (line 33-41: `join` endpoint allows any branchId).
- **FIX:** Restrict CORS to application domains. Validate branchId in `join` against user's assigned branches.

### C-05: Lead Conversion Not Wrapped in Transaction
- **FILE:** `apps/api/src/modules/lead/lead.service.ts:240-296`
- **ISSUE:** `convert()` creates User, Student, GroupStudent, and updates Lead status in sequence WITHOUT `$transaction`. If step 2 fails after step 1, orphaned User record remains.
- **IMPACT:** Data inconsistency, orphaned records, broken lead state.
- **FIX:** Wrap entire conversion in `this.prisma.$transaction()`.

### C-06: API Keys Exposed in Settings Response
- **FILE:** `apps/api/src/modules/settings/settings.service.ts:39-74`
- **ISSUE:** SMS/VoIP `apiKey` fields returned in API responses without masking.
- **IMPACT:** Any CEO/ADMIN user can read back stored third-party API keys via browser DevTools.
- **FIX:** Return only `{ isActive, provider }` in read endpoints, never the raw key.

---

## HIGH (Fix Before Production)

### H-01: Hard-coded 30% Salary Calculation Ignoring Config
- **FILE:** `apps/api/src/modules/finance/finance.service.ts:690-692`
- **ISSUE:** Salary calculation uses hard-coded `* 0.3` (30%) instead of reading `teacher.salaryType` and `teacher.salaryAmount` from database. The schema supports "fixed" and "percentage" types but this code ignores them.
- **IMPACT:** All teachers paid 30% regardless of their configured rate. Teachers with "fixed" salary type get wrong amounts.
- **FIX:** Use `teacher.salaryType` and `teacher.salaryAmount` like `lesson-payment.service.ts` does correctly.

### H-02: Lesson Count Date Iteration Bug
- **FILE:** `apps/api/src/modules/finance/lesson-payment.service.ts:55-63`
- **ISSUE:** Date loop `for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1))` mutates `d` in place. Time components can cause the `<=` comparison to fail on the last day.
- **IMPACT:** Incorrect lesson count per month, leading to wrong per-lesson cost calculation.
- **FIX:** Create fresh Date objects for comparison, or use date-fns for iteration.

### H-03: Sequential Salary Upserts Without Transaction
- **FILE:** `apps/api/src/modules/finance/finance.service.ts:414-434`
- **ISSUE:** Multiple `upsert` operations in a loop without transaction wrapper. If process crashes mid-loop, some teachers updated but not others.
- **IMPACT:** Partial salary data, inconsistent state.
- **FIX:** Wrap in `$transaction`.

### H-04: Missing RolesGuard on 9 Controllers
- **FILES:**
  - `apps/api/src/modules/course/course.controller.ts:24`
  - `apps/api/src/modules/group/group.controller.ts:26`
  - `apps/api/src/modules/room/room.controller.ts:23`
  - `apps/api/src/modules/tag/tag.controller.ts:23`
  - `apps/api/src/modules/holiday/holiday.controller.ts:22`
  - `apps/api/src/modules/blog/blog.controller.ts:22`
  - `apps/api/src/modules/exam/exam.controller.ts:22`
  - `apps/api/src/modules/form/form.controller.ts:22`
  - `apps/api/src/modules/schedule/schedule.controller.ts:8`
- **ISSUE:** Only `JwtAuthGuard` applied, no `RolesGuard`. Any authenticated user (including STUDENT, TEACHER) can create/update/delete courses, groups, rooms, tags, holidays, blogs, exams, forms.
- **IMPACT:** TEACHER role can delete courses. STUDENT role can modify groups.
- **FIX:** Add `@UseGuards(RolesGuard)` and `@Roles('CEO', 'ADMIN')` to write operations.

### H-05: Missing @CurrentBranch() in Multiple Modules
- **FILES:**
  - `apps/api/src/modules/exam/exam.controller.ts:26-38` — No branchId check on exam queries
  - `apps/api/src/modules/grade/grade.controller.ts:35-52` — No branchId on grade setting
  - `apps/api/src/modules/report/report.service.ts:207-220` — `getLogs()` returns ALL logs across ALL branches
- **IMPACT:** Cross-branch data access on exams, grades, and audit logs.
- **FIX:** Add branchId filtering to all queries.

### H-06: Dynamic sortBy Injection (5 Services)
- **FILES:**
  - `apps/api/src/modules/finance/finance.service.ts:66`
  - `apps/api/src/modules/user/user.service.ts:31`
  - `apps/api/src/modules/teacher/teacher.service.ts:38`
  - `apps/api/src/modules/student/student.service.ts:74`
  - `apps/api/src/modules/group/group.service.ts:58`
- **ISSUE:** `{ [sortBy]: sortOrder }` takes `sortBy` directly from user input. While Prisma prevents SQL injection, it can cause Prisma errors or expose field names.
- **FIX:** Whitelist allowed sortBy values: `const allowed = ['date', 'name', 'createdAt']; if (!allowed.includes(sortBy)) sortBy = 'createdAt';`

### H-07: N+1 Query — Teacher Salary Calculation
- **FILE:** `apps/api/src/modules/teacher/teacher.service.ts:167-224`
- **ISSUE:** `getSalary()` loops through groups, making individual `prisma.attendance.findMany()` and `prisma.salary.findUnique()` calls per group. With 10 groups = 20+ queries.
- **FIX:** Batch fetch all attendance and salary records in single queries.

### H-08: N+1 Query — Analytics Seasonality (36 Queries)
- **FILE:** `apps/api/src/modules/analytics/analytics.service.ts:379-401`
- **ISSUE:** For each of 12 months, runs 3 separate queries (payments, expenses, leads) = 36 total.
- **FIX:** Single aggregation query with `groupBy` month.

### H-09: N+1 Query — CEO Branch Breakdown (6N Queries)
- **FILE:** `apps/api/src/modules/analytics/analytics.service.ts:145-161`
- **ISSUE:** For multi-branch CEO dashboard, each branch triggers 6 queries. 10 branches = 60 parallel queries.
- **FIX:** Batch into aggregation queries with `groupBy` branchId.

### H-10: N+1 Query — Lead Analytics Loads All Leads Into Memory
- **FILE:** `apps/api/src/modules/lead/lead.service.ts:302-406`
- **ISSUE:** `getAnalytics()` loads ALL leads with `findMany()`, then filters in memory. With 10,000 leads = all loaded to RAM.
- **FIX:** Use database-level `where` clauses and `groupBy`.

### H-11: Missing Cascade Deletes — 40+ Relations
- **FILE:** `apps/api/prisma/schema.prisma`
- **ISSUE:** Most foreign key relations lack `onDelete: Cascade`. Deleting a Branch, Course, Teacher, or Student will either fail with FK constraint errors or leave orphaned records in 40+ tables.
- **KEY MODELS AFFECTED:** Payment, Withdrawal, Expense, Salary, Attendance, Rating, SmsRecord, CallRecord, Order, Reminder, all CRMPro models.
- **FIX:** Add appropriate `onDelete` behavior (Cascade, SetNull, or Restrict) to every relation.

### H-12: Missing Database Indexes — 35+ Foreign Keys
- **FILE:** `apps/api/prisma/schema.prisma`
- **ISSUE:** Most foreign key fields lack `@@index`. These columns are frequently used in WHERE clauses and JOINs.
- **KEY FIELDS:** Student.branchId, Course.branchId, Room.branchId, Group.branchId/courseId/teacherId/roomId, Lead.branchId/courseId, all CRMPro model branchIds.
- **IMPACT:** Full table scans on every query that filters by these fields. Will degrade severely at scale.
- **FIX:** Add `@@index([fieldName])` for every foreign key field.

### H-13: Missing Pagination on 7 List Endpoints
- **FILES:**
  - `apps/api/src/modules/branch/branch.controller.ts:30`
  - `apps/api/src/modules/course/course.controller.ts:30`
  - `apps/api/src/modules/room/room.controller.ts:29`
  - `apps/api/src/modules/tag/tag.controller.ts:29`
  - `apps/api/src/modules/holiday/holiday.controller.ts:27`
  - `apps/api/src/modules/schedule/schedule.controller.ts:14`
  - `apps/api/src/modules/report/report.service.ts:207` (getLogs)
- **ISSUE:** Returns ALL records without `skip`/`take`. Will cause memory issues at scale.
- **FIX:** Add pagination with sensible defaults (page=1, limit=50).

### H-14: Group Archival Doesn't Update Enrollments
- **FILE:** `apps/api/src/modules/group/group.service.ts:200`
- **ISSUE:** When group status set to ARCHIVED/COMPLETED, enrolled students remain with status='ACTIVE'. No cascade handling.
- **IMPACT:** Reports show active students in archived groups. Student profiles show them enrolled in non-existent groups.
- **FIX:** When archiving group, set all GroupStudent statuses to 'COMPLETED' or 'LEFT'.

---

## MEDIUM

### M-01: Frontend Null/Undefined Crashes
- **FILES:**
  - `apps/web/src/pages/analytics/CeoDashboardPage.tsx:265` — `dash.rooms.list` without optional chaining. Crashes if `dash.rooms` is undefined.
  - `apps/web/src/pages/analytics/CeoDashboardPage.tsx:325` — `Math.max(...)` on potentially undefined array.
- **FIX:** Add optional chaining: `dash?.rooms?.list || []`

### M-02: Inconsistent API Response Structure
- **FILES:** `apps/web/src/pages/settings/BranchesPage.tsx:55`, `GroupListPage.tsx:76`, `StudentListPage.tsx:79`, `PaymentsPage.tsx:95`, multiple others.
- **ISSUE:** Pages use `r.data?.data || r.data || []` double-fallback pattern because API responses are inconsistently wrapped.
- **FIX:** Standardize all API responses to `{ data: T, meta?: {...} }`.

### M-03: Custom State Management Instead of React Query
- **FILES:** `apps/web/src/pages/finance/PaymentsPage.tsx`, `WithdrawPage.tsx`, `DebtorsPage.tsx`, `ExpensesPage.tsx`
- **ISSUE:** Uses `useState` + `useCallback` + `setLoading()` instead of React Query's built-in state management. Causes `eslint-disable-line react-hooks/exhaustive-deps` hacks.
- **FIX:** Refactor to use `useQuery` with proper query params.

### M-04: Missing Error States on Query Pages
- **FILES:** `CeoDashboardPage.tsx`, `TahlilPage.tsx`, `StudentDashboard.tsx`, `StudentBalance.tsx`, `TeacherDashboard.tsx`, and multiple portal pages.
- **ISSUE:** Queries silently fail — no error UI shown. User sees infinite spinner.
- **FIX:** Add error handling: `if (error) return <ErrorComponent />`

### M-05: Docker Compose Password Mismatch
- **FILE:** `docker-compose.yml:7` vs `.env.local:10`
- **ISSUE:** Docker uses `crmpro_secret`, `.env.local` uses `crmpro_local`. Development database connection will fail depending on which config is used.
- **FIX:** Align passwords or use env variable reference in docker-compose.

### M-06: Shared Types Don't Match Schema
- **FILES:**
  - `packages/shared/src/types/auth.ts:30` — `botSections` typed as `string[]`, schema stores as `Json?`
  - `packages/shared/src/types/student.ts:31` — Gender typed as `'MALE' | 'FEMALE'`, schema uses `String?`, seed uses lowercase
- **FIX:** Align types with Prisma schema.

### M-07: Missing Type Definitions for New Models
- **FILE:** `packages/shared/src/types/`
- **ISSUE:** No type definitions for: LessonPayment, KpiTarget, KpiAssignment, HrStaff, HrGoal, DailyReport, Problem, EmptyRoom, AiInsight, CronJob, CrmSyncState.
- **FIX:** Add shared types for all new CRMPro models.

### M-08: Mixed Translation Languages
- **FILES:** Multiple pages across `apps/web/src/pages/`
- **ISSUE:** Some pages use `useTranslation()` hook, others hardcode Uzbek strings, some have English. No consistency.
- **EXAMPLE:** `RemindersPage.tsx` has hardcoded English "No reminders", `StudentDashboard.tsx` has hardcoded Uzbek.
- **FIX:** Audit all pages and move all strings to i18n translation files.

### M-09: Student Enrollment Silent Zero-Price
- **FILE:** `apps/api/src/modules/student/student.service.ts:217`
- **ISSUE:** `const price = dto.price ?? Number(group?.course?.price ?? 0);` — If group is null (not found), student enrolled at price 0 silently. No error thrown.
- **FIX:** Throw `NotFoundException` if group not found before enrollment.

### M-10: Scheduler Module is Config-Only
- **FILE:** `apps/api/src/modules/scheduler/scheduler.service.ts`
- **ISSUE:** Service only manages CRUD for cron job configuration. Does NOT execute any jobs. No `@nestjs/bull`, no worker integration.
- **IMPACT:** Configured cron jobs never run from the API. Only the bot app executes cron.
- **FIX:** Either integrate a job executor or document this as bot-only feature.

### M-11: Missing Error Handling on Delete Operations
- **FILES:**
  - `apps/api/src/modules/exam/exam.service.ts:83` — No existence check before delete
  - `apps/api/src/modules/form/form.service.ts:44` — No existence check before delete
- **FIX:** Check if record exists before deleting, throw NotFoundException.

### M-12: VoIP Webhook Missing Auth
- **FILE:** `apps/api/src/modules/voip/voip.controller.ts:50`
- **ISSUE:** `WEBHOOK_SECRET` env variable not in `.env` or `.env.example`. Webhook endpoint has weak authentication.
- **FIX:** Add WEBHOOK_SECRET to env files, validate properly.

### M-13: SMS Service Silent Failures
- **FILE:** `apps/api/src/modules/sms/sms.service.ts:8-35`
- **ISSUE:** `student?.user?.phone` silently accepts null/undefined. Could attempt to send SMS with empty phone number.
- **FIX:** Validate phone exists before sending.

### M-14: Content Security Policy Disabled
- **FILE:** `apps/api/src/main.ts:13`
- **ISSUE:** `contentSecurityPolicy: false` — disables important security header.
- **FIX:** Configure proper CSP rules instead of disabling entirely.

### M-15: Branch Scope Interceptor NaN Handling
- **FILE:** `apps/api/src/common/interceptors/branch-scope.interceptor.ts:25`
- **ISSUE:** `parseInt(branchIdHeader, 10)` can return NaN. NaN is not validated, could bypass branch checks.
- **FIX:** Add `if (isNaN(branchId)) throw new BadRequestException('Invalid branch ID');`

### M-16: Payment.createdById Missing Relation
- **FILE:** `apps/api/prisma/schema.prisma:405`
- **ISSUE:** `createdById Int?` has no `@relation` to User. Orphaned reference, no referential integrity.
- **FIX:** Add proper relation or at minimum add a comment explaining why it's intentionally loose.

---

## LOW

### L-01: Seed File Logs Credentials
- **FILE:** `apps/api/prisma/seed.ts:126,492`
- **ISSUE:** Logs default password `admin123` and phone number to console during seed.
- **FIX:** Remove credential logging.

### L-02: Unused `history` Variable
- **FILE:** `apps/web/src/pages/groups/GroupDetailPage.tsx:131`
- **ISSUE:** `history = []` assigned but never used.
- **FIX:** Remove.

### L-03: Axios Interceptor Uses Raw Axios
- **FILE:** `apps/web/src/lib/axios.ts:82`
- **ISSUE:** Token refresh uses `axios.post(...)` instead of `api.post(...)`. If baseURL changes dynamically, this breaks.
- **FIX:** Use `api` instance.

### L-04: Non-null Assertion in Token Queue
- **FILE:** `apps/web/src/lib/axios.ts:37`
- **ISSUE:** `promise.resolve(token!)` — non-null assertion. If token is null after refresh, crashes queued requests.
- **FIX:** Add null check before resolving.

### L-05: Direct API Calls Outside Feature Layer
- **FILE:** `apps/web/src/pages/student-portal/StudentProfilePage.tsx:588`
- **ISSUE:** Uses `api.get(...)` directly in `queryFn` instead of using feature API function. Inconsistent with codebase pattern.
- **FIX:** Move to `features/me/api.ts`.

---

## Summary Table

| Severity | Count | Categories |
|----------|-------|------------|
| **CRITICAL** | 6 | Secrets exposure (1), Multi-tenant breach (2), WebSocket security (1), Missing transaction (1), API key leak (1) |
| **HIGH** | 14 | Business logic bugs (3), Authorization gaps (3), Performance N+1 (4), Schema integrity (2), Missing pagination (1), Data cascade (1) |
| **MEDIUM** | 16 | Frontend crashes (1), API consistency (1), State management (1), Error handling (4), Docker config (1), Type safety (2), i18n (1), Security headers (2), Branch validation (1), Scheduler (1), Missing relations (1) |
| **LOW** | 5 | Logging (1), Dead code (1), Axios edge cases (2), Pattern inconsistency (1) |
| **TOTAL** | **41** | |

---

## Priority Action Plan

### Phase 1 — Immediate (Day 1):
1. Delete `.env.production.bak` and rotate all production credentials
2. Fix multi-tenant breaches (C-02, C-03)
3. Fix WebSocket CORS and branch validation (C-04)

### Phase 2 — Before Any New Feature Work (Week 1):
4. Add RolesGuard to 9 unprotected controllers (H-04)
5. Add branchId checks to exams, grades, logs (H-05)
6. Wrap lead conversion in transaction (C-05)
7. Fix salary calculation to use teacher config (H-01)
8. Fix lesson count date bug (H-02)
9. Mask API keys in settings responses (C-06)

### Phase 3 — Before Production Scale (Week 2-3):
10. Add missing database indexes (H-12)
11. Add cascade deletes (H-11)
12. Fix N+1 queries (H-07, H-08, H-09, H-10)
13. Add pagination to all list endpoints (H-13)
14. Standardize API response format (M-02)
15. Fix frontend null crashes (M-01)

### Phase 4 — Polish (Ongoing):
16. Refactor finance pages to React Query (M-03)
17. Add error states to all pages (M-04)
18. Standardize i18n (M-08)
19. Add shared types for new models (M-07)
20. Fix remaining medium/low issues
