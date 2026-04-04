import { Card, Row, Col, Typography, List, Tag, Statistic, Space } from 'antd';
import {
  AppstoreOutlined, CheckSquareOutlined, DollarOutlined,
  CalendarOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../features/auth/hooks';

const { Title, Text } = Typography;

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Teacher';

  // TODO: Real API calls
  const stats = { groups: 4, todayLessons: 3, avgAttendance: 89, salary: 3500000 };

  return (
    <>
      <Title level={3} style={{ marginBottom: 4 }}>Xush kelibsiz, {displayName}!</Title>
      <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>Bugungi ko'rsatkichlar</Text>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Guruhlarim', value: stats.groups, icon: <AppstoreOutlined />, bg: '#ede9fe', color: '#8b5cf6' },
          { title: 'Bugungi darslar', value: stats.todayLessons, icon: <CalendarOutlined />, bg: '#dbeafe', color: '#3b82f6' },
          { title: "O'rtacha davomat", value: `${stats.avgAttendance}%`, icon: <CheckSquareOutlined />, bg: '#d1fae5', color: '#10b981' },
          { title: 'Oylik', value: `${(stats.salary / 1000000).toFixed(1)}M`, icon: <DollarOutlined />, bg: '#fef3c7', color: '#f59e0b' },
        ].map((item, i) => (
          <Col xs={12} md={6} key={i}>
            <Card size="small" style={{ borderRadius: 14, background: item.bg, border: 'none' }}>
              <div style={{ color: item.color, fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{item.value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{item.title}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={<Space><CalendarOutlined style={{ color: '#3b82f6' }} /><span>Bugungi jadval</span></Space>}
        style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}
      >
        <List
          dataSource={[
            { time: '09:00 - 10:30', group: 'English B1', room: 'Room 1', students: 15 },
            { time: '11:00 - 12:30', group: 'English A2', room: 'Room 2', students: 12 },
            { time: '14:00 - 15:30', group: 'English B2', room: 'Room 1', students: 10 },
          ]}
          renderItem={(item) => (
            <List.Item>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                <div style={{ background: '#eff6ff', borderRadius: 10, padding: '6px 12px', minWidth: 110, textAlign: 'center' }}>
                  <ClockCircleOutlined style={{ color: '#3b82f6', marginRight: 4 }} />
                  <strong>{item.time}</strong>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.group}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{item.room}</div>
                </div>
                <Tag>{item.students} o'quvchi</Tag>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </>
  );
};

export default TeacherDashboard;
