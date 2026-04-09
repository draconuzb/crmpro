import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import StudentLayout from '@/layouts/StudentLayout';
import TeacherLayout from '@/layouts/TeacherLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleRedirect from '@/components/RoleRedirect';
import { ADMIN_ROLES, TEACHER_ROLES, STUDENT_ROLES } from '@/lib/roles';

// ─── Auth ────────────────────────────────────────
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));

// ─── Admin Pages (CEO / ADMIN / MANAGER) ─────────
const DashboardPage = lazy(() => import('@/pages/analytics/CeoDashboardPage'));
const TahlilPage = lazy(() => import('@/pages/analytics/TahlilPage'));

// Lead boshqaruvi
const LeadsKanbanPage = lazy(() => import('@/pages/leads/LeadsKanbanPage'));
const RejectionsPage = lazy(() => import('@/pages/leads/RejectionsPage'));

// Talabalar
const StudentListPage = lazy(() => import('@/pages/students/StudentListPage'));
const StudentProfilePage = lazy(() => import('@/pages/students/StudentProfilePage'));

// Guruhlar
const GroupListPage = lazy(() => import('@/pages/groups/GroupListPage'));
const GroupDetailPage = lazy(() => import('@/pages/groups/GroupDetailPage'));

// Jadval & Xonalar
const SchedulePage = lazy(() => import('@/pages/schedule/SchedulePage'));
const RoomsPage = lazy(() => import('@/pages/rooms/RoomsPage'));

// Moliya (Kirim / Chiqim)
const PaymentsPage = lazy(() => import('@/pages/finance/PaymentsPage'));
const ChiqimPage = lazy(() => import('@/pages/finance/ChiqimPage'));

// Qarzdorlar (top-level)
const DebtorsPage = lazy(() => import('@/pages/finance/DebtorsPage'));

// Davomat
const AttendanceReportPage = lazy(() => import('@/pages/attendance/AttendanceReportPage'));
const StaffAttendancePage = lazy(() => import('@/pages/attendance/StaffAttendancePage'));

// HR (drill-down)
const HrDrilldownPage = lazy(() => import('@/pages/hr/HrDrilldownPage'));

// Management
const RemindersPage = lazy(() => import('@/pages/reminders/RemindersPage'));
const ProblemsPage = lazy(() => import('@/pages/problems/ProblemsPage'));

// Hisobotlar (unified)
const HisobotlarPage = lazy(() => import('@/pages/reports/HisobotlarPage'));
const ConversionPage = lazy(() => import('@/pages/reports/ConversionPage'));

// Do'kon
const OrdersPage = lazy(() => import('@/pages/gamification/OrdersPage'));
const ShopPage = lazy(() => import('@/pages/gamification/ShopPage'));

// KPI & AI
const KpiDashboardPage = lazy(() => import('@/pages/kpi/KpiDashboardPage'));
const AiInsightsPage = lazy(() => import('@/pages/ai/AiInsightsPage'));

// Rating
const RatingPage = lazy(() => import('@/pages/rating/RatingPage'));

// Sozlamalar
const SmsSettingsPage = lazy(() => import('@/pages/settings/SmsSettingsPage'));
const VoipSettingsPage = lazy(() => import('@/pages/settings/VoipSettingsPage'));
const GradeSettingsPage = lazy(() => import('@/pages/settings/GradeSettingsPage'));
const CeoSettingsPage = lazy(() => import('@/pages/settings/CeoSettingsPage'));
const OfficeSettingsPage = lazy(() => import('@/pages/settings/OfficeSettingsPage'));
const FormsPage = lazy(() => import('@/pages/settings/FormsPage'));
const BlogPage = lazy(() => import('@/pages/settings/BlogPage'));
const TagsPage = lazy(() => import('@/pages/settings/TagsPage'));
const LeadStagesPage = lazy(() => import('@/pages/settings/LeadStagesPage'));
const BranchesPage = lazy(() => import('@/pages/settings/BranchesPage'));
const LogsPage = lazy(() => import('@/pages/reports/LogsPage')); // moved to settings
const RejectionReasonsPage = lazy(() => import('@/pages/settings/RejectionReasonsPage'));
const FinanceCategoriesPage = lazy(() => import('@/pages/settings/FinanceCategoriesPage'));
const ExpenseTypesPage = lazy(() => import('@/pages/settings/ExpenseTypesPage'));
const ProblemTypesPage = lazy(() => import('@/pages/settings/ProblemTypesPage'));
const CoinRulesPage = lazy(() => import('@/pages/settings/CoinRulesPage'));
const HrCategoriesPage = lazy(() => import('@/pages/settings/HrCategoriesPage'));
const OnlineLessonsPage = lazy(() => import('@/pages/settings/OnlineLessonsPage'));
const DiscountsPage = lazy(() => import('@/pages/settings/DiscountsPage'));

// Legacy pages kept for backward compatibility redirects
const TeacherListPage = lazy(() => import('@/pages/teachers/TeacherListPage'));
const TeacherProfilePage = lazy(() => import('@/pages/teachers/TeacherProfilePage'));

// ─── Student Portal ──────────────────────────────
const StudentDashboard = lazy(() => import('@/pages/student-portal/StudentDashboard'));
const StudentSchedule = lazy(() => import('@/pages/student-portal/StudentSchedule'));
const StudentGrades = lazy(() => import('@/pages/student-portal/StudentGrades'));
const StudentAttendance = lazy(() => import('@/pages/student-portal/StudentAttendance'));
const StudentBalance = lazy(() => import('@/pages/student-portal/StudentBalance'));
const StudentShop = lazy(() => import('@/pages/student-portal/StudentShop'));
const StudentProfile = lazy(() => import('@/pages/student-portal/StudentProfile'));

// ─── Teacher Portal ─────────────────────────────
const TeacherDashboard = lazy(() => import('@/pages/teacher-portal/TeacherDashboard'));
const TeacherGroups = lazy(() => import('@/pages/teacher-portal/TeacherGroups'));
const TeacherGroupDetail = lazy(() => import('@/pages/teacher-portal/TeacherGroupDetail'));
const TeacherSchedule = lazy(() => import('@/pages/teacher-portal/TeacherSchedule'));
const TeacherGradesPage = lazy(() => import('@/pages/teacher-portal/TeacherGrades'));
const TeacherSalary = lazy(() => import('@/pages/teacher-portal/TeacherSalary'));
const TeacherProfile = lazy(() => import('@/pages/teacher-portal/TeacherProfile'));

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: 48 }}>
    <Spin size="large" />
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* ═══ Public ═══ */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* ═══ Admin Portal (CEO / ADMIN / MANAGER) ═══ */}
        <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
          <Route element={<DashboardLayout />}>
            {/* Dashboard & Analytics */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tahlil" element={<TahlilPage />} />

            {/* Lead boshqaruvi */}
            <Route path="/leads" element={<LeadsKanbanPage />} />
            <Route path="/leads/rejections" element={<RejectionsPage />} />

            {/* Talabalar */}
            <Route path="/students" element={<StudentListPage />} />
            <Route path="/students/:id" element={<StudentProfilePage />} />

            {/* Guruhlar */}
            <Route path="/groups" element={<GroupListPage />} />
            <Route path="/groups/:id" element={<GroupDetailPage />} />

            {/* Jadval & Xonalar */}
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/rooms" element={<RoomsPage />} />

            {/* Moliya — new structure */}
            <Route path="/finance/income" element={<PaymentsPage />} />
            <Route path="/finance/expenses" element={<ChiqimPage />} />

            {/* Qarzdorlar — top-level */}
            <Route path="/debtors" element={<DebtorsPage />} />

            {/* Davomat — new structure */}
            <Route path="/attendance/students" element={<AttendanceReportPage />} />
            <Route path="/attendance/staff" element={<StaffAttendancePage />} />

            {/* HR — drill-down (single page for now) */}
            <Route path="/hr" element={<HrDrilldownPage />} />

            {/* Eslatmalar & Muammolar */}
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/problems" element={<ProblemsPage />} />

            {/* Hisobotlar — unified */}
            <Route path="/reports" element={<HisobotlarPage />} />
            <Route path="/reports/conversion" element={<ConversionPage />} />

            {/* Do'kon */}
            <Route path="/shop/products" element={<ShopPage />} />
            <Route path="/shop/orders" element={<OrdersPage />} />

            {/* KPI, AI & Rating */}
            <Route path="/kpi" element={<KpiDashboardPage />} />
            <Route path="/ai" element={<AiInsightsPage />} />
            <Route path="/rating" element={<RatingPage />} />

            {/* Sozlamalar */}
            <Route path="/settings/ceo" element={<CeoSettingsPage />} />
            <Route path="/settings/office" element={<OfficeSettingsPage />} />
            <Route path="/settings/branches" element={<BranchesPage />} />
            <Route path="/settings/sms" element={<SmsSettingsPage />} />
            <Route path="/settings/voip" element={<VoipSettingsPage />} />
            <Route path="/settings/tags" element={<TagsPage />} />
            <Route path="/settings/lead-stages" element={<LeadStagesPage />} />
            <Route path="/settings/grade" element={<GradeSettingsPage />} />
            <Route path="/settings/forms" element={<FormsPage />} />
            <Route path="/settings/blog" element={<BlogPage />} />
            <Route path="/settings/logs" element={<LogsPage />} />
            <Route path="/settings/rejection-reasons" element={<RejectionReasonsPage />} />
            <Route path="/settings/finance-categories" element={<FinanceCategoriesPage />} />
            <Route path="/settings/expense-types" element={<ExpenseTypesPage />} />
            <Route path="/settings/problem-types" element={<ProblemTypesPage />} />
            <Route path="/settings/coin-rules" element={<CoinRulesPage />} />
            <Route path="/settings/hr-categories" element={<HrCategoriesPage />} />
            <Route path="/settings/online-lessons" element={<OnlineLessonsPage />} />
            <Route path="/settings/discounts" element={<DiscountsPage />} />

            {/* Legacy redirects — old paths → new paths */}
            <Route path="/finance/payments" element={<Navigate to="/finance/income" replace />} />
            <Route path="/finance/withdraw" element={<Navigate to="/finance/expenses" replace />} />
            <Route path="/finance/salaries" element={<Navigate to="/finance/expenses" replace />} />
            <Route path="/finance/debtors" element={<Navigate to="/debtors" replace />} />
            <Route path="/attendance" element={<Navigate to="/attendance/students" replace />} />
            <Route path="/teacher-attendance" element={<Navigate to="/attendance/staff" replace />} />
            <Route path="/gamification/shop" element={<Navigate to="/shop/products" replace />} />
            <Route path="/gamification/orders" element={<Navigate to="/shop/orders" replace />} />
            <Route path="/reports/logs" element={<Navigate to="/settings/logs" replace />} />
            <Route path="/hr/staff" element={<Navigate to="/hr" replace />} />
            <Route path="/hr/goals" element={<Navigate to="/hr" replace />} />

            {/* Legacy pages — kept temporarily until HR replaces teachers */}
            <Route path="/teachers" element={<TeacherListPage />} />
            <Route path="/teachers/:id" element={<TeacherProfilePage />} />
          </Route>
        </Route>

        {/* ═══ Teacher Portal ═══ */}
        <Route element={<ProtectedRoute allowedRoles={TEACHER_ROLES} />}>
          <Route element={<TeacherLayout />}>
            <Route path="/t/dashboard" element={<TeacherDashboard />} />
            <Route path="/t/groups" element={<TeacherGroups />} />
            <Route path="/t/groups/:id" element={<TeacherGroupDetail />} />
            <Route path="/t/attendance" element={<TeacherDashboard />} />
            <Route path="/t/grades" element={<TeacherGradesPage />} />
            <Route path="/t/schedule" element={<TeacherSchedule />} />
            <Route path="/t/salary" element={<TeacherSalary />} />
            <Route path="/t/profile" element={<TeacherProfile />} />
          </Route>
        </Route>

        {/* ═══ Student Portal ═══ */}
        <Route element={<ProtectedRoute allowedRoles={STUDENT_ROLES} />}>
          <Route element={<StudentLayout />}>
            <Route path="/s/dashboard" element={<StudentDashboard />} />
            <Route path="/s/schedule" element={<StudentSchedule />} />
            <Route path="/s/grades" element={<StudentGrades />} />
            <Route path="/s/attendance" element={<StudentAttendance />} />
            <Route path="/s/balance" element={<StudentBalance />} />
            <Route path="/s/shop" element={<StudentShop />} />
            <Route path="/s/profile" element={<StudentProfile />} />
          </Route>
        </Route>

        {/* ═══ Catch-all: role-based redirect ═══ */}
        <Route path="/" element={<RoleRedirect />} />
        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
