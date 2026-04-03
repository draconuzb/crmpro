export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

export interface Payment {
  id: number;
  studentId: number;
  studentName: string;
  amount: number;
  method: PaymentMethod;
  description: string | null;
  date: string;
  createdAt: string;
}

export interface CreatePaymentDto {
  studentId: number;
  amount: number;
  method: PaymentMethod;
  description?: string;
  date?: string;
}

export interface Withdrawal {
  id: number;
  amount: number;
  method: PaymentMethod;
  description: string | null;
  category: string | null;
  date: string;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
}

export interface Debtor {
  id: number;
  studentName: string;
  phone: string;
  balance: number;
  periodicTotal: number;
  groupName: string;
  note: string | null;
  status: string;
}

export interface FinanceSummary {
  totalRevenue: number;
  netProfit: number;
  monthlyData: { month: string; revenue: number; expenses: number }[];
}
