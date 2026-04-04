import { Outlet } from 'react-router-dom';
import { Layout, Card, Typography } from 'antd';

const { Content } = Layout;
const { Title, Text } = Typography;

const AuthLayout: React.FC = () => {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      }}
    >
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <div style={{ width: 420, maxWidth: '100%' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
              }}
            >
              <span style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>C</span>
            </div>
            <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
              CRMPro
            </Title>
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>
              O'quv markaz boshqaruv tizimi
            </Text>
          </div>

          {/* Card */}
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            styles={{ body: { padding: '32px 32px 24px' } }}
          >
            <Outlet />
          </Card>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Text style={{ color: '#64748b', fontSize: 12 }}>
              CRMPro v2.0 — Professional Education CRM
            </Text>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
