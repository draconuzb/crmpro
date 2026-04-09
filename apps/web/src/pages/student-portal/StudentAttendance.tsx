import { Card, Table, Typography, Tag, Spin, Empty } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getMyStudentAttendance } from '../../features/me/api';

const { Title } = Typography;
const STATUS_MAP: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  PRESENT: { color: 'success', icon: <CheckCircleOutlined />, label: 'Keldi' },
  ABSENT: { color: 'error', icon: <CloseCircleOutlined />, label: 'Kelmadi' },
  LATE: { color: 'warning', icon: <ClockCircleOutlined />, label: 'Kechikdi' },
};

const StudentAttendance: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ['my-student-attendance'], queryFn: getMyStudentAttendance });
  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  return (
    <>
      <Title level={4} style={{ marginBottom: 20 }}><TrophyOutlined style={{ color: '#10b981', marginRight: 8 }} />Davomatim</Title>
      <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}>
        {!data || data.length === 0 ? <Empty description="Davomat hali yoq" /> : (
          <Table dataSource={data} rowKey="id" pagination={false} scroll={{ x: 400 }}
            columns={[
              { title: 'Sana', dataIndex: 'date', width: 110, render: (v: string) => new Date(v).toLocaleDateString() },
              { title: 'Guruh', render: (_: any, r: any) => r.group?.name },
              { title: 'Holat', dataIndex: 'status', width: 120,
                render: (v: string) => { const s = STATUS_MAP[v] || { color: 'default', label: v, icon: null }; return <Tag icon={s.icon} color={s.color}>{s.label}</Tag>; } },
            ]} />
        )}
      </Card>
    </>
  );
};

export default StudentAttendance;
