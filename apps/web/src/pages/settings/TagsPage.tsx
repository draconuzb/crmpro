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
      message.success('Tag created');
      setModalOpen(false);
      form.resetFields();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      message.success('Tag updated');
      setModalOpen(false);
      setEditingTag(null);
      form.resetFields();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      message.success('Tag deleted');
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
      title: 'Color',
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
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
            title="Delete this tag?"
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
        items={[{ title: 'Settings' }, { title: 'Tags' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.tags')}</Title>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Add Tag
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
        title={editingTag ? 'Edit Tag' : 'Add Tag'}
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
            label="Name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="color" label="Color" initialValue="#1677ff">
            <ColorPicker />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TagsPage;
