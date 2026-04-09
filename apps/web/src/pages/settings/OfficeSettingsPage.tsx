import React, { useState } from 'react';
import {
  Typography,
  Breadcrumb,
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Popconfirm,
  DatePicker,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  HomeOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  addSubcourse,
  updateSubcourse,
  deleteSubcourse,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getHolidays,
  createHoliday,
  deleteHoliday,
} from '../../features/settings/api';

const { Title } = Typography;

// ===================== COURSES TAB =====================
const CoursesTab: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<any>(null);
  const [subCourseId, setSubCourseId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [subForm] = Form.useForm();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      message.success(t('settings.courseCreated'));
      setModalOpen(false);
      form.resetFields();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      message.success(t('settings.courseUpdated'));
      setModalOpen(false);
      setEditingCourse(null);
      form.resetFields();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      message.success(t('settings.courseDeleted'));
    },
  });

  const addSubMutation = useMutation({
    mutationFn: ({ courseId, data }: { courseId: number; data: any }) =>
      addSubcourse(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      message.success(t('settings.subcourseAdded'));
      setSubModalOpen(false);
      subForm.resetFields();
    },
  });

  const updateSubMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateSubcourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      message.success(t('settings.subcourseUpdated'));
      setSubModalOpen(false);
      setEditingSub(null);
      subForm.resetFields();
    },
  });

  const deleteSubMutation = useMutation({
    mutationFn: deleteSubcourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      message.success(t('settings.subcourseDeleted'));
    },
  });

  const openCreateModal = () => {
    setEditingCourse(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record: any) => {
    setEditingCourse(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      price: Number(record.price),
      duration: record.duration,
      lessonDuration: record.lessonDuration,
    });
    setModalOpen(true);
  };

  const handleCourseSubmit = () => {
    form.validateFields().then((values) => {
      if (editingCourse) {
        updateMutation.mutate({ id: editingCourse.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    });
  };

  const openSubCreate = (courseId: number) => {
    setEditingSub(null);
    setSubCourseId(courseId);
    subForm.resetFields();
    setSubModalOpen(true);
  };

  const openSubEdit = (sub: any) => {
    setEditingSub(sub);
    setSubCourseId(null);
    subForm.setFieldsValue({
      name: sub.name,
      materials: sub.materials,
      sortOrder: sub.sortOrder,
    });
    setSubModalOpen(true);
  };

  const handleSubSubmit = () => {
    subForm.validateFields().then((values) => {
      if (editingSub) {
        updateSubMutation.mutate({ id: editingSub.id, data: values });
      } else if (subCourseId) {
        addSubMutation.mutate({ courseId: subCourseId, data: values });
      }
    });
  };

  const formatPrice = (price: number | string) => {
    return Number(price).toLocaleString('uz-UZ') + ' UZS';
  };

  const getStudentCount = (record: any) => {
    if (!record.groups) return 0;
    return record.groups.reduce(
      (sum: number, g: any) => sum + (g._count?.students || 0),
      0,
    );
  };

  const columns = [
    {
      title: t('common.image'),
      dataIndex: 'image',
      key: 'image',
      width: 60,
      render: () => (
        <div
          style={{
            width: 40,
            height: 40,
            background: '#f0f0f0',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BookOutlined style={{ color: '#999' }} />
        </div>
      ),
    },
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    {
      title: t('common.price'),
      dataIndex: 'price',
      key: 'price',
      render: (val: number) => formatPrice(val),
    },
    {
      title: t('common.students'),
      key: 'students',
      render: (_: any, record: any) => getStudentCount(record),
    },
    {
      title: t('common.duration'),
      dataIndex: 'duration',
      key: 'duration',
      render: (val: number | null) => (val ? `${val} ${t('common.months')}` : '-'),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title={t('settings.deleteCourseConfirm')}
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: any) => {
    const subColumns = [
      { title: t('common.name'), dataIndex: 'name', key: 'name' },
      {
        title: t('settings.materials'),
        dataIndex: 'materials',
        key: 'materials',
        render: (val: string | null) => val || '-',
      },
      { title: t('settings.order'), dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
      {
        title: t('common.actions'),
        key: 'actions',
        width: 120,
        render: (_: any, sub: any) => (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openSubEdit(sub)}
            />
            <Popconfirm
              title={t('settings.deleteSubcourseConfirm')}
              onConfirm={() => deleteSubMutation.mutate(sub.id)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <div style={{ padding: '0 16px' }}>
        <div style={{ marginBottom: 8 }}>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => openSubCreate(record.id)}
          >
            {t('settings.addSubcourse')}
          </Button>
        </div>
        <Table
          columns={subColumns}
          dataSource={record.subcourses || []}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </div>
    );
  };

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          {t('settings.addCourse')}
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={isLoading}
        expandable={{ expandedRowRender }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCourse ? t('settings.editCourse') : t('settings.addCourse')}
        open={modalOpen}
        onOk={handleCourseSubmit}
        onCancel={() => {
          setModalOpen(false);
          setEditingCourse(null);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('common.name')} rules={[{ required: true, message: t('common.nameRequired') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t('common.description')}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label={t('settings.priceUZS')} rules={[{ required: true, message: t('settings.priceRequired') }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="duration" label={t('settings.durationMonths')}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="lessonDuration" label={t('settings.lessonDurationMinutes')}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingSub ? t('settings.editSubcourse') : t('settings.addSubcourse')}
        open={subModalOpen}
        onOk={handleSubSubmit}
        onCancel={() => {
          setSubModalOpen(false);
          setEditingSub(null);
          subForm.resetFields();
        }}
        confirmLoading={addSubMutation.isPending || updateSubMutation.isPending}
      >
        <Form form={subForm} layout="vertical">
          <Form.Item name="name" label={t('common.name')} rules={[{ required: true, message: t('common.nameRequired') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="materials" label={t('settings.materials')}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="sortOrder" label={t('settings.sortOrder')}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ===================== ROOMS TAB =====================
const RoomsTab: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [form] = Form.useForm();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
  });

  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      message.success(t('settings.roomCreated'));
      setModalOpen(false);
      form.resetFields();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      message.success(t('settings.roomUpdated'));
      setModalOpen(false);
      setEditingRoom(null);
      form.resetFields();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      message.success(t('settings.roomDeleted'));
    },
  });

  const openCreate = () => {
    setEditingRoom(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: any) => {
    setEditingRoom(record);
    form.setFieldsValue({ name: record.name, capacity: record.capacity });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingRoom) {
        updateMutation.mutate({ id: editingRoom.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    });
  };

  const columns = [
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    {
      title: t('settings.capacity'),
      dataIndex: 'capacity',
      key: 'capacity',
      render: (val: number | null) => val ?? '-',
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
            title={t('settings.deleteRoomConfirm')}
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('settings.addRoom')}
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={rooms}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRoom ? t('settings.editRoom') : t('settings.addRoom')}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          setEditingRoom(null);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('common.name')} rules={[{ required: true, message: t('common.nameRequired') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="capacity" label={t('settings.capacity')}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ===================== HOLIDAYS TAB =====================
const HolidaysTab: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: holidays = [], isLoading } = useQuery({
    queryKey: ['holidays'],
    queryFn: getHolidays,
  });

  const createMutation = useMutation({
    mutationFn: createHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      message.success(t('settings.holidayCreated'));
      setModalOpen(false);
      form.resetFields();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      message.success(t('settings.holidayDeleted'));
    },
  });

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      createMutation.mutate({
        name: values.name,
        date: values.date.format('YYYY-MM-DD'),
      });
    });
  };

  const columns = [
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    {
      title: t('common.date'),
      dataIndex: 'date',
      key: 'date',
      render: (val: string) => dayjs(val).format('DD.MM.YYYY'),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 80,
      render: (_: any, record: any) => (
        <Popconfirm
          title={t('settings.deleteHolidayConfirm')}
          onConfirm={() => deleteMutation.mutate(record.id)}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          {t('settings.addHoliday')}
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={holidays}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={t('settings.addHoliday')}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('common.name')} rules={[{ required: true, message: t('common.nameRequired') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="date" label={t('common.date')} rules={[{ required: true, message: t('common.dateRequired') }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ===================== MAIN PAGE =====================
const OfficeSettingsPage: React.FC = () => {
  const { t } = useTranslation();

  const tabItems = [
    {
      key: 'courses',
      label: (
        <span>
          <BookOutlined /> {t('settings.courses')}
        </span>
      ),
      children: <CoursesTab />,
    },
    {
      key: 'rooms',
      label: (
        <span>
          <HomeOutlined /> {t('settings.rooms')}
        </span>
      ),
      children: <RoomsTab />,
    },
    {
      key: 'holidays',
      label: (
        <span>
          <CalendarOutlined /> {t('settings.holidays')}
        </span>
      ),
      children: <HolidaysTab />,
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: t('common.settings') }, { title: t('settings.office') }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.office')}</Title>
      <Tabs items={tabItems} defaultActiveKey="courses" />
    </>
  );
};

export default OfficeSettingsPage;
