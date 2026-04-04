import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Layout, Avatar, Dropdown, Space, Typography, Badge } from 'antd';
import {
  HomeOutlined, CalendarOutlined, TrophyOutlined, BookOutlined,
  UserOutlined, LogoutOutlined, WalletOutlined, ShopOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '../features/auth/hooks';

const { Header, Content } = Layout;
const { Text } = Typography;

const NAV_ITEMS = [
  { key: '/s/dashboard', icon: <HomeOutlined />, label: 'Bosh sahifa' },
  { key: '/s/schedule', icon: <CalendarOutlined />, label: 'Jadval' },
  { key: '/s/grades', icon: <BookOutlined />, label: 'Baholar' },
  { key: '/s/attendance', icon: <TrophyOutlined />, label: 'Davomat' },
  { key: '/s/balance', icon: <WalletOutlined />, label: 'Balans' },
  { key: '/s/shop', icon: <ShopOutlined />, label: "Do'kon" },
];

const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student';

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profilim', onClick: () => navigate('/s/profile') },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Chiqish', danger: true, onClick: () => logout() },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top Header */}
      <Header
        style={{
          background: '#fff',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          height: 60,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>C</span>
          </div>
          <Text strong style={{ fontSize: 16, color: '#0f172a' }}>CRMPro</Text>
        </div>

        <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              src={user?.avatar}
              icon={!user?.avatar ? <UserOutlined /> : undefined}
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              size={36}
            />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{displayName}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>O'quvchi</div>
            </div>
          </Space>
        </Dropdown>
      </Header>

      {/* Content */}
      <Content style={{ padding: '20px 16px 100px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>

      {/* Bottom Tab Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0 12px',
          zIndex: 100,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.key;
          return (
            <div
              key={item.key}
              onClick={() => navigate(item.key)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                color: isActive ? '#6366f1' : '#94a3b8',
                fontSize: 20,
                transition: 'color 0.2s',
                flex: 1,
              }}
            >
              {item.icon}
              <span style={{ fontSize: 10, marginTop: 2, fontWeight: isActive ? 600 : 400 }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </Layout>
  );
};

export default StudentLayout;
