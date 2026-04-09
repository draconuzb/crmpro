import React, { useState } from 'react';
import {
  Typography,
  Breadcrumb,
  Table,
  Button,
  Modal,
  Form,
  Input,
  ColorPicker,
  Tag,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getFinanceCategories,
  createFinanceCategory,
} from '../../features/finance/api';

const { Title } = Typography;

const FinanceCategoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['financeCategories'],
    queryFn: getFinanceCategories,
  });

  const createMutation = useMutation({
    mutationFn: createFinanceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeCategories'] });
      message.success(t('finance.categoryCreated'));
      setModalOpen(false);
      form.resetFields();
    },
  });

  const openCreate = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const color =
        typeof values.color === 'string'
          ? values.color
          : values.color?.toHexString?.() || '#1677ff';
      createMutation.mutate({ key: values.key, label: values.label, color });
    });
  };

  const columns = [
    {
      title: t('common.color'),
      dataIndex: 'color',
      key: 'color',
      width: 60,
      render: (color: string) => (
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: color || '#1677ff',
            border: '1px solid #d9d9d9',
          }}
        />
      ),
    },
    { title: t('common.key'), dataIndex: 'key', key: 'key' },
    { title: t('common.name'), dataIndex: 'label', key: 'label' },
    {
      title: t('common.type'),
      dataIndex: 'key',
      key: 'type',
      render: (key: string) => {
        if (key === 'cash') return <Tag color="green">{t('finance.cash')}</Tag>;
        if (key === 'bank') return <Tag color="blue">{t('finance.bank')}</Tag>;
        return <Tag>{t('common.other')}</Tag>;
      },
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: t('common.settings') }, { title: t('finance.financeCategories') }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('finance.financeCategories')}</Title>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('finance.addCategory')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={t('finance.addCategory')}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="key"
            label={t('finance.keyExample')}
            rules={[{ required: true, message: t('common.keyRequired') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="label"
            label={t('common.name')}
            rules={[{ required: true, message: t('common.nameRequired') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="color" label={t('common.color')} initialValue="#1677ff">
            <ColorPicker />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default FinanceCategoriesPage;
