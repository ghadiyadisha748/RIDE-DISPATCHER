import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken]     = useState(() => localStorage.getItem('rd_access_token'));

  // Hydrate user on mount
  useEffect(() => {
    const hydrate = async () => {
      const savedToken = localStorage.getItem('rd_access_token');
      const savedUser  = localStorage.getItem('rd_user');
      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          // Verify token is still valid
          const { data } = await authService.getProfile();
          setUser(data.data);
          localStorage.setItem('rd_user', JSON.stringify(data.data));
        } catch {
          logout(false);
        }
      }
      setLoading(false);
    };
    hydrate();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authService.login({ email, password });
    const { user: u, accessToken } = data.data;
    localStorage.setItem('rd_access_token', accessToken);
    localStorage.setItem('rd_user', JSON.stringify(u));
    setToken(accessToken);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authService.register(payload);
    const { user: u, accessToken } = data.data;
    localStorage.setItem('rd_access_token', accessToken);
    localStorage.setItem('rd_user', JSON.stringify(u));
    setToken(accessToken);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async (notify = true) => {
    try { await authService.logout(); } catch { /* ignore */ }
    localStorage.removeItem('rd_access_token');
    localStorage.removeItem('rd_user');
    setToken(null);
    setUser(null);
    if (notify) toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('rd_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isAdmin  = user?.role === 'admin';
  const isDriver = user?.role === 'driver';
  const isUser   = user?.role === 'user';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAdmin, isDriver, isUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
