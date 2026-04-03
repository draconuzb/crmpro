import { Outlet } from 'react-router-dom';
import { Layout, Card, Typography } from 'antd';

const { Content } = Layout;
const { Title } = Typography;

const AuthLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Card style={{ width: 400, maxWidth: '100%' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
            Modme CRM
          </Title>
          <Outlet />
        </Card>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
