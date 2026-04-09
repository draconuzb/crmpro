import React, { useEffect, useRef } from 'react';
import { Typography, Spin, Tag, Empty, Table, Button, Result } from 'antd';
import {
  ArrowUpOutlined, ArrowDownOutlined, MinusOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/charts';
import { useQuery } from '@tanstack/react-query';
import { useThemeMode } from '../../contexts/ThemeContext';
import AnalyticsFilterBar from '../../components/analytics/AnalyticsFilterBar';
import Particles from '../../components/analytics/Particles';
import AnimCount from '../../components/analytics/AnimCount';
import { useAnalyticsFilter, fmtMoney, fmtCurrency } from '../../features/analytics/useAnalyticsFilter';
import {
  getDashboardOverview, getBranchTrends, getBranchComparison,
  getAttendanceTrend, getFinancialIntelligence, getManagerAccountability, getHrAnalytics,
} from '../../features/analytics/api';
import api from '../../lib/axios';
import './analytics.css';

const { Title, Text } = Typography;
const BRANCH_COLORS = ['#6366f1','#34d399','#fb923c','#f87171','#a78bfa','#38bdf8','#fbbf24'];
const SUBJECT_COLORS = ['#6366f1','#8b5cf6','#a78bfa','#3b82f6','#06b6d4','#14b8a6','#22c55e','#eab308','#f97316','#ef4444','#ec4899','#d946ef'];

const GrowthBadge: React.FC<{ value: number; invert?: boolean }> = ({ value, invert }) => {
  if (value === 0) return <Tag icon={<MinusOutlined />} color="default">0%</Tag>;
  const isGood = invert ? value < 0 : value > 0;
  return <Tag icon={isGood ? <ArrowUpOutlined /> : <ArrowDownOutlined />} color={isGood ? 'success' : 'error'}>{value > 0 ? '+' : ''}{value}%</Tag>;
};

const TahlilPage: React.FC = () => {
  const { isDark } = useThemeMode();
  const { filter, params, periodLabel, setPeriod, setMonth, setQuarter, setRange, setYear, setBranchId, months, quarters, years } = useAnalyticsFilter();
  const pageRef = useRef<HTMLDivElement>(null);

  const { data: branchesData } = useQuery({ queryKey: ['branches'], queryFn: () => import('../../lib/axios').then(m => m.default.get('/branches').then(r => r.data)) });
  const branches = branchesData || [];
  const isCeo = true;
  const hasBranchFilter = !!filter.branchId;
  const branchName = filter.branchId ? branches.find((b: any) => b.id === filter.branchId)?.name || '' : 'Barcha filiallar';

  // ── Fetch ALL endpoints always ──
  const { data: dash, isLoading: dashLoading, error: dashError, refetch: dashRefetch } = useQuery({
    queryKey: ['ceo-dashboard-tahlil', params, filter.branchId],
    queryFn: () => getDashboardOverview({ ...params, ...(filter.branchId ? { branch_id: filter.branchId } : {}) } as any),
    staleTime: 5 * 60 * 1000,
  });

  const { data: trends } = useQuery({
    queryKey: ['branch-trends', params, filter.branchId],
    queryFn: () => getBranchTrends({ ...params, ...(filter.branchId ? { branch_id: filter.branchId } : {}) } as any),
  });

  const { data: comparison } = useQuery({
    queryKey: ['branch-compare', params],
    queryFn: () => getBranchComparison(params),
    enabled: branches.length > 1,
  });

  const { data: attTrend } = useQuery({
    queryKey: ['att-trend', params, filter.branchId],
    queryFn: () => getAttendanceTrend({ ...params, ...(filter.branchId ? { branch_id: filter.branchId } : {}) } as any),
  });

  const { data: finIntel } = useQuery({
    queryKey: ['fin-intel', params, filter.branchId],
    queryFn: () => getFinancialIntelligence({ ...params, ...(filter.branchId ? { branch_id: filter.branchId } : {}) } as any),
  });

  const { data: accountability } = useQuery({
    queryKey: ['accountability', params, filter.branchId],
    queryFn: () => getManagerAccountability({ ...params, ...(filter.branchId ? { branch_id: filter.branchId } : {}) } as any),
  });

  const { data: hrData } = useQuery({
    queryKey: ['hr-analytics'],
    queryFn: getHrAnalytics,
  });

  const { data: kpiTargets } = useQuery({
    queryKey: ['kpi-targets-tahlil', filter.branchId],
    queryFn: () => api.get('/kpi/targets', { params: { month: new Date().toISOString().slice(0, 7) } }).then(r => r.data),
  });

  const { data: aiInsights } = useQuery({
    queryKey: ['ai-insights-tahlil'],
    queryFn: () => api.get('/ai/history', { params: { limit: 10 } }).then(r => r.data),
  });

  // Animate bars
  useEffect(() => {
    if (!pageRef.current) return;
    const fills = pageRef.current.querySelectorAll<HTMLElement>('.ds-bar-fill');
    fills.forEach(el => {
      const w = el.getAttribute('data-w') || '0';
      el.style.width = '0';
      requestAnimationFrame(() => { el.style.width = w + '%'; });
    });
  }, [dash, trends, comparison, attTrend, finIntel]);

  // ══════════════════════════════════════════════════
  // 1. FILIALLAR REYTINGI (Branch Scorecard)
  // ══════════════════════════════════════════════════
  const renderScorecard = () => {
    if (!comparison?.length) return null;
    const medals = ['🥇', '🥈', '🥉'];
    const maxScore = Math.max(...comparison.map((b: any) => b.compositeScore), 1);
    return (
      <div className="an-section" style={{ '--ds-accent': '#8b5cf6' } as any}>
        <div className="an-section-title">Filiallar reytingi</div>
        <div className="an-section-desc">{periodLabel} — barcha filiallarning umumiy ball asosida reytingi</div>
        <div className="rank-list">
          {comparison.map((b: any, i: number) => (
            <div className="rank-row" key={b.branchId}>
              <span className="rank-pos">{medals[i] || (i + 1)}</span>
              <span className="rank-name">{b.branchName}</span>
              <div className="rank-bar-wrap">
                <div className="rank-bar ds-bar-fill" data-w={Math.round((b.compositeScore / maxScore) * 100)}
                  style={{ '--bar-color': b.compositeScore >= 70 ? 'linear-gradient(90deg, #34d399, #22d3ee)' : b.compositeScore >= 40 ? 'linear-gradient(90deg, #fb923c, #fbbf24)' : 'linear-gradient(90deg, #f87171, #fb923c)' } as any} />
              </div>
              <span className="rank-count" style={{ color: b.compositeScore >= 70 ? '#34d399' : b.compositeScore >= 40 ? '#fb923c' : '#f87171' }}>{b.compositeScore}</span>
            </div>
          ))}
        </div>
        <div className="ds-divider" />
        <div className="an-scorecard">
          <div className="an-scorecard-grid">
            <div className="an-sc-header">#</div><div className="an-sc-header">Filial</div><div className="an-sc-header">Ball</div>
            <div className="an-sc-header">Tushum</div><div className="an-sc-header">Lead</div><div className="an-sc-header">Dav.</div>
            <div className="an-sc-header">Qarz</div><div className="an-sc-header">Xona</div>
            {comparison.map((b: any, i: number) => (
              <React.Fragment key={b.branchId}>
                <div style={{ padding: '8px 4px', fontSize: 14 }}>{medals[i] || i + 1}</div>
                <div style={{ padding: '8px 4px', fontWeight: 600, fontSize: 13 }}>{b.branchName}</div>
                <div style={{ padding: '8px 4px' }}><span style={{ fontWeight: 800, color: b.compositeScore >= 70 ? '#34d399' : b.compositeScore >= 40 ? '#fb923c' : '#f87171' }}>{b.compositeScore}</span></div>
                <div style={{ padding: '8px 4px', fontSize: 12 }}>{fmtCurrency(b.revenue)} <GrowthBadge value={b.revenueGrowth} /></div>
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

  // ══════════════════════════════════════════════════
  // 2. DAVR TAQQOSLASH (Period Comparison)
  // ══════════════════════════════════════════════════
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
      <div className="an-section" style={{ '--ds-accent': '#6366f1' } as any}>
        <div className="an-section-title">Davr taqqoslash</div>
        <div className="an-section-desc">{branchName} — {periodLabel} va oldingi davr orasidagi o'sish yoki pasayish</div>
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

  // ══════════════════════════════════════════════════
  // 3. MOLIYA TRENDI (Finance Trend — grouped column)
  // ══════════════════════════════════════════════════
  const renderFinanceTrend = () => {
    if (!trends?.trends?.length) return null;
    const t = trends.trends;
    const totalInc = t.reduce((s: number, x: any) => s + (x.income || 0), 0);
    const totalExp = t.reduce((s: number, x: any) => s + (x.expense || 0), 0);
    const chartData = t.flatMap((x: any) => [
      { month: x.month, value: x.income, type: 'Tushum' },
      { month: x.month, value: x.expense, type: 'Xarajat' },
    ]);
    return (
      <div className="an-section" style={{ '--ds-accent': '#10b981' } as any}>
        <div className="an-section-title">Moliya trendi</div>
        <div className="an-section-desc">{branchName} — {periodLabel} uchun oylik tushum va xarajat dinamikasi</div>
        <div className="ds-stats" style={{ marginBottom: 16 }}>
          <div className="ds-stat"><span className="ds-stat-val">{fmtCurrency(totalInc)}</span><span className="ds-stat-label">Jami tushum</span></div>
          <div className="ds-stat"><span className="ds-stat-val">{fmtCurrency(totalExp)}</span><span className="ds-stat-label">Jami xarajat</span></div>
          <div className="ds-stat"><span className="ds-stat-val">{fmtCurrency(totalInc - totalExp)}</span><span className="ds-stat-label">Sof foyda</span></div>
        </div>
        <Column data={chartData} xField="month" yField="value" seriesField="type" isGroup color={['#34d399', '#f87171']} height={280}
          yAxis={{ label: { formatter: (v: string) => fmtCurrency(Number(v)) } }} legend={{ position: 'top' }} />
      </div>
    );
  };

  // ══════════════════════════════════════════════════
  // 4. MOLIYA TAQQOSLASH (Multi-branch finance comparison)
  // ══════════════════════════════════════════════════
  const renderBranchFinance = () => {
    if (!comparison?.length) return null;
    const data = comparison.flatMap((b: any) => [
      { branch: b.branchName, value: b.revenue, type: 'Tushum' },
      { branch: b.branchName, value: b.expenses, type: 'Xarajat' },
      { branch: b.branchName, value: b.profit, type: 'Foyda' },
    ]);
    return (
      <div className="an-section" style={{ '--ds-accent': '#10b981' } as any}>
        <div className="an-section-title">Moliya taqqoslash (filiallar)</div>
        <div className="an-section-desc">{periodLabel} — filiallar bo'yicha tushum, xarajat va foyda taqqoslash</div>
        <Column data={data} xField="branch" yField="value" seriesField="type" isGroup
          color={['#34d399', '#f87171', '#6366f1']} height={280}
          yAxis={{ label: { formatter: (v: string) => fmtCurrency(Number(v)) } }} legend={{ position: 'top' }} />
      </div>
    );
  };

  // ══════════════════════════════════════════════════
  // 5. FOYDA TRENDI (Profit trend line)
  // ══════════════════════════════════════════════════
  const renderProfitTrend = () => {
    if (!trends?.trends?.length || trends.trends.length < 2) return null;
    const data = trends.trends.map((t: any) => ({ month: t.month, profit: t.profit }));
    return (
      <div className="an-section" style={{ '--ds-accent': '#06b6d4' } as any}>
        <div className="an-section-title">Foyda trendi</div>
        <div className="an-section-desc">{branchName} — {periodLabel} davomida sof foyda o'zgarishi</div>
        <Line data={data} xField="month" yField="profit" smooth color="#06b6d4"
          areaStyle={{ fill: 'l(270) 0:rgba(6,182,212,0.15) 1:rgba(6,182,212,0)' }}
          yAxis={{ label: { formatter: (v: string) => fmtCurrency(Number(v)) } }}
          point={{ size: 4, style: { fill: '#06b6d4' } }} height={220} />
      </div>
    );
  };

  // ══════════════════════════════════════════════════
  // 6. LEADLAR TRENDI (Leads + Rejections grouped column)
  // ══════════════════════════════════════════════════
  const renderLeadsTrend = () => {
    if (!trends?.trends?.length) return null;
    const data = trends.trends.flatMap((t: any) => [
      { month: t.month, value: t.leads, type: 'Leadlar' },
      { month: t.month, value: t.rejections, type: 'Rad etilgan' },
    ]);
    return (
      <div className="an-section" style={{ '--ds-accent': '#3b82f6' } as any}>
        <div className="an-section-title">Leadlar trendi</div>
        <div className="an-section-desc">{branchName} — {periodLabel} uchun yangi leadlar va rad etilganlar dinamikasi</div>
        <Column data={data} xField="month" yField="value" seriesField="type" isGroup color={['#3b82f6', '#f87171']} height={240}
          legend={{ position: 'top' }} />
      </div>
    );
  };

  // ══════════════════════════════════════════════════
  // 7. LEADLAR BO'YICHA (Leads by Subject — ranked bars + donut)
  // ══════════════════════════════════════════════════
  const renderLeadsBySubject = () => {
    const subs = dash?.leads?.bySubject;
    if (!subs?.length) return null;
    const maxVal = subs[0]?.count || 1;
    const total = subs.reduce((s: number, r: any) => s + r.count, 0);
    return (
      <div className="an-section" style={{ '--ds-accent': '#3b82f6' } as any}>
        <div className="an-section-title">Leadlar fanlar bo'yicha</div>
        <div className="an-section-desc">{branchName} — {periodLabel} uchun fanlar bo'yicha lead taqsimoti va reytingi</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Ranked bars */}
          <div>
            <div className="ds-big" style={{ marginBottom: 12 }}>
              <AnimCount value={total} className="ds-big-num" style={{ fontSize: 42 }} />
              <span className="ds-big-label">Jami leadlar</span>
            </div>
            <div className="rank-list">
              {subs.map((s: any, i: number) => {
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div className="rank-row" key={s.name}>
                    <span className="rank-pos">{medals[i] || (i + 1)}</span>
                    <span className="rank-name">{s.name}</span>
                    <div className="rank-bar-wrap">
                      <div className="rank-bar ds-bar-fill" data-w={Math.round((s.count / maxVal) * 100)}
                        style={{ '--bar-color': `linear-gradient(90deg, ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}, ${SUBJECT_COLORS[(i + 1) % SUBJECT_COLORS.length]})` } as any} />
                    </div>
                    <span className="rank-count">{s.count} ta</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Donut chart */}
          <div>
            <Pie data={subs.map((s: any) => ({ subject: s.name, count: s.count }))}
              angleField="count" colorField="subject" color={SUBJECT_COLORS}
              height={280} radius={0.85} innerRadius={0.6}
              label={{ type: 'outer', formatter: (d: any) => `${d.subject}: ${d.count}` }}
              legend={{ position: 'bottom' }} />
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════
  // 8. QARZDORLAR (Debtors by month + aging bars)
  // ══════════════════════════════════════════════════
  const renderDebtors = () => {
    const debtors = dash?.debtors;
    if (!debtors?.byMonth?.some((d: any) => d.count > 0) && !finIntel?.aging) return null;
    const totalCount = debtors?.total?.count || 0;
    const totalAmount = debtors?.total?.amount || 0;
    return (
      <div className="an-section" style={{ '--ds-accent': '#f59e0b' } as any}>
        <div className="an-section-title">Qarzdorlar tahlili</div>
        <div className="an-section-desc">{branchName} — {periodLabel} uchun qarzdorlik holati va eskirish tahlili</div>
        <div className="ds-stats" style={{ marginBottom: 16 }}>
          <div className="ds-stat"><span className="ds-stat-val" style={{ WebkitTextFillColor: '#f87171' }}>{totalCount}</span><span className="ds-stat-label">Jami qarzdorlar</span></div>
          <div className="ds-stat"><span className="ds-stat-val" style={{ WebkitTextFillColor: '#fb923c' }}>{fmtMoney(totalAmount)}</span><span className="ds-stat-label">Jami qarz</span></div>
          {finIntel?.debtors && (
            <>
              <div className="ds-stat"><span className="ds-stat-val">{fmtMoney(finIntel.debtors.avgDebt)}</span><span className="ds-stat-label">O'rtacha qarz</span></div>
              <div className="ds-stat"><span className="ds-stat-val" style={{ WebkitTextFillColor: '#ef4444' }}>{fmtMoney(finIntel.debtors.maxDebt)}</span><span className="ds-stat-label">Eng katta qarz</span></div>
            </>
          )}
        </div>

        {/* Debtor month cards */}
        {debtors?.byMonth?.filter((d: any) => d.count > 0).length > 0 && (
          <div className="ds-debt-months" style={{ marginBottom: 16 }}>
            {debtors.byMonth.filter((d: any) => d.count > 0).map((d: any) => (
              <div className="ds-debt-month" key={d.month}>
                <div className="ds-debt-month-name">{d.month}</div>
                <div className="ds-debt-month-row"><span>Qarzdorlar soni</span><b style={{ color: '#f87171' }}>{d.count} ta</b></div>
                <div className="ds-debt-month-row"><span>Qarz miqdori</span><b style={{ color: '#fb923c' }}>{fmtMoney(d.amount)} so'm</b></div>
              </div>
            ))}
          </div>
        )}

        {/* Aging breakdown */}
        {finIntel?.aging && (
          <>
            <div className="ds-title" style={{ marginTop: 8 }}><div className="ds-title-left"><span className="ds-title-icon">⏳</span><span className="ds-title-text">Qarz eskirishi</span></div></div>
            <div className="an-fi-grid">
              <div className="an-fi-item" style={{ borderLeft: '3px solid #34d399' }}><Text type="secondary" style={{ fontSize: 11 }}>0-30 kun</Text><div style={{ fontWeight: 700, marginTop: 4 }}>{finIntel.aging.d30.count} ta — {fmtMoney(finIntel.aging.d30.amount)}</div></div>
              <div className="an-fi-item" style={{ borderLeft: '3px solid #fbbf24' }}><Text type="secondary" style={{ fontSize: 11 }}>30-60 kun</Text><div style={{ fontWeight: 700, marginTop: 4 }}>{finIntel.aging.d60.count} ta — {fmtMoney(finIntel.aging.d60.amount)}</div></div>
              <div className="an-fi-item" style={{ borderLeft: '3px solid #fb923c' }}><Text type="secondary" style={{ fontSize: 11 }}>60-90 kun</Text><div style={{ fontWeight: 700, marginTop: 4 }}>{finIntel.aging.d90.count} ta — {fmtMoney(finIntel.aging.d90.amount)}</div></div>
              <div className="an-fi-item" style={{ borderLeft: '3px solid #ef4444' }}><Text type="secondary" style={{ fontSize: 11 }}>90+ kun</Text><div style={{ color: '#ef4444', fontWeight: 700, marginTop: 4 }}>{finIntel.aging.d90plus.count} ta — {fmtMoney(finIntel.aging.d90plus.amount)}</div></div>
            </div>
          </>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════
  // 9. DAVOMAT TRENDI (Attendance trend line)
  // ══════════════════════════════════════════════════
  const renderAttTrend = () => {
    if (!attTrend) return null;
    const att = dash?.attendance;
    return (
      <div className="an-section" style={{ '--ds-accent': '#8b5cf6' } as any}>
        <div className="an-section-title">Davomat trendi</div>
        <div className="an-section-desc">{branchName} — {periodLabel} uchun darsga kelish foizi va kunlik dinamika</div>
        {/* Summary stats */}
        {att && (
          <div className="ds-stats" style={{ marginBottom: 16 }}>
            <div className="ds-stat"><span className="ds-stat-val" style={{ WebkitTextFillColor: att.rate >= 80 ? '#34d399' : '#fb923c', fontSize: 20 }}>{att.rate}%</span><span className="ds-stat-label">Umumiy davomat</span></div>
            <div className="ds-stat"><span className="ds-stat-val" style={{ WebkitTextFillColor: '#34d399' }}>{att.present}</span><span className="ds-stat-label">Kelgan</span></div>
            <div className="ds-stat"><span className="ds-stat-val">{att.total}</span><span className="ds-stat-label">Kutilgan</span></div>
          </div>
        )}
        {/* Chart */}
        {attTrend.type === 'single' ? (
          <Line data={attTrend.data} xField="month" yField="rate" smooth color="#8b5cf6"
            areaStyle={{ fill: 'l(270) 0:rgba(139,92,246,0.15) 1:rgba(139,92,246,0)' }}
            yAxis={{ min: 0, max: 100, label: { formatter: (v: string) => `${v}%` } }}
            point={{ size: 3, style: { fill: '#8b5cf6' } }} height={240} />
        ) : (
          <Line data={attTrend.data.flatMap((b: any) => b.rates.map((r: any) => ({ month: r.month, rate: r.rate, branch: b.branchName })))}
            xField="month" yField="rate" seriesField="branch" color={BRANCH_COLORS} smooth
            yAxis={{ min: 0, max: 100, label: { formatter: (v: string) => `${v}%` } }}
            height={280} legend={{ position: 'top' }} />
        )}

        {/* Daily attendance bars */}
        {att?.daily?.length > 1 && (
          <>
            <div className="ds-divider" />
            <div className="ds-title"><div className="ds-title-left"><span className="ds-title-icon">📅</span><span className="ds-title-text">Kunlik davomat</span></div></div>
            <div className="ds-att-list">
              {att.daily.slice(-20).map((d: any) => (
                <div className="ds-att-row" key={d.date}>
                  <span className="ds-att-date">{d.date}</span>
                  <div className="ds-att-bar">
                    <div className="ds-att-fill ds-bar-fill" data-w={d.rate}
                      style={{ background: d.rate >= 80 ? '#8b5cf6' : d.rate >= 60 ? '#fb923c' : '#f87171' }} />
                  </div>
                  <span className="ds-att-pct" style={{ color: d.rate >= 80 ? '#34d399' : d.rate >= 60 ? '#fb923c' : '#f87171' }}>{d.rate}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════
  // 10. XARAJAT TURLARI + TO'LOV USULLARI (Expense donut + payment methods)
  // ══════════════════════════════════════════════════
  const renderExpenseBreakdown = () => {
    if (!finIntel?.expensesByCategory?.length && !finIntel?.paymentsByMethod?.length) return null;
    return (
      <div className="an-section" style={{ '--ds-accent': '#f59e0b' } as any}>
        <div className="an-section-title">Xarajat va to'lov tahlili</div>
        <div className="an-section-desc">{branchName} — {periodLabel} uchun xarajat turlari va to'lov usullari tahlili</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="an-fi-card">
            <div className="ds-title"><div className="ds-title-left"><span className="ds-title-icon">📊</span><span className="ds-title-text">Xarajat turlari</span></div></div>
            {finIntel.expensesByCategory?.length ? (
              <Pie data={finIntel.expensesByCategory} angleField="amount" colorField="category"
                height={220} radius={0.85} innerRadius={0.6}
                label={{ type: 'outer', formatter: (d: any) => d.category }}
                legend={{ position: 'bottom' }} />
            ) : <Empty description="Ma'lumot yo'q" />}
          </div>
          <div className="an-fi-card">
            <div className="ds-title"><div className="ds-title-left"><span className="ds-title-icon">💳</span><span className="ds-title-text">To'lov usullari</span></div></div>
            {finIntel.paymentsByMethod?.length ? (
              <Pie data={finIntel.paymentsByMethod.map((p: any) => ({ method: p.method, amount: p.amount }))}
                angleField="amount" colorField="method" color={['#34d399', '#3b82f6', '#f59e0b']}
                height={220} radius={0.85} innerRadius={0.6}
                label={{ type: 'outer', formatter: (d: any) => `${d.method}: ${fmtMoney(d.amount)}` }}
                legend={{ position: 'bottom' }} />
            ) : <Empty description="Ma'lumot yo'q" />}
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════
  // 11. BREAK-EVEN TAHLILI
  // ══════════════════════════════════════════════════
  const renderBreakEven = () => {
    if (!finIntel?.breakEven) return null;
    const be = finIntel.breakEven;
    return (
      <div className="an-section" style={{ '--ds-accent': '#10b981' } as any}>
        <div className="an-section-title">Break-even tahlili</div>
        <div className="an-section-desc">{branchName} — xarajatlarni qoplash uchun kerakli minimum o'quvchilar soni</div>
        <div className="ds-stats">
          <div className="ds-stat"><span className="ds-stat-val">{fmtMoney(be.monthlyExpense)}</span><span className="ds-stat-label">Oylik xarajat</span></div>
          <div className="ds-stat"><span className="ds-stat-val">{fmtMoney(be.revenuePerStudent)}</span><span className="ds-stat-label">Har bir o'quvchi</span></div>
          <div className="ds-stat" style={{ borderLeft: '3px solid #34d399' }}>
            <span className="ds-stat-val" style={{ WebkitTextFillColor: '#34d399', fontSize: 20 }}>{be.breakEvenStudents} ta</span>
            <span className="ds-stat-label">Break-even uchun</span>
          </div>
          <div className="ds-stat"><span className="ds-stat-val">{be.activeStudents} ta</span><span className="ds-stat-label">Hozirgi o'quvchilar</span></div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════
  // 12. PUL OQIMI (Cash Flow trend)
  // ══════════════════════════════════════════════════
  const renderCashFlow = () => {
    if (!finIntel?.cashFlow?.length || finIntel.cashFlow.length < 2) return null;
    const barData = finIntel.cashFlow.flatMap((m: any) => [
      { month: m.month, value: m.income, type: 'Tushum' },
      { month: m.month, value: -m.expense, type: 'Xarajat' },
    ]);
    const cumulativeData = finIntel.cashFlow.map((m: any) => ({ month: m.month, cumulative: m.cumulative }));
    return (
      <div className="an-section" style={{ '--ds-accent': '#06b6d4' } as any}>
        <div className="an-section-title">Pul oqimi</div>
        <div className="an-section-desc">{branchName} — {periodLabel} uchun oylik kirim, chiqim va kumulyativ balans</div>
        <Column data={barData} xField="month" yField="value" seriesField="type" isGroup color={['#34d399', '#f87171']} height={240}
          yAxis={{ label: { formatter: (v: string) => fmtCurrency(Number(v)) } }} legend={{ position: 'top' }} />
        {/* Cumulative line */}
        <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Kumulyativ balans</div>
        <Line data={cumulativeData} xField="month" yField="cumulative" smooth color="#6366f1" height={160}
          areaStyle={{ fill: 'l(270) 0:rgba(99,102,241,0.2) 1:rgba(99,102,241,0)' }}
          yAxis={{ label: { formatter: (v: string) => fmtCurrency(Number(v)) } }}
          point={{ size: 4, style: { fill: '#6366f1' } }} />
      </div>
    );
  };

  // ══════════════════════════════════════════════════
  // 13. XONA DAROMAD POTENSIALI
  // ══════════════════════════════════════════════════
  const renderRoomPotential = () => {
    if (!finIntel?.roomPotential?.rooms?.length) return null;
    return (
      <div className="an-section" style={{ '--ds-accent': '#10b981' } as any}>
        <div className="an-section-title">Xona daromad potensiali</div>
        <div className="an-section-desc">{branchName} — bo'sh xonalarni to'ldirganda olinishi mumkin bo'lgan daromad</div>
        <div className="ds-pot-hero" style={{ padding: '12px 0 16px' }}>
          <div className="ds-pot-label">Jami potensial</div>
          <div className="ds-pot-val" style={{ fontSize: 28 }}>{fmtMoney(finIntel.roomPotential.total)} so'm</div>
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
    );
  };

  // ══════════════════════════════════════════════════
  // 14. XODIMLAR FAOLIYATI (Manager Accountability)
  // ══════════════════════════════════════════════════
  const renderAccountability = () => {
    if (!accountability?.length) return null;
    return (
      <div className="an-section" style={{ '--ds-accent': '#6366f1' } as any}>
        <div className="an-section-title">Xodimlar faoliyati</div>
        <div className="an-section-desc">{branchName} — {periodLabel} uchun menejerlar faollik ko'rsatkichlari</div>
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

  // ══════════════════════════════════════════════════
  // 15. XARAJAT TURLARI (Expense breakdown by type with % bars)
  // ══════════════════════════════════════════════════
  const renderExpenseByType = () => {
    if (!finIntel?.expenseBreakdown?.length) return null;
    return (
      <div className="an-section" style={{ '--ds-accent': '#f59e0b' } as any}>
        <div className="an-section-title">Xarajat turlari</div>
        <div className="an-section-desc">{branchName} — {periodLabel} uchun xarajatlar qaysi turlarga sarflangan</div>
        {finIntel.expenseBreakdown.map((r: any) => (
          <div key={r.type} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ minWidth: 100, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{r.type}</span>
            <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(r.pct, 100)}%`, height: '100%', borderRadius: 8, background: 'linear-gradient(90deg, #f59e0b, #ef4444)', transition: 'width 1.4s cubic-bezier(0.25,1,0.5,1)' }} />
            </div>
            <span style={{ minWidth: 35, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>{r.pct}%</span>
            <span style={{ minWidth: 80, fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{fmtMoney(r.amount)}</span>
          </div>
        ))}
      </div>
    );
  };

  // ══════════════════════════════════════════════════
  // 16. MAVSUMIYLIK (Seasonality chart)
  // ══════════════════════════════════════════════════
  const renderSeasonality = () => {
    if (!finIntel?.seasonality?.length) return null;
    const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    const chartData = finIntel.seasonality.flatMap((s: any) => [
      { month: monthNames[s.month - 1] || s.month, value: s.avgIncome, type: 'Tushum' },
      { month: monthNames[s.month - 1] || s.month, value: s.avgExpense, type: 'Xarajat' },
    ]);
    const leadsData = finIntel.seasonality.map((s: any) => ({
      month: monthNames[s.month - 1] || s.month, leads: s.avgLeads,
    }));
    return (
      <div className="an-section" style={{ '--ds-accent': '#06b6d4' } as any}>
        <div className="an-section-title">Mavsumiylik</div>
        <div className="an-section-desc">{branchName} — qaysi oylarda daromad ko'p, qaysi oylarda kam</div>
        <Column data={chartData} xField="month" yField="value" seriesField="type" isGroup
          color={['#34d399', '#f87171']} height={240}
          yAxis={{ label: { formatter: (v: string) => fmtCurrency(Number(v)) } }}
          legend={{ position: 'top' }} />
        {leadsData.some((d: any) => d.leads > 0) && (
          <>
            <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Oylik leadlar</div>
            <Line data={leadsData} xField="month" yField="leads" smooth color="#3b82f6" height={140}
              point={{ size: 4, style: { fill: '#3b82f6' } }}
              areaStyle={{ fill: 'l(270) 0:rgba(59,130,246,0.15) 1:rgba(59,130,246,0)' }} />
          </>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════
  // 17. HR ANALYTICS (Staff statistics)
  // ══════════════════════════════════════════════════
  const renderHrAnalytics = () => {
    if (!hrData) return null;
    const catLabels: Record<string, string> = { admin: 'Management', teacher: "O'qituvchilar", teaching: "O'qituvchilar", sales: 'Sotuv', it: 'IT', support: 'Yordam' };
    return (
      <div className="an-section" style={{ '--ds-accent': '#8b5cf6' } as any}>
        <div className="an-section-title">HR — Xodimlar statistikasi</div>
        <div className="an-section-desc">{branchName} — faol xodimlar soni, kategoriyalari va qabul dinamikasi</div>

        {/* Stats grid */}
        <div className="ds-stats" style={{ marginBottom: 16 }}>
          <div className="ds-stat">
            <AnimCount value={hrData.total} className="ds-stat-val" style={{ fontSize: 22, WebkitTextFillColor: '#8b5cf6' }} />
            <span className="ds-stat-label">Jami faol</span>
          </div>
          {hrData.byCategory?.map((c: any) => (
            <div className="ds-stat" key={c.category}>
              <span className="ds-stat-val" style={{ fontSize: 18 }}>{c.count}</span>
              <span className="ds-stat-label">{catLabels[c.category] || c.category}</span>
            </div>
          ))}
        </div>

        {/* Monthly hires bar chart */}
        {hrData.monthlyHires?.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Oylik qabul (12 oy)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 70 }}>
              {hrData.monthlyHires.map((r: any) => {
                const max = Math.max(...hrData.monthlyHires.map((x: any) => x.count), 1);
                const pct = Math.round((r.count / max) * 100);
                return (
                  <div key={r.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                      <div style={{ width: '100%', height: `${pct}%`, background: '#8b5cf6', borderRadius: '2px 2px 0 0', minHeight: r.count > 0 ? 2 : 0 }} />
                    </div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{r.month.substring(5)}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* By branch breakdown */}
        {hrData.byBranch?.length > 1 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginTop: 16, marginBottom: 8 }}>Filiallar bo'yicha</div>
            <div className="rank-list">
              {hrData.byBranch.map((br: any) => (
                <div className="rank-row" key={br.name}>
                  <span className="rank-name">{br.name}</span>
                  <div className="rank-bar-wrap">
                    <div className="rank-bar ds-bar-fill" data-w={Math.round((br.total / Math.max(hrData.total, 1)) * 100)}
                      style={{ '--bar-color': 'linear-gradient(90deg, #8b5cf6, #a78bfa)' } as any} />
                  </div>
                  <span className="rank-count">{br.total}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════
  // 18. KPI MAQSADLAR (detailed)
  // ══════════════════════════════════════════════════
  const renderKpiDetailed = () => {
    if (!kpiTargets?.length || !dash) return null;
    const metricLabels: Record<string, string> = {
      leads: '📈 Leadlar', income: '💰 Tushum', expense: '📤 Xarajat',
      attendance: '📋 Davomat', debtors: '💳 Qarzdorlar', rejections: '❌ Rad etilgan',
    };
    const getActual = (metric: string): number => {
      if (metric === 'leads') return dash.leads?.total || 0;
      if (metric === 'income') return dash.finance?.total?.income || 0;
      if (metric === 'expense') return dash.finance?.total?.expense || 0;
      if (metric === 'attendance') return dash.attendance?.rate || 0;
      if (metric === 'debtors') return dash.debtors?.total?.count || 0;
      return 0;
    };
    return (
      <div className="an-section" style={{ '--ds-accent': '#f59e0b' } as any}>
        <div className="an-section-title">KPI Maqsadlar</div>
        <div className="an-section-desc">{branchName} — {periodLabel} uchun belgilangan maqsadlar va hozirgi natija</div>
        <div className="ds-stats" style={{ marginBottom: 16 }}>
          <div className="ds-stat">
            <span className="ds-stat-val">{kpiTargets.length}</span>
            <span className="ds-stat-label">Jami maqsad</span>
          </div>
          <div className="ds-stat">
            <span className="ds-stat-val" style={{ WebkitTextFillColor: '#34d399' }}>
              {kpiTargets.filter((t: any) => { const pct = Math.round((getActual(t.metric) / (Number(t.targetValue) || 1)) * 100); return pct >= 90; }).length}
            </span>
            <span className="ds-stat-label">Bajarilgan</span>
          </div>
          <div className="ds-stat">
            <span className="ds-stat-val" style={{ WebkitTextFillColor: '#f87171' }}>
              {kpiTargets.filter((t: any) => { const pct = Math.round((getActual(t.metric) / (Number(t.targetValue) || 1)) * 100); return pct < 60; }).length}
            </span>
            <span className="ds-stat-label">Xavfli</span>
          </div>
        </div>
        {kpiTargets.map((t: any) => {
          const actual = getActual(t.metric);
          const target = Number(t.targetValue) || 1;
          const pct = Math.min(100, Math.round((actual / target) * 100));
          const color = pct >= 90 ? '#4ade80' : pct >= 60 ? '#f59e0b' : '#f87171';
          return (
            <div key={t.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                <span>{metricLabels[t.metric] || t.metric}</span>
                <span style={{ fontWeight: 700 }}>{actual.toLocaleString('uz-UZ')} / {Number(target).toLocaleString('uz-UZ')} <span style={{ color, fontSize: 12 }}>({pct}%)</span></span>
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 5, transition: 'width 1.2s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ══════════════════════════════════════════════════
  // 19. AI INSIGHTS (detailed)
  // ══════════════════════════════════════════════════
  const renderAiDetailed = () => {
    const insights = aiInsights?.data || aiInsights || [];
    if (!insights?.length) return null;
    return (
      <div className="an-section" style={{ '--ds-accent': '#8b5cf6' } as any}>
        <div className="an-section-title">AI Insights</div>
        <div className="an-section-desc">{branchName} — sun'iy intellekt tahlillari va tavsiyalar</div>
        {insights.map((insight: any, i: number) => (
          <div key={insight.id || i} style={{
            padding: '14px 16px', marginBottom: 10, borderRadius: 12,
            background: 'linear-gradient(145deg, rgba(139,92,246,0.08), rgba(139,92,246,0.02))',
            border: '1px solid rgba(139,92,246,0.12)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Tag color="purple">{insight.type === 'daily_analysis' ? 'Kunlik tahlil' : insight.type === 'anomaly' ? 'Anomaliya' : insight.type}</Tag>
              <Text type="secondary" style={{ fontSize: 11 }}>{new Date(insight.createdAt).toLocaleDateString('uz-UZ')}</Text>
            </div>
            <Text style={{ fontSize: 13, lineHeight: 1.6 }}>{insight.content}</Text>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="analytics-page" ref={pageRef}>
      <Particles />
      <div className="analytics-header">
        <Title level={3} style={{ margin: 0, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          <BarChartOutlined /> Analitika
        </Title>
        <Text type="secondary">{periodLabel} — {hasBranchFilter ? 'Filial tahlili' : 'Barcha filiallar'}</Text>
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

      {/* Quick Actions */}
      <div style={{ margin: '12px 0 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { label: '+ Lead', path: '/leads', color: '#6366f1' },
          { label: '+ To\'lov', path: '/finance/income', color: '#22c55e' },
          { label: '+ Chiqim', path: '/finance/expenses', color: '#ef4444' },
          { label: '+ Eslatma', path: '/reminders', color: '#f59e0b' },
          { label: '+ Talaba', path: '/students', color: '#3b82f6' },
          { label: '+ Guruh', path: '/groups', color: '#8b5cf6' },
          { label: '+ Xodim', path: '/hr', color: '#06b6d4' },
          { label: '+ Muammo', path: '/problems', color: '#fb923c' },
        ].map(a => (
          <Button key={a.path} size="small" style={{ borderColor: a.color, color: a.color }}
            onClick={() => window.location.href = a.path}>{a.label}</Button>
        ))}
      </div>

      {dashLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : dashError ? (
        <Result status="error" title="Xatolik yuz berdi" subTitle="Ma'lumotlar yuklanmadi" extra={<Button onClick={() => dashRefetch()}>Qayta urinish</Button>} />
      ) : (
        <>
          {/* ── KPI Summary Cards ── */}
          {dash && (
            <div className="an-kpi-grid">
              <div className="an-kpi-card an-kpi-income">
                <div className="an-kpi-icon">💰</div>
                <div className="an-kpi-label">Tushum</div>
                <AnimCount value={dash.finance?.total?.income || 0} className="an-kpi-value" style={{ fontSize: 18 }} formatter={(n) => fmtCurrency(n)} />
              </div>
              <div className="an-kpi-card an-kpi-expense">
                <div className="an-kpi-icon">📤</div>
                <div className="an-kpi-label">Xarajat</div>
                <AnimCount value={dash.finance?.total?.expense || 0} className="an-kpi-value" style={{ fontSize: 18 }} formatter={(n) => fmtCurrency(n)} />
              </div>
              <div className="an-kpi-card an-kpi-leads">
                <div className="an-kpi-icon">📈</div>
                <div className="an-kpi-label">Leadlar</div>
                <AnimCount value={dash.leads?.total || 0} className="an-kpi-value" />
              </div>
              <div className="an-kpi-card an-kpi-attendance">
                <div className="an-kpi-icon">📋</div>
                <div className="an-kpi-label">Davomat</div>
                <AnimCount value={dash.attendance?.rate || 0} className="an-kpi-value" formatter={(n) => `${n}%`} />
              </div>
            </div>
          )}

          {/* 1. Branch scorecard (multi-branch only) */}
          {renderScorecard()}

          {/* 2. Period comparison */}
          {renderComparison()}

          {/* 3. Finance trend (monthly column chart) */}
          {renderFinanceTrend()}

          {/* 4. Multi-branch finance comparison */}
          {renderBranchFinance()}

          {/* 5. Profit trend line */}
          {renderProfitTrend()}

          {/* 6. Leads trend (leads + rejections) */}
          {renderLeadsTrend()}

          {/* 7. Leads by subject (ranked bars + donut) */}
          {renderLeadsBySubject()}

          {/* 8. Debtors analysis (month cards + aging) */}
          {renderDebtors()}

          {/* 9. Attendance trend (line + daily bars) */}
          {renderAttTrend()}

          {/* 10. Expense donut + payment methods donut */}
          {renderExpenseBreakdown()}

          {/* 11. Break-even analysis */}
          {renderBreakEven()}

          {/* 12. Cash flow trend */}
          {renderCashFlow()}

          {/* 13. Room potential table */}
          {renderRoomPotential()}

          {/* 14. Manager accountability table */}
          {renderAccountability()}

          {/* 15. Expense breakdown by type with % bars */}
          {renderExpenseByType()}

          {/* 16. Seasonality chart */}
          {renderSeasonality()}

          {/* 17. HR analytics */}
          {renderHrAnalytics()}

          {/* 18. KPI detailed */}
          {renderKpiDetailed()}

          {/* 19. AI Insights detailed */}
          {renderAiDetailed()}
        </>
      )}
    </div>
  );
};

export default TahlilPage;
