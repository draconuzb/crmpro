import { Card, Typography, Tag } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const TeacherSchedule: React.FC = () => (
  <>
    <Title level={3}><CalendarOutlined style={{ color: '#3b82f6', marginRight: 8 }} />Dars jadvalim</Title>
    <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}>
      <p>Jadval sahifasi — API ulanganidan keyin to'ldiriladi.</p>
    </Card>
  </>
);

export default TeacherSchedule;
