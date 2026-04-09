export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(amount);
}

export function formatCurrencyWithLabel(amount: number): string {
  return `${formatCurrency(amount)} so'm`;
}
