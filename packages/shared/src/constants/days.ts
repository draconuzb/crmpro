import type { DayType } from '../types/group';

export const DAY_TYPE_LABELS: Record<DayType, string> = {
  ODD: 'Odd days (Mon, Wed, Fri)',
  EVEN: 'Even days (Tue, Thu, Sat)',
  OTHER: 'Other',
};

export const WEEKDAYS = [
  { key: 'MON', label: 'Monday', short: 'Mon' },
  { key: 'TUE', label: 'Tuesday', short: 'Tue' },
  { key: 'WED', label: 'Wednesday', short: 'Wed' },
  { key: 'THU', label: 'Thursday', short: 'Thu' },
  { key: 'FRI', label: 'Friday', short: 'Fri' },
  { key: 'SAT', label: 'Saturday', short: 'Sat' },
  { key: 'SUN', label: 'Sunday', short: 'Sun' },
] as const;

export const ODD_DAYS = ['MON', 'WED', 'FRI'] as const;
export const EVEN_DAYS = ['TUE', 'THU', 'SAT'] as const;
