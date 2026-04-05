import { useState, useCallback, useMemo } from 'react';

const UZ_MONTHS: Record<number, string> = {
  1: 'Yanvar', 2: 'Fevral', 3: 'Mart', 4: 'Aprel', 5: 'May', 6: 'Iyun',
  7: 'Iyul', 8: 'Avgust', 9: 'Sentyabr', 10: 'Oktabr', 11: 'Noyabr', 12: 'Dekabr',
};

export type PeriodType = 'month' | 'quarter' | 'range' | 'year';

export interface FilterState {
  period: PeriodType;
  month: string;
  quarter: string;
  range: string;
  year: string;
  branchId: number | null;
}

export function getCurrentUzMonth() {
  const now = new Date();
  return `${UZ_MONTHS[now.getMonth() + 1]} ${now.getFullYear()}`;
}

export function getLast12Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${UZ_MONTHS[d.getMonth() + 1]} ${d.getFullYear()}`);
  }
  return months;
}

export function getLast4Quarters(): string[] {
  const quarters: string[] = [];
  const now = new Date();
  const curQ = Math.ceil((now.getMonth() + 1) / 3);
  for (let i = 0; i < 4; i++) {
    const q = ((curQ - i - 1 + 4) % 4) + 1;
    const y = now.getFullYear() - (curQ - i <= 0 ? 1 : 0);
    quarters.push(`Q${q} ${y}`);
  }
  return quarters;
}

export function getLast3Years(): string[] {
  const now = new Date();
  return [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map(y => `${y}`);
}

export function useAnalyticsFilter() {
  const [filter, setFilter] = useState<FilterState>({
    period: 'month',
    month: getCurrentUzMonth(),
    quarter: '',
    range: 'last6',
    year: `${new Date().getFullYear()}`,
    branchId: null,
  });

  const setPeriod = useCallback((p: PeriodType) => setFilter(f => ({ ...f, period: p })), []);
  const setMonth = useCallback((m: string) => setFilter(f => ({ ...f, month: m })), []);
  const setQuarter = useCallback((q: string) => setFilter(f => ({ ...f, quarter: q })), []);
  const setRange = useCallback((r: string) => setFilter(f => ({ ...f, range: r })), []);
  const setYear = useCallback((y: string) => setFilter(f => ({ ...f, year: y })), []);
  const setBranchId = useCallback((id: number | null) => setFilter(f => ({ ...f, branchId: id })), []);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (filter.period === 'quarter' && filter.quarter) p.quarter = filter.quarter;
    else if (filter.period === 'range' && filter.range) p.range = filter.range;
    else if (filter.period === 'year' && filter.year) p.year = filter.year;
    else p.month = filter.month || getCurrentUzMonth();
    return p;
  }, [filter]);

  const periodLabel = useMemo(() => {
    if (filter.period === 'quarter' && filter.quarter) return filter.quarter.replace('Q', 'Chorak ');
    if (filter.period === 'range') {
      const labels: Record<string, string> = { last3: 'Oxirgi 3 oy', last6: 'Oxirgi 6 oy', last12: 'Oxirgi 12 oy' };
      return labels[filter.range] || 'Oxirgi 6 oy';
    }
    if (filter.period === 'year') return `${filter.year}-yil`;
    return filter.month || getCurrentUzMonth();
  }, [filter]);

  return {
    filter, params, periodLabel,
    setPeriod, setMonth, setQuarter, setRange, setYear, setBranchId,
    months: getLast12Months(),
    quarters: getLast4Quarters(),
    years: getLast3Years(),
  };
}

// Format helpers matching Boshqaruvchi
export const fmtMoney = (n: number) => n?.toLocaleString('uz-UZ') || '0';
export const fmtCurrency = (n: number) => {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)} mlrd`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)} mln`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(0)}k`;
  return fmtMoney(n);
};
