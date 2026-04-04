import { Card, Typography, Avatar, Descriptions, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../features/auth/hooks';

const { Title } = Typography;

const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student';

  return (
    <>
      <Title level={4} style={{ marginBottom: 20 }}>
        <UserOutlined style={{ color: '#6366f1', marginRight: 8 }} />
        Profilim
      </Title>

      <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', textAlign: 'center', marginBottom: 20 }}>
        <Avatar
          size={80}
          src={user?.avatar}
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', marginBottom: 16, fontSize: 32 }}
        >
          {displayName[0]}
        </Avatar>
        <Title level={4} style={{ margin: 0 }}>{displayName}</Title>
        <Tag color="blue" style={{ marginTop: 8 }}>O'quvchi</Tag>
      </Card>

      <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}>
        <Descriptions column={1} labelStyle={{ fontWeight: 600, color: '#475569' }}>
          <Descriptions.Item label="Telefon">{user?.phone || '—'}</Descriptions.Item>
          <Descriptions.Item label="Rol">{user?.role}</Descriptions.Item>
          <Descriptions.Item label="ID">{user?.id}</Descriptions.Item>
        </Descriptions>
      </Card>
    </>
  );
};

export default StudentProfile;
