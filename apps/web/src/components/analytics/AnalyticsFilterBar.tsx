import React from 'react';
import { Select, Segmented } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import type { PeriodType } from '../../features/analytics/useAnalyticsFilter';

interface Branch { id: number; name: string; }

interface Props {
  period: PeriodType;
  onPeriodChange: (p: PeriodType) => void;
  month: string;
  onMonthChange: (m: string) => void;
  quarter: string;
  onQuarterChange: (q: string) => void;
  range: string;
  onRangeChange: (r: string) => void;
  year: string;
  onYearChange: (y: string) => void;
  branchId: number | null;
  onBranchChange: (id: number | null) => void;
  branches: Branch[];
  isCeo: boolean;
  months: string[];
  quarters: string[];
  years: string[];
  periodLabel: string;
}

const AnalyticsFilterBar: React.FC<Props> = ({
  period, onPeriodChange, month, onMonthChange, quarter, onQuarterChange,
  range, onRangeChange, year, onYearChange, branchId, onBranchChange,
  branches, isCeo, months, quarters, years, periodLabel,
}) => {
  return (
    <div className="an-filter-card">
      {/* Branch selector */}
      {isCeo && branches.length > 1 && (
        <div className="an-filter-row">
          <div className="an-filter-label">🏢 Filial</div>
          <Select
            value={branchId ?? 0}
            onChange={(v) => onBranchChange(v === 0 ? null : v)}
            className="an-branch-select"
            style={{ width: '100%' }}
            options={[
              { value: 0, label: 'Barcha filiallar' },
              ...branches.map(b => ({ value: b.id, label: b.name })),
            ]}
          />
        </div>
      )}

      {/* Period tabs */}
      <div className="an-filter-row">
        <div className="an-filter-label">📅 Davr turi</div>
        <Segmented
          value={period}
          onChange={(v) => onPeriodChange(v as PeriodType)}
          options={[
            { label: 'Oy', value: 'month' },
            { label: 'Chorak', value: 'quarter' },
            { label: 'Davr', value: 'range' },
            { label: 'Yil', value: 'year' },
          ]}
          block
          className="an-period-tabs"
        />
      </div>

      {/* Time selector based on period */}
      <div className="an-filter-row">
        <div className="an-filter-label">
          {period === 'month' ? '🗓️ Oy' : period === 'quarter' ? '📊 Chorak' : period === 'range' ? '📏 Davr' : '📅 Yil'}
        </div>
        {period === 'month' && (
          <Select value={month} onChange={onMonthChange} style={{ width: '100%' }}
            options={months.map(m => ({ value: m, label: m }))} />
        )}
        {period === 'quarter' && (
          <Select value={quarter} onChange={onQuarterChange} style={{ width: '100%' }}
            options={quarters.map(q => ({ value: q, label: q.replace('Q', 'Chorak ') }))} />
        )}
        {period === 'range' && (
          <Select value={range} onChange={onRangeChange} style={{ width: '100%' }}
            options={[
              { value: 'last3', label: 'Oxirgi 3 oy' },
              { value: 'last6', label: 'Oxirgi 6 oy' },
              { value: 'last12', label: 'Oxirgi 12 oy' },
            ]} />
        )}
        {period === 'year' && (
          <Select value={year} onChange={onYearChange} style={{ width: '100%' }}
            options={years.map(y => ({ value: y, label: `${y}-yil` }))} />
        )}
      </div>

      {/* Context badge */}
      <div className="an-filter-ctx">
        <span className="an-filter-ctx-icon"><CalendarOutlined /></span>
        <span>{periodLabel}</span>
      </div>
    </div>
  );
};

export default AnalyticsFilterBar;
