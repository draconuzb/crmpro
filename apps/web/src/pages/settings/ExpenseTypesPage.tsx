import React, { useState } from 'react';
import {
  Typography,
  Breadcrumb,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  Tag,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const DEFAULT_CATEGORIES = [
  { value: 'RENT', label: 'Ijaraga' },
  { value: 'UTILITIES', label: 'Kommunal' },
  { value: 'SUPPLIES', label: 'Jihozlar' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'MAINTENANCE', label: "Ta'mirlash" },
  { value: 'FOOD', label: 'Ovqat' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'SALARY', label: 'Oyliklar' },
  { value: 'OTHER', label: 'Boshqa' },
];

const ExpenseTypesPage: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = () => {
    form.validateFields().then((values) => {
      const key = values.value.toUpperCase().replace(/\s+/g, '_');
      if (categories.find((c) => c.value === key)) {
        message.error(t('finance.keyAlreadyExists'));
        return;
      }
      setCategories([...categories, { value: key, label: values.label }]);
      message.success(t('finance.expenseTypeCreated'));
      setModalOpen(false);
      form.resetFields();
    });
  };

  const handleDelete = (value: string) => {
    setCategories(categories.filter((c) => c.value !== value));
    message.success(t('finance.expenseTypeDeleted'));
  };

  const columns = [
    { title: t('common.key'), dataIndex: 'value', key: 'value' },
    { title: t('common.name'), dataIndex: 'label', key: 'label' },
    {
      title: t('common.status'),
      key: 'status',
      width: 100,
      render: (_: any, record: any) => {
        const isDefault = DEFAULT_CATEGORIES.find((c) => c.value === record.value);
        return isDefault ? <Tag color="blue">{t('common.default')}</Tag> : <Tag color="green">{t('common.custom')}</Tag>;
      },
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 80,
      render: (_: any, record: any) => {
        const isDefault = DEFAULT_CATEGORIES.find((c) => c.value === record.value);
        if (isDefault) return null;
        return (
          <Popconfirm
            title={t('finance.deleteExpenseTypeConfirm')}
            onConfirm={() => handleDelete(record.value)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: t('common.settings') }, { title: t('finance.expenseTypes') }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('finance.expenseTypes')}</Title>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
          {t('finance.addExpenseType')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="value"
        pagination={false}
      />

      <Modal
        title={t('finance.addExpenseType')}
        open={modalOpen}
        onOk={handleAdd}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="value"
            label={t('finance.keyExampleExpense')}
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
        </Form>
      </Modal>
    </>
  );
};

export default ExpenseTypesPage;
