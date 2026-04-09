import React, { useState, useMemo } from 'react';
import {
  Typography,
  Breadcrumb,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Tag,
  Popconfirm,
  Row,
  Col,
  Statistic,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../../features/settings/api';
import { getGroups } from '../../features/groups/api';

const { Title } = Typography;

const RoomsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [form] = Form.useForm();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
  });

  // Fetch active groups to count per room
  const { data: groupsData } = useQuery({
    queryKey: ['groups', 'all-for-rooms'],
    queryFn: () => getGroups({ limit: 1000, status: 'ACTIVE' }),
  });

  const groupsList = groupsData?.items || groupsData || [];

  // Count groups per room
  const groupsPerRoom = useMemo(() => {
    const map: Record<number, number> = {};
    (Array.isArray(groupsList) ? groupsList : []).forEach((g: any) => {
      if (g.roomId) {
        map[g.roomId] = (map[g.roomId] || 0) + 1;
      }
    });
    return map;
  }, [groupsList]);

  // Stats
  const totalRooms = rooms.length;
  const activeRooms = rooms.filter((r: any) => r.isActive !== false).length;
  const totalCapacity = rooms.reduce((sum: number, r: any) => sum + (r.capacity || 0), 0);

  // Mutations
  const createMut = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      message.success(t('rooms.created', 'Xona yaratildi'));
      closeModal();
    },
    onError: () => message.error(t('common.error', 'Xatolik yuz berdi')),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      message.success(t('rooms.updated', 'Xona yangilandi'));
      closeModal();
    },
    onError: () => message.error(t('common.error', 'Xatolik yuz berdi')),
  });

  const deleteMut = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      message.success(t('rooms.deleted', "Xona o'chirildi"));
    },
    onError: () => message.error(t('common.error', 'Xatolik yuz berdi')),
  });

  const openCreate = () => {
    setEditingRoom(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (room: any) => {
    setEditingRoom(room);
    form.setFieldsValue({ name: room.name, capacity: room.capacity });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRoom(null);
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingRoom) {
        updateMut.mutate({ id: editingRoom.id, data: values });
      } else {
        createMut.mutate(values);
      }
    });
  };

  const columns = [
    {
      title: t('rooms.name', 'Nomi'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: t('rooms.capacity', "Sig'imi"),
      dataIndex: 'capacity',
      key: 'capacity',
      sorter: (a: any, b: any) => (a.capacity || 0) - (b.capacity || 0),
      render: (v: number) => v || '—',
    },
    {
      title: t('common.status', 'Holat'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) => (
        <Tag color={v !== false ? 'green' : 'default'}>
          {v !== false ? t('common.active', 'Faol') : t('common.inactive', 'Nofaol')}
        </Tag>
      ),
    },
    {
      title: t('rooms.groups_count', 'Guruhlar soni'),
      key: 'groupsCount',
      render: (_: any, r: any) => {
        const count = groupsPerRoom[r.id] || 0;
        return (
          <Space>
            <TeamOutlined />
            {count}
          </Space>
        );
      },
      sorter: (a: any, b: any) => (groupsPerRoom[a.id] || 0) - (groupsPerRoom[b.id] || 0),
    },
    {
      title: t('common.actions', 'Amallar'),
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
            size="small"
          />
          <Popconfirm
            title={t('rooms.delete_confirm', "Xonani o'chirmoqchimisiz?")}
            onConfirm={() => deleteMut.mutate(record.id)}
            okText={t('common.yes', 'Ha')}
            cancelText={t('common.no', "Yo'q")}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>{t('common.management', 'Boshqaruv')}</Breadcrumb.Item>
        <Breadcrumb.Item>{t('rooms.title', 'Xonalar')}</Breadcrumb.Item>
      </Breadcrumb>

      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            <HomeOutlined style={{ marginRight: 8 }} />
            {t('rooms.title', 'Xonalar')}
          </Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            {t('rooms.add_room', "Xona qo'shish")}
          </Button>
        </Col>
      </Row>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title={t('rooms.total_rooms', 'Jami xonalar')} value={totalRooms} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title={t('rooms.active_rooms', 'Faol xonalar')} value={activeRooms} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title={t('rooms.total_capacity', "Umumiy sig'im")} value={totalCapacity} suffix={t('schedule.student', 'talaba')} />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <Table
          dataSource={rooms}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          size="middle"
        />
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        title={editingRoom ? t('rooms.edit_room', 'Xonani tahrirlash') : t('rooms.new_room', 'Yangi xona')}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={closeModal}
        confirmLoading={createMut.isPending || updateMut.isPending}
        okText={t('common.save', 'Saqlash')}
        cancelText={t('common.cancel_full', 'Bekor qilish')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t('rooms.name', 'Nomi')}
            rules={[{ required: true, message: t('rooms.name_required', 'Xona nomini kiriting') }]}
          >
            <Input placeholder={t('rooms.name_placeholder', 'Masalan: 1-xona')} />
          </Form.Item>
          <Form.Item
            name="capacity"
            label={t('rooms.capacity_label', "Sig'imi (talabalar soni)")}
            rules={[{ required: true, message: t('rooms.capacity_required', "Sig'imini kiriting") }]}
          >
            <InputNumber min={1} max={200} style={{ width: '100%' }} placeholder="20" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomsPage;
