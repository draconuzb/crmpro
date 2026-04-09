import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Space, Typography, message, Popconfirm, Tag, Switch } from 'antd';
import { PlusOutlined, PercentageOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount } from '@/features/discounts/api';
import { getGroups } from '@/features/groups/api';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const DiscountsPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');

  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ['discounts'],
    queryFn: getDiscounts,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups-list'],
    queryFn: () => getGroups(),
  });

  const groupOptions = (Array.isArray(groups) ? groups : groups?.data || []).map((g: any) => ({
    label: g.name,
    value: g.id,
  }));

  const createMut = useMutation({
    mutationFn: (values: any) => createDiscount(values.groupId, {
      name: values.name,
      percentage: discountType === 'percentage' ? values.amount : undefined,
      fixedAmount: discountType === 'fixed' ? values.amount : undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['discounts'] }); setModalOpen(false); form.resetFields(); message.success('Yaratildi'); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: any) => updateDiscount(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['discounts'] }); setModalOpen(false); setEditingId(null); form.resetFields(); message.success('Yangilandi'); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteDiscount,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['discounts'] }); message.success("O'chirildi"); },
  });

  const toggleActive = (id: number, isActive: boolean) => {
    updateMut.mutate({ id, isActive });
  };

  const openEdit = (record: any) => {
    setEditingId(record.id);
    const isPct = record.percentage != null;
    setDiscountType(isPct ? 'percentage' : 'fixed');
    form.setFieldsValue({
      name: record.name,
      amount: isPct ? Number(record.percentage) : Number(record.fixedAmount),
    });
    setModalOpen(true);
  };

  const handleSubmit = (values: any) => {
    if (editingId) {
      updateMut.mutate({
        id: editingId,
        name: values.name,
        percentage: discountType === 'percentage' ? values.amount : null,
        fixedAmount: discountType === 'fixed' ? values.amount : null,
      });
    } else {
      createMut.mutate(values);
    }
  };

  const columns = [
    { title: t('name', 'Nomi'), dataIndex: 'name', key: 'name' },
    {
      title: t('group', 'Guruh'),
      key: 'group',
      render: (_: any, r: any) => r.group?.name || '-',
    },
    {
      title: t('discount', 'Chegirma'),
      key: 'discount',
      render: (_: any, r: any) => {
        if (r.percentage != null) return <Tag color="blue">{Number(r.percentage)}%</Tag>;
        if (r.fixedAmount != null) return <Tag color="green">{Number(r.fixedAmount).toLocaleString()} UZS</Tag>;
        return '-';
      },
    },
    {
      title: t('status', 'Holat'),
      key: 'isActive',
      render: (_: any, r: any) => (
        <Switch checked={r.isActive} size="small" onChange={(val) => toggleActive(r.id, val)} />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="O'chirishni tasdiqlaysizmi?" onConfirm={() => deleteMut.mutate(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <PercentageOutlined /> {t('discounts', 'Chegirmalar')}
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>
          {t('add', "Qo'shish")}
        </Button>
      </div>

      <Card>
        <Table rowKey="id" columns={columns} dataSource={discounts} loading={isLoading} pagination={{ pageSize: 20 }} size="small" />
      </Card>

      <Modal
        open={modalOpen}
        title={editingId ? t('edit', 'Tahrirlash') : t('addDiscount', "Chegirma qo'shish")}
        onCancel={() => { setModalOpen(false); setEditingId(null); }}
        onOk={() => form.submit()}
        confirmLoading={createMut.isPending || updateMut.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!editingId && (
            <Form.Item name="groupId" label={t('group', 'Guruh')} rules={[{ required: true }]}>
              <Select options={groupOptions} placeholder={t('selectGroup', 'Guruhni tanlang')} showSearch optionFilterProp="label" />
            </Form.Item>
          )}
          <Form.Item name="name" label={t('name', 'Nomi')} rules={[{ required: true }]}>
            <Input placeholder="Oilaviy chegirma" />
          </Form.Item>
          <Form.Item label={t('type', 'Turi')}>
            <Select value={discountType} onChange={setDiscountType} options={[
              { label: t('percentage', 'Foiz (%)'), value: 'percentage' },
              { label: t('fixedAmount', "Belgilangan summa (so'm)"), value: 'fixed' },
            ]} />
          </Form.Item>
          <Form.Item name="amount" label={discountType === 'percentage' ? t('percentage', 'Foiz') : t('amount', 'Summa')} rules={[{ required: true }]}>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={discountType === 'percentage' ? 100 : undefined}
              addonAfter={discountType === 'percentage' ? '%' : "so'm"}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DiscountsPage;
