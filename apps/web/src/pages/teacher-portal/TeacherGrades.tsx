import { useState } from 'react';
import { Typography, Spin, Empty, Select, Table, Button, InputNumber, message, Tag } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

const { Title, Text } = Typography;

const TeacherGrades: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [grades, setGrades] = useState<Record<number, number>>({});

  const { data: groups, isLoading } = useQuery({
    queryKey: ['teacher-groups'],
    queryFn: () => api.get('/me/teacher/groups').then(r => r.data),
  });

  const { data: groupDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['teacher-group-detail', selectedGroup],
    queryFn: () => api.get(`/me/teacher/groups/${selectedGroup}`).then(r => r.data),
    enabled: !!selectedGroup,
  });

  const saveMutation = useMutation({
    mutationFn: (data: { groupId: number; grades: { studentId: number; score: number }[] }) =>
      api.post('/grades/bulk', data).then(r => r.data),
    onSuccess: () => {
      message.success("Baholar saqlandi");
      setGrades({});
      queryClient.invalidateQueries({ queryKey: ['teacher-group-detail', selectedGroup] });
    },
    onError: () => message.error('Xatolik yuz berdi'),
  });

  const handleSave = () => {
    if (!selectedGroup) return;
    const entries = Object.entries(grades)
      .filter(([, score]) => score > 0)
      .map(([studentId, score]) => ({ studentId: Number(studentId), score }));
    if (!entries.length) { message.warning("Kamida bitta baho kiriting"); return; }
    saveMutation.mutate({ groupId: selectedGroup, grades: entries });
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  const students = groupDetail?.students || [];

  return (
    <div>
      <Title level={3}><BookOutlined style={{ color: '#8b5cf6', marginRight: 8 }} />Baho qo'yish</Title>
      <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
        Guruhni tanlang va o'quvchilarga baho qo'ying
      </Text>

      <Select
        placeholder="Guruhni tanlang"
        style={{ width: 300, marginBottom: 20 }}
        value={selectedGroup}
        onChange={setSelectedGroup}
        options={(groups || []).map((g: any) => ({
          value: g.id,
          label: `${g.name} (${g.course?.name || ''})`,
        }))}
      />

      {!selectedGroup ? (
        <Empty description="Guruh tanlang" />
      ) : detailLoading ? (
        <Spin />
      ) : !students.length ? (
        <Empty description="Bu guruhda o'quvchi yo'q" />
      ) : (
        <>
          <Table
            dataSource={students}
            rowKey={(r: any) => r.student?.id || r.id}
            pagination={false}
            columns={[
              {
                title: "O'quvchi",
                render: (_: any, r: any) => (
                  <Text strong>{r.student?.user?.firstName} {r.student?.user?.lastName || ''}</Text>
                ),
              },
              {
                title: 'Holat',
                dataIndex: ['student', 'status'],
                width: 80,
                render: () => <Tag color="green">Faol</Tag>,
              },
              {
                title: 'Baho (0-100)',
                width: 140,
                render: (_: any, r: any) => (
                  <InputNumber
                    min={0}
                    max={100}
                    value={grades[r.student?.id]}
                    onChange={(v) => setGrades(prev => ({ ...prev, [r.student?.id]: v || 0 }))}
                    style={{ width: 100 }}
                    placeholder="0-100"
                  />
                ),
              },
            ]}
          />
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button type="primary" onClick={handleSave} loading={saveMutation.isPending}>
              Baholarni saqlash
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherGrades;
