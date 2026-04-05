import React, { useState } from 'react';
import { Row, Col, Card, Typography, Spin, Progress, Tag, Empty, Statistic, Tabs, Table } from 'antd';
import {
  ArrowUpOutlined, ArrowDownOutlined, MinusOutlined,
  DollarOutlined, TeamOutlined, FunnelPlotOutlined,
  BarChartOutlined, CalendarOutlined, WarningOutlined,
  TrophyOutlined, BankOutlined,
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/charts';
import { useQuery } from '@tanstack/react-query';
import { useThemeMode } from '../../contexts/ThemeContext';
import AnalyticsFilterBar from '../../components/analytics/AnalyticsFilterBar';
import { useAnalyticsFilter, fmtMoney, fmtCurrency } from '../../features/analytics/useAnalyticsFilter';
import { getBranchTrends, getBranchComparison, getAttendanceTrend, getFinancialIntelligence, getManagerAccountability } from '../../features/analytics/api';
import './analytics.css';

const { Title, Text } = Typography;

const BRANCH_COLORS = ['#6366f1','#34d399','#fb923c','#f87171','#a78bfa','#38bdf8','#fbbf24'];

const GrowthBadge: React.FC<{ value: number; invert?: boolean }> = ({ value, invert }) => {
  if (value === 0) return <Tag icon={<MinusOutlined />} color="default">0%</Tag>;
  const isGood = invert ? value < 0 : value > 0;
  return <Tag icon={isGood ? <ArrowUpOutlined /> : <ArrowDownOutlined />} color={isGood ? 'success' : 'error'}>{value > 0 ? '+' : ''}{value}%</Tag>;
};

const TahlilPage: React.FC = () => {
  const { isDark } = useThemeMode();
  const { filter, params, periodLabel, setPeriod, setMonth, setQuarter, setRange, setYear, setBranchId, months, quarters, years } = useAnalyticsFilter();

  const { data: branchesData } = useQuery({ queryKey: ['branches'], queryFn: () => import('../../lib/axios').then(m => m.default.get('/branches').then(r => r.data)) });
  const branches = branchesData || [];
  const isCeo = true;
  const isSingleBranch = !!filter.branchId || branches.length <= 1;

  // Queries
  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['branch-trends', params, filter.branchId],
    queryFn: () => getBranchTrends(params),
    enabled: isSingleBranch,
  });

  const { data: comparison, isLoading: compLoading } = useQuery({
    queryKey: ['branch-compare', params],
    queryFn: () => getBranchComparison(params),
    enabled: !isSingleBranch,
  });

  const { data: attTrend } = useQuery({
    queryKey: ['att-trend', params, filter.branchId],
    queryFn: () => getAttendanceTrend(params),
  });

  const { data: finIntel } = useQuery({
    queryKey: ['fin-intel', params, filter.branchId],
    queryFn: () => getFinancialIntelligence(params),
  });

  const { data: accountability } = useQuery({
    queryKey: ['accountability', params, filter.branchId],
    queryFn: () => getManagerAccountability(params),
  });

  const cardStyle: React.CSSProperties = { borderRadius: 14, border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f0f0f0', background: isDark ? 'rgba(255,255,255,0.04)' : '#fff' };

  // ═══ SINGLE BRANCH: Period Comparison Table ═══
  const renderComparison = () => {
    if (!trends?.comparison) return null;
    const c = trends.comparison;
    const rows = [
      { metric: 'Tushum', current: fmtMoney(c.income.current), previous: fmtMoney(c.income.previous), growth: c.income.growth },
      { metric: 'Xarajat', current: fmtMoney(c.expense.current), previous: fmtMoney(c.expense.previous), growth: c.expense.growth, invert: true },
      { metric: 'Foyda', current: fmtMoney(c.profit.current), previous: fmtMoney(c.profit.previous), growth: c.profit.growth },
      { metric: 'Leadlar', current: c.leads.current, previous: c.leads.previous, growth: c.leads.growth },
      { metric: 'Davomat %', current: `${c.attendance.current}%`, previous: `${c.attendance.previous}%`, growth: c.attendance.growth },
    ];
    return (
      <div className="an-section">
        <div className="an-section-title">Davr taqqoslash</div>
        <table className="an-comp-table">
          <thead><tr className="an-comp-thead"><th>Ko'rsatkich</th><th>Joriy davr</th><th>Oldingi davr</th><th>O'sish</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.metric} className="an-comp-trow">
                <td>{r.metric}</td>
                <td style={{ fontWeight: 700 }}>{r.current}</td>
                <td style={{ color: isDark ? '#999' : '#888' }}>{r.previous}</td>
                <td><GrowthBadge value={r.growth} invert={r.invert} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ═══ SINGLE BRANCH: Finance Trend Chart ═══
  const renderFinanceTrend = () => {
    if (!trends?.trends?.length) return null;
    const chartData = trends.trends.flatMap((t: any) => [
      { month: t.month, value: t.income, type: 'Tushum' },
      { month: t.month, value: t.expense, type: 'Xarajat' },
      { month: t.month, value: t.profit, type: 'Foyda' },
    ]);
    return (
      <div className="an-section">
        <div className="an-section-title">Moliya trendi</div>
        <Column data={chartData.filter((d: any) => d.type !== 'Foyda')} xField="month" yField="value" seriesField="type"
          isGroup color={['#34d399', '#f87171']} height={280}
          yAxis={{ label: { formatter: (v: string) => fmtCurrency(Number(v)) } }}
          legend={{ position: 'top' }}
        />
      </div>
    );
  };

  // ═══ SINGLE BRANCH: Leads Trend ═══
  const renderLeadsTrend = () => {
    if (!trends?.trends?.length) return null;
    const data = trends.trends.map((t: any) => ({ month: t.month, leads: t.leads, rejections: t.rejections }));
    return (
      <div className="an-section">
        <div className="an-section-title">Leadlar trendi</div>
        <Column data={data.flatMap((d: any) => [
          { month: d.month, value: d.leads, type: 'Leadlar' },
          { month: d.month, value: d.rejections, type: 'Rad etilgan' },
        ])} xField="month" yField="value" seriesField="type" isGroup color={['#3b82f6', '#f87171']} height={240}
          legend={{ position: 'top' }} />
      </div>
    );
  };

  // ═══ MULTI BRANCH: Scorecard ═══
  const renderScorecard = () => {
    if (!comparison?.length) return <Empty description="Filiallar topilmadi" />;
    const medals = ['🥇', '🥈', '🥉'];
    return (
      <div className="an-section">
        <div className="an-section-title">Filiallar reytingi</div>
        <div className="an-scorecard">
          <div className="an-scorecard-grid">
            <div className="an-sc-header">#</div>
            <div className="an-sc-header">Filial</div>
            <div className="an-sc-header">Ball</div>
            <div className="an-sc-header">Tushum</div>
            <div className="an-sc-header">Lead</div>
            <div className="an-sc-header">Dav.</div>
            <div className="an-sc-header">Qarz</div>
            <div className="an-sc-header">Xona</div>
            {comparison.map((b: any, i: number) => (
              <React.Fragment key={b.branchId}>
                <div style={{ padding: '8px 4px', fontSize: 14 }}>{medals[i] || i + 1}</div>
                <div style={{ padding: '8px 4px', fontWeight: 600, fontSize: 13 }}>{b.branchName}</div>
                <div style={{ padding: '8px 4px' }}>
                  <span style={{ fontWeight: 800, color: b.compositeScore >= 70 ? '#34d399' : b.compositeScore >= 40 ? '#fb923c' : '#f87171' }}>{b.compositeScore}</span>
                </div>
                <div style={{ padding: '8px 4px', fontSize: 12 }}>
                  {fmtCurrency(b.revenue)} <GrowthBadge value={b.revenueGrowth} />
                </div>
                <div style={{ padding: '8px 4px', fontSize: 12 }}>{b.leads} <GrowthBadge value={b.leadsGrowth} /></div>
                <div style={{ padding: '8px 4px', fontSize: 12, color: b.attendance >= 80 ? '#34d399' : '#fb923c' }}>{b.attendance}%</div>
                <div style={{ padding: '8px 4px', fontSize: 12, color: b.debtors > 0 ? '#f87171' : '#34d399' }}>{b.debtors}</div>
                <div style={{ padding: '8px 4px', fontSize: 12 }}>{b.rooms}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ═══ MULTI BRANCH: Finance Comparison ═══
  const renderBranchFinance = () => {
    if (!comparison?.length) return null;
    const data = comparison.flatMap((b: any) => [
      { branch: b.branchName, value: b.revenue, type: 'Tushum' },
      { branch: b.branchName, value: b.expenses, type: 'Xarajat' },
      { branch: b.branchName, value: b.profit, type: 'Foyda' },
    ]);
    return (
      <div className="an-section">
        <div className="an-section-title">Moliya taqqoslash</div>
        <Column data={data} xField="branch" yField="value" seriesField="type" isGroup
          color={['#34d399', '#f87171', '#6366f1']} height={280}
          yAxis={{ label: { formatter: (v: string) => fmtCurrency(Number(v)) } }}
          legend={{ position: 'top' }} />
      </div>
    );
  };

  // ═══ Attendance Trend ═══
  const renderAttTrend = () => {
    if (!attTrend) return null;
    if (attTrend.type === 'single') {
      return (
        <div className="an-section">
          <div className="an-section-title">Davomat trendi</div>
          <Line data={attTrend.data} xField="month" yField="rate" smooth color="#6366f1"
            areaStyle={{ fill: 'l(270) 0:rgba(99,102,241,0.12) 1:rgba(99,102,241,0)' }}
            yAxis={{ min: 0, max: 100, label: { formatter: (v: string) => `${v}%` } }}
            point={{ size: 3, style: { fill: '#6366f1' } }} height={240} />
        </div>
      );
    }
    // Multi-branch
    const chartData = attTrend.data.flatMap((b: any) =>
      b.rates.map((r: any) => ({ month: r.month, rate: r.rate, branch: b.branchName }))
    );
    return (
      <div className="an-section">
        <div className="an-section-title">Davomat trendi (filiallar)</div>
        <Line data={chartData} xField="month" yField="rate" seriesField="branch"
          color={BRANCH_COLORS} smooth
          yAxis={{ min: 0, max: 100, label: { formatter: (v: string) => `${v}%` } }}
          height={280} legend={{ position: 'top' }} />
      </div>
    );
  };

  // ═══ Financial Intelligence ═══
  const renderFinIntel = () => {
    if (!finIntel) return null;
    return (
      <div className="an-section">
        <div className="an-section-title">Moliyaviy razvedka</div>

        {/* Break-even */}
        <div className="an-fi-card">
          <Text strong style={{ fontSize: 14, marginBottom: 8, display: 'block' }}>Break-even tahlili</Text>
          <div className="an-fi-grid">
            <div className="an-fi-item">
              <Text type="secondary" style={{ fontSize: 11 }}>Oylik xarajat</Text>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{fmtMoney(finIntel.breakEven?.monthlyExpense || 0)}</div>
            </div>
            <div className="an-fi-item">
              <Text type="secondary" style={{ fontSize: 11 }}>Har bir o'quvchidan</Text>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{fmtMoney(finIntel.breakEven?.revenuePerStudent || 0)}</div>
            </div>
            <div className="an-fi-item" style={{ borderColor: '#34d399' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Break-even uchun kerak</Text>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#34d399' }}>{finIntel.breakEven?.breakEvenStudents || 0} ta</div>
            </div>
            <div className="an-fi-item">
              <Text type="secondary" style={{ fontSize: 11 }}>Hozirgi o'quvchilar</Text>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{finIntel.breakEven?.activeStudents || 0} ta</div>
            </div>
          </div>
        </div>

        {/* Debtor Aging */}
        {finIntel.aging && (
          <div className="an-fi-card">
            <Text strong style={{ fontSize: 14, marginBottom: 8, display: 'block' }}>Qarz eskirishi</Text>
            <div className="an-fi-grid">
              <div className="an-fi-item" style={{ borderLeft: '3px solid #34d399' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>0-30 kun</Text>
                <div>{finIntel.aging.d30.count} ta — {fmtMoney(finIntel.aging.d30.amount)}</div>
              </div>
              <div className="an-fi-item" style={{ borderLeft: '3px solid #fbbf24' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>30-60 kun</Text>
                <div>{finIntel.aging.d60.count} ta — {fmtMoney(finIntel.aging.d60.amount)}</div>
              </div>
              <div className="an-fi-item" style={{ borderLeft: '3px solid #fb923c' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>60-90 kun</Text>
                <div>{finIntel.aging.d90.count} ta — {fmtMoney(finIntel.aging.d90.amount)}</div>
              </div>
              <div className="an-fi-item" style={{ borderLeft: '3px solid #ef4444' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>90+ kun</Text>
                <div style={{ color: '#ef4444', fontWeight: 700 }}>{finIntel.aging.d90plus.count} ta — {fmtMoney(finIntel.aging.d90plus.amount)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Expense breakdown */}
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <div className="an-fi-card">
              <Text strong style={{ fontSize: 14, marginBottom: 8, display: 'block' }}>Xarajat turlari</Text>
              {finIntel.expensesByCategory?.length ? (
                <Pie data={finIntel.expensesByCategory} angleField="amount" colorField="category"
                  height={200} radius={0.8} innerRadius={0.6}
                  label={{ type: 'outer', formatter: (d: any) => `${d.category}` }} />
              ) : <Empty description="Ma'lumot yo'q" />}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="an-fi-card">
              <Text strong style={{ fontSize: 14, marginBottom: 8, display: 'block' }}>To'lov usullari</Text>
              {finIntel.paymentsByMethod?.map((p: any) => (
                <div key={p.method} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #f0f0f0' }}>
                  <Text>{p.method}</Text>
                  <div><Tag color="green">{fmtMoney(p.amount)}</Tag> <Tag>{p.count} ta</Tag></div>
                </div>
              ))}
            </div>
          </Col>
        </Row>

        {/* Cash Flow */}
        {finIntel.cashFlow?.length > 1 && (
          <div className="an-fi-card" style={{ marginTop: 12 }}>
            <Text strong style={{ fontSize: 14, marginBottom: 8, display: 'block' }}>Pul oqimi</Text>
            <Column
              data={finIntel.cashFlow.flatMap((m: any) => [
                { month: m.month, value: m.income, type: 'Tushum' },
                { month: m.month, value: -m.expense, type: 'Xarajat' },
              ])}
              xField="month" yField="value" seriesField="type" isGroup
              color={['#34d399', '#f87171']} height={240}
              yAxis={{ label: { formatter: (v: string) => fmtCurrency(Number(v)) } }}
              legend={{ position: 'top' }} />
          </div>
        )}

        {/* Room Revenue */}
        {finIntel.roomPotential?.rooms?.length > 0 && (
          <div className="an-fi-card" style={{ marginTop: 12 }}>
            <Text strong style={{ fontSize: 14, marginBottom: 8, display: 'block' }}>Xona daromad potensiali</Text>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div className="potential-hero" style={{ fontSize: 24 }}>{fmtMoney(finIntel.roomPotential.total)} so'm</div>
              <Text type="secondary">Jami potensial</Text>
            </div>
            <Table dataSource={finIntel.roomPotential.rooms} rowKey="room" size="small" pagination={false}
              columns={[
                { title: 'Xona', dataIndex: 'room', key: 'room' },
                { title: 'Filial', dataIndex: 'branch', key: 'branch' },
                { title: "Sig'im", dataIndex: 'capacity', key: 'capacity' },
                { title: 'Narx', dataIndex: 'price', key: 'price', render: (v: number) => fmtMoney(v) },
                { title: 'Potensial', dataIndex: 'potential', key: 'potential', render: (v: number) => <Tag color="green">{fmtMoney(v)}</Tag> },
              ]} />
          </div>
        )}
      </div>
    );
  };

  // ═══ Manager Accountability ═══
  const renderAccountability = () => {
    if (!accountability?.length) return null;
    return (
      <div className="an-section">
        <div className="an-section-title">Xodimlar faoliyati</div>
        <Table dataSource={accountability} rowKey="id" size="small" pagination={false}
          columns={[
            { title: 'Xodim', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong>{v}</Text> },
            { title: 'Filiallar', dataIndex: 'branches', key: 'branches', render: (v: string[]) => v?.map(b => <Tag key={b} style={{ fontSize: 10 }}>{b}</Tag>) },
            { title: "To'lov", dataIndex: ['actions', 'payments'], key: 'p', render: (v: number) => <Tag color="green">{v}</Tag> },
            { title: 'Lead', dataIndex: ['actions', 'leads'], key: 'l', render: (v: number) => <Tag color="blue">{v}</Tag> },
            { title: 'Muammo', dataIndex: ['actions', 'problems'], key: 'pr', render: (v: number) => <Tag color="orange">{v}</Tag> },
            { title: 'Jami', dataIndex: ['actions', 'total'], key: 't', render: (v: number) => <Tag color="purple">{v}</Tag>, defaultSortOrder: 'descend' as const, sorter: (a: any, b: any) => a.actions.total - b.actions.total },
          ]} />
      </div>
    );
  };

  const isLoading = isSingleBranch ? trendsLoading : compLoading;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <Title level={3} style={{ margin: 0, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          <BarChartOutlined /> Tahlil
        </Title>
        <Text type="secondary">{periodLabel} — {isSingleBranch ? 'Filial tahlili' : 'Filiallar taqqoslash'}</Text>
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
      ) : (
        <>
          {/* Single branch mode */}
          {isSingleBranch && (
            <>
              {renderComparison()}
              {renderFinanceTrend()}
              {renderLeadsTrend()}
            </>
          )}

          {/* Multi branch mode */}
          {!isSingleBranch && (
            <>
              {renderScorecard()}
              {renderBranchFinance()}
            </>
          )}

          {/* Shared sections */}
          {renderAttTrend()}
          {renderFinIntel()}
          {renderAccountability()}
        </>
      )}
    </div>
  );
};

export default TahlilPage;
