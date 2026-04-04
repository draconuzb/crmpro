import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import HeaderBar from './components/Header';

const { Content, Sider } = Layout;

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={260}
        collapsedWidth={72}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
        trigger={null}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 20px',
            gap: 12,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>C</span>
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: '#fff', fontSize: 17, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.3px' }}>
                CRMPro
              </div>
              <div style={{ color: '#64748b', fontSize: 11, lineHeight: 1.2 }}>Education CRM</div>
            </div>
          )}
        </div>
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 72 : 260,
          transition: 'margin-left 0.2s cubic-bezier(0.2, 0, 0, 1)',
          background: '#f8fafc',
        }}
      >
        <HeaderBar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <Content
          style={{
            margin: '24px 24px 24px',
            padding: 28,
            background: '#fff',
            borderRadius: 16,
            minHeight: 'calc(100vh - 64px - 48px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
