import { Card, Table, Typography, Tag, Spin, Empty } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getMyStudentGrades } from '../../features/me/api';

const { Title } = Typography;

const StudentGrades: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ['my-student-grades'], queryFn: getMyStudentGrades });
  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  return (
    <>
      <Title level={4} style={{ marginBottom: 20 }}><BookOutlined style={{ color: '#8b5cf6', marginRight: 8 }} />Baholarim</Title>
      <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}>
        {!data || data.length === 0 ? <Empty description="Baholar hali yoq" /> : (
          <Table dataSource={data} rowKey="id" pagination={false} scroll={{ x: 400 }}
            columns={[
              { title: 'Sana', dataIndex: 'date', width: 110, render: (v: string) => new Date(v).toLocaleDateString() },
              { title: 'Guruh', render: (_: any, r: any) => r.group?.course?.name || r.group?.name },
              { title: 'Baho', dataIndex: 'score', width: 80,
                render: (v: number) => <Tag color={v >= 85 ? 'green' : v >= 70 ? 'gold' : 'red'} style={{ fontWeight: 700 }}>{v}</Tag> },
            ]} />
        )}
      </Card>
    </>
  );
};

export default StudentGrades;
