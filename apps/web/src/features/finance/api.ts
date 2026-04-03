import api from '../../lib/axios';

// Payments
export const getPayments = (params?: any) => api.get('/finance/payments', { params }).then(r => r.data);
export const createPayment = (data: any) => api.post('/finance/payments', data).then(r => r.data);
export const getPaymentsSummary = (params?: any) => api.get('/finance/payments/summary', { params }).then(r => r.data);

// Withdrawals
export const getWithdrawals = (params?: any) => api.get('/finance/withdrawals', { params }).then(r => r.data);
export const createWithdrawal = (data: any) => api.post('/finance/withdrawals', data).then(r => r.data);
export const getWithdrawalsSummary = (params?: any) => api.get('/finance/withdrawals/summary', { params }).then(r => r.data);

// Expenses
export const getExpenses = (params?: any) => api.get('/finance/expenses', { params }).then(r => r.data);
export const createExpense = (data: any) => api.post('/finance/expenses', data).then(r => r.data);
export const getExpensesSummary = (params?: any) => api.get('/finance/expenses/summary', { params }).then(r => r.data);

// Salaries
export const getSalaries = (month: number, year: number) => api.get('/finance/salaries', { params: { month, year } }).then(r => r.data);
export const calculateSalaries = (month: number, year: number) => api.post('/finance/salaries/calculate', { month, year }).then(r => r.data);
export const paySalary = (id: number) => api.patch(`/finance/salaries/${id}/pay`).then(r => r.data);

// Debtors
export const getDebtors = (params?: any) => api.get('/finance/debtors', { params }).then(r => r.data);

// Summary
export const getFinanceSummary = () => api.get('/finance/summary').then(r => r.data);
