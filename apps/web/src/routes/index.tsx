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
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const LeadsKanbanPage = lazy(() => import('@/pages/leads/LeadsKanbanPage'));
const TeacherListPage = lazy(() => import('@/pages/teachers/TeacherListPage'));
const TeacherProfilePage = lazy(() => import('@/pages/teachers/TeacherProfilePage'));
const GroupListPage = lazy(() => import('@/pages/groups/GroupListPage'));
const GroupDetailPage = lazy(() => import('@/pages/groups/GroupDetailPage'));
const StudentListPage = lazy(() => import('@/pages/students/StudentListPage'));
const StudentProfilePage = lazy(() => import('@/pages/students/StudentProfilePage'));
const RemindersPage = lazy(() => import('@/pages/reminders/RemindersPage'));
const RatingPage = lazy(() => import('@/pages/rating/RatingPage'));
const AttendanceReportPage = lazy(() => import('@/pages/attendance/AttendanceReportPage'));
const TeacherAttendancePage = lazy(() => import('@/pages/teacher-attendance/TeacherAttendancePage'));
const PaymentsPage = lazy(() => import('@/pages/finance/PaymentsPage'));
const WithdrawPage = lazy(() => import('@/pages/finance/WithdrawPage'));
const ExpensesPage = lazy(() => import('@/pages/finance/ExpensesPage'));
const SalariesPage = lazy(() => import('@/pages/finance/SalariesPage'));
const DebtorsPage = lazy(() => import('@/pages/finance/DebtorsPage'));
const ConversionPage = lazy(() => import('@/pages/reports/ConversionPage'));
const AttendanceReportsPage = lazy(() => import('@/pages/reports/AttendanceReportsPage'));
const LeadsReportsPage = lazy(() => import('@/pages/reports/LeadsReportsPage'));
const StudentsLeftPage = lazy(() => import('@/pages/reports/StudentsLeftPage'));
const LogsPage = lazy(() => import('@/pages/reports/LogsPage'));
const OrdersPage = lazy(() => import('@/pages/gamification/OrdersPage'));
const ShopPage = lazy(() => import('@/pages/gamification/ShopPage'));
const SmsSettingsPage = lazy(() => import('@/pages/settings/SmsSettingsPage'));
const VoipSettingsPage = lazy(() => import('@/pages/settings/VoipSettingsPage'));
const GradeSettingsPage = lazy(() => import('@/pages/settings/GradeSettingsPage'));
const CeoSettingsPage = lazy(() => import('@/pages/settings/CeoSettingsPage'));
const OfficeSettingsPage = lazy(() => import('@/pages/settings/OfficeSettingsPage'));
const FormsPage = lazy(() => import('@/pages/settings/FormsPage'));
const BlogPage = lazy(() => import('@/pages/settings/BlogPage'));
const TagsPage = lazy(() => import('@/pages/settings/TagsPage'));
const KpiDashboardPage = lazy(() => import('@/pages/kpi/KpiDashboardPage'));
const HrStaffPage = lazy(() => import('@/pages/hr/HrStaffPage'));
const HrGoalsPage = lazy(() => import('@/pages/hr/HrGoalsPage'));
const AiInsightsPage = lazy(() => import('@/pages/ai/AiInsightsPage'));
const ProblemsPage = lazy(() => import('@/pages/problems/ProblemsPage'));

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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadsKanbanPage />} />
            <Route path="/teachers" element={<TeacherListPage />} />
            <Route path="/teachers/:id" element={<TeacherProfilePage />} />
            <Route path="/groups" element={<GroupListPage />} />
            <Route path="/groups/:id" element={<GroupDetailPage />} />
            <Route path="/students" element={<StudentListPage />} />
            <Route path="/students/:id" element={<StudentProfilePage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/rating" element={<RatingPage />} />
            <Route path="/attendance" element={<AttendanceReportPage />} />
            <Route path="/teacher-attendance" element={<TeacherAttendancePage />} />
            <Route path="/finance/payments" element={<PaymentsPage />} />
            <Route path="/finance/withdraw" element={<WithdrawPage />} />
            <Route path="/finance/expenses" element={<ExpensesPage />} />
            <Route path="/finance/salaries" element={<SalariesPage />} />
            <Route path="/finance/debtors" element={<DebtorsPage />} />
            <Route path="/reports/conversion" element={<ConversionPage />} />
            <Route path="/reports/attendance" element={<AttendanceReportsPage />} />
            <Route path="/reports/leads" element={<LeadsReportsPage />} />
            <Route path="/reports/students-left" element={<StudentsLeftPage />} />
            <Route path="/reports/logs" element={<LogsPage />} />
            <Route path="/gamification/orders" element={<OrdersPage />} />
            <Route path="/gamification/shop" element={<ShopPage />} />
            <Route path="/settings/sms" element={<SmsSettingsPage />} />
            <Route path="/settings/voip" element={<VoipSettingsPage />} />
            <Route path="/settings/grade" element={<GradeSettingsPage />} />
            <Route path="/settings/ceo" element={<CeoSettingsPage />} />
            <Route path="/settings/office" element={<OfficeSettingsPage />} />
            <Route path="/settings/forms" element={<FormsPage />} />
            <Route path="/settings/blog" element={<BlogPage />} />
            <Route path="/settings/tags" element={<TagsPage />} />
            <Route path="/kpi" element={<KpiDashboardPage />} />
            <Route path="/hr/staff" element={<HrStaffPage />} />
            <Route path="/hr/goals" element={<HrGoalsPage />} />
            <Route path="/ai" element={<AiInsightsPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
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
