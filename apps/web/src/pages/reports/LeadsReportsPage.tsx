import { useState } from 'react';
import {
  Breadcrumb,
  Typography,
  Card,
  Table,
  DatePicker,
  Select,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import { getLeadsReport } from '../../features/reports/api';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const SOURCE_OPTIONS = [
  { label: 'All Sources', value: '' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Website', value: 'website' },
  { label: 'Referral', value: 'referral' },
  { label: 'Walk-in', value: 'walk_in' },
  { label: 'Other', value: 'other' },
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'New', value: 'NEW' },
  { label: 'Expectation', value: 'EXPECTATION' },
  { label: 'Set', value: 'SET' },
  { label: 'Attended', value: 'ATTENDED' },
  { label: 'Sold', value: 'SOLD' },
  { label: 'Rejected', value: 'REJECTED' },
];

const STATUS_COLORS: Record<string, string> = {
  NEW: 'blue',
  EXPECTATION: 'cyan',
  SET: 'gold',
  ATTENDED: 'orange',
  SOLD: 'green',
  REJECTED: 'red',
};

const SOURCE_COLORS: Record<string, string> = {
  instagram: 'magenta',
  telegram: 'blue',
  facebook: 'geekblue',
  website: 'green',
  referral: 'gold',
  walk_in: 'orange',
  other: 'default',
};

interface LeadRow {
  id: number;
  name: string;
  phone: string;
  source: string;
  status: string;
  createdAt: string;
  daysInPipeline: number;
  assignedTo: string;
}

const LeadsReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [source, setSource] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const params: Record<string, string> = {};
  if (dateRange) {
    params.startDate = dateRange[0].format('YYYY-MM-DD');
    params.endDate = dateRange[1].format('YYYY-MM-DD');
  }
  if (source) params.source = source;
  if (status) params.status = status;

  const { data, isLoading } = useQuery({
    queryKey: ['leads-report', params],
    queryFn: () => getLeadsReport(params),
  });

  const rawRows: any[] = data?.data ?? data ?? [];

  const rows: LeadRow[] = rawRows.map((item: any) => {
    const createdDate = item.createdAt ?? item.created_at;
    const daysInPipeline = createdDate
      ? dayjs().diff(dayjs(createdDate), 'day')
      : 0;
    return {
      id: item.id,
      name: item.name ?? item.fullName ?? '-',
      phone: item.phone ?? '-',
      source: item.source ?? '-',
      status: item.status ?? '-',
      createdAt: createdDate ? dayjs(createdDate).format('YYYY-MM-DD') : '-',
      daysInPipeline,
      assignedTo: item.assignedTo ?? item.staff?.name ?? '-',
    };
  });

  // Source breakdown
  const sourceCounts: Record<string, number> = {};
  rows.forEach((r) => {
    const s = r.source || 'other';
    sourceCounts[s] = (sourceCounts[s] || 0) + 1;
  });

  const columns: ColumnsType<LeadRow> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 140 },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (val: string) => (
        <Tag color={SOURCE_COLORS[val] ?? 'default'}>{val}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (val: string) => (
        <Tag color={STATUS_COLORS[val] ?? 'default'}>{val}</Tag>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
    },
    {
      title: 'Days in Pipeline',
      dataIndex: 'daysInPipeline',
      key: 'daysInPipeline',
      width: 140,
      sorter: (a, b) => a.daysInPipeline - b.daysInPipeline,
    },
    { title: 'Assigned To', dataIndex: 'assignedTo', key: 'assignedTo', width: 140 },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Reports' }, { title: 'Leads' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.leadsReports')}</Title>

      <Card style={{ marginBottom: 24 }}>
        <Space wrap size="middle">
          <RangePicker
            value={dateRange}
            onChange={(values) =>
              setDateRange(values as [Dayjs, Dayjs] | null)
            }
            allowClear
          />
          <Select
            style={{ width: 180 }}
            placeholder="Source"
            value={source || undefined}
            onChange={(val) => setSource(val ?? '')}
            allowClear
            options={SOURCE_OPTIONS}
          />
          <Select
            style={{ width: 180 }}
            placeholder="Status"
            value={status || undefined}
            onChange={(val) => setStatus(val ?? '')}
            allowClear
            options={STATUS_OPTIONS}
          />
        </Space>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Leads" value={rows.length} />
          </Card>
        </Col>
        <Col span={18}>
          <Card title="By Source">
            <Space wrap size="middle">
              {Object.entries(sourceCounts).map(([src, count]) => (
                <Tag
                  key={src}
                  color={SOURCE_COLORS[src] ?? 'default'}
                  style={{ fontSize: 14, padding: '4px 12px' }}
                >
                  {src}: {count}
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      <Card>
        <Table<LeadRow>
          columns={columns}
          dataSource={rows}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 20, showSizeChanger: true }}
          scroll={{ x: 900 }}
        />
      </Card>
    </>
  );
};

export default LeadsReportsPage;
