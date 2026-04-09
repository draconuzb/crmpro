import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Breadcrumb,
  Table,
  Input,
  Button,
  Space,
  Avatar,
  Modal,
  Form,
  message,
} from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTeachers, createTeacher } from '../../features/teachers/api';

const { Title } = Typography;

const TeacherListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', page, search],
    queryFn: () => getTeachers({ page, limit: 20, search: search || undefined }),
  });

  const createTeacherMutation = useMutation({
    mutationFn: createTeacher,
    onSuccess: () => {
      message.success('Teacher created successfully');
      setModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: () => {
      message.error('Failed to create teacher');
    },
  });

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: any, record: any) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <span>{record.firstName} {record.lastName}</span>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Groups',
      dataIndex: 'groupsCount',
      key: 'groupsCount',
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/teachers/${record.id}`);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      createTeacherMutation.mutate(values);
    });
  };

  return (
    <>
      <Breadcrumb items={[{ title: 'Teachers' }]} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>{t('pages.teachers')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Add Teacher
        </Button>
      </div>

      <Input
        placeholder="Search by name or phone..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        style={{ marginBottom: 16, maxWidth: 400 }}
        allowClear
      />

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => navigate(`/teachers/${record.id}`),
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
        title="Add Teacher"
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={createTeacherMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input placeholder="+998901234567" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TeacherListPage;
