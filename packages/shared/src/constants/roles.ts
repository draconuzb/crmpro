import { Role } from '../types/auth';

export const ROLE_LABELS: Record<Role, string> = {
  [Role.CEO]: 'CEO',
  [Role.ADMIN]: 'Admin',
  [Role.MANAGER]: 'Manager',
  [Role.TEACHER]: 'Teacher',
  [Role.STUDENT]: 'Student',
};

export const ADMIN_ROLES = [Role.CEO, Role.ADMIN, Role.MANAGER] as const;
export const ALL_ROLES = Object.values(Role);
