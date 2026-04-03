import { Layout, Select, Dropdown, Space, Avatar, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';
import { useAuth } from '../../features/auth/hooks';

const { Header } = Layout;
const { Text } = Typography;

const HeaderBar: React.FC = () => {
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
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('header.logout', 'Logout'),
      onClick: () => logout(),
    },
  ];

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : t('header.admin', 'Admin');

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Select
        placeholder={t('header.selectBranch', 'Select branch')}
        style={{ width: 200 }}
        value={activeBranchId ?? undefined}
        onChange={handleBranchChange}
        options={branchOptions}
      />

      <Space size="middle">
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          style={{ width: 80 }}
          suffixIcon={<GlobalOutlined />}
          options={[
            { value: 'uz', label: 'UZ' },
            { value: 'en', label: 'EN' },
            { value: 'ru', label: 'RU' },
          ]}
        />

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar src={user?.avatar} icon={!user?.avatar ? <UserOutlined /> : undefined} />
            <Text>{displayName}</Text>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default HeaderBar;
