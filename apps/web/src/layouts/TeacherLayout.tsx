import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Button } from 'antd';
import {
  DashboardOutlined, AppstoreOutlined, CheckSquareOutlined, BookOutlined,
  CalendarOutlined, DollarOutlined, UserOutlined, LogoutOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '../features/auth/hooks';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const TEACHER_MENU: MenuProps['items'] = [
  { key: '/t/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/t/groups', icon: <AppstoreOutlined />, label: 'Guruhlarim' },
  { key: '/t/attendance', icon: <CheckSquareOutlined />, label: 'Davomat' },
  { key: '/t/grades', icon: <BookOutlined />, label: 'Baholar' },
  { key: '/t/schedule', icon: <CalendarOutlined />, label: 'Jadval' },
  { key: '/t/salary', icon: <DollarOutlined />, label: 'Oyligim' },
  { type: 'divider' },
  { key: '/t/profile', icon: <UserOutlined />, label: 'Profilim' },
];

const TeacherLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Teacher';

  const userMenuItems: MenuProps['items'] = [
    { key: 'logout', icon: <LogoutOutlined />, label: 'Chiqish', danger: true, onClick: () => logout() },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={240}
        collapsedWidth={72}
        trigger={null}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#0f172a',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 20px',
            gap: 10,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>T</span>
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>CRMPro</div>
              <div style={{ color: '#64748b', fontSize: 11 }}>O'qituvchi</div>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={TEACHER_MENU}
          onClick={({ key }) => key.startsWith('/') && navigate(key)}
          style={{ background: 'transparent', border: 'none' }}
        />

        <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, padding: '0 16px' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: '#64748b', width: '100%' }}
          />
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 72 : 240, transition: 'margin-left 0.2s', background: '#f8fafc' }}>
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
            height: 60,
          }}
        >
          <Text strong style={{ fontSize: 16, color: '#0f172a' }}>
            {TEACHER_MENU.find((m: any) => m?.key === location.pathname)?.label || 'Dashboard'}
          </Text>

          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                src={user?.avatar}
                icon={!user?.avatar ? <UserOutlined /> : undefined}
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              />
              <Text strong>{displayName}</Text>
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 28,
            background: '#fff',
            borderRadius: 16,
            minHeight: 'calc(100vh - 60px - 48px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherLayout;
