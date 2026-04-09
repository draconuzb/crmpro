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

      // Restore branch context
      const storedBranch = localStorage.getItem('branchId');
      if (storedBranch && Number(storedBranch) > 0) {
        // Real branch selected
        api.defaults.headers.common['x-branch-id'] = storedBranch;
      } else if (storedBranch === '0') {
        // Analytics mode — no branch header
        delete api.defaults.headers.common['x-branch-id'];
        setActiveBranchId(0);
      } else if (profile.branches?.length > 0) {
        // First time — default to analytics mode (0)
        localStorage.setItem('branchId', '0');
        setActiveBranchId(0);
        delete api.defaults.headers.common['x-branch-id'];
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
    const storedBranch = localStorage.getItem('branchId');
    if (storedBranch && Number(storedBranch) >= 0) {
      const bid = Number(storedBranch);
      setActiveBranchId(bid);
      if (bid > 0) {
        api.defaults.headers.common['x-branch-id'] = String(bid);
      } else {
        delete api.defaults.headers.common['x-branch-id'];
      }
    } else if (profile.branches?.length > 0) {
      const firstBranch = profile.branches[0]?.branch?.id ?? profile.branches[0]?.branchId ?? 0;
      localStorage.setItem('branchId', String(firstBranch));
      setActiveBranchId(firstBranch);
      if (firstBranch > 0) api.defaults.headers.common['x-branch-id'] = String(firstBranch);
    } else {
      localStorage.setItem('branchId', '0');
      setActiveBranchId(0);
      delete api.defaults.headers.common['x-branch-id'];
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
    if (branchId > 0) {
      api.defaults.headers.common['x-branch-id'] = String(branchId);
    } else {
      // Analytics mode — no branch scope
      delete api.defaults.headers.common['x-branch-id'];
    }
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
