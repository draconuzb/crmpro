import type { PaymentMethod } from '../types/finance';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  CARD: 'Card',
  TRANSFER: 'Transfer',
};

export const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'CARD', 'TRANSFER'];
