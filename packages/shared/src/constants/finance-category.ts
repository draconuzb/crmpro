export enum FinanceCategoryKey {
  CASH = 'cash',
  BANK = 'bank',
}

export const FINANCE_CATEGORY_DEFAULTS = [
  {
    key: FinanceCategoryKey.CASH,
    label: 'Naqd',
    labelRu: 'Наличные',
    labelEn: 'Cash',
    color: '#06b6d4',
    sortOrder: 0,
  },
  {
    key: FinanceCategoryKey.BANK,
    label: 'Bank',
    labelRu: 'Банк',
    labelEn: 'Bank',
    color: '#8b5cf6',
    sortOrder: 1,
  },
] as const;
