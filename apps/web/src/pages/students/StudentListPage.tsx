import React, { useState } from 'react';
import {
  Typography,
  Breadcrumb,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Avatar,
  Drawer,
  Form,
  DatePicker,
  InputNumber,
  message,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { getStudents, createStudent, getCourses, getGroups } from '../../features/students/api';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const StudentListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const [filters, setFilters] = useState<any>({
    page: 1,
    limit: 20,
    search: '',
    courseId: undefined,
    status: undefined,
    financialStatus: undefined,
  });

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students', filters],
    queryFn: () => getStudents(filters),
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  const { data: groupsData } = useQuery({
    queryKey: ['groups-list'],
    queryFn: () => getGroups({ limit: 200 }),
  });

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      message.success('Student created successfully');
      setDrawerOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => {
      message.error('Failed to create student');
    },
  });

  const courses = coursesData?.data || coursesData || [];
  const groups = groupsData?.data || groupsData || [];

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: any, record: any) => (
        <Space>
          <Avatar
            size="small"
            src={record.user?.avatar}
            icon={<UserOutlined />}
          />
          <span>
            {record.user?.firstName} {record.user?.lastName}
          </span>
        </Space>
      ),
    },
    {
      title: 'Phone',
      key: 'phone',
      render: (_: any, record: any) => record.user?.phone,
    },
    {
      title: 'Groups',
      key: 'groups',
      render: (_: any, record: any) =>
        (record.groupEnrollments || []).map((ge: any) => (
          <Tag key={ge.id} color="blue">
            {ge.group?.name}
          </Tag>
        )),
    },
    {
      title: 'Teachers',
      key: 'teachers',
      render: (_: any, record: any) => {
        const teachers = (record.groupEnrollments || [])
          .map((ge: any) => ge.group?.teacher?.user)
          .filter(Boolean);
        const unique = Array.from(
          new Map(teachers.map((t: any) => [t.id, t])).values(),
        ) as any[];
        return unique
          .map((t: any) => `${t.firstName} ${t.lastName}`)
          .join(', ');
      },
    },
    {
      title: 'Balance',
      key: 'balance',
      render: (_: any, record: any) => {
        const balance = Number(record.balance || 0);
        const color = balance < 0 ? 'red' : balance > 0 ? 'green' : undefined;
        return (
          <span style={{ color, fontWeight: 600 }}>
            {balance.toLocaleString()} UZS
          </span>
        );
      },
    },
    {
      title: 'Created',
      key: 'createdAt',
      render: (_: any, record: any) =>
        dayjs(record.createdAt).format('DD.MM.YYYY'),
    },
  ];

  const handleSearch = (value: string) => {
    setFilters((prev: any) => ({ ...prev, search: value, page: 1 }));
  };

  const handleCreate = (values: any) => {
    const payload: any = {
      phone: values.phone,
      firstName: values.firstName,
      lastName: values.lastName,
      password: values.password,
      gender: values.gender,
      note: values.note,
      dateOfBirth: values.dateOfBirth
        ? values.dateOfBirth.format('YYYY-MM-DD')
        : undefined,
      groupId: values.groupId,
      price: values.price,
    };
    createMutation.mutate(payload);
  };

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Students' }]}
        style={{ marginBottom: 16 }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          {t('pages.students')}
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setDrawerOpen(true)}
        >
          Add Student
        </Button>
      </div>

      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by name or phone"
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 220 }}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Select
          placeholder="Course"
          allowClear
          style={{ width: 160 }}
          onChange={(v) =>
            setFilters((prev: any) => ({ ...prev, courseId: v, page: 1 }))
          }
          options={(Array.isArray(courses) ? courses : []).map((c: any) => ({
            label: c.name,
            value: c.id,
          }))}
        />
        <Select
          placeholder="Status"
          allowClear
          style={{ width: 140 }}
          onChange={(v) =>
            setFilters((prev: any) => ({ ...prev, status: v, page: 1 }))
          }
          options={[
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Frozen', value: 'FROZEN' },
            { label: 'Left', value: 'LEFT' },
            { label: 'Trial', value: 'TRIAL' },
          ]}
        />
        <Select
          placeholder="Financial"
          allowClear
          style={{ width: 140 }}
          onChange={(v) =>
            setFilters((prev: any) => ({
              ...prev,
              financialStatus: v,
              page: 1,
            }))
          }
          options={[
            { label: 'Debtor', value: 'debtor' },
            { label: 'Paid', value: 'paid' },
            { label: 'Overpaid', value: 'overpaid' },
          ]}
        />
        <RangePicker
          onChange={(dates) => {
            setFilters((prev: any) => ({
              ...prev,
              startDate: dates?.[0]?.format('YYYY-MM-DD'),
              endDate: dates?.[1]?.format('YYYY-MM-DD'),
              page: 1,
            }));
          }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={studentsData?.data || []}
        loading={isLoading}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => navigate(`/students/${record.id}`),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          current: filters.page,
          pageSize: filters.limit,
          total: studentsData?.meta?.total || 0,
          showTotal: (total) => `Total ${total} students`,
          onChange: (page, pageSize) =>
            setFilters((prev: any) => ({
              ...prev,
              page,
              limit: pageSize,
            })),
        }}
      />

      <Drawer
        title="Add Student"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={createMutation.isPending}
            >
              Create
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Phone is required' }]}
          >
            <Input placeholder="+998" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'First name is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Last Name">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 6, message: 'Min 6 characters' },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dateOfBirth" label="Date of Birth">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Gender">
                <Select
                  allowClear
                  options={[
                    { label: 'Male', value: 'MALE' },
                    { label: 'Female', value: 'FEMALE' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="groupId" label="Group (optional)">
            <Select
              allowClear
              showSearch
              placeholder="Select group"
              filterOption={(input, option) =>
                (option?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={(Array.isArray(groups) ? groups : []).map((g: any) => ({
                label: g.name,
                value: g.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="price" label="Custom Price (optional)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default StudentListPage;
