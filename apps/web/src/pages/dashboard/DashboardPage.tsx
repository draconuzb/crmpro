import { useState } from 'react';
import {
  Row, Col, Card, Typography, Spin, Table, Radio, Segmented,
} from 'antd';
import {
  FunnelPlotOutlined, UserOutlined, AppstoreOutlined, WarningOutlined,
  ExperimentOutlined, DollarOutlined, UserDeleteOutlined, StopOutlined,
} from '@ant-design/icons';
import { Line, Pie, Column } from '@ant-design/charts';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getDashboardStats, getDashboardRevenue, getSchedule } from '../../features/dashboard/api';
import { useThemeMode } from '../../contexts/ThemeContext';

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
  const { isDark } = useThemeMode();
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

  const textColor = isDark ? '#e2e8f0' : '#0f172a';
  const cardBorder = isDark ? '1px solid #303030' : '1px solid #e2e8f0';

  // Revenue Line Chart
  const renderRevenueChart = () => {
    if (!revenue || revenue.length === 0) {
      return <Text type="secondary">Ma'lumot yo'q</Text>;
    }

    const chartData = revenue.map((r) => ({
      month: r.month.substring(5),
      revenue: r.revenue,
    }));

    const config = {
      data: chartData,
      xField: 'month',
      yField: 'revenue',
      smooth: true,
      color: '#6366f1',
      point: {
        size: 4,
        shape: 'circle',
        style: { fill: '#fff', stroke: '#6366f1', lineWidth: 2 },
      },
      area: {
        style: {
          fill: 'l(270) 0:rgba(99,102,241,0.01) 1:rgba(99,102,241,0.2)',
        },
      },
      yAxis: {
        label: {
          formatter: (v: string) => new Intl.NumberFormat('uz-UZ').format(Number(v)),
        },
      },
      tooltip: {
        formatter: (datum: any) => ({
          name: 'Daromad',
          value: new Intl.NumberFormat('uz-UZ').format(datum.revenue) + " so'm",
        }),
      },
      theme: isDark ? 'dark' : 'default',
      height: 280,
      autoFit: true,
    };

    return <Line {...(config as any)} />;
  };

  // Expense Pie Chart (simulated from stats)
  const renderExpensePieChart = () => {
    if (!stats) return <Text type="secondary">Ma'lumot yo'q</Text>;

    const pieData = [
      { type: "O'qituvchi maoshi", value: stats.paidThisMonth * 0.4 || 0 },
      { type: 'Ijara', value: stats.paidThisMonth * 0.25 || 0 },
      { type: 'Marketing', value: stats.paidThisMonth * 0.15 || 0 },
      { type: 'Kommunal', value: stats.paidThisMonth * 0.1 || 0 },
      { type: 'Boshqa', value: stats.paidThisMonth * 0.1 || 0 },
    ].filter((d) => d.value > 0);

    if (pieData.length === 0) {
      return <Text type="secondary">Ma'lumot yo'q</Text>;
    }

    const config = {
      data: pieData,
      angleField: 'value',
      colorField: 'type',
      radius: 0.85,
      innerRadius: 0.55,
      color: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
      label: {
        type: 'outer',
        content: '{name} {percentage}',
        style: { fontSize: 12 },
      },
      legend: { position: 'bottom' as const },
      tooltip: {
        formatter: (datum: any) => ({
          name: datum.type,
          value: new Intl.NumberFormat('uz-UZ').format(Math.round(datum.value)) + " so'm",
        }),
      },
      theme: isDark ? 'dark' : 'default',
      height: 280,
      autoFit: true,
    };

    return <Pie {...(config as any)} />;
  };

  // Lead Funnel Bar Chart
  const renderLeadFunnelChart = () => {
    if (!stats) return <Text type="secondary">Ma'lumot yo'q</Text>;

    const funnelData = [
      { stage: 'LEAD', count: stats.activeLeads || 0, color: '#3b82f6' },
      { stage: 'EXPECTATION', count: Math.round((stats.activeLeads || 0) * 0.6), color: '#f59e0b' },
      { stage: 'SET', count: stats.activeStudents || 0, color: '#10b981' },
    ];

    const config = {
      data: funnelData,
      xField: 'stage',
      yField: 'count',
      color: ['#3b82f6', '#f59e0b', '#10b981'],
      seriesField: 'stage',
      legend: false,
      label: {
        position: 'top' as const,
        style: { fontWeight: 600 },
      },
      columnStyle: {
        radius: [8, 8, 0, 0],
      },
      yAxis: {
        label: {
          formatter: (v: string) => String(Math.round(Number(v))),
        },
      },
      theme: isDark ? 'dark' : 'default',
      height: 280,
      autoFit: true,
    };

    return <Column {...(config as any)} />;
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
            <div style={{ background: isDark ? '#1e293b' : '#f0f0ff', borderLeft: '3px solid #6366f1', padding: '6px 10px', borderRadius: 8, fontSize: 12 }}>
              <div style={{ fontWeight: 600, color: textColor }}>{val.name}</div>
              <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}>
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
        <Title level={3} style={{ margin: 0, fontWeight: 700, color: textColor }}>
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
        title={<span style={{ fontWeight: 600, color: textColor }}>Daromad dinamikasi</span>}
        style={{ marginBottom: 24, borderRadius: 14, border: cardBorder }}
        loading={revenueLoading}
      >
        {renderRevenueChart()}
      </Card>

      {/* Pie + Bar Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card
            title={<span style={{ fontWeight: 600, color: textColor }}>Xarajat taqsimoti</span>}
            style={{ borderRadius: 14, border: cardBorder, height: '100%' }}
            loading={statsLoading}
          >
            {renderExpensePieChart()}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={<span style={{ fontWeight: 600, color: textColor }}>Lid funnel</span>}
            style={{ borderRadius: 14, border: cardBorder, height: '100%' }}
            loading={statsLoading}
          >
            {renderLeadFunnelChart()}
          </Card>
        </Col>
      </Row>

      {/* Schedule */}
      <Card
        title={<span style={{ fontWeight: 600, color: textColor }}>Dars jadvali</span>}
        style={{ borderRadius: 14, border: cardBorder }}
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
