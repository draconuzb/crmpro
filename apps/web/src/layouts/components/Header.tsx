import { Layout, Select, Dropdown, Space, Avatar, Typography, Button } from 'antd';
import {
  UserOutlined, LogoutOutlined, GlobalOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, MenuOutlined, SunOutlined, MoonOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';
import { useAuth } from '../../features/auth/hooks';
import { useThemeMode } from '../../contexts/ThemeContext';
import NotificationBell from '../../components/NotificationBell';

const { Header } = Layout;
const { Text } = Typography;

interface HeaderBarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ collapsed, onToggle, isMobile = false }) => {
  const { i18n, t } = useTranslation();
  const { user, activeBranchId, logout, setActiveBranch } = useAuth();
  const { isDark, toggleTheme } = useThemeMode();

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
      label: <Text type="secondary" style={{ fontSize: 12 }}>{user?.role}</Text>,
      disabled: true,
    },
    { type: 'divider' },
    ...(!isMobile ? [] : [
      {
        key: 'lang',
        label: 'Til',
        children: [
          { key: 'uz', label: 'UZ', onClick: () => handleLanguageChange('uz') },
          { key: 'en', label: 'EN', onClick: () => handleLanguageChange('en') },
          { key: 'ru', label: 'RU', onClick: () => handleLanguageChange('ru') },
        ],
      } as any,
      { type: 'divider' } as any,
    ]),
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

  const headerBg = isDark ? '#1f1f1f' : '#fff';
  const borderColor = isDark ? '#303030' : '#e2e8f0';
  const textColor = isDark ? '#a0aec0' : '#475569';
  const nameColor = isDark ? '#e2e8f0' : '#1e293b';
  const roleColor = isDark ? '#718096' : '#94a3b8';

  return (
    <Header
      style={{
        background: headerBg,
        padding: isMobile ? '0 12px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${borderColor}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: isMobile ? 56 : 64,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <Space size={isMobile ? 8 : 12}>
        <Button
          type="text"
          icon={isMobile ? <MenuOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
          onClick={onToggle}
          style={{ fontSize: 18, color: textColor }}
        />
        {!isMobile && (
          <Select
            placeholder={t('header.selectBranch', 'Filial tanlang')}
            style={{ width: 200 }}
            value={activeBranchId ?? undefined}
            onChange={handleBranchChange}
            options={branchOptions}
            variant="borderless"
          />
        )}
        {isMobile && branchOptions.length > 1 && (
          <Select
            value={activeBranchId ?? undefined}
            onChange={handleBranchChange}
            options={branchOptions}
            variant="borderless"
            style={{ maxWidth: 140 }}
            popupMatchSelectWidth={false}
          />
        )}
      </Space>

      <Space size={isMobile ? 4 : 16}>
        {!isMobile && (
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
        )}

        <Button
          type="text"
          icon={isDark ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          style={{ color: isDark ? '#fadb14' : textColor, fontSize: 18 }}
          title={isDark ? 'Light mode' : 'Dark mode'}
        />

        {!isMobile && <NotificationBell />}

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 10 }}>
            <Avatar
              src={user?.avatar}
              icon={!user?.avatar ? <UserOutlined /> : undefined}
              size={isMobile ? 32 : 36}
              style={{
                background: user?.avatar ? undefined : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              }}
            />
            {!isMobile && (
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: nameColor }}>{displayName}</div>
                <div style={{ fontSize: 11, color: roleColor }}>{user?.role}</div>
              </div>
            )}
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default HeaderBar;
