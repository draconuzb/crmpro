export enum Role {
  CEO = 'CEO',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string | null;
  role: Role;
  telegramId?: string;
  telegramLang?: string;
  botSections?: string[];
  branches: BranchInfo[];
}

export interface BranchInfo {
  id: number;
  name: string;
}

export interface JwtPayload {
  sub: number;
  phone: string;
  role: Role;
  branchId: number;
}
