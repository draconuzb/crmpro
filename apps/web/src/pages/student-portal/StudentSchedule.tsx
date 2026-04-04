import { Card, Typography, List, Tag, Empty } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Title } = Typography;

const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

// TODO: Replace with real API data
const schedule = [
  { day: 'Dushanba', time: '09:00 - 10:30', group: 'English B1', teacher: 'Ali Valiyev', room: 'Room 1' },
  { day: 'Dushanba', time: '14:00 - 15:30', group: 'Math Advanced', teacher: 'Olim Karimov', room: 'Room 3' },
  { day: 'Chorshanba', time: '09:00 - 10:30', group: 'English B1', teacher: 'Ali Valiyev', room: 'Room 1' },
  { day: 'Chorshanba', time: '14:00 - 15:30', group: 'Math Advanced', teacher: 'Olim Karimov', room: 'Room 3' },
  { day: 'Juma', time: '09:00 - 10:30', group: 'English B1', teacher: 'Ali Valiyev', room: 'Room 1' },
  { day: 'Juma', time: '14:00 - 15:30', group: 'Math Advanced', teacher: 'Olim Karimov', room: 'Room 3' },
];

const StudentSchedule: React.FC = () => {
  return (
    <>
      <Title level={4} style={{ marginBottom: 20 }}>
        <CalendarOutlined style={{ color: '#6366f1', marginRight: 8 }} />
        Dars jadvali
      </Title>

      {DAYS.map((day) => {
        const daySchedule = schedule.filter((s) => s.day === day);
        if (daySchedule.length === 0) return null;

        return (
          <Card
            key={day}
            size="small"
            title={<Tag color="blue" style={{ fontSize: 13, padding: '2px 12px' }}>{day}</Tag>}
            style={{ marginBottom: 12, borderRadius: 14, border: '1px solid #e2e8f0' }}
            styles={{ body: { padding: '8px 16px' } }}
          >
            <List
              dataSource={daySchedule}
              renderItem={(item) => (
                <List.Item style={{ padding: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                    <div style={{ color: '#6366f1', minWidth: 110 }}>
                      <ClockCircleOutlined style={{ marginRight: 6 }} />
                      <strong>{item.time}</strong>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{item.group}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{item.teacher}</div>
                    </div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>
                      <EnvironmentOutlined style={{ marginRight: 4 }} />
                      {item.room}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        );
      })}
    </>
  );
};

export default StudentSchedule;
