import React from 'react';
import { Row, Col, Card, Typography, Spin, Progress, Tag, Empty, Statistic } from 'antd';
import {
  DollarOutlined, TeamOutlined, FunnelPlotOutlined, BarChartOutlined,
  CalendarOutlined, WarningOutlined, RiseOutlined, HomeOutlined,
  ArrowUpOutlined, ArrowDownOutlined, MinusOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import { useQuery } from '@tanstack/react-query';
import { useThemeMode } from '../../contexts/ThemeContext';
import AnalyticsFilterBar from '../../components/analytics/AnalyticsFilterBar';
import { useAnalyticsFilter, fmtMoney, fmtCurrency } from '../../features/analytics/useAnalyticsFilter';
import { getDashboardOverview, getActivityFeed } from '../../features/analytics/api';
import './analytics.css';

const { Title, Text } = Typography;

const SUBJECT_COLORS = ['#6366f1','#8b5cf6','#a78bfa','#3b82f6','#06b6d4','#14b8a6','#22c55e','#eab308','#f97316','#ef4444','#ec4899','#d946ef'];

const GrowthBadge: React.FC<{ value: number; invert?: boolean }> = ({ value, invert }) => {
  if (value === 0) return <Tag icon={<MinusOutlined />} color="default">0%</Tag>;
  const isGood = invert ? value < 0 : value > 0;
  return (
    <Tag icon={isGood ? <ArrowUpOutlined /> : <ArrowDownOutlined />} color={isGood ? 'success' : 'error'}>
      {value > 0 ? '+' : ''}{value}%
    </Tag>
  );
};

const CeoDashboardPage: React.FC = () => {
  const { isDark } = useThemeMode();
  const { filter, params, periodLabel, setPeriod, setMonth, setQuarter, setRange, setYear, setBranchId, months, quarters, years } = useAnalyticsFilter();

  // Fetch branches
  const { data: branchesData } = useQuery({ queryKey: ['branches'], queryFn: () => import('../../lib/axios').then(m => m.default.get('/branches').then(r => r.data)) });
  const branches = branchesData || [];
  const isCeo = true; // TODO: from auth context

  // Fetch dashboard data
  const { data: dash, isLoading } = useQuery({
    queryKey: ['ceo-dashboard', params, filter.branchId],
    queryFn: () => getDashboardOverview({ ...params, ...(filter.branchId ? { branch_id: filter.branchId } : {}) } as any),
  });

  const { data: feed } = useQuery({ queryKey: ['activity-feed'], queryFn: () => getActivityFeed() });

  const cardStyle: React.CSSProperties = {
    borderRadius: 16,
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f0f0f0',
    background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
  };

  // ═══ Finance Group ═══
  const renderFinanceGroup = () => {
    if (!dash) return null;
    const { finance, debtors } = dash;
    return (
      <div className="dash-group" style={{ '--ds-accent': '#10b981' } as any}>
        <div className="dash-group-header">
          <div className="dash-group-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <DollarOutlined style={{ fontSize: 24 }} />
          </div>
          <div className="dash-group-title">Moliya va Qarzdorlar</div>
          <div className="dash-group-sub">{periodLabel} uchun kiritilgan tushum, xarajat va qarzdorlar</div>
        </div>

        <Row gutter={[12, 12]} style={{ padding: '0 16px 16px' }}>
          {finance?.byMonth?.map((m: any) => (
            <Col xs={24} sm={12} md={8} key={m.month}>
              <Card size="small" style={cardStyle} className="card-sweep">
                <Text strong style={{ fontSize: 14 }}>{m.month}</Text>
                <div style={{ marginTop: 8 }}>
                  <div className="fin-row"><span style={{ color: '#06b6d4' }}>📥 Kirim</span><span style={{ fontWeight: 700, color: '#06b6d4' }}>{fmtMoney(m.income)} so'm</span></div>
                  <div className="fin-row"><span style={{ color: '#f59e0b' }}>📤 Chiqim</span><span style={{ fontWeight: 700, color: '#f59e0b' }}>{fmtMoney(m.expense)} so'm</span></div>
                  <div className="fin-row fin-row-net" style={{ borderTop: `2px solid ${m.income - m.expense >= 0 ? '#34d399' : '#f87171'}` }}>
                    <span>Qoldiq</span>
                    <span style={{ fontWeight: 800, color: m.income - m.expense >= 0 ? '#34d399' : '#f87171' }}>{fmtMoney(m.income - m.expense)} so'm</span>
                  </div>
                </div>
              </Card>
            </Col>
          ))}

          {/* Grand total */}
          {finance?.byMonth?.length > 1 && (
            <Col xs={24}>
              <Card size="small" style={{ ...cardStyle, borderLeft: '3px solid #10b981' }} className="card-sweep">
                <Row gutter={16}>
                  <Col span={8}><Statistic title="Jami tushum" value={finance.total.income} formatter={(v) => fmtMoney(Number(v))} valueStyle={{ color: '#06b6d4', fontSize: 18 }} suffix="so'm" /></Col>
                  <Col span={8}><Statistic title="Jami xarajat" value={finance.total.expense} formatter={(v) => fmtMoney(Number(v))} valueStyle={{ color: '#f59e0b', fontSize: 18 }} suffix="so'm" /></Col>
                  <Col span={8}><Statistic title="Jami foyda" value={finance.total.income - finance.total.expense} formatter={(v) => fmtMoney(Number(v))} valueStyle={{ color: finance.total.income - finance.total.expense >= 0 ? '#34d399' : '#f87171', fontSize: 18 }} suffix="so'm" /></Col>
                </Row>
              </Card>
            </Col>
          )}

          {/* Debtors */}
          {debtors?.byMonth?.some((d: any) => d.count > 0) && (
            <Col xs={24}>
              <Card size="small" style={{ ...cardStyle, borderLeft: '3px solid #ef4444' }}>
                <Text strong style={{ color: '#ef4444' }}>💸 Qarzdorlar</Text>
                <Row gutter={16} style={{ marginTop: 8 }}>
                  {debtors.byMonth.filter((d: any) => d.count > 0).map((d: any) => (
                    <Col xs={12} sm={8} key={d.month}>
                      <div style={{ padding: '4px 0' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>{d.month}</Text>
                        <div><Tag color="red">{d.count} ta</Tag> <Text style={{ fontSize: 13, fontWeight: 600 }}>{fmtMoney(d.amount)} so'm</Text></div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  // ═══ Leads Group ═══
  const renderLeadsGroup = () => {
    if (!dash) return null;
    const { leads, activeStudents } = dash;
    return (
      <div className="dash-group" style={{ '--ds-accent': '#3b82f6' } as any}>
        <div className="dash-group-header">
          <div className="dash-group-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
            <FunnelPlotOutlined style={{ fontSize: 24 }} />
          </div>
          <div className="dash-group-title">Lead bo'limi</div>
          <div className="dash-group-sub">Aktiv o'quvchilar va lead holati</div>
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          <Card size="small" style={cardStyle} className="card-sweep">
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#6366f1' }}>{activeStudents}</div>
              <Text type="secondary">Faol o'quvchilar</Text>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 16, justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#6366f1' }}>{leads?.total || 0}</div>
                <Text type="secondary" style={{ fontSize: 11 }}>Yangi lead</Text>
              </div>
            </div>

            {/* Subject breakdown */}
            {leads?.bySubject?.map((s: any, i: number) => (
              <div key={s.name} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: SUBJECT_COLORS[i % SUBJECT_COLORS.length], display: 'inline-block' }} />
                    <Text style={{ fontSize: 13 }}>{s.name}</Text>
                  </div>
                  <Text strong style={{ fontSize: 13 }}>{s.count}</Text>
                </div>
                <Progress percent={leads.total ? Math.round((s.count / leads.total) * 100) : 0} showInfo={false} strokeColor={SUBJECT_COLORS[i % SUBJECT_COLORS.length]} size="small" />
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  };

  // ═══ Attendance Group ═══
  const renderAttendanceGroup = () => {
    if (!dash) return null;
    const { attendance } = dash;
    return (
      <div className="dash-group" style={{ '--ds-accent': '#6366f1' } as any}>
        <div className="dash-group-header">
          <div className="dash-group-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
            <CalendarOutlined style={{ fontSize: 24 }} />
          </div>
          <div className="dash-group-title">Davomat</div>
          <div className="dash-group-sub">Kelish ko'rsatkichlari</div>
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          <Row gutter={[12, 12]}>
            <Col xs={8}>
              <Card size="small" style={cardStyle} className="card-sweep">
                <Statistic title="Jami %" value={attendance?.rate || 0} suffix="%" valueStyle={{ color: (attendance?.rate || 0) >= 80 ? '#34d399' : '#fb923c', fontSize: 28, fontWeight: 800 }} />
              </Card>
            </Col>
            <Col xs={8}>
              <Card size="small" style={cardStyle} className="card-sweep">
                <Statistic title="Kelgan" value={attendance?.present || 0} valueStyle={{ color: '#34d399', fontSize: 20 }} />
              </Card>
            </Col>
            <Col xs={8}>
              <Card size="small" style={cardStyle} className="card-sweep">
                <Statistic title="Kutilgan" value={attendance?.total || 0} valueStyle={{ fontSize: 20 }} />
              </Card>
            </Col>
          </Row>

          {/* Attendance trend chart */}
          {attendance?.daily?.length > 1 && (
            <Card size="small" style={{ ...cardStyle, marginTop: 12 }}>
              <Line
                data={attendance.daily.map((d: any) => ({ date: d.date, rate: d.rate }))}
                xField="date" yField="rate" smooth
                color="#6366f1"
                areaStyle={{ fill: 'l(270) 0:rgba(99,102,241,0.12) 1:rgba(99,102,241,0)' }}
                yAxis={{ min: 0, max: 100, label: { formatter: (v: string) => `${v}%` } }}
                point={{ size: 3, color: '#6366f1' }}
                height={200}
              />
            </Card>
          )}
        </div>
      </div>
    );
  };

  // ═══ Problems Group ═══
  const renderProblemsGroup = () => {
    if (!dash?.problems?.length) return null;
    return (
      <div className="dash-group" style={{ '--ds-accent': '#ef4444' } as any}>
        <div className="dash-group-header">
          <div className="dash-group-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
            <WarningOutlined style={{ fontSize: 24 }} />
          </div>
          <div className="dash-group-title">Ochiq muammolar</div>
          <div className="dash-group-sub">{dash.problems.length} ta hal qilinmagan muammo</div>
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          {dash.problems.slice(0, 10).map((p: any) => (
            <div key={p.id} className="problem-item">
              <span className="problem-dot" />
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 13 }}>{p.branch}</Text>
                <div><Text type="secondary" style={{ fontSize: 12 }}>{p.type} — {p.issue?.substring(0, 60)}</Text></div>
              </div>
              <Tag color={p.status === 'open' ? 'red' : 'orange'}>{p.status}</Tag>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ═══ Rooms Group ═══
  const renderRoomsGroup = () => {
    if (!dash?.rooms?.count) return null;
    return (
      <div className="dash-group" style={{ '--ds-accent': '#10b981' } as any}>
        <div className="dash-group-header">
          <div className="dash-group-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <HomeOutlined style={{ fontSize: 24 }} />
          </div>
          <div className="dash-group-title">Bo'sh xonalar</div>
          <div className="dash-group-sub">{dash.rooms.count} ta bo'sh xona</div>
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          <Card size="small" style={{ ...cardStyle, textAlign: 'center', marginBottom: 12 }}>
            <div className="potential-hero">{fmtCurrency(dash.rooms.totalPotential)}</div>
            <Text type="secondary">Potensial daromad</Text>
          </Card>

          <Row gutter={[8, 8]}>
            {dash.rooms.list?.slice(0, 6).map((r: any, i: number) => (
              <Col xs={12} sm={8} key={i}>
                <Card size="small" style={cardStyle} className="card-sweep">
                  <Text strong style={{ fontSize: 12 }}>{r.branch}</Text>
                  <div style={{ fontSize: 11, color: isDark ? '#999' : '#666' }}>{r.room} — {r.days} {r.time}</div>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="green">{fmtMoney(r.potential)} so'm</Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    );
  };

  // ═══ Branch Breakdown ═══
  const renderBranchBreakdown = () => {
    if (!dash?.branchBreakdown?.length) return null;
    return (
      <div className="dash-group" style={{ '--ds-accent': '#8b5cf6' } as any}>
        <div className="dash-group-header">
          <div className="dash-group-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
            <BarChartOutlined style={{ fontSize: 24 }} />
          </div>
          <div className="dash-group-title">Filiallar kesimi</div>
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          <Row gutter={[12, 12]}>
            {dash.branchBreakdown.map((b: any) => (
              <Col xs={24} sm={12} key={b.branchId}>
                <Card size="small" style={cardStyle} className="card-sweep">
                  <Text strong>{b.branchName}</Text>
                  <Row gutter={8} style={{ marginTop: 8 }}>
                    <Col span={12}><div style={{ fontSize: 11, color: isDark ? '#999' : '#666' }}>Foyda</div><div style={{ fontWeight: 700, color: b.profit >= 0 ? '#34d399' : '#f87171', fontSize: 15 }}>{fmtCurrency(b.profit)}</div></Col>
                    <Col span={6}><div style={{ fontSize: 11, color: isDark ? '#999' : '#666' }}>Lead</div><div style={{ fontWeight: 600 }}>{b.leads}</div></Col>
                    <Col span={6}><div style={{ fontSize: 11, color: isDark ? '#999' : '#666' }}>Davomat</div><div style={{ fontWeight: 600, color: b.attendance >= 80 ? '#34d399' : '#fb923c' }}>{b.attendance}%</div></Col>
                  </Row>
                  {b.debtors > 0 && <div style={{ marginTop: 4 }}><Tag color="red" style={{ fontSize: 10 }}>Qarz: {b.debtors} ta</Tag></div>}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    );
  };

  // ═══ Activity Feed ═══
  const renderFeed = () => {
    if (!feed?.length) return null;
    return (
      <Card title="So'nggi faoliyat" style={{ ...cardStyle, marginTop: 16 }}>
        {feed.slice(0, 15).map((item: any, i: number) => (
          <div key={i} className="feed-item">
            <div className={`feed-icon feed-icon-${item.type}`}>
              {item.type === 'payment' ? <DollarOutlined /> : item.type === 'lead' ? <FunnelPlotOutlined /> : <WarningOutlined />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text strong style={{ fontSize: 13 }}>{item.title}</Text>
              <div><Text type="secondary" style={{ fontSize: 11 }}>{item.subtitle}</Text></div>
            </div>
            {item.amount && <Text strong style={{ color: '#16a34a', whiteSpace: 'nowrap', fontSize: 13 }}>+{fmtMoney(item.amount)}</Text>}
            {item.status && <Tag color={item.status === 'open' ? 'red' : item.status === 'LEAD' ? 'blue' : 'green'} style={{ fontSize: 10 }}>{item.status}</Tag>}
          </div>
        ))}
      </Card>
    );
  };

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <Title level={3} style={{ margin: 0, background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Bosh sahifa
        </Title>
        <Text type="secondary">{periodLabel} — CEO Dashboard</Text>
      </div>

      <AnalyticsFilterBar
        period={filter.period} onPeriodChange={setPeriod}
        month={filter.month} onMonthChange={setMonth}
        quarter={filter.quarter} onQuarterChange={setQuarter}
        range={filter.range} onRangeChange={setRange}
        year={filter.year} onYearChange={setYear}
        branchId={filter.branchId} onBranchChange={setBranchId}
        branches={branches} isCeo={isCeo}
        months={months} quarters={quarters} years={years}
        periodLabel={periodLabel}
      />

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : !dash ? (
        <Empty description="Ma'lumot yo'q" />
      ) : (
        <>
          {renderFinanceGroup()}
          {renderRoomsGroup()}
          {renderLeadsGroup()}
          {renderAttendanceGroup()}
          {renderProblemsGroup()}
          {renderBranchBreakdown()}
          {renderFeed()}
        </>
      )}
    </div>
  );
};

export default CeoDashboardPage;
