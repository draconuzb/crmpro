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

const DEFAULT_PROBLEM_TYPES = [
  { value: 'DISCIPLINE', label: 'Intizom' },
  { value: 'ATTENDANCE', label: 'Davomat' },
  { value: 'ACADEMIC', label: 'O\'qish natijasi' },
  { value: 'PAYMENT', label: 'To\'lov muammosi' },
  { value: 'BEHAVIOR', label: 'Xulq-atvor' },
  { value: 'HEALTH', label: 'Salomatlik' },
  { value: 'OTHER', label: 'Boshqa' },
];

const ProblemTypesPage: React.FC = () => {
  const { t } = useTranslation();
  const [types, setTypes] = useState(DEFAULT_PROBLEM_TYPES);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = () => {
    form.validateFields().then((values) => {
      const key = values.value.toUpperCase().replace(/\s+/g, '_');
      if (types.find((t) => t.value === key)) {
        message.error(t('problems.keyAlreadyExists'));
        return;
      }
      setTypes([...types, { value: key, label: values.label }]);
      message.success(t('problems.problemTypeCreated'));
      setModalOpen(false);
      form.resetFields();
    });
  };

  const handleDelete = (value: string) => {
    setTypes(types.filter((t) => t.value !== value));
    message.success(t('problems.problemTypeDeleted'));
  };

  const columns = [
    { title: t('common.key'), dataIndex: 'value', key: 'value' },
    { title: t('common.name'), dataIndex: 'label', key: 'label' },
    {
      title: t('common.status'),
      key: 'status',
      width: 100,
      render: (_: any, record: any) => {
        const isDefault = DEFAULT_PROBLEM_TYPES.find((t) => t.value === record.value);
        return isDefault ? <Tag color="blue">{t('common.default')}</Tag> : <Tag color="green">{t('common.custom')}</Tag>;
      },
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 80,
      render: (_: any, record: any) => {
        const isDefault = DEFAULT_PROBLEM_TYPES.find((t) => t.value === record.value);
        if (isDefault) return null;
        return (
          <Popconfirm
            title={t('problems.deleteProblemTypeConfirm')}
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
        items={[{ title: t('common.settings') }, { title: t('problems.problemTypes') }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('problems.problemTypes')}</Title>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
          {t('problems.addProblemType')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={types}
        rowKey="value"
        pagination={false}
      />

      <Modal
        title={t('problems.addProblemType')}
        open={modalOpen}
        onOk={handleAdd}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="value"
            label={t('problems.keyExample')}
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

export default ProblemTypesPage;
