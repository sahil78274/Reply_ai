import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ra_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api
        .get('/auth/me')
        .then(({ data }) => setUser(data.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (tok, userData) => {
    setToken(tok);
    setUser(userData);
    localStorage.setItem('ra_token', tok);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ra_token');
    api.clearToken();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
