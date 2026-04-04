import { Card, Typography } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const { Title } = Typography;

const TeacherGrades: React.FC = () => (
  <>
    <Title level={3}><BookOutlined style={{ color: '#8b5cf6', marginRight: 8 }} />Baho qo'yish</Title>
    <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}>
      <p>Baho sahifasi — API ulanganidan keyin to'ldiriladi.</p>
    </Card>
  </>
);

export default TeacherGrades;
