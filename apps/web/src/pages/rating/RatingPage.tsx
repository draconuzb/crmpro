import { useState } from 'react';
import {
  Card,
  Table,
  Breadcrumb,
  Typography,
  DatePicker,
  Select,
  Segmented,
  Space,
  Spin,
  Progress,
  Rate,
  Empty,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { getRatings, getRatingChart } from '../../features/rating/api';
import api from '../../lib/axios';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface RatingItem {
  id: number;
  studentName: string;
  studentId: number;
  groupId: number;
  groupName: string;
  score: number;
  period: string;
  createdAt: string;
}

interface GroupOption {
  id: number;
  name: string;
}

const RatingPage: React.FC = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<string>('Table');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [groupId, setGroupId] = useState<number | undefined>(undefined);

  const params: any = {};
  if (dateRange && dateRange[0]) params.startDate = dateRange[0].toISOString();
  if (dateRange && dateRange[1]) params.endDate = dateRange[1].toISOString();
  if (groupId) params.groupId = groupId;

  const { data: ratings, isLoading } = useQuery<RatingItem[]>({
    queryKey: ['ratings', params],
    queryFn: () => getRatings(params),
  });

  const chartParams: any = {};
  if (dateRange && dateRange[0]) chartParams.startDate = dateRange[0].toISOString();
  if (dateRange && dateRange[1]) chartParams.endDate = dateRange[1].toISOString();

  const { data: chartData, isLoading: isChartLoading } = useQuery<{ studentName: string; score: number; period: string }[]>({
    queryKey: ['ratings-chart', chartParams],
    queryFn: () => getRatingChart(chartParams),
    enabled: viewMode === 'Graph',
  });

  const { data: groups } = useQuery<GroupOption[]>({
    queryKey: ['groups-list'],
    queryFn: () => api.get('/groups', { params: { status: 'ACTIVE' } }).then((r) => {
      const d = r.data;
      return Array.isArray(d) ? d : d.data || [];
    }),
  });

  const columns = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, idx: number) => idx + 1,
    },
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
      sorter: (a: RatingItem, b: RatingItem) => a.studentName.localeCompare(b.studentName),
    },
    {
      title: 'Group',
      dataIndex: 'groupName',
      key: 'groupName',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      sorter: (a: RatingItem, b: RatingItem) => a.score - b.score,
      render: (score: number) => (
        <Space>
          <Rate disabled allowHalf value={Math.min(score / 20, 5)} style={{ fontSize: 14 }} />
          <Typography.Text strong>{score}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
    },
  ];

  const chartMaxScore = chartData && chartData.length > 0
    ? Math.max(...chartData.map((r) => r.score))
    : 100;

  const renderGraph = () => {
    if (isChartLoading) {
      return <Spin />;
    }
    if (!chartData || chartData.length === 0) {
      return <Empty description="No rating data" />;
    }

    return (
      <div style={{ padding: '16px 0' }}>
        {chartData.map((item, idx) => (
          <div
            key={`${item.studentName}-${idx}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 12,
              gap: 12,
            }}
          >
            <div style={{ width: 30, textAlign: 'right', color: '#8c8c8c', fontWeight: 600 }}>
              {idx + 1}
            </div>
            <div style={{ width: 160, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.studentName}
            </div>
            <div style={{ flex: 1 }}>
              <Progress
                percent={chartMaxScore > 0 ? Math.round((item.score / chartMaxScore) * 100) : 0}
                strokeColor={{
                  '0%': '#1890ff',
                  '100%': '#52c41a',
                }}
                format={() => <span style={{ fontWeight: 600 }}>{item.score}</span>}
              />
            </div>
            <div style={{ width: 100, color: '#8c8c8c', fontSize: 12 }}>
              {item.period}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Breadcrumb items={[{ title: t('pages.rating') }]} style={{ marginBottom: 16 }} />
      <Title level={2}>{t('pages.rating')}</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size={16}>
          <RangePicker
            value={dateRange as any}
            onChange={(vals) => setDateRange(vals as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)}
            allowClear
          />
          <Select
            placeholder="Select group"
            allowClear
            showSearch
            optionFilterProp="label"
            style={{ width: 200 }}
            value={groupId}
            onChange={(val) => setGroupId(val)}
            options={(groups || []).map((g) => ({ value: g.id, label: g.name }))}
          />
          <Segmented
            options={['Table', 'Graph']}
            value={viewMode}
            onChange={(v) => setViewMode(v as string)}
          />
        </Space>
      </Card>

      <Spin spinning={isLoading}>
        {viewMode === 'Table' ? (
          <Card>
            <Table
              columns={columns}
              dataSource={(ratings || []).map((r) => ({ ...r, key: r.id }))}
              pagination={{ pageSize: 20, showSizeChanger: true }}
              size="middle"
            />
          </Card>
        ) : (
          <Card title="Student Ratings">
            {renderGraph()}
          </Card>
        )}
      </Spin>
    </>
  );
};

export default RatingPage;
