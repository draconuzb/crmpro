import { Card, Table, Typography, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title } = Typography;

const data = [
  { id: 1, date: '2026-04-04', group: 'English B1', status: 'PRESENT' },
  { id: 2, date: '2026-04-04', group: 'Math Advanced', status: 'PRESENT' },
  { id: 3, date: '2026-04-02', group: 'English B1', status: 'LATE' },
  { id: 4, date: '2026-04-02', group: 'Math Advanced', status: 'PRESENT' },
  { id: 5, date: '2026-03-31', group: 'English B1', status: 'ABSENT' },
  { id: 6, date: '2026-03-31', group: 'Math Advanced', status: 'PRESENT' },
];

const STATUS_MAP: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  PRESENT: { color: 'success', icon: <CheckCircleOutlined />, label: 'Keldi' },
  ABSENT: { color: 'error', icon: <CloseCircleOutlined />, label: 'Kelmadi' },
  LATE: { color: 'warning', icon: <ClockCircleOutlined />, label: 'Kechikdi' },
};

const StudentAttendance: React.FC = () => {
  return (
    <>
      <Title level={4} style={{ marginBottom: 20 }}>
        <TrophyOutlined style={{ color: '#10b981', marginRight: 8 }} />
        Davomatim
      </Title>

      <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}>
        <Table
          dataSource={data}
          rowKey="id"
          pagination={false}
          columns={[
            { title: 'Sana', dataIndex: 'date', width: 110 },
            { title: 'Guruh', dataIndex: 'group' },
            {
              title: 'Holat',
              dataIndex: 'status',
              width: 120,
              render: (status: string) => {
                const s = STATUS_MAP[status];
                return <Tag icon={s.icon} color={s.color}>{s.label}</Tag>;
              },
            },
          ]}
        />
      </Card>
    </>
  );
};

export default StudentAttendance;
