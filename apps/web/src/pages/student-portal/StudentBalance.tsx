import { Card, Typography, List, Statistic, Row, Col, Spin, Empty } from 'antd';
import { WalletOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getMyStudentPayments } from '../../features/me/api';

const { Title } = Typography;

const StudentBalance: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ['my-student-payments'], queryFn: getMyStudentPayments });
  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;
  const info = data || { balance: 0, coins: 0, payments: [] };

  return (
    <>
      <Title level={4} style={{ marginBottom: 20 }}><WalletOutlined style={{ color: '#3b82f6', marginRight: 8 }} />Balansim</Title>
      <Row gutter={12} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Card style={{ borderRadius: 14, background: '#eff6ff', border: 'none' }}>
            <Statistic title="Joriy balans" value={info.balance} suffix="UZS" valueStyle={{ color: '#3b82f6', fontWeight: 700 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card style={{ borderRadius: 14, background: '#fef3c7', border: 'none' }}>
            <Statistic title="Coinlar" value={info.coins} suffix="coin" valueStyle={{ color: '#f59e0b', fontWeight: 700 }} />
          </Card>
        </Col>
      </Row>
      <Card title="Tolov tarixi" style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}>
        {info.payments.length === 0 ? <Empty description="Tolovlar yoq" /> : (
          <List dataSource={info.payments} renderItem={(item: any) => (
            <List.Item>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowUpOutlined style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.description || item.method}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(item.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#10b981' }}>+{Number(item.amount).toLocaleString()} UZS</div>
              </div>
            </List.Item>
          )} />
        )}
      </Card>
    </>
  );
};

export default StudentBalance;
