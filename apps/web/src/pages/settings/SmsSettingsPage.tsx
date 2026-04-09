import React, { useEffect, useState } from 'react';
import {
  Typography,
  Breadcrumb,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Table,
  Modal,
  Tag,
  message,
  Space,
  Card,
  Divider,
} from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import api from '../../lib/axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SmsRecord {
  id: number;
  studentId: number;
  phone: string;
  message: string;
  status: string;
  sentAt: string;
  student?: {
    user: { firstName: string; lastName: string; phone: string };
  };
}

const SmsSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [settingsForm] = Form.useForm();
  const [sendForm] = Form.useForm();
  const [history, setHistory] = useState<SmsRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [messageLength, setMessageLength] = useState(0);

  const fetchHistory = async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const res = await api.get('/sms/history', { params: { page, limit } });
      const body = res.data;
      setHistory(body.data ?? []);
      setPagination({
        current: body.meta?.page ?? page,
        pageSize: body.meta?.limit ?? limit,
        total: body.meta?.total ?? 0,
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async () => {
    try {
      const values = await sendForm.validateFields();
      setSending(true);
      await api.post('/sms/send', {
        studentId: values.studentId,
        message: values.message,
      });
      message.success('SMS sent successfully');
      setSendModalOpen(false);
      sendForm.resetFields();
      setMessageLength(0);
      fetchHistory();
    } catch {
      message.error('Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  const columns: ColumnsType<SmsRecord> = [
    {
      title: 'Date',
      dataIndex: 'sentAt',
      key: 'sentAt',
      render: (val: string) => new Date(val).toLocaleString(),
      width: 180,
    },
    {
      title: 'Student',
      key: 'student',
      render: (_: unknown, record: SmsRecord) =>
        record.student?.user
          ? `${record.student.user.firstName} ${record.student.user.lastName}`
          : '—',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const color = status === 'SENT' ? 'green' : status === 'FAILED' ? 'red' : 'blue';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Settings' }, { title: 'SMS' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.sms')}</Title>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>SMS Provider Settings</Title>
        <Form form={settingsForm} layout="vertical" style={{ maxWidth: 500 }}>
          <Form.Item label="Provider" name="provider">
            <Select placeholder="Select SMS provider">
              <Select.Option value="eskiz">Eskiz</Select.Option>
              <Select.Option value="playmobile">PlayMobile</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="API Key" name="apiKey">
            <Input.Password placeholder="Enter API key" />
          </Form.Item>
          <Form.Item label="Sender Name" name="senderName">
            <Input placeholder="Enter sender name" />
          </Form.Item>
          <Form.Item label="Active" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button type="primary">Save Settings</Button>
        </Form>
      </Card>

      <Divider />

      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>
          SMS History
        </Title>
        <Button type="primary" onClick={() => setSendModalOpen(true)}>
          Send SMS
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={history}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => fetchHistory(page, pageSize),
        }}
      />

      <Modal
        title="Send SMS"
        open={sendModalOpen}
        onCancel={() => {
          setSendModalOpen(false);
          sendForm.resetFields();
          setMessageLength(0);
        }}
        onOk={handleSend}
        confirmLoading={sending}
        okText="Send"
      >
        <Form form={sendForm} layout="vertical">
          <Form.Item
            label="Student ID"
            name="studentId"
            rules={[{ required: true, message: 'Please enter student ID' }]}
          >
            <Input type="number" placeholder="Enter student ID" />
          </Form.Item>
          <Form.Item
            label="Message"
            name="message"
            rules={[{ required: true, message: 'Please enter a message' }]}
          >
            <TextArea
              rows={4}
              maxLength={640}
              showCount
              placeholder="Enter SMS message"
              onChange={(e) => setMessageLength(e.target.value.length)}
            />
          </Form.Item>
          <Text type="secondary">{messageLength} / 640 characters</Text>
        </Form>
      </Modal>
    </>
  );
};

export default SmsSettingsPage;
