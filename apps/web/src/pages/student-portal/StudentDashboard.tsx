import { Card, Row, Col, Typography, Avatar, Space, Tag, List } from 'antd';
import {
  WalletOutlined, TrophyOutlined, CalendarOutlined,
  BookOutlined, ClockCircleOutlined, StarOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../features/auth/hooks';

const { Title, Text, Paragraph } = Typography;

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student';

  // TODO: Replace with real API calls
  const stats = {
    balance: 450000,
    coins: 120,
    groups: 2,
    attendanceRate: 92,
  };

  return (
    <>
      {/* Welcome Card */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none',
          borderRadius: 20,
          marginBottom: 20,
          color: '#fff',
        }}
        styles={{ body: { padding: '28px 24px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar
            size={56}
            src={user?.avatar}
            style={{ background: 'rgba(255,255,255,0.2)', fontSize: 24 }}
          >
            {displayName[0]}
          </Avatar>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              Assalomu alaykum, {displayName}!
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
              Bugungi darslaringizga tayyor bo'ling
            </Text>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { icon: <WalletOutlined />, label: 'Balans', value: `${stats.balance.toLocaleString()} UZS`, bg: '#eff6ff', color: '#3b82f6' },
          { icon: <StarOutlined />, label: 'Coinlar', value: `${stats.coins} coin`, bg: '#fef3c7', color: '#f59e0b' },
          { icon: <BookOutlined />, label: 'Guruhlar', value: `${stats.groups} ta`, bg: '#ede9fe', color: '#8b5cf6' },
          { icon: <TrophyOutlined />, label: 'Davomat', value: `${stats.attendanceRate}%`, bg: '#d1fae5', color: '#10b981' },
        ].map((item, i) => (
          <Col span={12} key={i}>
            <Card
              size="small"
              style={{ borderRadius: 16, border: 'none', background: item.bg }}
              styles={{ body: { padding: '16px' } }}
            >
              <div style={{ color: item.color, fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{item.value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{item.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Today's Schedule */}
      <Card
        title={
          <Space>
            <CalendarOutlined style={{ color: '#6366f1' }} />
            <span style={{ fontWeight: 600 }}>Bugungi darslar</span>
          </Space>
        }
        style={{ borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 20 }}
      >
        <List
          dataSource={[
            { time: '09:00 - 10:30', group: 'English B1', teacher: 'Ali Valiyev', room: 'Room 1' },
            { time: '14:00 - 15:30', group: 'Math Advanced', teacher: 'Olim Karimov', room: 'Room 3' },
          ]}
          renderItem={(item) => (
            <List.Item>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                <div
                  style={{
                    background: '#eff6ff',
                    borderRadius: 12,
                    padding: '8px 12px',
                    minWidth: 100,
                    textAlign: 'center',
                  }}
                >
                  <ClockCircleOutlined style={{ color: '#6366f1', marginRight: 4 }} />
                  <Text strong style={{ fontSize: 13 }}>{item.time}</Text>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.group}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {item.teacher} — {item.room}
                  </div>
                </div>
                <Tag color="blue">Bugun</Tag>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* Recent Grades */}
      <Card
        title={
          <Space>
            <BookOutlined style={{ color: '#8b5cf6' }} />
            <span style={{ fontWeight: 600 }}>So'nggi baholar</span>
          </Space>
        }
        style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}
      >
        <List
          dataSource={[
            { subject: 'English B1', grade: 85, date: '2026-04-03', max: 100 },
            { subject: 'Math Advanced', grade: 92, date: '2026-04-02', max: 100 },
            { subject: 'English B1', grade: 78, date: '2026-04-01', max: 100 },
          ]}
          renderItem={(item) => (
            <List.Item>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.subject}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.date}</div>
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: item.grade >= 85 ? '#10b981' : item.grade >= 70 ? '#f59e0b' : '#ef4444',
                  }}
                >
                  {item.grade}<span style={{ fontSize: 12, color: '#94a3b8' }}>/{item.max}</span>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </>
  );
};

export default StudentDashboard;
