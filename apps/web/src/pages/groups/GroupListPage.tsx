import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Breadcrumb,
  Table,
  Button,
  Space,
  Tag,
  Select,
  Input,
  Modal,
  Form,
  DatePicker,
  TimePicker,
  InputNumber,
  Radio,
  message,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getGroups, createGroup } from '../../features/groups/api';
import api from '../../lib/axios';

const { Title } = Typography;

const GroupListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState<number | undefined>();
  const [filterTeacher, setFilterTeacher] = useState<number | undefined>();
  const [filterDayType, setFilterDayType] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const dayTypeValue = Form.useWatch('dayType', form);

  const { data, isLoading } = useQuery({
    queryKey: ['groups', page, search, filterCourse, filterTeacher, filterDayType, filterStatus],
    queryFn: () =>
      getGroups({
        page,
        limit: 20,
        search: search || undefined,
        courseId: filterCourse,
        teacherId: filterTeacher,
        dayType: filterDayType,
        status: filterStatus,
      }),
  });

  // Load courses, teachers, rooms for filters and form
  const { data: coursesData } = useQuery({
    queryKey: ['courses-list'],
    queryFn: () => api.get('/courses', { params: { limit: 200 } }).then((r) => r.data),
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers-list'],
    queryFn: () => api.get('/teachers', { params: { limit: 200 } }).then((r) => r.data),
  });

  const { data: roomsData } = useQuery({
    queryKey: ['rooms-list'],
    queryFn: () => api.get('/rooms', { params: { limit: 200 } }).then((r) => r.data),
  });

  const courses = Array.isArray(coursesData) ? coursesData : coursesData?.data || [];
  const teachers = Array.isArray(teachersData) ? teachersData : teachersData?.data || [];
  const rooms = Array.isArray(roomsData) ? roomsData : roomsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (values: any) => createGroup(values),
    onSuccess: () => {
      message.success('Group created successfully');
      setModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: () => {
      message.error('Failed to create group');
    },
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Course',
      key: 'course',
      render: (_: any, r: any) => r.course?.name || '-',
    },
    {
      title: 'Teacher',
      key: 'teacher',
      render: (_: any, r: any) =>
        r.teacher?.user
          ? `${r.teacher.user.firstName} ${r.teacher.user.lastName}`
          : '-',
    },
    {
      title: 'Days',
      dataIndex: 'dayType',
      key: 'dayType',
      width: 100,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: 'Time',
      key: 'time',
      width: 120,
      render: (_: any, r: any) => `${r.startTime} - ${r.endTime}`,
    },
    {
      title: 'Room',
      key: 'room',
      width: 100,
      render: (_: any, r: any) => r.room?.name || '-',
    },
    {
      title: 'Students',
      key: 'students',
      width: 80,
      render: (_: any, r: any) => r._count?.students ?? 0,
    },
    {
      title: 'Tags',
      key: 'tags',
      render: (_: any, r: any) =>
        (r.tags || []).map((gt: any) => (
          <Tag key={gt.tag.id} color={gt.tag.color || 'default'}>
            {gt.tag.name}
          </Tag>
        )),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/groups/${record.id}`);
            }}
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/groups/${record.id}`);
            }}
          />
        </Space>
      ),
    },
  ];

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...values,
        startTime: values.startTime?.format('HH:mm'),
        endTime: values.endTime?.format('HH:mm'),
        startDate: values.startDate?.format('YYYY-MM-DD'),
      };
      createMutation.mutate(payload);
    });
  };

  return (
    <>
      <Breadcrumb items={[{ title: 'Groups' }]} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>{t('pages.groups')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Add Group
        </Button>
      </div>

      {/* Filters */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            allowClear
          />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select
            placeholder="Course"
            value={filterCourse}
            onChange={(v) => { setFilterCourse(v); setPage(1); }}
            allowClear
            style={{ width: '100%' }}
          >
            {courses.map((c: any) => (
              <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select
            placeholder="Teacher"
            value={filterTeacher}
            onChange={(v) => { setFilterTeacher(v); setPage(1); }}
            allowClear
            style={{ width: '100%' }}
          >
            {teachers.map((tc: any) => (
              <Select.Option key={tc.id} value={tc.id}>
                {tc.firstName} {tc.lastName}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Select
            placeholder="Day Type"
            value={filterDayType}
            onChange={(v) => { setFilterDayType(v); setPage(1); }}
            allowClear
            style={{ width: '100%' }}
          >
            <Select.Option value="ODD">ODD</Select.Option>
            <Select.Option value="EVEN">EVEN</Select.Option>
            <Select.Option value="OTHER">OTHER</Select.Option>
          </Select>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Select
            placeholder="Status"
            value={filterStatus}
            onChange={(v) => { setFilterStatus(v); setPage(1); }}
            allowClear
            style={{ width: '100%' }}
          >
            <Select.Option value="ACTIVE">Active</Select.Option>
            <Select.Option value="ARCHIVED">Archived</Select.Option>
            <Select.Option value="COMPLETED">Completed</Select.Option>
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => navigate(`/groups/${record.id}`),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          current: page,
          pageSize: 20,
          total: data?.meta?.total || 0,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
      />

      <Modal
        title="Add Group"
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" initialValues={{ dayType: 'ODD' }}>
          <Form.Item name="name" label="Group Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="courseId" label="Course" rules={[{ required: true }]}>
                <Select placeholder="Select course">
                  {courses.map((c: any) => (
                    <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="teacherId" label="Teacher" rules={[{ required: true }]}>
                <Select placeholder="Select teacher">
                  {teachers.map((tc: any) => (
                    <Select.Option key={tc.id} value={tc.id}>
                      {tc.firstName} {tc.lastName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="roomId" label="Room">
                <Select placeholder="Select room" allowClear>
                  {rooms.map((r: any) => (
                    <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="capacity" label="Capacity">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="dayType" label="Day Type" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio.Button value="ODD">ODD</Radio.Button>
              <Radio.Button value="EVEN">EVEN</Radio.Button>
              <Radio.Button value="OTHER">OTHER</Radio.Button>
            </Radio.Group>
          </Form.Item>
          {dayTypeValue === 'OTHER' && (
            <Form.Item name="customDays" label="Custom Days">
              <Input placeholder="e.g. Mon,Wed,Fri" />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="startTime" label="Start Time" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="endTime" label="End Time" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default GroupListPage;
