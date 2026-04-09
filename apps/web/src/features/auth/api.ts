import api from '../../lib/axios';

export interface Branch {
  id: number;
  name: string;
}

export interface UserBranch {
  userId: number;
  branchId: number;
  branch: Branch;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  avatar?: string | null;
  branches: UserBranch[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export async function loginApi(phone: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { phone, password });
  return data;
}

export async function refreshTokenApi(refreshToken: string): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>('/auth/refresh', { refreshToken });
  return data;
}

export async function logoutApi(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken });
}

export async function getMeApi(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/auth/me');
  return data;
}
