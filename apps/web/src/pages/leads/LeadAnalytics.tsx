import React from 'react';
import { Spin, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Column, Line, Pie } from '@ant-design/charts';
import { useQuery } from '@tanstack/react-query';
import { getLeadAnalytics } from '../../features/leads/api';
import AnimCount from '../../components/analytics/AnimCount';


const fmtPct = (n: number) => `${n}%`;

const LeadAnalytics: React.FC = () => {
  const { data: a, isLoading } = useQuery({
    queryKey: ['lead-analytics'],
    queryFn: getLeadAnalytics,
  });

  if (isLoading) return <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>;
  if (!a) return null;

  return (
    <div className="lead-an">
      {/* ── KPI Row ── */}
      <div className="lead-an-kpis">
        <div className="lead-an-kpi lead-an-kpi-total">
          <div className="lead-an-kpi-icon">📊</div>
          <AnimCount value={a.total} className="lead-an-kpi-val" />
          <div className="lead-an-kpi-label">Jami leadlar</div>
        </div>
        <div className="lead-an-kpi lead-an-kpi-today">
          <div className="lead-an-kpi-icon">📅</div>
          <AnimCount value={a.today} className="lead-an-kpi-val" />
          <div className="lead-an-kpi-label">Bugun</div>
        </div>
        <div className="lead-an-kpi lead-an-kpi-month">
          <div className="lead-an-kpi-icon">📈</div>
          <AnimCount value={a.thisMonth} className="lead-an-kpi-val" />
          <div className="lead-an-kpi-label">Bu oy</div>
        </div>
        <div className="lead-an-kpi lead-an-kpi-conv">
          <div className="lead-an-kpi-icon">🎯</div>
          <AnimCount value={a.conversionRate} className="lead-an-kpi-val" formatter={fmtPct} />
          <div className="lead-an-kpi-label">Konversiya</div>
        </div>
        <div className="lead-an-kpi lead-an-kpi-avg">
          <div className="lead-an-kpi-icon">⚡</div>
          <span className="lead-an-kpi-val">{a.avgPerDay}</span>
          <div className="lead-an-kpi-label">Kuniga o'rtacha</div>
        </div>
        <div className="lead-an-kpi lead-an-kpi-growth">
          <div className="lead-an-kpi-icon">{a.growth >= 0 ? '🚀' : '📉'}</div>
          <span className="lead-an-kpi-val">
            {a.growth >= 0 ? '+' : ''}{a.growth}%
          </span>
          <div className="lead-an-kpi-label">O'sish (30 kun)</div>
          <Tag color={a.growth >= 0 ? 'success' : 'error'} style={{ fontSize: 10, marginTop: 4 }}
            icon={a.growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>
            {a.thisWeek} bu hafta / {a.lastWeek} o'tgan
          </Tag>
        </div>
      </div>

      {/* ── Row 1: Funnel + Source Donut ── */}
      <div className="lead-an-row">
        {/* Funnel */}
        <div className="lead-an-card lead-an-funnel">
          <div className="lead-an-card-title">Lead Funnel</div>
          <div className="lead-an-card-desc">Bosqichlar bo'yicha leadlar taqsimoti</div>
          <div className="lead-an-funnel-bars">
            {a.stageFlow.map((s: any, i: number) => {
              const maxPct = Math.max(...a.stageFlow.map((x: any) => x.percentage), 1);
              const w = Math.max((s.percentage / maxPct) * 100, 8);
              return (
                <div key={s.key} className="lead-an-funnel-row">
                  <div className="lead-an-funnel-label">
                    <span className="lead-an-funnel-dot" style={{ background: s.color }} />
                    <span>{s.label}</span>
                  </div>
                  <div className="lead-an-funnel-track">
                    <div className="lead-an-funnel-fill" style={{ width: `${w}%`, background: s.color, animationDelay: `${i * 0.1}s` }} />
                  </div>
                  <div className="lead-an-funnel-nums">
                    <span className="lead-an-funnel-count">{s.total}</span>
                    <span className="lead-an-funnel-pct">{s.percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Source Donut */}
        <div className="lead-an-card">
          <div className="lead-an-card-title">Manbalar</div>
          <div className="lead-an-card-desc">Leadlar qayerdan kelmoqda</div>
          {a.bySource?.length > 0 ? (
            <Pie data={a.bySource} angleField="count" colorField="source"
              color={['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6']}
              height={240} radius={0.85} innerRadius={0.65}
              label={{ type: 'outer', formatter: (d: any) => `${d.source}: ${d.count}` }}
              legend={{ position: 'bottom' }}
              statistic={{ title: { content: 'Jami' }, content: { content: String(a.total) } }} />
          ) : <div className="lead-an-empty">Ma'lumot yo'q</div>}
        </div>
      </div>

      {/* ── Row 2: Daily Trend + Course Breakdown ── */}
      <div className="lead-an-row">
        {/* Daily trend */}
        <div className="lead-an-card lead-an-wide">
          <div className="lead-an-card-title">Kunlik trend</div>
          <div className="lead-an-card-desc">Oxirgi 30 kun — har kungi yangi leadlar soni</div>
          <Line data={a.dailyTrend} xField="date" yField="count" smooth
            color="#6366f1" height={220}
            areaStyle={{ fill: 'l(270) 0:rgba(99,102,241,0.2) 1:rgba(99,102,241,0)' }}
            point={{ size: 3, style: { fill: '#6366f1', stroke: '#6366f1' } }}
            yAxis={{ min: 0 }} xAxis={{ label: { style: { fontSize: 9 } } }} />
        </div>

        {/* By course */}
        <div className="lead-an-card">
          <div className="lead-an-card-title">Fanlar bo'yicha</div>
          <div className="lead-an-card-desc">Qaysi fanga ko'proq lead kelmoqda</div>
          {a.byCourse?.length > 0 ? (
            <Column data={a.byCourse} xField="course" yField="count"
              color="#10b981" height={220}
              columnStyle={{ radius: [6, 6, 0, 0] }}
              label={{ position: 'top', style: { fill: 'rgba(255,255,255,0.5)', fontSize: 10 } }}
              xAxis={{ label: { style: { fontSize: 10 }, autoRotate: true } }} />
          ) : <div className="lead-an-empty">Ma'lumot yo'q</div>}
        </div>
      </div>

      {/* ── Row 3: Heatmap + Hourly ── */}
      <div className="lead-an-row">
        {/* Weekly heatmap */}
        <div className="lead-an-card">
          <div className="lead-an-card-title">Hafta kunlari</div>
          <div className="lead-an-card-desc">Qaysi kunlarda ko'proq lead keladi</div>
          <div className="lead-an-heatmap">
            {a.heatmap.map((d: any) => {
              const max = Math.max(...a.heatmap.map((x: any) => x.count), 1);
              const intensity = d.count / max;
              return (
                <div key={d.day} className="lead-an-heat-cell">
                  <div className="lead-an-heat-block" style={{
                    background: `rgba(99,102,241,${0.1 + intensity * 0.8})`,
                    boxShadow: intensity > 0.5 ? `0 0 12px rgba(99,102,241,${intensity * 0.4})` : 'none',
                  }}>
                    <span className="lead-an-heat-count">{d.count}</span>
                  </div>
                  <span className="lead-an-heat-label">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly distribution */}
        <div className="lead-an-card lead-an-wide">
          <div className="lead-an-card-title">Soatlik taqsimot</div>
          <div className="lead-an-card-desc">Kunning qaysi soatlarida lead ko'proq keladi</div>
          <Column data={a.hourly.filter((_: any, i: number) => i >= 7 && i <= 22)}
            xField="hour" yField="count"
            color={(d: any) => d.count > 2 ? '#6366f1' : 'rgba(99,102,241,0.3)'}
            height={180}
            columnStyle={{ radius: [4, 4, 0, 0] }}
            xAxis={{ label: { style: { fontSize: 9 } } }}
            yAxis={{ min: 0 }} />
        </div>
      </div>

      {/* ── Conversion Stats ── */}
      <div className="lead-an-card lead-an-conversion">
        <div className="lead-an-card-title">Konversiya statistikasi</div>
        <div className="lead-an-conv-grid">
          <div className="lead-an-conv-item">
            <AnimCount value={a.total} className="lead-an-conv-num" />
            <div className="lead-an-conv-label">Jami lead</div>
          </div>
          <div className="lead-an-conv-arrow">→</div>
          <div className="lead-an-conv-item lead-an-conv-highlight">
            <AnimCount value={a.convertedCount} className="lead-an-conv-num" />
            <div className="lead-an-conv-label">O'quvchiga aylangan</div>
          </div>
          <div className="lead-an-conv-arrow">=</div>
          <div className="lead-an-conv-item lead-an-conv-rate">
            <AnimCount value={a.conversionRate} className="lead-an-conv-num" formatter={fmtPct} />
            <div className="lead-an-conv-label">Konversiya foizi</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadAnalytics;
