import { Card, Row, Col, Typography, Button, Tag } from 'antd';
import { ShopOutlined, StarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const products = [
  { id: 1, name: 'Darslik', price: 50, image: null, stock: 10, description: 'Ingliz tili darsligi' },
  { id: 2, name: 'Ruchka to\'plami', price: 15, image: null, stock: 25, description: '5 ta gel ruchka' },
  { id: 3, name: 'Stiker paket', price: 10, image: null, stock: 50, description: 'CRMPro stikerlar' },
  { id: 4, name: 'Bosh kiyim', price: 100, image: null, stock: 5, description: 'CRMPro kepka' },
];

const StudentShop: React.FC = () => {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>
          <ShopOutlined style={{ color: '#f59e0b', marginRight: 8 }} />
          Coin Do'kon
        </Title>
        <Tag color="gold" style={{ fontSize: 14, padding: '4px 12px' }}>
          <StarOutlined /> 120 coin
        </Tag>
      </div>

      <Row gutter={[12, 12]}>
        {products.map((p) => (
          <Col xs={12} sm={12} key={p.id}>
            <Card
              style={{ borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}
              styles={{ body: { padding: 16 } }}
              cover={
                <div
                  style={{
                    height: 120,
                    background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 40,
                  }}
                >
                  <ShopOutlined style={{ color: '#94a3b8' }} />
                </div>
              }
            >
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>{p.description}</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <Tag color="gold"><StarOutlined /> {p.price} coin</Tag>
                <Button type="primary" size="small" style={{ borderRadius: 8 }}>
                  Olish
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default StudentShop;
