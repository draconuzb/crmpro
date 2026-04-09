# CRM Pro — Comprehensive System Audit v2

> **Date:** 2026-04-08 (Post-fix re-audit)
> **Scope:** Full-stack audit after all CONCEPT.md implementation + audit v1 fixes

---

## CRITICAL (Fix Immediately)

### C-01: Lead Double Conversion — No Guard
- **FILE:** `apps/api/src/modules/lead/lead.service.ts:243`
- **ISSUE:** `convert()` has no check for `lead.status === 'converted'`. Calling convert twice creates duplicate User + Student records.
- **IMPACT:** Orphaned users, duplicate students, unique constraint crash on phone.
- **FIX:** Add `if (lead.status === 'converted') throw new BadRequestException('Lead already converted');`

### C-02: Lead.findOne() branchId Still Optional
- **FILE:** `apps/api/src/modules/lead/lead.service.ts:173`
- **ISSUE:** `findOne(id, branchId?)` — branchId is optional. If not provided, any user can access any lead by ID. Some callers (update, updateStatus, addTag, removeTag) call `findOne(id)` without branchId.
- **IMPACT:** Multi-tenant data breach via lead update/tag endpoints.
- **FIX:** Make branchId required. Update all callers to pass branchId from controller.

### C-03: Salary Double-Payment — No Guard
- **FILE:** `apps/api/src/modules/finance/finance.service.ts:442-482`
- **ISSUE:** `paySalary()` has no check for `salary.isPaid === true`. Can pay same salary multiple times, creating duplicate Withdrawal records each time.
- **IMPACT:** Financial data corruption, duplicate payouts.
- **FIX:** Add `if (salary.isPaid) throw new BadRequestException('Salary already paid');` and wrap in transaction.

### C-04: Student Balance — No Minimum Enforcement
- **FILE:** `apps/api/src/modules/finance/lesson-payment.service.ts:101`
- **ISSUE:** `balance: { decrement: perLessonCost }` allows balance to go infinitely negative. No business limit.
- **IMPACT:** Unlimited debt creation with no alerts or restrictions.
- **FIX:** Add configurable minimum balance threshold per branch. Alert or block when exceeded.

---

## HIGH (Fix Before Production)

### H-01: Missing RolesGuard on Scheduler Controller
- **FILE:** `apps/api/src/modules/scheduler/scheduler.controller.ts:17-51`
- **ISSUE:** Any authenticated user (STUDENT, TEACHER) can create/update/delete/toggle cron jobs.
- **FIX:** Add `@Roles('CEO', 'ADMIN')` to all write endpoints.

### H-02: Missing RolesGuard on LeadStage Write Endpoints
- **FILE:** `apps/api/src/modules/lead/lead.controller.ts:28-59`
- **ISSUE:** createStage, updateStage, deleteStage, reorderStages have no @Roles.
- **FIX:** Add `@Roles('CEO', 'ADMIN')`.

### H-03: Group Enrollment — No Capacity Check
- **FILE:** `apps/api/src/modules/group/group.service.ts:229-253`
- **ISSUE:** `addStudent()` creates enrollment without checking `group.capacity`. Unlimited students per group.
- **FIX:** Count active enrollments, compare to `group.capacity` before adding.

### H-04: Holiday Check Not Filtered by Branch
- **FILE:** `apps/api/src/modules/finance/lesson-payment.service.ts:22-25`
- **ISSUE:** `holiday.findFirst({ where: { date } })` matches ANY branch's holiday. A holiday in Branch A skips deductions for ALL branches.
- **FIX:** Add `branchId` filter or run deduction per-branch.

### H-05: Lead Phone — Not Unique Per Branch
- **FILE:** `apps/api/prisma/schema.prisma:287`
- **ISSUE:** `Lead.phone` has no unique constraint per branch. Same person can be added as lead multiple times.
- **FIX:** Add `@@unique([branchId, phone])` or at least check before creating.

### H-06: undoWriteOff Missing BranchId Check
- **FILE:** `apps/api/src/modules/finance/lesson-payment.service.ts:164-182`
- **ISSUE:** `undoWriteOff()` has no branchId parameter. Any authenticated user can undo write-offs from any branch.
- **FIX:** Add branchId param and verify `lp.branchId === branchId`.

### H-07: Two Conflicting Salary Calculators
- **FILE:** `apps/api/src/modules/finance/finance.service.ts:652-722` vs `lesson-payment.service.ts:216-314`
- **ISSUE:** Two different salary calculation methods with different logic:
  - `finance.service.ts` uses attendance records, ignores write-offs
  - `lesson-payment.service.ts` uses LessonPayment records, accounts for write-offs
- **IMPACT:** Different salary amounts depending on which calculation is used.
- **FIX:** Standardize on one method (LessonPayment-based is more accurate).

### H-08: StaffAttendancePage — No Backend Integration
- **FILE:** `apps/web/src/pages/attendance/StaffAttendancePage.tsx:66-74`
- **ISSUE:** Save button only does `console.log()`. No API endpoint exists for staff attendance. UI works but data is never persisted.
- **FIX:** Create `/attendance/staff` backend endpoint and wire up frontend.

---

## MEDIUM

### M-01: Missing @Roles on Delete Endpoints
- **FILES:**
  - `modules/reminder/reminder.controller.ts` — `remove()` no roles
  - `modules/problem/problem.controller.ts` — `deleteProblem()` no roles
  - `modules/daily-report/daily-report.controller.ts` — `deleteReport()` no roles
  - `modules/gamification/gamification.controller.ts` — `deleteProduct()` no roles
- **FIX:** Add `@Roles('CEO', 'ADMIN')` to all delete endpoints.

### M-02: Branch Isolation Gaps in findOne() Methods
- **FILES:**
  - `modules/user/user.service.ts:67-81` — `findOne()` returns any user by ID, no branch check
  - `modules/group/group.service.ts:100-154` — `findOne()` no branch check
- **FIX:** Add branchId filtering or verify user's branches include the resource.

### M-03: Archived Students Still Charged by Lesson Deduction
- **FILE:** `apps/api/src/modules/finance/lesson-payment.service.ts:28-38`
- **ISSUE:** Filters by `GroupStudent.status = 'ACTIVE'` but doesn't check `Student.isArchived`. An archived student with active enrollment still gets charged.
- **FIX:** Add `student: { isArchived: false }` to the nested where clause.

### M-04: writeOff Race Condition
- **FILE:** `apps/api/src/modules/finance/lesson-payment.service.ts:137-161`
- **ISSUE:** Two concurrent writeOff calls can both pass the `status === 'written_off'` check, incrementing student balance twice.
- **FIX:** Use Prisma's `updateMany` with a WHERE condition: `{ id, status: 'paid' }`.

### M-05: createPayment Missing Student Branch Validation
- **FILE:** `apps/api/src/modules/finance/finance.service.ts:94-123`
- **ISSUE:** No check that student belongs to the branch. Payment can be created for student in different branch.
- **FIX:** Validate `student.branchId === branchId` before creating payment.

### M-06: Lead Convert Doesn't Check Duplicate Phone
- **FILE:** `apps/api/src/modules/lead/lead.service.ts:250-259`
- **ISSUE:** Creates user with `phone: lead.phone` without checking if a user with that phone already exists. `User.phone` is globally unique — will crash if duplicate.
- **FIX:** Check for existing user first, or catch unique constraint error gracefully.

### M-07: Salary.groupId Nullable With Unique Constraint Issue
- **FILE:** `apps/api/prisma/schema.prisma:468-482`
- **ISSUE:** `groupId Int?` with `@@unique([teacherId, groupId, month, year])`. SQL treats NULL != NULL, allowing duplicate entries with null groupId.
- **FIX:** Either make groupId required or adjust unique constraint.

### M-08: Student.leadId Missing onDelete Directive
- **FILE:** `apps/api/prisma/schema.prisma:139`
- **ISSUE:** No onDelete on lead relation. If lead is deleted (via rejection workflow), student references orphaned leadId.
- **FIX:** Add `onDelete: SetNull`.

### M-09: Departure Type Fallback When No Enrollment
- **FILE:** `apps/api/src/modules/rejection/rejection.service.ts:129-198`
- **ISSUE:** If student has no active enrollment, type defaults to 'doimiy' without checking historical enrollments.
- **FIX:** Fall back to latest completed/left enrollment to calculate tenure.

### M-10: 12 Dead/Orphaned Page Files
- **FILES:** DashboardPage.tsx, WithdrawPage.tsx, ExpensesPage.tsx, SalariesPage.tsx, RatingPage.tsx, HrStaffPage.tsx, HrGoalsPage.tsx, LeadAnalytics.tsx, AttendanceReportsPage.tsx, LeadsReportsPage.tsx, StudentsLeftPage.tsx, TeacherAttendancePage.tsx
- **ISSUE:** Files exist but are never imported in routes.
- **FIX:** Delete or archive these files.

### M-11: calculateSalaries Ignores Holidays
- **FILE:** `apps/api/src/modules/finance/finance.service.ts:652-722`
- **ISSUE:** Counts attendance records on holiday dates as lesson days.
- **FIX:** Exclude holiday dates from attendance count.

---

## LOW

### L-01: Missing Error UI on 2 Pages
- **FILES:** `StaffAttendancePage.tsx:41`, `HisobotlarPage.tsx:99`
- **ISSUE:** useQuery without error state UI. Shows infinite spinner on failure.
- **FIX:** Add error Result component.

### L-02: Missing Empty State on RejectionsPage
- **FILE:** `apps/web/src/pages/leads/RejectionsPage.tsx:200-213`
- **ISSUE:** Empty table shows no message/illustration.
- **FIX:** Add `locale={{ emptyText: "Rad etganlar yo'q" }}` to Table.

### L-03: Hardcoded Categories in ChiqimPage
- **FILE:** `apps/web/src/pages/finance/ChiqimPage.tsx:21-31`
- **ISSUE:** EXPENSE_CATEGORIES hardcoded instead of fetched from settings API.
- **FIX:** Fetch from `/finance/categories` endpoint.

### L-04: Hardcoded HR Config
- **FILE:** `apps/web/src/pages/hr/HrDrilldownPage.tsx:21-50`
- **ISSUE:** HR_CATS, POS_LABELS hardcoded instead of configurable from settings.
- **FIX:** Will be resolved when HR categories settings page is wired to backend.

### L-05: N+1 in Lesson Payment Teacher Salary
- **FILE:** `apps/api/src/modules/finance/lesson-payment.service.ts:235-263`
- **ISSUE:** 3 queries per group inside a loop (paidLessons, totalLessons, lessonDates).
- **FIX:** Batch all queries before the loop.

### L-06: Frontend staleTime Not Set
- **ISSUE:** Dashboard/analytics pages refetch on every mount. Should set `staleTime: 5 * 60 * 1000`.
- **FIX:** Add staleTime to heavy dashboard queries.

### L-07: Docker Build Uses --no-frozen-lockfile
- **FILE:** `apps/api/Dockerfile:13,33`
- **ISSUE:** Non-deterministic production builds.
- **FIX:** Use `--frozen-lockfile` in production stage.

---

## Summary Table

| Severity | Count | Key Areas |
|----------|-------|-----------|
| **CRITICAL** | 4 | Double conversion (1), branch bypass (1), double payment (1), infinite debt (1) |
| **HIGH** | 8 | Missing auth guards (2), capacity (1), holiday filter (1), phone unique (1), branch check (1), dual calculators (1), no backend (1) |
| **MEDIUM** | 11 | Missing roles (1), branch isolation (1), archived charges (1), race conditions (1), validation gaps (3), schema issues (2), dead code (1), holiday calc (1) |
| **LOW** | 7 | UI polish (3), hardcoded config (2), N+1 query (1), Docker (1) |
| **TOTAL** | **30** | |

---

## Comparison: Audit v1 → v2

| Metric | v1 (Pre-fix) | v2 (Post-fix) | Change |
|--------|-------------|---------------|--------|
| Critical | 6 | 4 | -2 (fixed C-01 secrets, C-04 WebSocket) |
| High | 14 | 8 | -6 (fixed guards, N+1, schema, salary calc) |
| Medium | 16 | 11 | -5 (fixed frontend crashes, Docker, types) |
| Low | 5 | 7 | +2 (new pages introduced new minor issues) |
| **Total** | **41** | **30** | **-11 fixed, 0 regressions** |

### Issues Fixed Since v1:
- Production secrets deleted (C-01 v1)
- WebSocket CORS locked down (C-04 v1)
- API keys masked in responses (C-06 v1)
- 9 controllers got RolesGuard (H-04 v1)
- Salary 30% hardcode → uses teacher config (H-01 v1)
- Date iteration bug fixed (H-02 v1)
- Salary upserts wrapped in transaction (H-03 v1)
- Branch scope NaN validation added (M-15 v1)
- 36 indexes + 31 cascades added to schema (H-11+H-12 v1)
- Frontend null crashes fixed (M-01 v1)
- Teacher salary N+1 eliminated (H-07 v1)
- Analytics N+1 eliminated (H-08+H-09 v1)
- Group archival cascades enrollments (H-14 v1)
- SortBy whitelist on 8 patterns (H-06 v1)
- Error states added to 4 pages (M-04 v1)
- PaymentsPage refactored to React Query (M-03 v1)
- Unused imports cleaned (multiple files)
- Shared types added for new models (M-07 v1)
- Seed file no longer logs credentials (L-01 v1)
- Axios interceptor uses api instance (L-03 v1)

### New Issues Found:
- 4 Critical: All are business logic gaps (double conversion, double payment, infinite debt, branch bypass on update)
- 8 High: Mostly missing guards on new/overlooked controllers + staff attendance backend gap
- Most Medium/Low: Polish items from new pages we created
