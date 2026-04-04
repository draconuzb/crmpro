export type Role = 'CEO' | 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';

export const ADMIN_ROLES: Role[] = ['CEO', 'ADMIN', 'MANAGER'];
export const TEACHER_ROLES: Role[] = ['TEACHER'];
export const STUDENT_ROLES: Role[] = ['STUDENT'];

export function getHomeRoute(role: string): string {
  if (ADMIN_ROLES.includes(role as Role)) return '/dashboard';
  if (role === 'TEACHER') return '/t/dashboard';
  if (role === 'STUDENT') return '/s/dashboard';
  return '/login';
}

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as Role);
}
