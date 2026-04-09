import { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Breadcrumb,
  Drawer,
  Form,
  Input,
  DatePicker,
  Select,
  Popconfirm,
  Modal,
  Tag,
  Space,
  Spin,
  Empty,
  message,
} from 'antd';
import {
  PlusOutlined,
  CheckOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  getReminders,
  createReminder,
  completeReminder,
  deleteReminder,
} from '../../features/reminders/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ReminderItem {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  assignedToId?: number;
  lead?: { id: number; firstName: string; phone: string } | null;
  student?: { id: number; firstName: string; lastName?: string; phone: string } | null;
  createdAt: string;
}

interface RemindersData {
  overdue: ReminderItem[];
  today: ReminderItem[];
  future: ReminderItem[];
}

const RemindersPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<number | null>(null);
  const [completionNote, setCompletionNote] = useState('');
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery<RemindersData>({
    queryKey: ['reminders'],
    queryFn: getReminders,
  });

  const createMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setDrawerOpen(false);
      form.resetFields();
      message.success('Reminder created');
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) => completeReminder(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setCompleteModalOpen(false);
      setCompletionNote('');
      message.success('Reminder completed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      message.success('Reminder deleted');
    },
  });

  const handleCreate = (values: any) => {
    createMutation.mutate({
      ...values,
      dueDate: values.dueDate.toISOString(),
    });
  };

  const handleComplete = () => {
    if (selectedReminder !== null) {
      completeMutation.mutate({ id: selectedReminder, note: completionNote || undefined });
    }
  };

  const renderColumn = (
    title: string,
    items: ReminderItem[],
    color: string,
    headerBg: string,
  ) => (
    <Col xs={24} md={8}>
      <Card
        size="small"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: color,
              }}
            />
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              {title} ({items.length})
            </span>
          </div>
        }
        headStyle={{ background: headerBg, borderBottom: `2px solid ${color}` }}
        bodyStyle={{ padding: 8, maxHeight: 600, overflowY: 'auto' }}
      >
        {items.length === 0 ? (
          <Empty description="No reminders" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            {items.map((item) => (
              <Card
                key={item.id}
                size="small"
                bodyStyle={{ padding: '12px 16px' }}
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                {item.description && (
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    {item.description}
                  </Text>
                )}
                {item.lead && (
                  <div style={{ marginBottom: 4 }}>
                    <Tag color="blue">Lead: {item.lead.firstName}</Tag>
                  </div>
                )}
                {item.student && (
                  <div style={{ marginBottom: 4 }}>
                    <Tag color="green">
                      Student: {item.student.firstName} {item.student.lastName || ''}
                    </Tag>
                  </div>
                )}
                <div style={{ marginBottom: 8 }}>
                  <ClockCircleOutlined style={{ marginRight: 4, color: color === '#ff4d4f' ? '#ff4d4f' : '#8c8c8c' }} />
                  <Text
                    type={color === '#ff4d4f' ? 'danger' : 'secondary'}
                    style={{ fontSize: 12 }}
                  >
                    {dayjs(item.dueDate).format('DD MMM YYYY, HH:mm')}
                  </Text>
                </div>
                <Space>
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => {
                      setSelectedReminder(item.id);
                      setCompleteModalOpen(true);
                    }}
                  >
                    Complete
                  </Button>
                  <Popconfirm
                    title="Delete this reminder?"
                    onConfirm={() => deleteMutation.mutate(item.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </Card>
            ))}
          </Space>
        )}
      </Card>
    </Col>
  );

  return (
    <>
      <Breadcrumb items={[{ title: t('pages.reminders') }]} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>{t('pages.reminders')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
          Add Reminder
        </Button>
      </div>

      <Spin spinning={isLoading}>
        <Row gutter={16}>
          {renderColumn('Overdue', data?.overdue || [], '#ff4d4f', '#fff2f0')}
          {renderColumn('Today', data?.today || [], '#1890ff', '#e6f7ff')}
          {renderColumn('Future', data?.future || [], '#52c41a', '#f6ffed')}
        </Row>
      </Spin>

      {/* Create Drawer */}
      <Drawer
        title="Add Reminder"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={400}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={() => form.submit()} loading={createMutation.isPending}>
              Create
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="leadId" label="Link to Lead">
            <Select placeholder="Select lead" allowClear showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item name="studentId" label="Link to Student">
            <Select placeholder="Select student" allowClear showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item name="assignedToId" label="Assign to">
            <Select placeholder="Select staff" allowClear showSearch optionFilterProp="label" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Complete Modal */}
      <Modal
        title="Complete Reminder"
        open={completeModalOpen}
        onOk={handleComplete}
        onCancel={() => {
          setCompleteModalOpen(false);
          setCompletionNote('');
        }}
        confirmLoading={completeMutation.isPending}
        okText="Complete"
      >
        <Typography.Paragraph>Add an optional completion note:</Typography.Paragraph>
        <TextArea
          rows={3}
          value={completionNote}
          onChange={(e) => setCompletionNote(e.target.value)}
          placeholder="Completion note (optional)"
        />
      </Modal>
    </>
  );
};

export default RemindersPage;
