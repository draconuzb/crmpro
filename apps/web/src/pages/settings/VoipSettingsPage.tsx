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
  Tag,
  Card,
  Divider,
} from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import api from '../../lib/axios';

const { Title } = Typography;

interface CallRecord {
  id: number;
  studentId: number;
  phone: string;
  direction: string;
  duration: number | null;
  recordingUrl: string | null;
  calledAt: string;
  student?: {
    user: { firstName: string; lastName: string; phone: string };
  };
}

const VoipSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [settingsForm] = Form.useForm();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const fetchCalls = async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const res = await api.get('/voip/calls', { params: { page, limit } });
      const body = res.data;
      setCalls(body.data ?? []);
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
    fetchCalls();
  }, []);

  const formatDuration = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const columns: ColumnsType<CallRecord> = [
    {
      title: 'Date',
      dataIndex: 'calledAt',
      key: 'calledAt',
      render: (val: string) => new Date(val).toLocaleString(),
      width: 180,
    },
    {
      title: 'Student',
      key: 'student',
      render: (_: unknown, record: CallRecord) =>
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
      title: 'Direction',
      dataIndex: 'direction',
      key: 'direction',
      width: 120,
      render: (direction: string) => {
        const color = direction === 'INBOUND' ? 'blue' : 'green';
        return <Tag color={color}>{direction}</Tag>;
      },
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (val: number | null) => formatDuration(val),
    },
    {
      title: 'Recording',
      dataIndex: 'recordingUrl',
      key: 'recordingUrl',
      width: 120,
      render: (url: string | null) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            Play
          </a>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Settings' }, { title: 'VoIP' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.voip')}</Title>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>VoIP Provider Settings</Title>
        <Form form={settingsForm} layout="vertical" style={{ maxWidth: 500 }}>
          <Form.Item label="Provider" name="provider">
            <Select placeholder="Select VoIP provider">
              <Select.Option value="asterisk">Asterisk</Select.Option>
              <Select.Option value="twilio">Twilio</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="API Key" name="apiKey">
            <Input.Password placeholder="Enter API key" />
          </Form.Item>
          <Form.Item label="SIP Domain" name="sipDomain">
            <Input placeholder="sip.example.com" />
          </Form.Item>
          <Form.Item label="Active" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button type="primary">Save Settings</Button>
        </Form>
      </Card>

      <Divider />

      <Title level={4}>Call History</Title>

      <Table
        columns={columns}
        dataSource={calls}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => fetchCalls(page, pageSize),
        }}
      />
    </>
  );
};

export default VoipSettingsPage;
