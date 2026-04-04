import { Card, Row, Col, Typography, Avatar, Tag, List, Spin, Empty } from 'antd';
import { WalletOutlined, TrophyOutlined, CalendarOutlined, BookOutlined, ClockCircleOutlined, StarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../features/auth/hooks';
import { getMyStudentDashboard } from '../../features/me/api';

const { Title, Text } = Typography;

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student';
  const { data, isLoading } = useQuery({ queryKey: ['my-student-dashboard'], queryFn: getMyStudentDashboard });

  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  const stats = data || { balance: 0, coins: 0, groups: 0, attendanceRate: 0, todaySchedule: [], recentGrades: [] };

  return (
    <>
      <Card style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 20, marginBottom: 20, color: '#fff' }}
        styles={{ body: { padding: '28px 24px' } }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar size={56} src={user?.avatar} style={{ background: 'rgba(255,255,255,0.2)', fontSize: 24 }}>{displayName[0]}</Avatar>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>Assalomu alaykum, {displayName}!</Title>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Bugungi darslaringizga tayyor bo'ling</Text>
          </div>
        </div>
      </Card>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { icon: <WalletOutlined />, label: 'Balans', value: `${Number(stats.balance).toLocaleString()} UZS`, bg: '#eff6ff', color: '#3b82f6' },
          { icon: <StarOutlined />, label: 'Coinlar', value: `${stats.coins} coin`, bg: '#fef3c7', color: '#f59e0b' },
          { icon: <BookOutlined />, label: 'Guruhlar', value: `${stats.groups} ta`, bg: '#ede9fe', color: '#8b5cf6' },
          { icon: <TrophyOutlined />, label: 'Davomat', value: `${stats.attendanceRate}%`, bg: '#d1fae5', color: '#10b981' },
        ].map((item, i) => (
          <Col span={12} key={i}>
            <Card size="small" style={{ borderRadius: 16, border: 'none', background: item.bg }} styles={{ body: { padding: 16 } }}>
              <div style={{ color: item.color, fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{item.value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{item.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title={<><CalendarOutlined style={{ color: '#6366f1', marginRight: 8 }} />Bugungi darslar</>}
        style={{ borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 20 }}>
        {stats.todaySchedule.length === 0 ? <Empty description="Bugun dars yo'q" /> : (
          <List dataSource={stats.todaySchedule} renderItem={(item: any) => (
            <List.Item>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                <div style={{ background: '#eff6ff', borderRadius: 12, padding: '8px 12px', minWidth: 100, textAlign: 'center' }}>
                  <ClockCircleOutlined style={{ color: '#6366f1', marginRight: 4 }} />
                  <Text strong style={{ fontSize: 13 }}>{item.time}</Text>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.group}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{item.teacher} — {item.room}</div>
                </div>
              </div>
            </List.Item>
          )} />
        )}
      </Card>

      <Card title={<><BookOutlined style={{ color: '#8b5cf6', marginRight: 8 }} />So'nggi baholar</>}
        style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}>
        {stats.recentGrades.length === 0 ? <Empty description="Baholar hali yo'q" /> : (
          <List dataSource={stats.recentGrades} renderItem={(item: any) => (
            <List.Item>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.subject}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.date}</div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: item.grade >= 85 ? '#10b981' : item.grade >= 70 ? '#f59e0b' : '#ef4444' }}>
                  {item.grade}<span style={{ fontSize: 12, color: '#94a3b8' }}>/{item.max}</span>
                </div>
              </div>
            </List.Item>
          )} />
        )}
      </Card>
    </>
  );
};

export default StudentDashboard;
