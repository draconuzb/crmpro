import { useState } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag, Space,
  Popconfirm, Typography, Breadcrumb, Row, Col, Statistic,
} from 'antd';
import { PlusOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProblems, createProblem, updateProblem, deleteProblem, getProblemStats } from '../../features/problems/api';

const { Title } = Typography;

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  open: { color: 'error', label: 'Ochiq' },
  in_progress: { color: 'processing', label: 'Jarayonda' },
  resolved: { color: 'success', label: 'Hal qilindi' },
};

const TYPES = [
  { value: 'equipment', label: 'Jihozlar' },
  { value: 'facility', label: 'Bino' },
  { value: 'staff', label: 'Xodimlar' },
  { value: 'student', label: "O'quvchilar" },
  { value: 'finance', label: 'Moliya' },
  { value: 'other', label: 'Boshqa' },
];

const ProblemsPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['problems'], queryFn: () => getProblems() });
  const { data: stats } = useQuery({ queryKey: ['problem-stats'], queryFn: getProblemStats });

  const createMut = useMutation({
    mutationFn: createProblem,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['problem'] }); setModalOpen(false); form.resetFields(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, dto }: any) => updateProblem(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['problem'] }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteProblem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['problem'] }),
  });

  const openCount = stats?.byStatus?.find((s: any) => s.status === 'open')?._count || 0;
  const resolvedCount = stats?.byStatus?.find((s: any) => s.status === 'resolved')?._count || 0;

  return (
    <>
      <Breadcrumb items={[{ title: 'Muammolar' }]} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}><WarningOutlined /> Muammolar</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Muammo qo'shish
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}><Card><Statistic title="Ochiq" value={openCount} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="Hal qilindi" value={resolvedCount} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="Jami" value={data?.total || 0} /></Card></Col>
      </Row>

      <Card>
        <Table
          loading={isLoading}
          dataSource={data?.data || []}
          rowKey="id"
          columns={[
            {
              title: 'Turi', dataIndex: 'type',
              render: (v: string) => TYPES.find((t) => t.value === v)?.label || v,
            },
            { title: 'Muammo', dataIndex: 'issue' },
            {
              title: 'Status', dataIndex: 'status',
              render: (v: string) => <Tag color={STATUS_MAP[v]?.color}>{STATUS_MAP[v]?.label || v}</Tag>,
            },
            { title: 'Sana', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleDateString() },
            {
              title: '', width: 140,
              render: (_: any, record: any) => (
                <Space>
                  {record.status === 'open' && (
                    <Button size="small" onClick={() => updateMut.mutate({ id: record.id, dto: { status: 'in_progress' } })}>
                      Boshlash
                    </Button>
                  )}
                  {record.status === 'in_progress' && (
                    <Button size="small" type="primary" onClick={() => updateMut.mutate({ id: record.id, dto: { status: 'resolved' } })}>
                      Hal qilish
                    </Button>
                  )}
                  <Popconfirm title="O'chirilsinmi?" onConfirm={() => deleteMut.mutate(record.id)}>
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Yangi muammo"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createMut.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(v) => createMut.mutate(v)}>
          <Form.Item name="type" label="Turi" rules={[{ required: true }]}>
            <Select options={TYPES} placeholder="Tanlang" />
          </Form.Item>
          <Form.Item name="issue" label="Muammo" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ProblemsPage;
