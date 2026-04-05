import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  FunnelPlotOutlined,
  TeamOutlined,
  AppstoreOutlined,
  UserOutlined,
  BellOutlined,
  StarOutlined,
  CheckSquareOutlined,
  ScheduleOutlined,
  DollarOutlined,
  BarChartOutlined, RiseOutlined,
  TrophyOutlined,
  SettingOutlined,
  RobotOutlined,
  WarningOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

type MenuItem = Required<MenuProps>['items'][number];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  onNavigate?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const items: MenuItem[] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('sidebar.dashboard'),
    },
    {
      key: "/analytics",
      icon: <BarChartOutlined />,
      label: "Tahlil",
    },
    {
      key: "/tahlil",
      icon: <RiseOutlined />,
      label: "Chuqur tahlil",
    },
    { type: 'divider' },
    {
      key: '/leads',
      icon: <FunnelPlotOutlined />,
      label: t('sidebar.leads'),
    },
    {
      key: '/students',
      icon: <UserOutlined />,
      label: t('sidebar.students'),
    },
    {
      key: '/groups',
      icon: <AppstoreOutlined />,
      label: t('sidebar.groups'),
    },
    {
      key: '/teachers',
      icon: <TeamOutlined />,
      label: t('sidebar.teachers'),
    },
    { type: 'divider' },
    {
      key: '/kpi',
      icon: <TrophyOutlined />,
      label: 'KPI',
    },
    {
      key: '/ai',
      icon: <RobotOutlined />,
      label: 'AI Insights',
    },
    {
      key: '/problems',
      icon: <WarningOutlined />,
      label: t('sidebar.problems', 'Muammolar'),
    },
    { type: 'divider' },
    {
      key: 'finance',
      icon: <DollarOutlined />,
      label: t('sidebar.finance'),
      children: [
        { key: '/finance/payments', label: t('sidebar.allPayments') },
        { key: '/finance/withdraw', label: t('sidebar.withdraw') },
        { key: '/finance/expenses', label: t('sidebar.totalExpenses') },
        { key: '/finance/salaries', label: t('sidebar.salaries') },
        { key: '/finance/debtors', label: t('sidebar.debtors') },
      ],
    },
    {
      key: 'hr',
      icon: <TeamOutlined />,
      label: 'HR',
      children: [
        { key: '/hr/staff', label: 'Xodimlar' },
        { key: '/hr/goals', label: 'Maqsadlar' },
      ],
    },
    {
      key: '/reminders',
      icon: <BellOutlined />,
      label: t('sidebar.reminders'),
    },
    {
      key: '/rating',
      icon: <StarOutlined />,
      label: t('sidebar.rating'),
    },
    {
      key: '/attendance',
      icon: <CheckSquareOutlined />,
      label: t('sidebar.attendance'),
    },
    {
      key: '/teacher-attendance',
      icon: <ScheduleOutlined />,
      label: t('sidebar.teacherAttendance'),
    },
    { type: 'divider' },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: t('sidebar.reports'),
      children: [
        { key: '/reports/conversion', label: t('sidebar.conversion') },
        { key: '/reports/attendance', label: t('sidebar.attendanceReport') },
        { key: '/reports/leads', label: t('sidebar.leadsReport') },
        { key: '/reports/students-left', label: t('sidebar.studentsLeft') },
        { key: '/reports/logs', label: t('sidebar.logs') },
      ],
    },
    {
      key: 'gamification',
      icon: <TrophyOutlined />,
      label: t('sidebar.gamification'),
      children: [
        { key: '/gamification/orders', label: t('sidebar.orders') },
        { key: '/gamification/shop', label: t('sidebar.shop') },
      ],
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('sidebar.settings'),
      children: [
        { key: '/settings/sms', label: t('sidebar.sms') },
        { key: '/settings/voip', label: t('sidebar.voip') },
        { key: '/settings/grade', label: t('sidebar.grade') },
        { key: '/settings/ceo', label: t('sidebar.ceo') },
        { key: '/settings/office', label: t('sidebar.office') },
        { key: '/settings/forms', label: t('sidebar.forms') },
        { key: '/settings/blog', label: t('sidebar.blog') },
        { key: '/settings/tags', label: t('sidebar.tags') },
      ],
    },
  ];

  const onClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('/')) {
      navigate(key);
      onNavigate?.();
    }
  };

  const selectedKeys = [location.pathname];
  const openKeys = ['finance', 'reports', 'gamification', 'settings', 'hr'].filter((key) =>
    location.pathname.startsWith(`/${key}`),
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 73px)' }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={items}
          onClick={onClick}
          style={{ border: 'none', background: 'transparent' }}
        />
      </div>

      {/* Collapse toggle at bottom */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          style={{ color: '#64748b', width: '100%' }}
        >
          {!collapsed && 'Yig\'ish'}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
