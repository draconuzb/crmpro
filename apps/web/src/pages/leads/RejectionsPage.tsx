import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Card, Table, Tabs, Tag, Input, Select, DatePicker, Space, Typography, Statistic, Row, Col, Button, Tooltip,
} from 'antd';
import {
  PhoneOutlined, MessageOutlined, BellOutlined, SearchOutlined,
  CloseCircleOutlined, ExperimentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getDepartures, getRejectionReasons } from '@/features/rejections/api';
import { useAuth } from '@/features/auth/hooks';

const { RangePicker } = DatePicker;
const { Title } = Typography;

interface DepartureRecord {
  id: number;
  type: string;
  studentId: number;
  studentName: string;
  phone: string;
  reason: string;
  reasonId: number;
  note: string | null;
  groupId: number | null;
  teacherId: number | null;
  courseId: number | null;
  departureDate: string;
  createdAt: string;
}

const RejectionsPage: React.FC = () => {
  const { t } = useTranslation();
  const { activeBranchId } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [page, setPage] = useState(1);

  const typeFilter = activeTab === 'sinov' ? 'sinov' : activeTab === 'doimiy' ? 'doimiy' : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['departures', activeBranchId, typeFilter, reasonFilter, search, dateRange?.[0]?.format('YYYY-MM-DD'), dateRange?.[1]?.format('YYYY-MM-DD'), page],
    queryFn: () => getDepartures({
      type: typeFilter,
      reasonId: reasonFilter,
      search: search || undefined,
      startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
      page,
      limit: 20,
    }),
  });

  const { data: reasons } = useQuery({
    queryKey: ['rejection-reasons', activeBranchId],
    queryFn: getRejectionReasons,
  });

  const columns: ColumnsType<DepartureRecord> = [
    {
      title: t('rejections.student'),
      dataIndex: 'studentName',
      key: 'studentName',
      render: (name: string, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: t('rejections.type'),
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type: string) => (
        <Tag
          icon={type === 'sinov' ? <ExperimentOutlined /> : <CloseCircleOutlined />}
          color={type === 'sinov' ? 'orange' : 'red'}
        >
          {type === 'sinov' ? t('rejections.fromTrialLesson') : t('rejections.fromRegularLesson')}
        </Tag>
      ),
    },
    {
      title: t('rejections.reason'),
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => <Tag>{reason}</Tag>,
    },
    {
      title: t('rejections.note'),
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (note: string | null) => note || '—',
    },
    {
      title: t('rejections.date'),
      dataIndex: 'departureDate',
      key: 'departureDate',
      width: 110,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: t('rejections.actions'),
      key: 'actions',
      width: 120,
      render: (_: any, record: DepartureRecord) => (
        <Space size={4}>
          <Tooltip title={t('rejections.call')}>
            <Button type="text" size="small" icon={<PhoneOutlined />} href={`tel:${record.phone}`} />
          </Tooltip>
          <Tooltip title={t('rejections.sendSms')}>
            <Button type="text" size="small" icon={<MessageOutlined />} />
          </Tooltip>
          <Tooltip title={t('rejections.addReminder')}>
            <Button type="text" size="small" icon={<BellOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const stats = data?.stats || { sinov: 0, doimiy: 0, total: 0 };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20 }}>{t('rejections.title')}</Title>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic title={t('rejections.totalRejected')} value={stats.total} valueStyle={{ color: '#6366f1' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title={t('rejections.fromTrialLesson')}
              value={stats.sinov}
              valueStyle={{ color: '#f59e0b' }}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title={t('rejections.fromRegularLesson')}
              value={stats.doimiy}
              valueStyle={{ color: '#ef4444' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap size={12}>
          <Input
            placeholder={t('common.search')}
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder={t('rejections.reason')}
            value={reasonFilter}
            onChange={v => { setReasonFilter(v); setPage(1); }}
            style={{ width: 160 }}
            allowClear
            options={reasons?.map((r: any) => ({ value: r.id, label: r.label })) || []}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => { setDateRange(dates as any); setPage(1); }}
          />
        </Space>
      </Card>

      {/* Tabs + Table */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={key => { setActiveTab(key); setPage(1); }}
          items={[
            { key: 'all', label: `${t('rejections.all')} (${stats.total})` },
            { key: 'sinov', label: `${t('rejections.fromTrialLesson')} (${stats.sinov})` },
            { key: 'doimiy', label: `${t('rejections.fromRegularLesson')} (${stats.doimiy})` },
          ]}
        />
        <Table
          dataSource={data?.data || []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          locale={{ emptyText: t('rejections.noRejections') }}
          pagination={{
            current: page,
            pageSize: 20,
            total: data?.total || 0,
            onChange: setPage,
            showTotal: (total) => `${t('common.total')}: ${total}`,
          }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default RejectionsPage;
