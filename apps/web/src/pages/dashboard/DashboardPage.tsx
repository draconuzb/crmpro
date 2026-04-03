import { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Breadcrumb,
  Typography,
  Spin,
  Table,
  Radio,
  Segmented,
} from 'antd';
import {
  FunnelPlotOutlined,
  UserOutlined,
  AppstoreOutlined,
  WarningOutlined,
  ExperimentOutlined,
  DollarOutlined,
  UserDeleteOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getDashboardStats, getDashboardRevenue, getSchedule } from '../../features/dashboard/api';

const { Title } = Typography;

interface DashboardStats {
  activeLeads: number;
  activeStudents: number;
  totalGroups: number;
  debtors: number;
  trialStudents: number;
  paidThisMonth: number;
  leftActiveGroup: number;
  leftAfterTrial: number;
}

interface RevenueItem {
  month: string;
  revenue: number;
}

interface ScheduleGroup {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  dayType: string;
  room?: { id: number; name: string };
  teacher?: { user?: { firstName: string; lastName?: string } };
}

const statCards: {
  key: keyof DashboardStats;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}[] = [
  { key: 'activeLeads', label: 'Active Leads', icon: <FunnelPlotOutlined />, color: '#1890ff', bg: '#e6f7ff' },
  { key: 'activeStudents', label: 'Active Students', icon: <UserOutlined />, color: '#52c41a', bg: '#f6ffed' },
  { key: 'totalGroups', label: 'Groups', icon: <AppstoreOutlined />, color: '#722ed1', bg: '#f9f0ff' },
  { key: 'debtors', label: 'Debtors', icon: <WarningOutlined />, color: '#ff4d4f', bg: '#fff2f0' },
  { key: 'trialStudents', label: 'In Trial Lesson', icon: <ExperimentOutlined />, color: '#fa8c16', bg: '#fff7e6' },
  { key: 'paidThisMonth', label: 'Paid This Month', icon: <DollarOutlined />, color: '#52c41a', bg: '#f6ffed' },
  { key: 'leftActiveGroup', label: 'Left Active Group', icon: <UserDeleteOutlined />, color: '#ff4d4f', bg: '#fff2f0' },
  { key: 'leftAfterTrial', label: 'Left After Trial', icon: <StopOutlined />, color: '#8c8c8c', bg: '#fafafa' },
];

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [dayFilter, setDayFilter] = useState<string>('ODD');
  const [viewMode, setViewMode] = useState<string>('Horizontal');

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery<RevenueItem[]>({
    queryKey: ['dashboard-revenue'],
    queryFn: getDashboardRevenue,
  });

  const { data: scheduleData } = useQuery<ScheduleGroup[]>({
    queryKey: ['schedule', dayFilter],
    queryFn: () => getSchedule({ dayType: dayFilter }),
  });

  // Format currency
  const formatUZS = (val: number) =>
    new Intl.NumberFormat('uz-UZ').format(val);

  // Build schedule grid
  const buildScheduleGrid = () => {
    const groups = Array.isArray(scheduleData) ? scheduleData : [];
    if (groups.length === 0) {
      return <Typography.Text type="secondary">No schedule data available</Typography.Text>;
    }

    // Collect unique rooms and time slots
    const roomsSet = new Map<number, string>();
    const timesSet = new Set<string>();

    groups.forEach((g) => {
      if (g.room) {
        roomsSet.set(g.room.id, g.room.name);
      }
      timesSet.add(g.startTime);
    });

    const rooms = Array.from(roomsSet.entries()).map(([id, name]) => ({ id, name }));
    const times = Array.from(timesSet).sort();

    // Build lookup: roomId-time -> group
    const lookup = new Map<string, ScheduleGroup>();
    groups.forEach((g) => {
      if (g.room) {
        lookup.set(`${g.room.id}-${g.startTime}`, g);
      }
    });

    if (viewMode === 'Horizontal') {
      const columns = [
        { title: 'Time', dataIndex: 'time', key: 'time', width: 80 },
        ...rooms.map((r) => ({
          title: r.name,
          dataIndex: `room_${r.id}`,
          key: `room_${r.id}`,
          render: (val: ScheduleGroup | undefined) =>
            val ? (
              <div
                style={{
                  background: '#e6f7ff',
                  borderLeft: '3px solid #1890ff',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                <div style={{ fontWeight: 600 }}>{val.name}</div>
                <div style={{ color: '#666' }}>
                  {val.teacher?.user
                    ? `${val.teacher.user.firstName} ${val.teacher.user.lastName || ''}`
                    : ''}
                </div>
              </div>
            ) : null,
        })),
      ];

      const dataSource = times.map((time) => {
        const row: any = { key: time, time };
        rooms.forEach((r) => {
          row[`room_${r.id}`] = lookup.get(`${r.id}-${time}`);
        });
        return row;
      });

      return (
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size="small"
          bordered
          scroll={{ x: 'max-content' }}
        />
      );
    }

    // Vertical: rows=rooms, columns=times
    const columns = [
      { title: 'Room', dataIndex: 'room', key: 'room', width: 100 },
      ...times.map((time) => ({
        title: time,
        dataIndex: `time_${time}`,
        key: `time_${time}`,
        render: (val: ScheduleGroup | undefined) =>
          val ? (
            <div
              style={{
                background: '#f6ffed',
                borderLeft: '3px solid #52c41a',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 600 }}>{val.name}</div>
              <div style={{ color: '#666' }}>
                {val.teacher?.user
                  ? `${val.teacher.user.firstName} ${val.teacher.user.lastName || ''}`
                  : ''}
              </div>
            </div>
          ) : null,
      })),
    ];

    const dataSource = rooms.map((r) => {
      const row: any = { key: r.id, room: r.name };
      times.forEach((time) => {
        row[`time_${time}`] = lookup.get(`${r.id}-${time}`);
      });
      return row;
    });

    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
      />
    );
  };

  // Revenue chart: simple SVG line chart
  const renderRevenueChart = () => {
    if (!revenue || revenue.length === 0) {
      return <Typography.Text type="secondary">No revenue data</Typography.Text>;
    }

    const maxRevenue = Math.max(...revenue.map((r) => r.revenue), 1);
    const width = 800;
    const height = 250;
    const padding = { top: 20, right: 20, bottom: 40, left: 20 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const points = revenue.map((r, i) => {
      const x = padding.left + (i / Math.max(revenue.length - 1, 1)) * chartW;
      const y = padding.top + chartH - (r.revenue / maxRevenue) * chartH;
      return { x, y, ...r };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const areaPath =
      linePath +
      ` L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

    return (
      <div style={{ overflowX: 'auto' }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1890ff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#1890ff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = padding.top + chartH - frac * chartH;
            return (
              <line
                key={frac}
                x1={padding.left}
                y1={y}
                x2={padding.left + chartW}
                y2={y}
                stroke="#f0f0f0"
                strokeWidth={1}
              />
            );
          })}
          {/* Area fill */}
          <path d={areaPath} fill="url(#revGrad)" />
          {/* Line */}
          <path d={linePath} fill="none" stroke="#1890ff" strokeWidth={2.5} />
          {/* Points */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={4} fill="#1890ff" />
          ))}
          {/* Month labels */}
          {points.map((p, i) => (
            <text
              key={`label-${i}`}
              x={p.x}
              y={padding.top + chartH + 20}
              textAnchor="middle"
              fontSize={10}
              fill="#8c8c8c"
            >
              {p.month.substring(5)}
            </text>
          ))}
        </svg>
        {/* Fallback table */}
        <Table
          style={{ marginTop: 16 }}
          size="small"
          pagination={false}
          dataSource={revenue.map((r, i) => ({ key: i, ...r }))}
          columns={[
            { title: 'Month', dataIndex: 'month' },
            {
              title: 'Revenue (UZS)',
              dataIndex: 'revenue',
              render: (v: number) => formatUZS(v),
              align: 'right' as const,
            },
          ]}
        />
      </div>
    );
  };

  return (
    <>
      <Breadcrumb items={[{ title: t('pages.dashboard') }]} style={{ marginBottom: 16 }} />
      <Title level={2}>{t('pages.dashboard')}</Title>

      {/* Stat Cards */}
      <Spin spinning={statsLoading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {statCards.map((card) => (
            <Col key={card.key} xs={12} sm={12} md={6} lg={6}>
              <Card
                size="small"
                style={{ background: card.bg, borderColor: 'transparent' }}
                bodyStyle={{ padding: '16px 20px' }}
              >
                <Statistic
                  title={
                    <span style={{ color: '#595959', fontSize: 13 }}>{card.label}</span>
                  }
                  value={stats?.[card.key] ?? 0}
                  prefix={
                    <span style={{ color: card.color, fontSize: 20, marginRight: 4 }}>
                      {card.icon}
                    </span>
                  }
                  valueStyle={{ fontSize: 28, fontWeight: 700 }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      {/* Revenue Chart */}
      <Card
        title="Revenue"
        style={{ marginBottom: 24 }}
        loading={revenueLoading}
      >
        {renderRevenueChart()}
      </Card>

      {/* Schedule Widget */}
      <Card
        title="Schedule"
        extra={
          <Segmented
            options={['Horizontal', 'Vertical']}
            value={viewMode}
            onChange={(v) => setViewMode(v as string)}
          />
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Radio.Group
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="ODD">Odd days</Radio.Button>
            <Radio.Button value="EVEN">Even days</Radio.Button>
            <Radio.Button value="OTHER">Other</Radio.Button>
          </Radio.Group>
        </div>
        {buildScheduleGrid()}
      </Card>
    </>
  );
};

export default DashboardPage;
