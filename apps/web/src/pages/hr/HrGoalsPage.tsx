import { useState } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag, Space,
  Popconfirm, Typography, Breadcrumb,
} from 'antd';
import { PlusOutlined, DeleteOutlined, CheckOutlined, AimOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHrGoals, createHrGoal, updateHrGoal, deleteHrGoal } from '../../features/hr/api';

const { Title } = Typography;

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending: { color: 'default', label: 'Kutilmoqda' },
  in_progress: { color: 'processing', label: 'Jarayonda' },
  completed: { color: 'success', label: 'Bajarildi' },
  cancelled: { color: 'error', label: 'Bekor' },
};

const HrGoalsPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({ queryKey: ['hr-goals'], queryFn: () => getHrGoals() });

  const createMut = useMutation({
    mutationFn: createHrGoal,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hr-goals'] }); setModalOpen(false); form.resetFields(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, dto }: any) => updateHrGoal(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr-goals'] }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteHrGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr-goals'] }),
  });

  return (
    <>
      <Breadcrumb items={[{ title: 'HR' }, { title: 'Maqsadlar' }]} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}><AimOutlined /> Maqsadlar</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Maqsad qo'shish
        </Button>
      </div>

      <Card>
        <Table
          loading={isLoading}
          dataSource={goals || []}
          rowKey="id"
          columns={[
            { title: 'Sarlavha', dataIndex: 'title' },
            { title: 'Kategoriya', dataIndex: 'category' },
            { title: 'Muddat', dataIndex: 'deadline', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
            {
              title: 'Status', dataIndex: 'status',
              render: (v: string) => <Tag color={STATUS_MAP[v]?.color}>{STATUS_MAP[v]?.label || v}</Tag>,
            },
            {
              title: '', width: 120,
              render: (_: any, record: any) => (
                <Space>
                  {record.status !== 'completed' && (
                    <Button
                      type="text" size="small" icon={<CheckOutlined />}
                      onClick={() => updateMut.mutate({ id: record.id, dto: { status: 'completed' } })}
                    />
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
        title="Yangi maqsad"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createMut.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(v) => createMut.mutate(v)}>
          <Form.Item name="title" label="Sarlavha" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Tavsif"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="category" label="Kategoriya"><Input /></Form.Item>
          <Form.Item name="deadline" label="Muddat"><Input type="date" /></Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default HrGoalsPage;
