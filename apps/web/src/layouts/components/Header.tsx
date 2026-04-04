import { Layout, Select, Dropdown, Space, Avatar, Typography, Button, Badge } from 'antd';
import {
  UserOutlined, LogoutOutlined, GlobalOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, BellOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';
import { useAuth } from '../../features/auth/hooks';

const { Header } = Layout;
const { Text } = Typography;

interface HeaderBarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ collapsed, onToggle }) => {
  const { i18n, t } = useTranslation();
  const { user, activeBranchId, logout, setActiveBranch } = useAuth();

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const handleBranchChange = (branchId: number) => {
    setActiveBranch(branchId);
  };

  const branchOptions = (user?.branches ?? []).map((ub: any) => ({
    value: ub.branch?.id ?? ub.branchId ?? ub.id,
    label: ub.branch?.name ?? ub.name ?? `Branch ${ub.branchId}`,
  }));

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'role',
      label: (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {user?.role}
        </Text>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('header.logout', 'Chiqish'),
      danger: true,
      onClick: () => logout(),
    },
  ];

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : t('header.admin', 'Admin');

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: 64,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <Space size="middle">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{ fontSize: 18, color: '#475569' }}
        />
        <Select
          placeholder={t('header.selectBranch', 'Filial tanlang')}
          style={{ width: 200 }}
          value={activeBranchId ?? undefined}
          onChange={handleBranchChange}
          options={branchOptions}
          variant="borderless"
        />
      </Space>

      <Space size={16}>
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          style={{ width: 76 }}
          suffixIcon={<GlobalOutlined style={{ color: '#6366f1' }} />}
          variant="borderless"
          options={[
            { value: 'uz', label: 'UZ' },
            { value: 'en', label: 'EN' },
            { value: 'ru', label: 'RU' },
          ]}
        />

        <Badge count={0} size="small">
          <Button type="text" icon={<BellOutlined />} style={{ color: '#475569' }} />
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <Space
            style={{
              cursor: 'pointer',
              padding: '4px 12px',
              borderRadius: 10,
              transition: 'background 0.2s',
            }}
          >
            <Avatar
              src={user?.avatar}
              icon={!user?.avatar ? <UserOutlined /> : undefined}
              style={{
                background: user?.avatar ? undefined : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              }}
            />
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{displayName}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{user?.role}</div>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default HeaderBar;
