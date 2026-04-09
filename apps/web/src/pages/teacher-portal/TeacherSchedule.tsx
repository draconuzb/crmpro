import { Card, Typography, Spin, Empty, Tag } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

const { Title, Text } = Typography;

const DAY_LABELS: Record<string, string> = {
  ODD: 'Toq kunlar (Du/Chor/Ju)',
  EVEN: 'Juft kunlar (Se/Pay/Sha)',
  OTHER: 'Boshqa kunlar',
};

const TeacherSchedule: React.FC = () => {
  const { data: groups, isLoading } = useQuery({
    queryKey: ['teacher-groups'],
    queryFn: () => api.get('/me/teacher/groups').then(r => r.data),
  });

  if (isLoading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;
  if (!groups?.length) return <Empty description="Guruhlar topilmadi" />;

  const byDay: Record<string, any[]> = {};
  (groups || []).forEach((g: any) => {
    const key = g.dayType || 'OTHER';
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(g);
  });

  return (
    <div>
      <Title level={3}><CalendarOutlined style={{ color: '#3b82f6', marginRight: 8 }} />Dars jadvalim</Title>
      <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
        Barcha guruhlaringiz va dars vaqtlari
      </Text>

      {Object.entries(byDay).map(([dayType, dayGroups]) => (
        <div key={dayType} style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 12 }}>{DAY_LABELS[dayType] || dayType}</Title>
          {dayGroups
            .sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''))
            .map((g: any) => (
              <Card key={g.id} size="small" style={{ marginBottom: 8, borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <Text strong style={{ fontSize: 15 }}>{g.name}</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag color="blue">{g.course?.name}</Tag>
                      {g.room && <Tag>{g.room.name}</Tag>}
                      <Tag color="green">{g._count?.students || 0} o'quvchi</Tag>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text strong style={{ fontSize: 16 }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />{g.startTime} — {g.endTime}
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      ))}
    </div>
  );
};

export default TeacherSchedule;
