import { Card, Typography, List, Tag, Statistic, Row, Col } from 'antd';
import { WalletOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Title } = Typography;

const payments = [
  { id: 1, date: '2026-04-01', amount: 500000, type: 'payment', desc: "Aprel uchun to'lov" },
  { id: 2, date: '2026-03-15', amount: -50000, type: 'deduction', desc: 'Darslik uchun' },
  { id: 3, date: '2026-03-01', amount: 500000, type: 'payment', desc: "Mart uchun to'lov" },
];

const StudentBalance: React.FC = () => {
  return (
    <>
      <Title level={4} style={{ marginBottom: 20 }}>
        <WalletOutlined style={{ color: '#3b82f6', marginRight: 8 }} />
        Balansim
      </Title>

      <Row gutter={12} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Card style={{ borderRadius: 14, background: '#eff6ff', border: 'none' }}>
            <Statistic title="Joriy balans" value={450000} suffix="UZS" valueStyle={{ color: '#3b82f6', fontWeight: 700 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card style={{ borderRadius: 14, background: '#fef3c7', border: 'none' }}>
            <Statistic title="Coinlar" value={120} suffix="coin" valueStyle={{ color: '#f59e0b', fontWeight: 700 }} />
          </Card>
        </Col>
      </Row>

      <Card title="To'lov tarixi" style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}>
        <List
          dataSource={payments}
          renderItem={(item) => (
            <List.Item>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: item.amount > 0 ? '#d1fae5' : '#fee2e2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {item.amount > 0
                      ? <ArrowUpOutlined style={{ color: '#10b981' }} />
                      : <ArrowDownOutlined style={{ color: '#ef4444' }} />
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.desc}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.date}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: item.amount > 0 ? '#10b981' : '#ef4444' }}>
                  {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()} UZS
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </>
  );
};

export default StudentBalance;
