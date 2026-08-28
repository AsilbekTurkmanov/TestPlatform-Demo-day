import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthResponse } from '../types';
import { authApi } from '../api/services';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
    phoneNumber?: string;
  }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('testplatform_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('testplatform_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('testplatform_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('testplatform_user', JSON.stringify(res.data));
          }
        } catch {
          // Token expired or invalid
          setToken(null);
          setUser(null);
          localStorage.removeItem('testplatform_token');
          localStorage.removeItem('testplatform_refresh');
          localStorage.removeItem('testplatform_user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    const handleLogoutEvent = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth_logout', handleLogoutEvent);
    return () => window.removeEventListener('auth_logout', handleLogoutEvent);
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      setToken(res.data.accessToken);
      const loggedInUser: User = {
        id: res.data.id,
        fullName: res.data.fullName,
        email: res.data.email,
        role: res.data.role,
        isActive: true,
        avatarUrl: res.data.avatarUrl,
        createdAt: new Date().toISOString(),
      };
      setUser(loggedInUser);
      localStorage.setItem('testplatform_token', res.data.accessToken);
      localStorage.setItem('testplatform_refresh', res.data.refreshToken);
      localStorage.setItem('testplatform_user', JSON.stringify(loggedInUser));
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
    phoneNumber?: string;
  }): Promise<AuthResponse> => {
    const res = await authApi.register(data);
    if (res.success && res.data) {
      setToken(res.data.accessToken);
      const registeredUser: User = {
        id: res.data.id,
        fullName: res.data.fullName,
        email: res.data.email,
        role: res.data.role,
        isActive: true,
        avatarUrl: res.data.avatarUrl,
        phoneNumber: data.phoneNumber,
        createdAt: new Date().toISOString(),
      };
      setUser(registeredUser);
      localStorage.setItem('testplatform_token', res.data.accessToken);
      localStorage.setItem('testplatform_refresh', res.data.refreshToken);
      localStorage.setItem('testplatform_user', JSON.stringify(registeredUser));
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('testplatform_refresh');
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('testplatform_token');
    localStorage.removeItem('testplatform_refresh');
    localStorage.removeItem('testplatform_user');
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem('testplatform_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        isStudent: user?.role === UserRole.Student,
        isTeacher: user?.role === UserRole.Teacher,
        isAdmin: user?.role === UserRole.Admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
