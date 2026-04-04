import { Card, Row, Col, Typography, Tag, Space } from 'antd';
import { AppstoreOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const groups = [
  { id: 1, name: 'English B1', students: 15, schedule: 'Dush, Chor, Jum — 09:00', room: 'Room 1', status: 'ACTIVE' },
  { id: 2, name: 'English A2', students: 12, schedule: 'Dush, Chor, Jum — 11:00', room: 'Room 2', status: 'ACTIVE' },
  { id: 3, name: 'English B2', students: 10, schedule: 'Sesh, Pay, Shan — 14:00', room: 'Room 1', status: 'ACTIVE' },
  { id: 4, name: 'IELTS Prep', students: 8, schedule: 'Sesh, Pay, Shan — 16:00', room: 'Room 3', status: 'ACTIVE' },
];

const TeacherGroups: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Title level={3} style={{ marginBottom: 20 }}>
        <AppstoreOutlined style={{ color: '#8b5cf6', marginRight: 8 }} />
        Guruhlarim
      </Title>

      <Row gutter={[16, 16]}>
        {groups.map((g) => (
          <Col xs={24} sm={12} key={g.id}>
            <Card
              hoverable
              style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}
              onClick={() => navigate(`/t/groups/${g.id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Title level={5} style={{ margin: 0 }}>{g.name}</Title>
                <Tag color="green">{g.status}</Tag>
              </div>
              <Space direction="vertical" size={4}>
                <Text><UserOutlined style={{ color: '#6366f1', marginRight: 6 }} />{g.students} o'quvchi</Text>
                <Text><ClockCircleOutlined style={{ color: '#f59e0b', marginRight: 6 }} />{g.schedule}</Text>
                <Text type="secondary">{g.room}</Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default TeacherGroups;
