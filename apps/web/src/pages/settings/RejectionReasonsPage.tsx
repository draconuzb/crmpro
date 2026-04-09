import React, { useState } from 'react';
import {
  Typography,
  Breadcrumb,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getRejectionReasons,
  createRejectionReason,
  updateRejectionReason,
  deleteRejectionReason,
} from '../../features/rejections/api';

const { Title } = Typography;

const RejectionReasonsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  const { data: reasons = [], isLoading } = useQuery({
    queryKey: ['rejectionReasons'],
    queryFn: getRejectionReasons,
  });

  const createMutation = useMutation({
    mutationFn: createRejectionReason,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rejectionReasons'] });
      message.success(t('rejections.reasonCreated'));
      setModalOpen(false);
      form.resetFields();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: string }) => updateRejectionReason(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rejectionReasons'] });
      message.success(t('rejections.reasonUpdated'));
      setModalOpen(false);
      setEditingItem(null);
      form.resetFields();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRejectionReason,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rejectionReasons'] });
      message.success(t('rejections.reasonDeleted'));
    },
  });

  const openCreate = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: any) => {
    setEditingItem(record);
    form.setFieldsValue({ label: record.label });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingItem) {
        updateMutation.mutate({ id: editingItem.id, data: values.label });
      } else {
        createMutation.mutate({ label: values.label });
      }
    });
  };

  const columns = [
    { title: t('rejections.reason'), dataIndex: 'label', key: 'label' },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
            title={t('rejections.deleteReasonConfirm')}
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: t('common.settings') }, { title: t('rejections.rejectionReasons') }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('rejections.rejectionReasons')}</Title>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('rejections.addReason')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={reasons}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingItem ? t('rejections.editReason') : t('rejections.addReason')}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          setEditingItem(null);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="label"
            label={t('rejections.reasonName')}
            rules={[{ required: true, message: t('rejections.reasonNameRequired') }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RejectionReasonsPage;
