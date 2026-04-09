import { useState } from 'react';
import {
  Breadcrumb,
  Typography,
  Card,
  Table,
  Tabs,
  DatePicker,
  Select,
  Space,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import { getLogs } from '../../features/reports/api';
import api from '../../lib/axios';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
};

const ENTITY_OPTIONS = [
  { label: 'All Entities', value: '' },
  { label: 'Student', value: 'student' },
  { label: 'Lead', value: 'lead' },
  { label: 'Group', value: 'group' },
  { label: 'Payment', value: 'payment' },
  { label: 'Attendance', value: 'attendance' },
  { label: 'Teacher', value: 'teacher' },
  { label: 'Course', value: 'course' },
];

interface LogRow {
  id: number;
  dateTime: string;
  staffName: string;
  action: string;
  entity: string;
  details: string;
}

const LogsTab: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [staff, setStaff] = useState<string>('');
  const [entityType, setEntityType] = useState<string>('');

  const params: Record<string, string> = {};
  if (dateRange) {
    params.startDate = dateRange[0].format('YYYY-MM-DD');
    params.endDate = dateRange[1].format('YYYY-MM-DD');
  }
  if (staff) params.staffId = staff;
  if (entityType) params.entity = entityType;

  const { data, isLoading } = useQuery({
    queryKey: ['logs', params],
    queryFn: () => getLogs(params),
  });

  const rawRows: any[] = data?.data ?? data ?? [];

  const rows: LogRow[] = rawRows.map((item: any) => ({
    id: item.id,
    dateTime: item.createdAt
      ? dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')
      : item.dateTime ?? '-',
    staffName: item.staffName ?? item.userName ?? '-',
    action: item.action ?? '-',
    entity: item.entity ?? item.entityType ?? '-',
    details: typeof item.details === 'object' ? JSON.stringify(item.details) : (item.details ?? '-'),
  }));

  const columns: ColumnsType<LogRow> = [
    {
      title: 'Date/Time',
      dataIndex: 'dateTime',
      key: 'dateTime',
      width: 160,
      sorter: (a, b) => a.dateTime.localeCompare(b.dateTime),
    },
    { title: 'Staff Name', dataIndex: 'staffName', key: 'staffName', width: 160 },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (val: string) => (
        <Tag color={ACTION_COLORS[val?.toUpperCase()] ?? 'default'}>
          {val?.toUpperCase()}
        </Tag>
      ),
    },
    { title: 'Entity', dataIndex: 'entity', key: 'entity', width: 120 },
    { title: 'Details', dataIndex: 'details', key: 'details', ellipsis: true },
  ];

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <RangePicker
            value={dateRange}
            onChange={(values) => setDateRange(values as [Dayjs, Dayjs] | null)}
            allowClear
          />
          <Select
            style={{ width: 180 }}
            placeholder="Staff"
            value={staff || undefined}
            onChange={(val) => setStaff(val ?? '')}
            allowClear
            options={[{ label: 'All Staff', value: '' }]}
          />
          <Select
            style={{ width: 180 }}
            placeholder="Entity Type"
            value={entityType || undefined}
            onChange={(val) => setEntityType(val ?? '')}
            allowClear
            options={ENTITY_OPTIONS}
          />
        </Space>
      </Card>
      <Table<LogRow>
        columns={columns}
        dataSource={rows}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 20, showSizeChanger: true }}
        scroll={{ x: 800 }}
      />
    </>
  );
};

// ─── SMS History Tab ─────────────────────────────────────────────

const SmsTab: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const params: Record<string, string> = {};
  if (dateRange) {
    params.startDate = dateRange[0].format('YYYY-MM-DD');
    params.endDate = dateRange[1].format('YYYY-MM-DD');
  }

  const { data, isLoading } = useQuery({
    queryKey: ['sms-history', params],
    queryFn: async () => {
      const { data } = await api.get('/sms/history', { params });
      return data;
    },
  });

  const rows = (data?.data ?? data ?? []).map((item: any) => ({
    id: item.id,
    phone: item.phone ?? '-',
    message: item.message ?? item.text ?? '-',
    status: item.status ?? 'sent',
    createdAt: item.createdAt ? dayjs(item.createdAt).format('YYYY-MM-DD HH:mm') : '-',
    studentName: item.student
      ? `${item.student.user?.firstName || ''} ${item.student.user?.lastName || ''}`.trim()
      : '-',
  }));

  const columns: ColumnsType<any> = [
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
    { title: 'Student', dataIndex: 'studentName', key: 'studentName', width: 160 },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 150 },
    { title: 'Message', dataIndex: 'message', key: 'message', ellipsis: true },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => <Tag color={s === 'sent' ? 'green' : 'orange'}>{s}</Tag>,
    },
  ];

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <RangePicker
          value={dateRange}
          onChange={(values) => setDateRange(values as [Dayjs, Dayjs] | null)}
          allowClear
        />
      </Card>
      <Table columns={columns} dataSource={rows} loading={isLoading} rowKey="id" pagination={{ pageSize: 20 }} scroll={{ x: 700 }} />
    </>
  );
};

// ─── Call Log Tab ────────────────────────────────────────────────

const CallsTab: React.FC = () => {
  const [direction, setDirection] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const params: Record<string, string> = {};
  if (direction) params.direction = direction;
  if (dateRange) {
    params.startDate = dateRange[0].format('YYYY-MM-DD');
    params.endDate = dateRange[1].format('YYYY-MM-DD');
  }

  const { data, isLoading } = useQuery({
    queryKey: ['call-history', params],
    queryFn: async () => {
      const { data } = await api.get('/voip/calls', { params });
      return data;
    },
  });

  const rows = (data?.data ?? data ?? []).map((item: any) => ({
    id: item.id,
    phone: item.phone ?? '-',
    direction: item.direction ?? '-',
    duration: item.duration ? `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}` : '-',
    createdAt: item.createdAt ? dayjs(item.createdAt).format('YYYY-MM-DD HH:mm') : '-',
    studentName: item.student
      ? `${item.student.user?.firstName || ''} ${item.student.user?.lastName || ''}`.trim()
      : '-',
  }));

  const columns: ColumnsType<any> = [
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
    { title: 'Student', dataIndex: 'studentName', key: 'studentName', width: 160 },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 150 },
    {
      title: 'Direction',
      dataIndex: 'direction',
      key: 'direction',
      width: 110,
      render: (d: string) => <Tag color={d === 'incoming' ? 'blue' : 'green'}>{d}</Tag>,
    },
    { title: 'Duration', dataIndex: 'duration', key: 'duration', width: 100 },
  ];

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <RangePicker
            value={dateRange}
            onChange={(values) => setDateRange(values as [Dayjs, Dayjs] | null)}
            allowClear
          />
          <Select
            style={{ width: 150 }}
            placeholder="Direction"
            value={direction || undefined}
            onChange={(val) => setDirection(val ?? '')}
            allowClear
            options={[
              { label: 'All', value: '' },
              { label: 'Incoming', value: 'incoming' },
              { label: 'Outgoing', value: 'outgoing' },
            ]}
          />
        </Space>
      </Card>
      <Table columns={columns} dataSource={rows} loading={isLoading} rowKey="id" pagination={{ pageSize: 20 }} scroll={{ x: 700 }} />
    </>
  );
};

// ─── Teacher Attendance (Workly) Tab ─────────────────────────────

const WorklyTab: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-attendance-log'],
    queryFn: async () => {
      const { data } = await api.get('/attendance/teachers');
      return data;
    },
  });

  const rows = (data?.data ?? data ?? []).map((item: any) => ({
    id: item.id,
    teacherName: item.teacher
      ? `${item.teacher.user?.firstName || ''} ${item.teacher.user?.lastName || ''}`.trim()
      : item.teacherName ?? '-',
    date: item.date ? dayjs(item.date).format('YYYY-MM-DD') : '-',
    checkIn: item.checkIn ?? '-',
    checkOut: item.checkOut ?? '-',
    status: item.status ?? '-',
  }));

  const columns: ColumnsType<any> = [
    { title: 'Date', dataIndex: 'date', key: 'date', width: 120 },
    { title: 'Teacher', dataIndex: 'teacherName', key: 'teacherName', width: 180 },
    { title: 'Check In', dataIndex: 'checkIn', key: 'checkIn', width: 100 },
    { title: 'Check Out', dataIndex: 'checkOut', key: 'checkOut', width: 100 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => {
        const colors: Record<string, string> = { PRESENT: 'green', LATE: 'orange', ABSENT: 'red' };
        return <Tag color={colors[s] ?? 'default'}>{s}</Tag>;
      },
    },
  ];

  return (
    <Table columns={columns} dataSource={rows} loading={isLoading} rowKey="id" pagination={{ pageSize: 20 }} scroll={{ x: 600 }} />
  );
};

// ─── Main Page ────────────────────────────────────────────────────

const LogsPage: React.FC = () => {
  const { t } = useTranslation();

  const tabItems = [
    { key: 'logs', label: 'Logs', children: <LogsTab /> },
    { key: 'workly', label: 'Workly Report', children: <WorklyTab /> },
    { key: 'sms', label: 'Sent SMS', children: <SmsTab /> },
    { key: 'calls', label: 'Call Log', children: <CallsTab /> },
  ];

  return (
    <>
      <Breadcrumb items={[{ title: 'Reports' }, { title: 'Logs' }]} style={{ marginBottom: 16 }} />
      <Title level={2}>{t('pages.logs')}</Title>
      <Tabs defaultActiveKey="logs" items={tabItems} />
    </>
  );
};

export default LogsPage;
