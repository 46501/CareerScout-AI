import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  scoutStatus?: string;
  scoutSettings?: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (data: any) => {
    const response = await api.post('/auth/login', data);
    const token = response.data?.data?.accessToken;
    if (token) setAccessToken(token);
    setUser(response.data.data.user);
  };

  const register = async (data: any) => {
    const response = await api.post('/auth/register', data);
    const token = response.data?.data?.accessToken;
    if (token) setAccessToken(token);
    setUser(response.data.data.user);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
