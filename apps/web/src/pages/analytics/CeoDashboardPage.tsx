import React, { useEffect, useRef } from 'react';
import { Typography, Spin, Empty, Tag, Result, Button } from 'antd';
import {
  DollarOutlined, FunnelPlotOutlined,
  CalendarOutlined, WarningOutlined, HomeOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import AnalyticsFilterBar from '../../components/analytics/AnalyticsFilterBar';
import Particles from '../../components/analytics/Particles';
import AnimCount from '../../components/analytics/AnimCount';
import { useAnalyticsFilter, fmtMoney, fmtCurrency } from '../../features/analytics/useAnalyticsFilter';
import { getDashboardOverview, getActivityFeed } from '../../features/analytics/api';
import api from '../../lib/axios';
import './analytics.css';

const { Title, Text } = Typography;

const SUBJECT_COLORS = ['#6366f1','#8b5cf6','#a78bfa','#3b82f6','#06b6d4','#14b8a6','#22c55e','#eab308','#f97316','#ef4444','#ec4899','#d946ef'];

/* Animate ds-bar-fill on mount */
function useBarAnimation(ref: React.RefObject<HTMLDivElement | null>, dep: any) {
  useEffect(() => {
    if (!ref.current) return;
    const fills = ref.current.querySelectorAll<HTMLElement>('.ds-bar-fill');
    fills.forEach(el => {
      const w = el.getAttribute('data-w') || '0';
      el.style.width = '0';
      requestAnimationFrame(() => { el.style.width = w + '%'; });
    });
  }, [dep]);
}

const CeoDashboardPage: React.FC = () => {
  const { filter, params, periodLabel, setPeriod, setMonth, setQuarter, setRange, setYear, setBranchId, months, quarters, years } = useAnalyticsFilter();
  const barsRef = useRef<HTMLDivElement>(null);

  const { data: branchesData } = useQuery({ queryKey: ['branches'], queryFn: () => import('../../lib/axios').then(m => m.default.get('/branches').then(r => r.data)) });
  const branches = branchesData || [];
  const isCeo = true;
  const branchName = filter.branchId ? branches.find((b: any) => b.id === filter.branchId)?.name || '' : 'Barcha filiallar';

  const { data: dash, isLoading, error, refetch } = useQuery({
    queryKey: ['ceo-dashboard', params, filter.branchId],
    queryFn: () => getDashboardOverview({ ...params, ...(filter.branchId ? { branch_id: filter.branchId } : {}) } as any),
    staleTime: 5 * 60 * 1000,
  });

  const { data: feed } = useQuery({ queryKey: ['activity-feed'], queryFn: () => getActivityFeed() });

  // KPI targets
  const { data: kpiTargets } = useQuery({
    queryKey: ['kpi-targets', filter.branchId],
    queryFn: () => api.get('/kpi/targets', { params: { month: new Date().toISOString().slice(0, 7) } }).then(r => r.data),
  });

  // AI Insights (latest)
  const { data: aiInsights } = useQuery({
    queryKey: ['ai-insights-latest'],
    queryFn: () => api.get('/ai/history', { params: { limit: 3 } }).then(r => r.data),
  });

  useBarAnimation(barsRef, dash);

  // ═══ KPI MAQSADLAR ═══
  const renderKpiTargets = () => {
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
      <div className="dash-group" style={{ '--ds-accent': '#f59e0b' } as any}>
        <div className="dash-group-header">
          <span className="dash-group-icon">🎯</span>
          <span className="dash-group-title">KPI Maqsadlar</span>
          <span className="dash-group-sub">{branchName} — {periodLabel} uchun belgilangan maqsadlar va hozirgi natija</span>
        </div>
        <div className="dash-group-body">
          <div className="dash-sub" style={{ padding: '16px 22px' }}>
            {kpiTargets.map((t: any) => {
              const actual = getActual(t.metric);
              const target = Number(t.targetValue) || 1;
              const pct = Math.min(100, Math.round((actual / target) * 100));
              const color = pct >= 90 ? '#4ade80' : pct >= 60 ? '#f59e0b' : '#f87171';
              return (
                <div key={t.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{metricLabels[t.metric] || t.metric}</span>
                    <span style={{ fontWeight: 700 }}>{actual.toLocaleString('uz-UZ')} / {Number(target).toLocaleString('uz-UZ')}</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ═══ GROUP 1: MOLIYA ═══
  const renderFinanceGroup = () => {
    if (!dash) return null;
    const { finance, debtors } = dash;
    const finSubs: React.ReactNode[] = [];

    // Finance sub-section
    if (finance?.byMonth?.length) {
      const totalInc = finance.total?.income || 0;
      const totalExp = finance.total?.expense || 0;
      const net = totalInc - totalExp;

      finSubs.push(
        <div className="dash-sub" key="fin">
          <div className="dash-sub-header">
            <span className="dash-sub-title">Moliya — {periodLabel}</span>
            <span className="dash-sub-badge">{(net >= 0 ? '+' : '') + fmtMoney(net)} sof</span>
          </div>
          <div className="dash-sub-body">
            {/* Summary stats */}
            <div className="ds-stats">
              <div className="ds-stat">
                <span className="ds-stat-val">{fmtMoney(totalInc)}</span>
                <span className="ds-stat-label">Jami tushum</span>
              </div>
              <div className="ds-stat">
                <span className="ds-stat-val">{fmtMoney(totalExp)}</span>
                <span className="ds-stat-label">Jami xarajat</span>
              </div>
              <div className="ds-stat">
                <span className="ds-stat-val">{(net >= 0 ? '+' : '') + fmtMoney(net)}</span>
                <span className="ds-stat-label">Sof foyda</span>
              </div>
            </div>

            {/* Month cards */}
            {finance.byMonth.map((m: any) => {
              const mNet = (m.income || 0) - (m.expense || 0);
              return (
                <div className="ds-fin-month" key={m.month}>
                  <div className="ds-fin-month-head">
                    <span className="ds-fin-month-name">{m.month}</span>
                    <span className="ds-fin-month-net" style={{ color: mNet >= 0 ? '#34d399' : '#f87171' }}>
                      {mNet >= 0 ? '+' : ''}{fmtMoney(mNet)}
                    </span>
                  </div>
                  <div className="ds-fin-blocks">
                    <div className="ds-fin-block">
                      <div className="ds-fin-block-title">Tushum / Xarajat</div>
                      <div className="ds-fin-row">
                        <span className="ds-fin-row-label">Kirim</span>
                        <span className="ds-fin-row-val" style={{ color: '#06b6d4' }}>{fmtMoney(m.income)}</span>
                      </div>
                      <div className="ds-fin-row">
                        <span className="ds-fin-row-label">Chiqim</span>
                        <span className="ds-fin-row-val" style={{ color: '#f59e0b' }}>{fmtMoney(m.expense)}</span>
                      </div>
                      <div className="ds-fin-row ds-fin-row-qoldiq">
                        <span className="ds-fin-row-label">Qoldiq</span>
                        <span className="ds-fin-qoldiq" style={{ color: mNet >= 0 ? '#34d399' : '#f87171' }}>
                          {mNet >= 0 ? '+' : ''}{fmtMoney(mNet)}
                        </span>
                      </div>
                    </div>
                    <div className="ds-fin-block-divider" />
                    <div className="ds-fin-block">
                      <div className="ds-fin-block-title">So'm</div>
                      <div className="ds-fin-row">
                        <span className="ds-fin-row-label">Kirim</span>
                        <span className="ds-fin-row-val" style={{ color: '#34d399' }}>{fmtMoney(m.income)} so'm</span>
                      </div>
                      <div className="ds-fin-row">
                        <span className="ds-fin-row-label">Chiqim</span>
                        <span className="ds-fin-row-val" style={{ color: '#ef4444' }}>{fmtMoney(m.expense)} so'm</span>
                      </div>
                      <div className="ds-fin-row ds-fin-row-qoldiq">
                        <span className="ds-fin-row-label">Qoldiq</span>
                        <span className="ds-fin-qoldiq" style={{ color: mNet >= 0 ? '#34d399' : '#f87171' }}>
                          {mNet >= 0 ? '+' : ''}{fmtMoney(mNet)} so'm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Debtors sub-section
    if (debtors?.byMonth?.some((d: any) => d.count > 0)) {
      const totalCount = debtors.byMonth.reduce((s: number, d: any) => s + (d.count || 0), 0);
      const totalAmount = debtors.byMonth.reduce((s: number, d: any) => s + (d.amount || 0), 0);

      finSubs.push(
        <React.Fragment key="debt-div"><div className="dash-sub-divider" /></React.Fragment>
      );
      finSubs.push(
        <div className="dash-sub" key="debt">
          <div className="dash-sub-header">
            <span className="dash-sub-title">Qarzdorlar</span>
            <span className="dash-sub-badge" style={{ color: '#f87171' }}>{totalCount} ta — {fmtMoney(totalAmount)} so'm</span>
          </div>
          <div className="dash-sub-body">
            <div className="ds-stats">
              <div className="ds-stat">
                <span className="ds-stat-val">{totalCount}</span>
                <span className="ds-stat-label">Jami qarzdorlar</span>
              </div>
              <div className="ds-stat">
                <span className="ds-stat-val">{fmtMoney(totalAmount)}</span>
                <span className="ds-stat-label">Jami qarz</span>
              </div>
            </div>
            <div className="ds-debt-months">
              {debtors.byMonth.filter((d: any) => d.count > 0).map((d: any) => (
                <div className="ds-debt-month" key={d.month}>
                  <div className="ds-debt-month-name">{d.month}</div>
                  <div className="ds-debt-month-row">
                    <span>Qarzdorlar soni</span>
                    <b style={{ color: '#f87171' }}>{d.count} ta</b>
                  </div>
                  <div className="ds-debt-month-row">
                    <span>Qarz miqdori</span>
                    <b style={{ color: '#fb923c' }}>{fmtMoney(d.amount)} so'm</b>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (!finSubs.length) return null;

    return (
      <div className="dash-group" style={{ '--ds-accent': '#10b981' } as any}>
        <div className="dash-group-header">
          <span className="dash-group-icon"><DollarOutlined style={{ fontSize: 22 }} /></span>
          <span className="dash-group-title">Moliya va Qarzdorlar</span>
          <span className="dash-group-sub">{branchName} — {periodLabel} uchun kiritilgan tushum, xarajat va qarzdorlar tafsiloti</span>
        </div>
        <div className="dash-group-body">{finSubs}</div>
      </div>
    );
  };

  // ═══ GROUP 2: BO'SH XONALAR ═══
  const renderRoomsGroup = () => {
    if (!dash?.rooms?.count) return null;
    const rooms = dash?.rooms?.list || [];

    return (
      <div className="dash-group" style={{ '--ds-accent': '#10b981' } as any}>
        <div className="dash-group-header">
          <span className="dash-group-icon"><HomeOutlined style={{ fontSize: 22 }} /></span>
          <span className="dash-group-title">Bo'sh xonalar</span>
          <span className="dash-group-sub">{branchName} — hozirgi bo'sh xonalar va ularni to'ldirganda mumkin bo'lgan potensial daromad</span>
        </div>
        <div className="dash-group-body">
          {/* Potential income sub */}
          <div className="dash-sub">
            <div className="dash-sub-header">
              <span className="dash-sub-title">Potensial daromad</span>
              <span className="dash-sub-badge">{fmtMoney(dash.rooms.totalPotential)} so'm</span>
            </div>
            <div className="dash-sub-body">
              <div className="ds-pot-hero">
                <div className="ds-pot-label">Jami potensial daromad</div>
                <div className="ds-pot-val">{fmtMoney(dash.rooms.totalPotential)} so'm</div>
              </div>
            </div>
          </div>

          <div className="dash-sub-divider" />

          {/* Room list sub */}
          <div className="dash-sub">
            <div className="dash-sub-header">
              <span className="dash-sub-title">Bo'sh xonalar ro'yxati</span>
              <span className="dash-sub-badge">{dash.rooms.count} ta</span>
            </div>
            <div className="dash-sub-body">
              <div className="ds-room-cards">
                {rooms.slice(0, 8).map((r: any, i: number) => (
                  <div className="ds-room-card" key={i}>
                    <div className="ds-room-card-top">
                      <span className="ds-room-card-id">Filial {r.branch} — Xona {r.room}</span>
                      <span className="ds-room-card-pot">{fmtMoney(r.potential)} so'm</span>
                    </div>
                    <div className="ds-room-card-bot">
                      <span className="ds-room-card-tag">📅 {r.days || '—'}</span>
                      <span className="ds-room-card-tag">🕐 {r.time || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══ GROUP 3: LEAD BO'LIMI ═══
  const renderLeadsGroup = () => {
    if (!dash) return null;
    const { leads, activeStudents } = dash;
    if (!leads) return null;

    const subjectCounts = (leads.bySubject || []).map((s: any) => s.count);
    const maxLead = subjectCounts.length ? Math.max(...subjectCounts, 1) : 1;

    return (
      <div className="dash-group" style={{ '--ds-accent': '#3b82f6' } as any}>
        <div className="dash-group-header">
          <span className="dash-group-icon"><FunnelPlotOutlined style={{ fontSize: 22 }} /></span>
          <span className="dash-group-title">Lead bo'limi</span>
          <span className="dash-group-sub">{branchName} — {periodLabel} davomida kelgan leadlar va aktiv o'quvchilar holati</span>
        </div>
        <div className="dash-group-body">
          <div className="dash-sub">
            <div className="dash-sub-header">
              <span className="dash-sub-title">Leadlar holati</span>
              <span className="dash-sub-badge">{leads.total || 0} ta</span>
            </div>
            <div className="dash-sub-body">
              {/* Big number */}
              <div className="ds-big">
                <AnimCount value={activeStudents || 0} className="ds-big-num" />
                <span className="ds-big-label">Faol o'quvchilar</span>
              </div>

              {/* Stats */}
              <div className="ds-stats">
                <div className="ds-stat">
                  <span className="ds-stat-val">{leads.bySubject?.length || 0}</span>
                  <span className="ds-stat-label">Fan yo'nalishlari</span>
                </div>
                <div className="ds-stat">
                  <span className="ds-stat-val">{leads.total || 0}</span>
                  <span className="ds-stat-label">Yangi leadlar</span>
                </div>
              </div>

              {/* Subject bars */}
              {leads.bySubject?.length > 0 && (
                <div className="ds-bars">
                  {leads.bySubject.slice(0, 8).map((s: any, i: number) => (
                    <div key={s.name}>
                      <div className="ds-bar-label">
                        <span className="ds-bar-name">{s.name}</span>
                        <span className="ds-bar-val">{s.count}</span>
                      </div>
                      <div className="ds-bar-track">
                        <div
                          className="ds-bar-fill"
                          data-w={Math.round((s.count / maxLead) * 100)}
                          style={{ '--ds-accent': SUBJECT_COLORS[i % SUBJECT_COLORS.length] } as any}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══ GROUP 4: DAVOMAT ═══
  const renderAttendanceGroup = () => {
    if (!dash?.attendance) return null;
    const { attendance } = dash;
    const rate = attendance.rate || 0;

    return (
      <div className="dash-group" style={{ '--ds-accent': '#8b5cf6' } as any}>
        <div className="dash-group-header">
          <span className="dash-group-icon"><CalendarOutlined style={{ fontSize: 22 }} /></span>
          <span className="dash-group-title">Davomat</span>
          <span className="dash-group-sub">{branchName} — {periodLabel} uchun darsga kelish ko'rsatkichlari</span>
        </div>
        <div className="dash-group-body">
          <div className="dash-sub">
            <div className="dash-sub-header">
              <span className="dash-sub-title">Kelish ko'rsatkichlari</span>
              <span className="dash-sub-badge">{rate}%</span>
            </div>
            <div className="dash-sub-body">
              {/* Big number */}
              <div className="ds-big">
                <AnimCount value={rate} className="ds-big-num" formatter={(n) => `${n}%`} />
                <span className="ds-big-label">Umumiy davomat</span>
              </div>

              {/* Stats */}
              <div className="ds-stats">
                <div className="ds-stat">
                  <span className="ds-stat-val" style={{ WebkitTextFillColor: '#34d399' }}>{attendance.present || 0}</span>
                  <span className="ds-stat-label">Kelgan</span>
                </div>
                <div className="ds-stat">
                  <span className="ds-stat-val">{attendance.total || 0}</span>
                  <span className="ds-stat-label">Kutilgan</span>
                </div>
              </div>

              {/* Daily attendance rows */}
              {attendance.daily?.length > 1 && (
                <div className="ds-att-list">
                  {attendance.daily.map((d: any) => {
                    const pct = d.rate || 0;
                    return (
                      <div className="ds-att-row" key={d.date}>
                        <span className="ds-att-date">{d.date}</span>
                        <div className="ds-att-bar">
                          <div
                            className="ds-att-fill ds-bar-fill"
                            data-w={pct}
                            style={{ background: pct >= 80 ? '#8b5cf6' : pct >= 60 ? '#fb923c' : '#f87171' }}
                          />
                        </div>
                        <span className="ds-att-pct" style={{ color: pct >= 80 ? '#34d399' : pct >= 60 ? '#fb923c' : '#f87171' }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══ GROUP 5: OCHIQ MUAMMOLAR ═══
  const renderProblemsGroup = () => {
    if (!dash?.problems?.length) return null;
    return (
      <div className="dash-group" style={{ '--ds-accent': '#ef4444' } as any}>
        <div className="dash-group-header">
          <span className="dash-group-icon"><WarningOutlined style={{ fontSize: 22 }} /></span>
          <span className="dash-group-title">Ochiq muammolar</span>
          <span className="dash-group-sub">{branchName} — hal qilinmagan muammolar ro'yxati</span>
        </div>
        <div className="dash-group-body">
          <div className="dash-sub">
            <div className="dash-sub-header">
              <span className="dash-sub-title">Hal qilinmagan muammolar</span>
              <span className="dash-sub-badge" style={{ color: '#f87171' }}>{dash.problems.length} ta</span>
            </div>
            <div className="dash-sub-body">
              {/* Big number */}
              <div className="ds-big">
                <AnimCount value={dash.problems.length} className="ds-big-num" />
                <span className="ds-big-label">Ochiq muammolar</span>
              </div>

              {/* Problem list */}
              {dash.problems.slice(0, 10).map((p: any) => (
                <div className="ds-problem" key={p.id}>
                  <span className="ds-problem-dot" />
                  <div style={{ flex: 1 }}>
                    <div className="ds-problem-branch">{p.branch}</div>
                    <div className="ds-problem-issue">{p.type} — {p.issue?.substring(0, 60)}</div>
                    <div className="ds-problem-meta">{p.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══ GROUP 6: FILIALLAR KESIMI ═══
  const renderBranchBreakdown = () => {
    if (!dash?.branchBreakdown?.length) return null;

    const profitValues = dash.branchBreakdown.map((b: any) => Math.abs(b.profit));
    const maxRevenue = profitValues.length ? Math.max(...profitValues, 1) : 1;

    return (
      <div className="dash-group" style={{ '--ds-accent': '#8b5cf6' } as any}>
        <div className="dash-group-header">
          <span className="dash-group-icon"><BarChartOutlined style={{ fontSize: 22 }} /></span>
          <span className="dash-group-title">Filiallar kesimi</span>
          <span className="dash-group-sub">{periodLabel} — har bir filialning foyda, lead, davomat va qarzdorlik ko'rsatkichlari</span>
        </div>
        <div className="dash-group-body">
          <div className="dash-sub">
            <div className="dash-sub-header">
              <span className="dash-sub-title">Filiallar</span>
              <span className="dash-sub-badge">{dash.branchBreakdown.length} ta</span>
            </div>
            <div className="dash-sub-body">
              {/* Bars */}
              <div className="ds-bars">
                {dash.branchBreakdown.map((b: any) => (
                  <div key={b.branchId}>
                    <div className="ds-bar-label">
                      <span className="ds-bar-name">{b.branchName}</span>
                      <span className="ds-bar-val">{fmtCurrency(b.profit)}</span>
                    </div>
                    <div className="ds-bar-track">
                      <div
                        className="ds-bar-fill"
                        data-w={Math.round((Math.abs(b.profit) / maxRevenue) * 100)}
                        style={{ '--ds-accent': b.profit >= 0 ? '#34d399' : '#f87171' } as any}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="ds-divider" />

              {/* Detail stats per branch */}
              {dash.branchBreakdown.map((b: any) => (
                <div className="ds-fin-month" key={b.branchId} style={{ marginBottom: 10 }}>
                  <div className="ds-fin-month-head">
                    <span className="ds-fin-month-name">{b.branchName}</span>
                    <span className="ds-fin-month-net" style={{ color: b.profit >= 0 ? '#34d399' : '#f87171' }}>
                      {fmtCurrency(b.profit)}
                    </span>
                  </div>
                  <div style={{ padding: '10px 16px' }}>
                    <div className="ds-stats" style={{ marginBottom: 0 }}>
                      <div className="ds-stat">
                        <span className="ds-stat-val">{b.leads}</span>
                        <span className="ds-stat-label">Leadlar</span>
                      </div>
                      <div className="ds-stat">
                        <span className="ds-stat-val" style={{ WebkitTextFillColor: b.attendance >= 80 ? '#34d399' : '#fb923c' }}>{b.attendance}%</span>
                        <span className="ds-stat-label">Davomat</span>
                      </div>
                      {b.debtors > 0 && (
                        <div className="ds-stat">
                          <span className="ds-stat-val" style={{ WebkitTextFillColor: '#f87171' }}>{b.debtors}</span>
                          <span className="ds-stat-label">Qarzdor</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══ AI INSIGHTS SUMMARY ═══
  const renderAiInsights = () => {
    const insights = aiInsights?.data || aiInsights || [];
    if (!insights?.length) return null;
    return (
      <div className="dash-section" style={{ '--ds-accent': '#8b5cf6' } as any}>
        <div className="ds-title">
          <div className="ds-title-left">
            <span className="ds-title-icon">🤖</span>
            <span className="ds-title-text">AI Insights</span>
          </div>
          <span className="ds-badge">{insights.length} ta</span>
        </div>
        {insights.slice(0, 3).map((insight: any, i: number) => (
          <div key={insight.id || i} style={{
            padding: '10px 14px', marginBottom: 8, borderRadius: 10,
            background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Tag color="purple" style={{ fontSize: 10 }}>{insight.type}</Tag>
              <Text type="secondary" style={{ fontSize: 10 }}>{new Date(insight.createdAt).toLocaleDateString('uz-UZ')}</Text>
            </div>
            <Text style={{ fontSize: 13 }}>{insight.content?.substring(0, 200)}{insight.content?.length > 200 ? '...' : ''}</Text>
          </div>
        ))}
      </div>
    );
  };

  // ═══ ACTIVITY FEED ═══
  const renderFeed = () => {
    if (!feed?.length) return null;
    return (
      <div className="dash-section" style={{ '--ds-accent': '#6366f1' } as any}>
        <div className="ds-title">
          <div className="ds-title-left">
            <span className="ds-title-icon">📋</span>
            <span className="ds-title-text">So'nggi faoliyat</span>
          </div>
          <span className="ds-badge">{feed.length} ta</span>
        </div>
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
      </div>
    );
  };

  return (
    <div className="analytics-page" ref={barsRef}>
      <Particles />
      <div className="analytics-header">
        <Title level={3} style={{ margin: 0, background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Bosh sahifa
        </Title>
        <Text type="secondary">{branchName} — {periodLabel}</Text>
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
      ) : error ? (
        <Result status="error" title="Xatolik yuz berdi" subTitle="Ma'lumotlar yuklanmadi" extra={<Button onClick={() => refetch()}>Qayta urinish</Button>} />
      ) : !dash ? (
        <Empty description="Ma'lumot yo'q" />
      ) : (
        <>
          {/* ── KPI Summary Cards ── */}
          <div className="an-kpi-grid">
            <div className="an-kpi-card an-kpi-leads">
              <div className="an-kpi-icon"><FunnelPlotOutlined /></div>
              <div className="an-kpi-label">Leadlar</div>
              <AnimCount value={dash.leads?.total || 0} className="an-kpi-value" />
              <div className="an-kpi-sub">{periodLabel}</div>
            </div>
            <div className="an-kpi-card an-kpi-students">
              <div className="an-kpi-icon"><span style={{ fontSize: 16 }}>👨‍🎓</span></div>
              <div className="an-kpi-label">Faol o'quvchilar</div>
              <AnimCount value={dash.activeStudents || 0} className="an-kpi-value" />
            </div>
            <div className="an-kpi-card an-kpi-income">
              <div className="an-kpi-icon"><DollarOutlined /></div>
              <div className="an-kpi-label">Tushum</div>
              <div className="an-kpi-value" style={{ fontSize: 18 }}>{fmtCurrency(dash.finance?.total?.income || 0)}</div>
            </div>
            <div className="an-kpi-card an-kpi-expense">
              <div className="an-kpi-icon"><span style={{ fontSize: 16 }}>💸</span></div>
              <div className="an-kpi-label">Qarzdorlar</div>
              <AnimCount value={dash.debtors?.total?.count || 0} className="an-kpi-value" />
              <div className="an-kpi-sub">{fmtMoney(dash.debtors?.total?.amount || 0)} so'm</div>
            </div>
            <div className="an-kpi-card an-kpi-attendance">
              <div className="an-kpi-icon"><CalendarOutlined /></div>
              <div className="an-kpi-label">Davomat</div>
              <AnimCount value={dash.attendance?.rate || 0} className="an-kpi-value" formatter={(n) => `${n}%`} />
            </div>
            {dash.problems?.length > 0 && (
              <div className="an-kpi-card an-kpi-problems">
                <div className="an-kpi-icon"><WarningOutlined /></div>
                <div className="an-kpi-label">Muammolar</div>
                <AnimCount value={dash.problems.length} className="an-kpi-value" />
                <div className="an-kpi-sub">ochiq</div>
              </div>
            )}
          </div>

          {renderFinanceGroup()}
          {renderRoomsGroup()}
          {renderLeadsGroup()}
          {renderAttendanceGroup()}
          {renderProblemsGroup()}
          {renderBranchBreakdown()}
          {renderKpiTargets()}
          {renderAiInsights()}
          {renderFeed()}
        </>
      )}
    </div>
  );
};

export default CeoDashboardPage;
