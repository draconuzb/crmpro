import { useState, useEffect } from 'react';
import {
  Typography,
  Breadcrumb,
  Tabs,
  Card,
  Form,
  Input,
  Button,
  Table,
  Switch,
  Select,
  Modal,
  Space,
  Timeline,
  Tag,
  Spin,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../../lib/axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ─── General Tab ───────────────────────────────────────────────────

const GeneralTab: React.FC = () => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings/general').then(({ data }) => {
      form.setFieldsValue(data);
    }).catch(() => {
      message.error('Failed to load settings');
    }).finally(() => setLoading(false));
  }, [form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await api.patch('/settings/general', {
        name: values.name,
        address: values.address,
        phone: values.phone,
      });
      message.success('Branch settings saved');
    } catch {
      // validation error
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin />;

  return (
    <Card style={{ maxWidth: 600 }}>
      <Form form={form} layout="vertical" initialValues={{ timezone: 'Asia/Tashkent' }}>
        <Form.Item name="name" label="Branch Name" rules={[{ required: true }]}>
          <Input placeholder="Main Branch" />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <TextArea rows={2} placeholder="123 Main Street" />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input placeholder="+998 90 123 45 67" />
        </Form.Item>
        <Form.Item name="timezone" label="Timezone">
          <Select>
            <Select.Option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</Select.Option>
            <Select.Option value="Asia/Almaty">Asia/Almaty (UTC+6)</Select.Option>
            <Select.Option value="Europe/Moscow">Europe/Moscow (UTC+3)</Select.Option>
            <Select.Option value="Asia/Dubai">Asia/Dubai (UTC+4)</Select.Option>
            <Select.Option value="Asia/Seoul">Asia/Seoul (UTC+9)</Select.Option>
          </Select>
        </Form.Item>
        <Button type="primary" onClick={handleSave} loading={saving}>
          Save
        </Button>
      </Form>
    </Card>
  );
};

// ─── Staff Tab ─────────────────────────────────────────────────────

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isActive: boolean;
}

const StaffTab: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [staffForm] = Form.useForm();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = () => {
    api.get('/users').then(({ data }) => {
      setStaff((data.data || data).map((u: any) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        role: u.role,
        isActive: u.isActive,
      })));
    }).catch(() => {
      message.error('Failed to load staff');
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchStaff(); }, []);

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: any, r: StaffMember) => `${r.firstName} ${r.lastName}`,
    },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string, record: StaffMember) => (
        <Select
          defaultValue={role}
          style={{ width: 130 }}
          size="small"
          onChange={async (newRole) => {
            try {
              await api.patch(`/users/${record.id}`, { role: newRole });
              message.success('Role updated');
              fetchStaff();
            } catch {
              message.error('Failed to update role');
            }
          }}
        >
          <Select.Option value="ADMIN">Admin</Select.Option>
          <Select.Option value="TEACHER">Teacher</Select.Option>
          <Select.Option value="STUDENT">Student</Select.Option>
          <Select.Option value="CEO">CEO</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean, record: StaffMember) => (
        <Switch
          checked={active}
          size="small"
          onChange={async (checked) => {
            try {
              await api.patch(`/users/${record.id}`, { isActive: checked });
              message.success(checked ? 'Activated' : 'Deactivated');
              fetchStaff();
            } catch {
              message.error('Failed to update status');
            }
          }}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: StaffMember) => (
        <Space>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => {
              Modal.confirm({
                title: 'Delete staff member?',
                onOk: async () => {
                  try {
                    await api.delete(`/users/${record.id}`);
                    message.success('Deleted');
                    fetchStaff();
                  } catch {
                    message.error('Failed to delete');
                  }
                },
              });
            }}
          />
        </Space>
      ),
    },
  ];

  const handleAddStaff = async () => {
    try {
      const values = await staffForm.validateFields();
      await api.post('/users', {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        role: values.role,
        password: values.phone.replace(/\D/g, '').slice(-6) || '123456',
      });
      message.success('Staff member added');
      setModalOpen(false);
      staffForm.resetFields();
      fetchStaff();
    } catch {
      message.error('Failed to add staff');
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setModalOpen(true)}
        style={{ marginBottom: 16 }}
      >
        Add Staff
      </Button>
      <Table columns={columns} dataSource={staff} rowKey="id" loading={loading} pagination={false} />

      <Modal
        title="Add Staff Member"
        open={modalOpen}
        onOk={handleAddStaff}
        onCancel={() => setModalOpen(false)}
        okText="Add"
      >
        <Form form={staffForm} layout="vertical">
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="ADMIN">Admin</Select.Option>
              <Select.Option value="TEACHER">Teacher</Select.Option>
              <Select.Option value="CEO">CEO</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ─── Billing Tab ───────────────────────────────────────────────────

const BillingTab: React.FC = () => (
  <Card style={{ maxWidth: 400 }}>
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text type="secondary">Plan</Text>
        <Title level={4} style={{ margin: 0 }}>Professional</Title>
      </div>
      <div>
        <Text type="secondary">Expiry Date</Text>
        <Paragraph strong style={{ margin: 0 }}>2026-12-31</Paragraph>
      </div>
      <div>
        <Text type="secondary">Students Limit</Text>
        <Paragraph strong style={{ margin: 0 }}>500</Paragraph>
      </div>
      <Tag color="green">Active</Tag>
    </Space>
  </Card>
);

// ─── Roadmap Tab ───────────────────────────────────────────────────

const RoadmapTab: React.FC = () => (
  <div style={{ maxWidth: 500 }}>
    <Title level={4}>Coming Soon</Title>
    <Timeline
      items={[
        { dot: <ClockCircleOutlined />, color: 'blue', children: 'Advanced analytics dashboard' },
        { dot: <ClockCircleOutlined />, color: 'blue', children: 'Parent mobile app' },
        { dot: <ClockCircleOutlined />, color: 'gray', children: 'AI-powered student recommendations' },
        { dot: <ClockCircleOutlined />, color: 'gray', children: 'Multi-branch consolidated reporting' },
        { dot: <ClockCircleOutlined />, color: 'gray', children: 'Integration marketplace' },
      ]}
    />
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────

const CeoSettingsPage: React.FC = () => {
  const { t } = useTranslation();

  const tabItems = [
    { key: 'general', label: 'General', children: <GeneralTab /> },
    { key: 'staff', label: 'Staff', children: <StaffTab /> },
    { key: 'billing', label: 'Billing', children: <BillingTab /> },
    { key: 'roadmap', label: 'Roadmap', children: <RoadmapTab /> },
  ];

  return (
    <>
      <Breadcrumb items={[{ title: 'Settings' }, { title: 'CEO' }]} style={{ marginBottom: 16 }} />
      <Title level={2}>{t('pages.ceo')}</Title>
      <Tabs items={tabItems} />
    </>
  );
};

export default CeoSettingsPage;
