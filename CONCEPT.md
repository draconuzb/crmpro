# CRM Pro — Workflow & Concept Plan

> **Status:** DRAFT — awaiting approval before implementation
> **Date:** 2026-04-08

---

## 1. Sidebar Structure (Final Order)

```
Bosh sahifa                          ← Dashboard (today's overview + quick actions)
Analitika                            ← Trends, charts, strategic view

─────────────────────────────────────

Lead boshqaruvi                      ← Expandable
  → Lidlar                           ← Existing Kanban board
  → Rad etganlar                     ← NEW: rejection database

Talabalar                            ← Student list + 360° profile
Guruhlar                             ← Group list + detail page

─────────────────────────────────────

Moliya                               ← Expandable
  → Kirim                            ← All incoming payments
  → Chiqim                           ← All outgoing (expenses, withdrawals, salaries — everything)

Qarzdorlar                           ← Top-level (daily-use action page)

─────────────────────────────────────

Davomat                              ← Expandable
  → Talabalar davomati               ← Student attendance reports
  → Xodimlar davomati                ← ALL staff attendance (not just teachers)

─────────────────────────────────────

HR                                   ← Full drill-down system (TWA-style)
Eslatmalar                           ← Unified reminders from all sources
Muammolar                            ← Problem tracking

─────────────────────────────────────

Hisobotlar                           ← Unified report generator

─────────────────────────────────────

Do'kon                               ← Expandable
  → Mahsulotlar                      ← Products/inventory
  → Buyurtmalar                      ← Student orders

KPI                                  ← (revisit later)
AI Insights                          ← (revisit later)

─────────────────────────────────────

Sozlamalar                           ← CEO/ADMIN only, grouped
  → Boshqaruv                        ← CEO, Ofis, Filiallar, HR kategoriyalari
  → Ulanishlar                       ← SMS, VoIP
  → Tizim                            ← Teglar, Lead bosqichlari, Baholar,
                                        Rad etish sabablari, Coin qoidalari,
                                        Moliya kategoriyalari, Xarajat turlari
  → Kontent                          ← Formalar, Blog
  → Jurnal                           ← Loglar (audit trail, moved from Reports)
```

**Removed from sidebar:**
- O'qituvchilar (merged into HR)
- Reyting (dropped)
- O'qituvchi davomati (merged into Davomat → Xodimlar davomati)

---

## 2. Lead Boshqaruvi

### 2.1. Lidlar (Kanban)
No concept change — existing Kanban with drag-and-drop pipeline stages.

### 2.2. Lead Deletion Workflow
When a user **deletes a lead** from the Kanban, a **modal forces them to select a rejection reason** from a configurable list (managed in Sozlamalar → Tizim → Rad etish sabablari).

This is a **workflow concept**, not a sidebar item. The rejection reason is stored with the deletion record.

### 2.4. Student Departure Workflow
When a student is **archived/removed** from a group or the system, a **modal forces the user to:**
1. Select departure type: **Sinov darsidan** (studied < 1 month) or **Doimiy darsdan** (studied ≥ 1 month) — auto-calculated from enrollment duration
2. Select rejection reason from the configurable list
3. Optional: add a note

This creates the record that appears in Rad etganlar. Same workflow triggers when a debtor is marked as "left" from the Qarzdorlar page.

### 2.3. Rad etganlar (NEW page)
**Single page with two tabs:**

| Tab | Description | Data source |
|-----|-------------|-------------|
| **Sinov darsidan rad etganlar** | People who left within first month (trial phase) | Student model — students who studied < 1 month then left |
| **Doimiy darsdan rad etganlar** | Students who studied 1+ months then quit | Student model — students who studied ≥ 1 month then left |

**Filters:**
- Teacher
- Date range
- Branch
- Reason category (from configurable list)
- Course
- Source

**Purpose:**
- **Analytics** — understand why people leave
- **Re-engagement** — call them back, track callbacks

**Re-engagement actions on Rad etganlar records:**
- Call
- Send SMS
- Add reminder
- Add note
- Mark as "re-engaged" (if they come back)

**Rejection reasons** are configurable in Sozlamalar → Tizim → Rad etish sabablari. Admins define their own categories (e.g., narx, sifat, vaqt, boshqa markaz, shaxsiy, etc.).

---

## 3. Moliya (Finance)

### Restructured from 5 sub-items to 2:

| Sub-page | What it contains |
|----------|-----------------|
| **Kirim** | All incoming payments (current PaymentsPage — no concept change) |
| **Chiqim** | ALL outgoing money merged into one page — expenses, withdrawals, salaries, everything |

### Chiqim page features:
- **Category filters** to separate expense types: Barchasi / Oyliklar / Ijaraga / Kommunal / Boshqa
- Categories are configurable in Sozlamalar → Tizim → Xarajat turlari
- Dual accounting (Naqd/Bank) via Moliya kategoriyalari
- Date range filter
- Search
- Export (CSV/PDF)

### Salary flow (Option C):
- **HR** owns salary calculation and approval workflow
- When salaries are approved/paid in HR → Oylik hisoblash, they **auto-appear in Chiqim** as expense records with category "Oyliklar"
- No duplicate logic — HR calculates, Chiqim displays

**Removed:**
- Pul yechish (merged into Chiqim)
- Umumiy xarajatlar (merged into Chiqim)
- Oyliklar (moved to HR, results appear in Chiqim)

---

## 4. Qarzdorlar (Top-level)

Promoted from Finance sub-item to **top-level sidebar item** — managers check debtors daily.

### Actions available on debtor records:
- Call
- Send SMS
- Add reminder
- Mark as "promised to pay"
- Add note

### Filters:
- Group
- Teacher
- Course
- Debt amount range
- How long overdue

### Connection to Rad etganlar:
If a debtor stops paying entirely and leaves, the student **flows into "Doimiy darsdan rad etganlar"** via the Student Departure Workflow (Section 2.4) — admin marks the student as left, selects reason, and the record appears in Rad etganlar.

### Connection to Eslatmalar:
When "Add reminder" is clicked on a debtor, the reminder is created with a link back to this student. It appears in both the Qarzdorlar page (inline) and the Eslatmalar page (unified view).

---

## 5. Davomat (Attendance)

### Expandable with two sub-items:

| Sub-page | Description |
|----------|-------------|
| **Talabalar davomati** | Student attendance report/view (existing concept) |
| **Xodimlar davomati** | NEW — attendance for ALL staff (teaching, admin, sales, IT, support) |

### Key decisions:
- **Attendance-taking** (marking students present/absent/late) happens in the **Teacher Portal** — teachers do it from their portal
- The admin panel Davomat pages are for **viewing/reporting** only
- **Xodimlar davomati** — admin manually marks who showed up (no biometric/QR for now)

---

## 6. HR (Full Drill-down System)

### Ported from TWA Boshqaruvchi bot design. Replaces current flat two-page HR.

### Structure:

**Level 0 — Main view:**
- Branch filter at top
- 3 view tabs: **Faol / Ishlamaydi / Hisobot**
- Total staff count header with branch breakdown
- Department category cards (clickable drill-down)
- Categories are **configurable** in Sozlamalar → Boshqaruv → HR kategoriyalari
- Default categories: Management, O'qituvchi xodimlari, Sotuv va Marketing, IT bo'limi, Yordamchi xodimlar

**Hisobot tab (inside HR):**
- Staff analytics: total headcount, by category, by branch
- Hiring trend (last 6-12 months chart)
- Average tenure
- New hires this month
- Departures this month
- Category distribution breakdown

**Level 1 — Category drilled:**
- Back bar with category title
- **Teaching category:** subject folders (English, Math, etc.) with pin/reorder, each showing staff + goals count
- **Non-teaching categories:** two cards — Xodimlar (→ flat list) and Maqsadlar (→ goals)

**Level 2 — Teaching subject drilled:**
- Xodimlar card → Asosiy o'qituvchilar / Yordamchi o'qituvchilar split
- Maqsadlar card → Goals for that subject

### Staff cards:
- Avatar initial
- Name, position, tenure calculation
- Phone, branch tags
- Edit / Deactivate / Delete actions

### Goals:
- Status badges: Kutilmoqda / Jarayonda / Bajarildi
- Deadlines
- Scoped per category + subject

### Profile modal:
- Full detail view: avatar, position, tenure, branch assignments, notes
- Phone number
- Start date / End date
- Status (Faol / Deaktiv)
- Quick actions: edit, deactivate
- **For teaching staff:** linked groups, schedule, attendance data, salary breakdown (from Teacher model)

### Oylik hisoblash (Salary calculation):
- Lives inside HR (not Finance)
- Calculates salaries for **ALL staff** (not just teachers)
- Teacher salaries: auto-calculated from salary type (fixed/percentage) × students × groups
- Non-teaching salaries: fixed amounts set per staff member
- **Workflow:** Select month → system calculates → manager reviews → approves → marks as paid
- When confirmed/paid → entries auto-appear in Moliya → Chiqim with "Oyliklar" category
- Salary history viewable per staff member in their HR profile

### O'qituvchilar sidebar item removed:
- Teachers are managed through HR → O'qituvchi xodimlari category
- Teacher-specific data (groups, schedule, salary) accessible from teacher's HR profile
- CRM Pro enriches HR profiles with Teacher model data (groups, attendance, schedule)

---

## 7. Eslatmalar (Reminders)

**Top-level sidebar item** — managers need a single "what do I need to do today" view.

### Concept:
- Kanban-style board: Muddati o'tgan / Bugungi / Kelajakdagi (existing)
- Shows ALL reminders from all sources in one unified view
- Each reminder card shows its source context (linked lead, student, debtor)

### Creation flow:
- **Qarzdorlar page** → "Add reminder" action → creates a reminder linked to debtor
- **Lead boshqaruvi** → "Add reminder" action → creates a reminder linked to lead
- **Talabalar** → Student profile → "Add reminder" → creates a reminder linked to student
- **Rad etganlar** → "Add reminder" for re-engagement → creates a reminder linked to rejected student
- **Eslatmalar page** → shows everything, can also create new reminders directly
- **Bosh sahifa** → quick action "+ Eslatma" → creates unlinked reminder

---

## 8. Muammolar (Problems)

**Top-level sidebar item** — "what's broken right now" view.

- Problem types: configurable in Sozlamalar → Tizim → Muammo turlari (default: equipment, facility, staff, student, finance, other)
- Status workflow: open → in_progress → resolved
- Assign, update status, resolve
- Branch-scoped (each branch sees its own problems)
- Open problems also appear in Hisobotlar (unified report) as a summary section
- Open problems count appears on Bosh sahifa as a stat card

---

## 9. Hisobotlar (Unified Report Generator)

### Replaces 5 separate report pages with ONE unified page.

**Ported from TWA Boshqaruvchi bot design.**

### Report type selector (4 buttons):
- **Kunlik** (daily)
- **Xaftalik** (weekly)
- **Oylik** (monthly)
- **Umumiy** (all-time)

### Date picker adapts to type:
- Date input for daily/weekly
- Month picker for monthly
- Hidden for umumiy

### One "Generatsiya" button → produces consolidated report with sections:

1. **💰 Moliya** — Kirim / Chiqim / Qoldiq + category breakdown + expense types
2. **📈 Leadlar** — total + by subject
3. **❌ Rad etilganlar** — total + by subject (sinov + doimiy)
4. **📋 Davomat** — expected vs attended + percentage (students + staff)
5. **💸 Qarzdorlar** — count + amount + by month
6. **⚠️ Muammolar** — open problems list
7. **🏫 Bo'sh xonalar** — empty rooms + potential revenue
8. **🏢 Filiallar bo'yicha** — branch breakdown (when multi-branch)

### CRM Pro additions (richer data than TWA):
- Group statistics (active groups, new enrollments)
- Course performance (which courses bring most revenue/students)
- HR summary (new hires, departures, staff count by category)
- Gamification stats (coins earned, orders, popular products)

### Monthly comparison (inline, not export):
- **"Oldingi oy bilan taqqoslash"** button appears on monthly reports
- Shows side-by-side table: previous month vs current month
- Delta arrows (▲▼) with color coding (green = good, red = bad, inverted for expenses/debtors)
- Metrics compared: Leadlar, Rad etilganlar, Kirim, Chiqim, Qarzdorlar, Davomat %

### Export options:
- PDF export
- CSV export

### Removed from sidebar:
- Konversiya (data included in unified report)
- Davomat hisoboti (moved to Davomat section)
- Lidlar hisoboti (data included in unified report)
- Ketgan talabalar (replaced by Rad etganlar in Lead boshqaruvi)
- Loglar (moved to Sozlamalar → Jurnal)

---

## 10. Bosh Sahifa (Dashboard)

**"What's happening right now?"** — daily operational overview.

### Stats cards:
- Bugungi kirim / chiqim / qoldiq
- Yangi leadlar soni
- Rad etilganlar soni (today)
- Qarzdorlar — count + total amount
- Bugungi davomat % (students)
- Xodimlar davomati (staff who showed up today)
- Ochiq muammolar count
- Bugungi eslatmalar count
- Faol guruhlar / talabalar soni

### Quick-action buttons:
- \+ Lead
- \+ To'lov (kirim)
- \+ Chiqim
- \+ Eslatma
- \+ Talaba
- \+ Guruh
- \+ Xodim (HR)
- \+ Muammo

### Branch scoping:
- **Branch selected (branchId > 0):** shows only that branch's data, no branch filter inside the page
- **Analitika rejimi (branchId = 0):** shows aggregated dashboard across ALL branches — total kirim/chiqim, total leads, total debtors, etc. CEO-level daily overview.

---

## 11. Analitika

**"How are we performing over time?"** — trends, charts, strategic view.

### Quick-action buttons:
Same as Bosh sahifa — all section quick actions available.

### Branch scoping:
- **Branch selected (branchId > 0):** shows only that branch's trends and charts, no branch filter
- **Analitika rejimi (branchId = 0):** shows cross-branch comparison, branch filters, branch breakdown — CEO-level overview

### Content:
- Trend charts across all new sections (leads, finance, attendance, debtors, HR, rad etganlar)
- Month-over-month comparisons
- Branch performance comparison (analitika rejimi only)
- Rad etganlar trends (sinov vs doimiy over time, by reason)
- Qarzdorlar trends (total debt amount over time)
- HR analytics (headcount changes, category distribution)
- Group fill rate (capacity vs enrolled)
- Course performance (revenue per course, popularity ranking)

---

## 12. Talabalar (Students)

**Top-level sidebar item** — no concept change to list page.

### Student Profile — 360° view:
- Current groups + attendance history
- Payment history (from Moliya kirim)
- Debt status (from Qarzdorlar) — if debtor, show amount + overdue duration
- Reminders linked to this student
- Coin balance + order history (from Do'kon)
- Grade history + exam results
- If they were a lead before — original lead source, conversion stage
- If they left — rad etilgan status, type (sinov/doimiy), reason, date (from Rad etganlar)
- Comments / notes timeline
- **Actions from profile:** add payment, add reminder, add note, send SMS, archive (triggers Student Departure Workflow)

---

## 13. Guruhlar (Groups)

**Top-level sidebar item** — no concept change to list page.

### Group Detail — enriched:
- Students list + enrollment management (existing)
- Financial summary for this group (total kirim from group students)
- Teacher info (linked from HR)
- Attendance trend chart
- Debtors in this group (quick view from Qarzdorlar data)
- Group schedule (days, time, room)
- Rad etganlar from this group (who left and why)

---

## 14. Do'kon (Gamification)

### Expandable with two sub-items:

| Sub-page | Description |
|----------|-------------|
| **Mahsulotlar** | Product inventory — CRUD, images, coin prices, stock |
| **Buyurtmalar** | Student orders — status tracking |

### Coin earning rules:
Configurable in Sozlamalar → Tizim → Coin qoidalari (e.g., attendance streak, high grades, exam scores).

---

## 15. Sozlamalar (Settings)

**CEO/ADMIN only.** Grouped into 5 sub-categories:

### Boshqaruv (Management):
| Setting | Description |
|---------|-------------|
| CEO sozlamalari | System-wide settings only CEO controls |
| Ofis sozlamalari | Working hours, breaks, holidays, office config |
| Filiallar | Branch CRUD — add, edit, deactivate branches |
| HR kategoriyalari | Configurable staff department categories + positions |

### Ulanishlar (Integrations):
| Setting | Description |
|---------|-------------|
| SMS | Eskiz.uz gateway config, API key, sender name, on/off |
| VoIP | Phone system config, SIP domain, API key, on/off |

### Tizim (System configuration):
| Setting | Description |
|---------|-------------|
| Muammo turlari | Configurable problem type categories |
| Teglar | Tag CRUD for leads and groups (name, color) |
| Lead bosqichlari | Configurable Kanban pipeline stages per branch |
| Baholar | Grade scale settings |
| Rad etish sabablari | Customizable rejection reason categories |
| Coin qoidalari | Rules for how students earn coins |
| Moliya kategoriyalari | Cash/Bank + custom finance categories |
| Xarajat turlari | Expense type categories |

### Kontent (Content):
| Setting | Description |
|---------|-------------|
| Formalar | Dynamic form builder |
| Blog | News/blog posts |

### Jurnal (Audit):
| Setting | Description |
|---------|-------------|
| Loglar | Activity log — who did what, when. Filters by user, action, entity, date range |

---

## 16. Role-based Sidebar Visibility

| Sidebar Item | CEO | ADMIN | MANAGER | TEACHER | STUDENT |
|---|---|---|---|---|---|
| Bosh sahifa | ✅ | ✅ | ✅ | — (Teacher Portal) | — (Student Portal) |
| Analitika | ✅ | ✅ | ✅ | — | — |
| Lead boshqaruvi | ✅ | ✅ | ✅ | — | — |
| Talabalar | ✅ | ✅ | ✅ | — | — |
| Guruhlar | ✅ | ✅ | ✅ | — | — |
| Moliya | ✅ | ✅ | ✅ | — | — |
| Qarzdorlar | ✅ | ✅ | ✅ | — | — |
| Davomat | ✅ | ✅ | ✅ | — | — |
| HR | ✅ | ✅ | — | — | — |
| Eslatmalar | ✅ | ✅ | ✅ | — | — |
| Muammolar | ✅ | ✅ | ✅ | — | — |
| Hisobotlar | ✅ | ✅ | ✅ | — | — |
| Do'kon | ✅ | ✅ | ✅ | — | — |
| KPI | ✅ | ✅ | ✅ | — | — |
| AI Insights | ✅ | ✅ | — | — | — |
| Sozlamalar | ✅ | ✅ | — | — | — |

> **Note:** TEACHER and STUDENT roles use their own dedicated portals (separate sidebar/layout). They never see the admin sidebar.

---

## 17. Branch Control Bar

**Current problem:** Borderless `<Select>` dropdown squeezed into header. "Analitika" mode mixed with branch selection. Too small/hidden for such an important control.

**Status:** Visual redesign pending — concept TBD.

---

## 18. Teacher Portal

**Current state:** Basic portal at `/t/*` with minimal sub-pages (groups, schedule, grades, salary, profile).

**Dependencies:** Teacher Portal is where attendance-taking happens (marking students present/absent/late per group). This must be defined before Davomat section can be fully implemented.

**Status:** Rethink pending — concept TBD.

---

## 19. Student Portal

**Current state:** Basic portal at `/s/*` with minimal sub-pages (schedule, grades, balance, shop, profile).

**Dependencies:** Student Portal is where students browse and buy from Do'kon (gamification shop). This must be defined before Do'kon section can be fully implemented.

**Status:** Rethink pending — concept TBD.

---

## 20. Database Changes Required

New models/tables needed for these concepts:

| Model | Purpose |
|-------|---------|
| **RejectionReason** | Configurable rejection reason categories (branch-scoped) |
| **StudentDeparture** | Records when a student leaves — type (sinov/doimiy), reason, date, note, studentId |
| **LeadDeletion** | Records when a lead is deleted — reason, date, leadId, deletedById |
| **ProblemType** | Configurable problem type categories |
| **CoinRule** | Configurable coin earning rules |
| **HrCategory** | Configurable HR department categories + positions (replaces hardcoded HR_CATS) |
| **StaffSalaryConfig** | Non-teaching staff salary amounts (teaching uses existing Teacher.salaryType/salaryAmount) |

Existing models to modify:
- **Expense/Withdrawal** → merge into unified **Chiqim** model or use Expense for both
- **Salary** → needs to support non-teaching staff
- **Problem** → type field references ProblemType instead of free string
- **Student** → needs departure tracking fields or relation to StudentDeparture
- **Attendance** → needs staff attendance support (or use existing TeacherAttendance expanded)

---

## 21. Cross-section Data Flows

```
Lead (Kanban) ──delete──→ LeadDeletion (with reason)
                │
                │ convert
                ▼
Student ──archive──→ StudentDeparture ──→ Rad etganlar page
  │                    (with type + reason)
  │
  ├── negative balance ──→ Qarzdorlar page
  │                            │
  │                            └── leaves ──→ StudentDeparture ──→ Rad etganlar
  │
  ├── payments ──→ Moliya → Kirim
  │
  └── groups ──→ Guruhlar detail
                    │
                    └── teacher ──→ HR profile

HR → Oylik hisoblash → approve → Moliya → Chiqim (auto-entry, category "Oyliklar")

Eslatmalar ←── created from: Qarzdorlar, Lead boshqaruvi, Talabalar, Rad etganlar, Bosh sahifa

Hisobotlar ←── aggregates from: Moliya, Leadlar, Rad etganlar, Davomat, Qarzdorlar, Muammolar, Bo'sh xonalar, HR
```

---

## 22. Open Questions (require answers before implementation)

1. **Manager role visibility:** Should MANAGERs see HR section or not? (Currently marked as hidden — confirm)
2. **AI Insights:** Should MANAGERs have access or CEO/ADMIN only? (Currently marked CEO/ADMIN only — confirm)
3. **Branch control bar:** Visual direction TBD — needs design discussion
4. **Teacher Portal:** Attendance-taking workflow TBD — blocks Davomat implementation
5. **Student Portal:** Shop browsing/buying workflow TBD — blocks Do'kon implementation
6. **Notification system:** Current WebSocket notification system (NotificationBell) — should it notify on new debtors, new problems, overdue reminders, salary approvals?
7. **Bo'sh xonalar (Empty rooms):** Exists in TWA reports and database — should it have its own page in CRM Pro or only appear in Hisobotlar?

---

## Approval

> ⚠️ **No implementation begins until this document is approved.**
>
> After approval, each section will be implemented incrementally with review checkpoints.
