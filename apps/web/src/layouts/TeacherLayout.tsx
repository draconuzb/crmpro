import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Button, Drawer } from 'antd';
import {
  DashboardOutlined, AppstoreOutlined, CheckSquareOutlined, BookOutlined,
  CalendarOutlined, DollarOutlined, UserOutlined, LogoutOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, MenuOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '../features/auth/hooks';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;
const BREAKPOINT = 768;

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINT);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setDrawerOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Teacher';
  const userMenuItems: MenuProps['items'] = [
    { key: 'logout', icon: <LogoutOutlined />, label: 'Chiqish', danger: true, onClick: () => logout() },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('/')) { navigate(key); if (isMobile) setDrawerOpen(false); }
  };

  const siderContent = (
    <>
      <div style={{
        height: 64, display: 'flex', alignItems: 'center',
        justifyContent: isMobile || !collapsed ? 'flex-start' : 'center',
        padding: isMobile || !collapsed ? '0 20px' : 0, gap: 10,
        borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 8,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>T</span>
        </div>
        {(isMobile || !collapsed) && (
          <div>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>CRMPro</div>
            <div style={{ color: '#64748b', fontSize: 11 }}>O'qituvchi</div>
          </div>
        )}
      </div>
      <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={TEACHER_MENU}
        onClick={handleMenuClick} style={{ background: 'transparent', border: 'none' }} />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider collapsed={collapsed} theme="dark" width={240} collapsedWidth={72} trigger={null}
          style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, background: '#0f172a' }}>
          {siderContent}
          <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, padding: '0 16px' }}>
            <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)} style={{ color: '#64748b', width: '100%' }} />
          </div>
        </Sider>
      )}
      {isMobile && (
        <Drawer placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={260}
          styles={{ body: { padding: 0, background: '#0f172a' }, header: { display: 'none' } }}>
          <div style={{ background: '#0f172a', minHeight: '100%' }}>{siderContent}</div>
        </Drawer>
      )}
      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 72 : 240), transition: 'margin-left 0.2s', background: '#f8fafc' }}>
        <Header style={{
          background: '#fff', padding: isMobile ? '0 12px' : '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10, height: isMobile ? 56 : 60,
        }}>
          <Space>
            {isMobile && <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} style={{ color: '#475569' }} />}
            <Text strong style={{ fontSize: isMobile ? 14 : 16, color: '#0f172a' }}>
              {(TEACHER_MENU.find((m: any) => m?.key === location.pathname) as any)?.label || 'Dashboard'}
            </Text>
          </Space>
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar src={user?.avatar} icon={!user?.avatar ? <UserOutlined /> : undefined}
                size={isMobile ? 32 : 36} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} />
              {!isMobile && <Text strong>{displayName}</Text>}
            </Space>
          </Dropdown>
        </Header>
        <Content style={{
          margin: isMobile ? '12px 8px' : 24, padding: isMobile ? 16 : 28,
          background: '#fff', borderRadius: isMobile ? 12 : 16,
          minHeight: 'calc(100vh - 60px - 48px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherLayout;
