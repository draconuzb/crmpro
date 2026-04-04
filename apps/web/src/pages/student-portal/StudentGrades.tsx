import { Card, Table, Typography, Tag } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const { Title } = Typography;

const grades = [
  { id: 1, date: '2026-04-03', group: 'English B1', score: 85, max: 100 },
  { id: 2, date: '2026-04-02', group: 'Math Advanced', score: 92, max: 100 },
  { id: 3, date: '2026-04-01', group: 'English B1', score: 78, max: 100 },
  { id: 4, date: '2026-03-28', group: 'Math Advanced', score: 88, max: 100 },
  { id: 5, date: '2026-03-27', group: 'English B1', score: 90, max: 100 },
];

const StudentGrades: React.FC = () => {
  return (
    <>
      <Title level={4} style={{ marginBottom: 20 }}>
        <BookOutlined style={{ color: '#8b5cf6', marginRight: 8 }} />
        Baholarim
      </Title>

      <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}>
        <Table
          dataSource={grades}
          rowKey="id"
          pagination={false}
          columns={[
            { title: 'Sana', dataIndex: 'date', width: 110 },
            { title: 'Guruh', dataIndex: 'group' },
            {
              title: 'Baho',
              dataIndex: 'score',
              width: 100,
              render: (score: number, record: any) => {
                const pct = (score / record.max) * 100;
                const color = pct >= 85 ? 'green' : pct >= 70 ? 'gold' : 'red';
                return <Tag color={color} style={{ fontSize: 14, fontWeight: 700 }}>{score}/{record.max}</Tag>;
              },
            },
          ]}
        />
      </Card>
    </>
  );
};

export default StudentGrades;
