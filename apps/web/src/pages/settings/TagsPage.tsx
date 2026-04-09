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
  Space,
  Popconfirm,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTags, createTag, updateTag, deleteTag } from '../../features/settings/api';

const { Title } = Typography;

const TagsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [form] = Form.useForm();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  const createMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      message.success(t('settings.tagCreated'));
      setModalOpen(false);
      form.resetFields();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      message.success(t('settings.tagUpdated'));
      setModalOpen(false);
      setEditingTag(null);
      form.resetFields();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      message.success(t('settings.tagDeleted'));
    },
  });

  const openCreate = () => {
    setEditingTag(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: any) => {
    setEditingTag(record);
    form.setFieldsValue({
      name: record.name,
      color: record.color || '#1677ff',
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const color =
        typeof values.color === 'string'
          ? values.color
          : values.color?.toHexString?.() || '#1677ff';
      const payload = { name: values.name, color };

      if (editingTag) {
        updateMutation.mutate({ id: editingTag.id, data: payload });
      } else {
        createMutation.mutate(payload);
      }
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
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
            title={t('settings.deleteTagConfirm')}
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
        items={[{ title: t('common.settings') }, { title: t('settings.tags') }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.tags')}</Title>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('settings.addTag')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tags}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingTag ? t('settings.editTag') : t('settings.addTag')}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          setEditingTag(null);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
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

export default TagsPage;
