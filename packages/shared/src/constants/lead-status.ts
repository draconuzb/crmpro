import type { LeadStatus } from '../types/lead';

export const LEAD_COLUMNS: { key: LeadStatus; label: string }[] = [
  { key: 'LEAD', label: 'Leads' },
  { key: 'EXPECTATION', label: 'Expectation' },
  { key: 'SET', label: 'Set' },
];

export const LEAD_SOURCES = [
  'Instagram',
  'Telegram',
  'Facebook',
  'Website',
  'Referral',
  'Walk-in',
  'Phone call',
  'Other',
] as const;
