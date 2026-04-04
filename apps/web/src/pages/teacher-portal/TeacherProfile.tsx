import { Card, Typography, Avatar, Descriptions, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../features/auth/hooks';

const { Title } = Typography;

const TeacherProfile: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Teacher';

  return (
    <>
      <Title level={3}><UserOutlined style={{ color: '#10b981', marginRight: 8 }} />Profilim</Title>
      <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', textAlign: 'center', marginBottom: 20 }}>
        <Avatar size={80} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', marginBottom: 16, fontSize: 32 }}>
          {displayName[0]}
        </Avatar>
        <Title level={4} style={{ margin: 0 }}>{displayName}</Title>
        <Tag color="green" style={{ marginTop: 8 }}>O'qituvchi</Tag>
      </Card>
      <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}>
        <Descriptions column={1} labelStyle={{ fontWeight: 600 }}>
          <Descriptions.Item label="Telefon">{user?.phone || '—'}</Descriptions.Item>
          <Descriptions.Item label="Rol">{user?.role}</Descriptions.Item>
        </Descriptions>
      </Card>
    </>
  );
};

export default TeacherProfile;
