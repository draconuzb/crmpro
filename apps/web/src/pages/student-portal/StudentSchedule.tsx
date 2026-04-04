import { Card, Typography, Tag, Spin, Empty } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getMyStudentSchedule } from '../../features/me/api';

const { Title } = Typography;

const StudentSchedule: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ['my-student-schedule'], queryFn: getMyStudentSchedule });
  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;
  if (!data || data.length === 0) return <Empty description="Jadval topilmadi" />;

  return (
    <>
      <Title level={4} style={{ marginBottom: 20 }}><CalendarOutlined style={{ color: '#6366f1', marginRight: 8 }} />Dars jadvali</Title>
      {data.map((item: any, i: number) => (
        <Card key={i} size="small" style={{ marginBottom: 12, borderRadius: 14, border: '1px solid #e2e8f0' }}
          styles={{ body: { padding: '12px 16px' } }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ color: '#6366f1', minWidth: 110 }}>
              <ClockCircleOutlined style={{ marginRight: 6 }} />
              <strong>{item.startTime} - {item.endTime}</strong>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontWeight: 600 }}>{item.groupName}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{item.teacher}</div>
            </div>
            <div>
              <Tag color="blue">{item.dayType}</Tag>
              {item.room && <span style={{ fontSize: 11, color: '#94a3b8' }}><EnvironmentOutlined /> {item.room}</span>}
            </div>
          </div>
        </Card>
      ))}
    </>
  );
};

export default StudentSchedule;
