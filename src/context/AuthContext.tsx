import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyToken = useCallback((t: string) => {
    setToken(t);
    localStorage.setItem('tt_token', t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
  }, []);

  const fetchMe = useCallback(async (t: string) => {
    try {
      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
      });
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('tt_token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('tt_token');
    if (saved) {
      applyToken(saved);
      fetchMe(saved).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [applyToken, fetchMe]);

  const savePendingResult = async () => {
    const pending = localStorage.getItem('tt_pending_result');
    if (!pending) return;
    localStorage.removeItem('tt_pending_result');
    try {
      await axios.post('/api/results', JSON.parse(pending));
    } catch { /* silently fail */ }
  };

  const login = async (email: string, password: string) => {
    const res = await axios.post('/api/auth/login', { email, password });
    applyToken(res.data.token);
    setUser(res.data.user);
    await savePendingResult();
  };

  const register = async (email: string, username: string, password: string) => {
    const res = await axios.post('/api/auth/register', { email, username, password });
    applyToken(res.data.token);
    setUser(res.data.user);
    await savePendingResult();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tt_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
