// Holds the current user + token in React context. Persists to localStorage.
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('linktrack_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('linktrack_token'));
  const [loading, setLoading] = useState(true);

  // On boot, if we have a token, re-fetch the user to make sure it's still valid.
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled) {
          setUser(data.user);
          localStorage.setItem('linktrack_user', JSON.stringify(data.user));
        }
      } catch {
        // Interceptor already cleared storage on 401.
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function login(nextUser, nextToken) {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem('linktrack_user', JSON.stringify(nextUser));
    localStorage.setItem('linktrack_token', nextToken);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('linktrack_user');
    localStorage.removeItem('linktrack_token');
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
