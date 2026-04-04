import { useState } from 'react';
import {
  Row, Col, Card, Statistic, Typography, Spin, Table, Radio, Segmented,
} from 'antd';
import {
  FunnelPlotOutlined, UserOutlined, AppstoreOutlined, WarningOutlined,
  ExperimentOutlined, DollarOutlined, UserDeleteOutlined, StopOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getDashboardStats, getDashboardRevenue, getSchedule } from '../../features/dashboard/api';

const { Title, Text } = Typography;

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
  gradient: string;
  iconBg: string;
}[] = [
  { key: 'activeLeads', label: 'Faol lidlar', icon: <FunnelPlotOutlined />, gradient: 'linear-gradient(135deg, #dbeafe, #eff6ff)', iconBg: '#3b82f6' },
  { key: 'activeStudents', label: "Faol o'quvchilar", icon: <UserOutlined />, gradient: 'linear-gradient(135deg, #d1fae5, #ecfdf5)', iconBg: '#10b981' },
  { key: 'totalGroups', label: 'Guruhlar', icon: <AppstoreOutlined />, gradient: 'linear-gradient(135deg, #ede9fe, #f5f3ff)', iconBg: '#8b5cf6' },
  { key: 'debtors', label: 'Qarzdorlar', icon: <WarningOutlined />, gradient: 'linear-gradient(135deg, #fee2e2, #fef2f2)', iconBg: '#ef4444' },
  { key: 'trialStudents', label: 'Sinov darsida', icon: <ExperimentOutlined />, gradient: 'linear-gradient(135deg, #ffedd5, #fff7ed)', iconBg: '#f97316' },
  { key: 'paidThisMonth', label: "Bu oy to'lagan", icon: <DollarOutlined />, gradient: 'linear-gradient(135deg, #d1fae5, #ecfdf5)', iconBg: '#10b981' },
  { key: 'leftActiveGroup', label: 'Guruhdan ketgan', icon: <UserDeleteOutlined />, gradient: 'linear-gradient(135deg, #fee2e2, #fef2f2)', iconBg: '#ef4444' },
  { key: 'leftAfterTrial', label: 'Sinovdan ketgan', icon: <StopOutlined />, gradient: 'linear-gradient(135deg, #f1f5f9, #f8fafc)', iconBg: '#64748b' },
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

  const formatUZS = (val: number) => new Intl.NumberFormat('uz-UZ').format(val);

  const renderRevenueChart = () => {
    if (!revenue || revenue.length === 0) {
      return <Text type="secondary">Ma'lumot yo'q</Text>;
    }

    const maxRevenue = Math.max(...revenue.map((r) => r.revenue), 1);
    const width = 800;
    const height = 280;
    const padding = { top: 30, right: 20, bottom: 50, left: 20 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const points = revenue.map((r, i) => {
      const x = padding.left + (i / Math.max(revenue.length - 1, 1)) * chartW;
      const y = padding.top + chartH - (r.revenue / maxRevenue) * chartH;
      return { x, y, ...r };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = linePath + ` L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

    return (
      <div style={{ overflowX: 'auto' }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = padding.top + chartH - frac * chartH;
            return (
              <g key={frac}>
                <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#e2e8f0" strokeWidth={1} />
                <text x={padding.left - 2} y={y - 6} fontSize={10} fill="#94a3b8" textAnchor="start">
                  {formatUZS(Math.round(maxRevenue * frac))}
                </text>
              </g>
            );
          })}
          <path d={areaPath} fill="url(#revGrad)" />
          <path d={linePath} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={5} fill="#fff" stroke="#6366f1" strokeWidth={2.5} />
              <text x={p.x} y={padding.top + chartH + 24} textAnchor="middle" fontSize={11} fill="#64748b" fontWeight={500}>
                {p.month.substring(5)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  const buildScheduleGrid = () => {
    const groups = Array.isArray(scheduleData) ? scheduleData : [];
    if (groups.length === 0) {
      return <Text type="secondary">Jadval ma'lumotlari yo'q</Text>;
    }

    const roomsSet = new Map<number, string>();
    const timesSet = new Set<string>();
    groups.forEach((g) => {
      if (g.room) roomsSet.set(g.room.id, g.room.name);
      timesSet.add(g.startTime);
    });

    const rooms = Array.from(roomsSet.entries()).map(([id, name]) => ({ id, name }));
    const times = Array.from(timesSet).sort();
    const lookup = new Map<string, ScheduleGroup>();
    groups.forEach((g) => {
      if (g.room) lookup.set(`${g.room.id}-${g.startTime}`, g);
    });

    const columns = [
      { title: 'Vaqt', dataIndex: 'time', key: 'time', width: 80, fixed: 'left' as const },
      ...rooms.map((r) => ({
        title: r.name,
        dataIndex: `room_${r.id}`,
        key: `room_${r.id}`,
        render: (val: ScheduleGroup | undefined) =>
          val ? (
            <div style={{ background: '#f0f0ff', borderLeft: '3px solid #6366f1', padding: '6px 10px', borderRadius: 8, fontSize: 12 }}>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{val.name}</div>
              <div style={{ color: '#64748b', fontSize: 11 }}>
                {val.teacher?.user ? `${val.teacher.user.firstName} ${val.teacher.user.lastName || ''}` : ''}
              </div>
            </div>
          ) : null,
      })),
    ];

    const dataSource = times.map((time) => {
      const row: any = { key: time, time };
      rooms.forEach((r) => { row[`room_${r.id}`] = lookup.get(`${r.id}-${time}`); });
      return row;
    });

    return <Table columns={columns} dataSource={dataSource} pagination={false} size="small" bordered scroll={{ x: 'max-content' }} />;
  };

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
          Dashboard
        </Title>
        <Text type="secondary">Bugungi umumiy ko'rsatkichlar</Text>
      </div>

      {/* Stat Cards */}
      <Spin spinning={statsLoading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
          {statCards.map((card) => (
            <Col key={card.key} xs={12} sm={12} md={6} lg={6}>
              <Card
                size="small"
                style={{
                  background: card.gradient,
                  border: 'none',
                  borderRadius: 14,
                }}
                styles={{ body: { padding: '18px 20px' } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: '#475569', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>
                      {card.label}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                      {stats?.[card.key] ?? 0}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: card.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 18,
                    }}
                  >
                    {card.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      {/* Revenue Chart */}
      <Card
        title={<span style={{ fontWeight: 600, color: '#0f172a' }}>Daromad dinamikasi</span>}
        style={{ marginBottom: 24, borderRadius: 14, border: '1px solid #e2e8f0' }}
        loading={revenueLoading}
      >
        {renderRevenueChart()}
      </Card>

      {/* Schedule */}
      <Card
        title={<span style={{ fontWeight: 600, color: '#0f172a' }}>Dars jadvali</span>}
        style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}
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
            <Radio.Button value="ODD">Toq kunlar</Radio.Button>
            <Radio.Button value="EVEN">Juft kunlar</Radio.Button>
            <Radio.Button value="OTHER">Boshqa</Radio.Button>
          </Radio.Group>
        </div>
        {buildScheduleGrid()}
      </Card>
    </>
  );
};

export default DashboardPage;
