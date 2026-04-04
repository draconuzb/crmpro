import { Card, Table, Typography, Button, Tag, Space } from 'antd';
import { CheckSquareOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title } = Typography;

const students = [
  { id: 1, name: 'Alisher Navoiy', phone: '+998901111111', status: 'ACTIVE' },
  { id: 2, name: 'Bobur Mirzo', phone: '+998902222222', status: 'ACTIVE' },
  { id: 3, name: 'Nodira Begim', phone: '+998903333333', status: 'ACTIVE' },
];

const TeacherGroupDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <Space style={{ marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/t/groups')} />
        <Title level={3} style={{ margin: 0 }}>English B1 — Guruh #{id}</Title>
      </Space>

      <Card
        title="O'quvchilar ro'yxati"
        style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}
        extra={<Button type="primary" icon={<CheckSquareOutlined />}>Davomat olish</Button>}
      >
        <Table
          dataSource={students}
          rowKey="id"
          pagination={false}
          columns={[
            { title: 'Ism', dataIndex: 'name' },
            { title: 'Telefon', dataIndex: 'phone' },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (v: string) => <Tag color="green">{v}</Tag>,
            },
          ]}
        />
      </Card>
    </>
  );
};

export default TeacherGroupDetail;
