import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, DatePicker, Select, Space, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, VideoCameraOutlined, DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUpcomingLessons, createOnlineLesson, updateOnlineLesson, deleteOnlineLesson } from '@/features/online-lessons/api';
import { getGroups } from '@/features/groups/api';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { Title } = Typography;

const OnlineLessonsPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['online-lessons'],
    queryFn: getUpcomingLessons,
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
    mutationFn: (values: any) => createOnlineLesson(values.groupId, {
      title: values.title,
      url: values.url,
      date: values.date.toISOString(),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['online-lessons'] }); setModalOpen(false); form.resetFields(); message.success('Yaratildi'); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: any) => updateOnlineLesson(id, {
      ...data,
      date: data.date?.toISOString?.() ?? data.date,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['online-lessons'] }); setModalOpen(false); setEditingId(null); form.resetFields(); message.success('Yangilandi'); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteOnlineLesson,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['online-lessons'] }); message.success("O'chirildi"); },
  });

  const openEdit = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue({
      groupId: record.groupId,
      title: record.title,
      url: record.url,
      date: dayjs(record.date),
    });
    setModalOpen(true);
  };

  const handleSubmit = (values: any) => {
    if (editingId) {
      updateMut.mutate({ id: editingId, title: values.title, url: values.url, date: values.date });
    } else {
      createMut.mutate(values);
    }
  };

  const columns = [
    { title: t('title', 'Sarlavha'), dataIndex: 'title', key: 'title' },
    {
      title: t('group', 'Guruh'),
      key: 'group',
      render: (_: any, r: any) => r.group?.name || '-',
    },
    {
      title: t('course', 'Kurs'),
      key: 'course',
      render: (_: any, r: any) => r.group?.course?.name || '-',
    },
    {
      title: t('date', 'Sana'),
      dataIndex: 'date',
      key: 'date',
      render: (d: string) => dayjs(d).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: t('link', 'Havola'),
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <LinkOutlined /> {t('open', 'Ochish')}
        </a>
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
          <VideoCameraOutlined /> {t('onlineLessons', 'Online darslar')}
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>
          {t('add', "Qo'shish")}
        </Button>
      </div>

      <Card>
        <Table rowKey="id" columns={columns} dataSource={lessons} loading={isLoading} pagination={{ pageSize: 20 }} size="small" />
      </Card>

      <Modal
        open={modalOpen}
        title={editingId ? t('edit', 'Tahrirlash') : t('addOnlineLesson', 'Online dars yaratish')}
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
          <Form.Item name="title" label={t('title', 'Sarlavha')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="url" label={t('link', 'Havola (Zoom/Meet)')} rules={[{ required: true, type: 'url' }]}>
            <Input placeholder="https://zoom.us/j/..." />
          </Form.Item>
          <Form.Item name="date" label={t('date', 'Sana va vaqt')} rules={[{ required: true }]}>
            <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OnlineLessonsPage;
