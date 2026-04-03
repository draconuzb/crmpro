import { useState } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Space,
  Popconfirm, Tag, Typography, Breadcrumb, Row, Col, Statistic,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHrStaff, createHrStaff, updateHrStaff, deleteHrStaff, getHrStaffStats } from '../../features/hr/api';

const { Title } = Typography;

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'green',
  INACTIVE: 'orange',
  DISMISSED: 'red',
};

const CATEGORIES = [
  { value: 'teacher', label: "O'qituvchi" },
  { value: 'admin', label: 'Administrator' },
  { value: 'support', label: 'Yordamchi' },
  { value: 'manager', label: 'Menejer' },
];

const HrStaffPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['hr-staff'], queryFn: () => getHrStaff() });
  const { data: stats } = useQuery({ queryKey: ['hr-stats'], queryFn: getHrStaffStats });

  const createMut = useMutation({
    mutationFn: createHrStaff,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hr'] }); closeModal(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, dto }: any) => updateHrStaff(id, dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hr'] }); closeModal(); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteHrStaff,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr'] }),
  });

  const closeModal = () => { setModalOpen(false); setEditingId(null); form.resetFields(); };

  const openEdit = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const onFinish = (values: any) => {
    if (editingId) {
      updateMut.mutate({ id: editingId, dto: values });
    } else {
      createMut.mutate(values);
    }
  };

  return (
    <>
      <Breadcrumb items={[{ title: 'HR' }, { title: 'Xodimlar' }]} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}><TeamOutlined /> Xodimlar</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Xodim qo'shish
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="Jami" value={stats?.total || 0} /></Card></Col>
        {(stats?.byStatus || []).map((s: any) => (
          <Col span={6} key={s.status}>
            <Card><Statistic title={s.status} value={s.count} valueStyle={{ color: STATUS_COLORS[s.status] || '#000' }} /></Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Table
          loading={isLoading}
          dataSource={data?.data || []}
          rowKey="id"
          columns={[
            { title: 'Ism', dataIndex: 'name', sorter: (a: any, b: any) => a.name.localeCompare(b.name) },
            { title: 'Telefon', dataIndex: 'phone' },
            {
              title: 'Kategoriya', dataIndex: 'category',
              render: (v: string) => CATEGORIES.find((c) => c.value === v)?.label || v,
            },
            { title: 'Lavozim', dataIndex: 'position' },
            {
              title: 'Status', dataIndex: 'status',
              render: (v: string) => <Tag color={STATUS_COLORS[v]}>{v}</Tag>,
            },
            {
              title: '', width: 100,
              render: (_: any, record: any) => (
                <Space>
                  <Button type="text" icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
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
        title={editingId ? 'Xodimni tahrirlash' : 'Yangi xodim'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMut.isPending || updateMut.isPending}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Ism" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Telefon"><Input /></Form.Item>
          <Form.Item name="category" label="Kategoriya"><Select options={CATEGORIES} /></Form.Item>
          <Form.Item name="position" label="Lavozim"><Input /></Form.Item>
          <Form.Item name="subject" label="Fan"><Input /></Form.Item>
          {editingId && (
            <Form.Item name="status" label="Status">
              <Select options={[
                { value: 'ACTIVE', label: 'Faol' },
                { value: 'INACTIVE', label: 'Nofaol' },
                { value: 'DISMISSED', label: 'Ishdan bo\'shatilgan' },
              ]} />
            </Form.Item>
          )}
          <Form.Item name="notes" label="Izoh"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default HrStaffPage;
