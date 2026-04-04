import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { createElement } from 'react';
import { loginApi, logoutApi, getMeApi, type UserProfile } from './api';
import api from '../../lib/axios';

export interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeBranchId: number | null;
  login: (phone: string, password: string) => Promise<{ user: UserProfile }>;
  logout: () => void;
  setActiveBranch: (branchId: number) => void;
  refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem('accessToken'),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeBranchId, setActiveBranchId] = useState<number | null>(() => {
    const stored = localStorage.getItem('branchId');
    return stored ? Number(stored) : null;
  });

  const isAuthenticated = !!accessToken && !!user;

  const restoreSession = useCallback(async () => {
    const storedToken = localStorage.getItem('accessToken');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    try {
      const profile = await getMeApi();
      setUser(profile);
      setAccessToken(storedToken);

      // If no active branch but user has branches, pick the first one
      const storedBranch = localStorage.getItem('branchId');
      if (!storedBranch && profile.branches?.length > 0) {
        const firstBranchId = profile.branches[0].branch?.id ?? profile.branches[0].branchId;
        localStorage.setItem('branchId', String(firstBranchId));
        setActiveBranchId(firstBranchId);
        api.defaults.headers.common['x-branch-id'] = String(firstBranchId);
      }
    } catch {
      // Token invalid or expired — clear everything
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (phone: string, password: string) => {
    const response = await loginApi(phone, password);
    const { user: profile, accessToken: at, refreshToken: rt } = response;

    localStorage.setItem('accessToken', at);
    localStorage.setItem('refreshToken', rt);
    setAccessToken(at);
    setUser(profile);

    // Set default branch
    if (profile.branches?.length > 0) {
      const storedBranch = localStorage.getItem('branchId');
      const branchId = storedBranch ? Number(storedBranch) : (profile.branches[0].branch?.id ?? profile.branches[0].branchId);
      localStorage.setItem('branchId', String(branchId));
      setActiveBranchId(branchId);
      api.defaults.headers.common['x-branch-id'] = String(branchId);
    }

    return { user: profile };
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      logoutApi(refreshToken).catch(() => {
        // Ignore logout API errors
      });
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('branchId');
    setAccessToken(null);
    setUser(null);
    setActiveBranchId(null);
    delete api.defaults.headers.common['x-branch-id'];
    window.location.href = '/login';
  }, []);

  const setActiveBranch = useCallback((branchId: number) => {
    localStorage.setItem('branchId', String(branchId));
    setActiveBranchId(branchId);
    api.defaults.headers.common['x-branch-id'] = String(branchId);
    // Reload the page so all queries refetch with the new branch
    window.location.reload();
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const profile = await getMeApi();
      setUser(profile);
    } catch {
      logout();
    }
  }, [logout]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      accessToken,
      isAuthenticated,
      isLoading,
      activeBranchId,
      login,
      logout,
      setActiveBranch,
      refreshAuth,
    }),
    [user, accessToken, isAuthenticated, isLoading, activeBranchId, login, logout, setActiveBranch, refreshAuth],
  );

  return createElement(AuthContext.Provider, { value }, children);
}
