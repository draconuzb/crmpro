import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Drawer } from 'antd';
import Sidebar from './components/Sidebar';
import HeaderBar from './components/Header';

const { Content, Sider } = Layout;

const BREAKPOINT = 768;

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINT);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setDrawerOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleToggle = () => {
    if (isMobile) {
      setDrawerOpen(!drawerOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleNavigate = () => {
    if (isMobile) setDrawerOpen(false);
  };

  const siderWidth = collapsed ? 72 : 260;

  const siderContent = (
    <>
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile || !collapsed ? 'flex-start' : 'center',
          padding: isMobile || !collapsed ? '0 20px' : 0,
          gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>C</span>
        </div>
        {(isMobile || !collapsed) && (
          <div>
            <div style={{ color: '#fff', fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>CRMPro</div>
            <div style={{ color: '#64748b', fontSize: 11, lineHeight: 1.2 }}>Education CRM</div>
          </div>
        )}
      </div>
      <Sidebar collapsed={isMobile ? false : collapsed} onCollapse={setCollapsed} onNavigate={handleNavigate} />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sider */}
      {!isMobile && (
        <Sider
          collapsed={collapsed}
          theme="dark"
          width={260}
          collapsedWidth={72}
          trigger={null}
          style={{
            overflow: 'auto', height: '100vh', position: 'fixed',
            left: 0, top: 0, bottom: 0,
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {siderContent}
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={280}
          closable={false}
          styles={{ body: { padding: 0, background: '#0f172a' } }}
        >
          <div style={{ background: '#0f172a', minHeight: '100%' }}>
            {siderContent}
          </div>
        </Drawer>
      )}

      <Layout
        style={{
          marginLeft: isMobile ? 0 : siderWidth,
          transition: 'margin-left 0.2s cubic-bezier(0.2, 0, 0, 1)',
          background: '#f8fafc',
        }}
      >
        <HeaderBar collapsed={collapsed} onToggle={handleToggle} isMobile={isMobile} />
        <Content
          style={{
            margin: isMobile ? '12px 8px' : '24px 24px',
            padding: isMobile ? 16 : 28,
            background: '#fff',
            borderRadius: isMobile ? 12 : 16,
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
