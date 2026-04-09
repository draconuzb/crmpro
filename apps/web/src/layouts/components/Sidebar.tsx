import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Button, Select } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  FunnelPlotOutlined,
  UserOutlined,
  AppstoreOutlined,
  DollarOutlined,
  BellOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  WarningOutlined,
  BarChartOutlined,
  RiseOutlined,
  ShopOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LineChartOutlined,
  WalletOutlined,
  BulbOutlined,
  AimOutlined,
  HomeOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../features/auth/hooks';

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
  const { activeBranchId, user, setActiveBranch } = useAuth();
  const userRole = user?.role || '';

  const isAnalyticsMode = !activeBranchId || activeBranchId === 0;
  const isCeoOrAdmin = userRole === 'CEO' || userRole === 'ADMIN';

  // Build branch options
  const realBranches = (user?.branches ?? []).map((ub: any) => ({
    value: ub.branch?.id ?? ub.branchId ?? ub.id,
    label: ub.branch?.name ?? ub.name ?? `Branch ${ub.branchId}`,
  }));
  const branchOptions = [
    { value: 0, label: '📊 Analitika (barcha filiallar)' },
    ...realBranches,
  ];

  const handleBranchChange = (branchId: number) => {
    setActiveBranch(branchId);
  };

  // ── Analytics mode: dashboards + settings ──
  const analyticsItems: MenuItem[] = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: t('sidebar.dashboard') },
    { key: '/tahlil', icon: <RiseOutlined />, label: t('sidebar.analytics') },
    { type: 'divider' },
    {
      key: 'settings', icon: <SettingOutlined />, label: t('sidebar.settings'),
      children: [
        { key: '/settings/ceo', label: t('sidebar.ceoSettings') },
        { key: '/settings/branches', label: t('sidebar.branches') },
        { key: '/settings/lead-stages', label: t('sidebar.leadStages') },
        { key: '/settings/tags', label: t('sidebar.tags') },
      ],
    },
  ];

  // ── Branch mode: full operational menu ──
  const branchItems: MenuItem[] = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: t('sidebar.dashboard') },
    { key: '/tahlil', icon: <RiseOutlined />, label: t('sidebar.analytics') },
    { type: 'divider' },

    {
      key: 'leads', icon: <FunnelPlotOutlined />, label: t('sidebar.leadManagement'),
      children: [
        { key: '/leads', label: t('sidebar.leads') },
        { key: '/leads/rejections', label: t('sidebar.rejections') },
      ],
    },
    { key: '/students', icon: <UserOutlined />, label: t('sidebar.students') },
    {
      key: 'groups', icon: <AppstoreOutlined />, label: t('sidebar.groups'),
      children: [
        { key: '/groups', label: t('sidebar.groups') },
        { key: '/schedule', label: t('sidebar.schedule') },
        { key: '/rooms', label: t('sidebar.rooms') },
      ],
    },
    { type: 'divider' },

    {
      key: 'finance', icon: <DollarOutlined />, label: t('sidebar.finance'),
      children: [
        { key: '/finance/income', label: t('sidebar.income') },
        { key: '/finance/expenses', label: t('sidebar.expenses') },
      ],
    },
    { key: '/debtors', icon: <WalletOutlined />, label: t('sidebar.debtors') },
    { type: 'divider' },

    {
      key: 'attendance', icon: <CheckSquareOutlined />, label: t('sidebar.attendance'),
      children: [
        { key: '/attendance/students', label: t('sidebar.studentAttendance') },
        { key: '/attendance/staff', label: t('sidebar.staffAttendance') },
      ],
    },
    { type: 'divider' },

    ...(isCeoOrAdmin ? [
      { key: '/hr', icon: <TeamOutlined />, label: t('sidebar.hr') } as MenuItem,
    ] : []),
    { key: '/reminders', icon: <BellOutlined />, label: t('sidebar.reminders') },
    { key: '/problems', icon: <WarningOutlined />, label: t('sidebar.problems') },
    { type: 'divider' },

    { key: '/reports', icon: <BarChartOutlined />, label: t('sidebar.reports') },
    { key: '/rating', icon: <StarOutlined />, label: t('sidebar.rating') },
    { type: 'divider' },

    {
      key: 'shop', icon: <ShopOutlined />, label: t('sidebar.shop'),
      children: [
        { key: '/shop/products', label: t('sidebar.products') },
        { key: '/shop/orders', label: t('sidebar.orders') },
      ],
    },
    { key: '/kpi', icon: <AimOutlined />, label: t('sidebar.kpi') },
    { key: '/ai', icon: <BulbOutlined />, label: t('sidebar.aiInsights') },
    { type: 'divider' },

    ...(isCeoOrAdmin ? [{
      key: 'settings', icon: <SettingOutlined />, label: t('sidebar.settings'),
      children: [
        { key: '/settings/ceo', label: t('sidebar.ceoSettings'), type: undefined },
        { key: '/settings/office', label: t('sidebar.officeSettings') },
        { key: '/settings/branches', label: t('sidebar.branches') },
        { key: '/settings/hr-categories', label: t('sidebar.hrCategories') },
        { type: 'divider' },
        { key: '/settings/sms', label: t('sidebar.sms') },
        { key: '/settings/voip', label: t('sidebar.voip') },
        { type: 'divider' },
        { key: '/settings/tags', label: t('sidebar.tags') },
        { key: '/settings/lead-stages', label: t('sidebar.leadStages') },
        { key: '/settings/grade', label: t('sidebar.grade') },
        { key: '/settings/rejection-reasons', label: t('sidebar.rejectionReasons') },
        { key: '/settings/coin-rules', label: t('sidebar.coinRules') },
        { key: '/settings/finance-categories', label: t('sidebar.financeCategories') },
        { key: '/settings/expense-types', label: t('sidebar.expenseTypes') },
        { key: '/settings/problem-types', label: t('sidebar.problemTypes') },
        { type: 'divider' },
        { key: '/settings/online-lessons', label: t('sidebar.onlineLessons') },
        { key: '/settings/discounts', label: t('sidebar.discounts') },
        { type: 'divider' },
        { key: '/settings/forms', label: t('sidebar.forms') },
        { key: '/settings/blog', label: t('sidebar.blog') },
        { type: 'divider' },
        { key: '/settings/logs', label: t('sidebar.logs') },
      ],
    } as MenuItem] : []),
  ];

  const items = isAnalyticsMode ? analyticsItems : branchItems;

  const onClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('/')) {
      navigate(key);
      onNavigate?.();
    }
  };

  const selectedKeys = [location.pathname];
  const openKeys = ['leads', 'finance', 'attendance', 'shop', 'settings', 'groups'].filter((key) =>
    location.pathname.startsWith(`/${key}`) ||
    (key === 'groups' && (location.pathname.startsWith('/groups') || location.pathname.startsWith('/schedule') || location.pathname.startsWith('/rooms'))),
  );

  const selectedBranchName = realBranches.find((b: any) => b.value === activeBranchId)?.label;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 73px)' }}>
      {/* Branch Selector — below logo */}
      <div style={{ padding: collapsed ? '8px 8px' : '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {collapsed ? (
          <Button
            type="text"
            icon={<HomeOutlined />}
            style={{ width: '100%', color: isAnalyticsMode ? '#6366f1' : '#a0aec0' }}
            title={selectedBranchName || 'Analitika'}
          />
        ) : (
          <Select
            value={activeBranchId ?? 0}
            onChange={handleBranchChange}
            options={branchOptions}
            style={{ width: '100%' }}
            variant="borderless"
            popupMatchSelectWidth={false}
            dropdownStyle={{ minWidth: 220 }}
          />
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Analytics mode indicator */}
        {isAnalyticsMode && (
          <div style={{
            padding: '10px 16px', margin: '4px 12px 8px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))',
            border: '1px solid rgba(99,102,241,0.2)',
            textAlign: 'center',
          }}>
            <LineChartOutlined style={{ color: '#6366f1', fontSize: 16, marginRight: 6 }} />
            <span style={{ color: '#a5b4fc', fontSize: 12, fontWeight: 600 }}>{t('sidebar.analyticsMode')}</span>
          </div>
        )}
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

      {/* Collapse toggle */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '8px 12px' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          style={{ width: '100%', color: '#64748b', justifyContent: 'flex-start' }}
        >
          {!collapsed && t('sidebar.collapse')}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
