import { Card, Typography, Statistic, Row, Col } from 'antd';
import { DollarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const TeacherSalary: React.FC = () => (
  <>
    <Title level={3}><DollarOutlined style={{ color: '#f59e0b', marginRight: 8 }} />Oyligim</Title>
    <Row gutter={16} style={{ marginBottom: 20 }}>
      <Col span={12}>
        <Card style={{ borderRadius: 14, background: '#d1fae5', border: 'none' }}>
          <Statistic title="Bu oy" value={3500000} suffix="UZS" valueStyle={{ color: '#10b981' }} />
        </Card>
      </Col>
      <Col span={12}>
        <Card style={{ borderRadius: 14, background: '#eff6ff', border: 'none' }}>
          <Statistic title="O'tgan oy" value={3200000} suffix="UZS" valueStyle={{ color: '#3b82f6' }} />
        </Card>
      </Col>
    </Row>
    <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}>
      <p>Oylik tafsilotlari — API ulanganidan keyin to'ldiriladi.</p>
    </Card>
  </>
);

export default TeacherSalary;
