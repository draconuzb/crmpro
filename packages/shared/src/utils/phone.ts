import { PHONE_PREFIX, PHONE_LENGTH } from '../constants/currency';

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('998')) {
    const local = digits.slice(3);
    return `${PHONE_PREFIX} (${local.slice(0, 2)}) ${local.slice(2, 5)}-${local.slice(5, 7)}-${local.slice(7)}`;
  }
  return phone;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === PHONE_LENGTH) {
    return `${PHONE_PREFIX}${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+${digits}`;
  }
  return phone;
}

export function isValidUzPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('998');
}
