import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api';

interface User {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  role: 'admin' | 'mediabuyer' | 'printer';
  statut: string;
  email_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }
    setIsLoading(false);
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, mot_de_passe: password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token,
      login, logout,
      isLoading,
      isAuthenticated: !!user && !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
