import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
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
  BarChartOutlined,
  TrophyOutlined,
  SettingOutlined,
  RobotOutlined,
  WarningOutlined,
  AimOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

type MenuItem = Required<MenuProps>['items'][number];

const Sidebar: React.FC = () => {
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
      key: '/leads',
      icon: <FunnelPlotOutlined />,
      label: t('sidebar.leads'),
    },
    {
      key: '/teachers',
      icon: <TeamOutlined />,
      label: t('sidebar.teachers'),
    },
    {
      key: '/groups',
      icon: <AppstoreOutlined />,
      label: t('sidebar.groups'),
    },
    {
      key: '/students',
      icon: <UserOutlined />,
      label: t('sidebar.students'),
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
    {
      key: '/kpi',
      icon: <TrophyOutlined />,
      label: 'KPI',
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
      key: '/ai',
      icon: <RobotOutlined />,
      label: 'AI Insights',
    },
    {
      key: '/problems',
      icon: <WarningOutlined />,
      label: 'Muammolar',
    },
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
    }
  };

  const selectedKeys = [location.pathname];
  const openKeys = ['finance', 'reports', 'gamification', 'settings', 'hr'].filter((key) =>
    location.pathname.startsWith(`/${key}`),
  );

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={selectedKeys}
      defaultOpenKeys={openKeys}
      items={items}
      onClick={onClick}
    />
  );
};

export default Sidebar;
