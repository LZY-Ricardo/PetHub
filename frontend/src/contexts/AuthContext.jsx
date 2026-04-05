import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from '../utils/antdApp';
import { apiClient, setUnauthorizedHandler, clearUnauthorizedHandler } from '../utils/apiClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getDefaultRouteByRole = (currentUser) => {
    return currentUser?.role === 'admin' ? '/admin/dashboard' : '/';
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    // Check for stored token and user
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        clearAuth();
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth();
    });

    return () => {
      clearUnauthorizedHandler();
    };
  }, []);

  const login = async (username, password) => {
    try {
      const data = await apiClient.post('/api/auth/login', { username, password });

      if (data?.token && data?.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        message.success('登录成功！');
        return {
          success: true,
          redirectPath: getDefaultRouteByRole(data.user)
        };
      } else {
        message.error('登录失败');
        return { success: false };
      }
    } catch (error) {
      message.error(error.message || '登录失败，请稍后重试');
      return { success: false };
    }
  };

  const register = async (userData) => {
    try {
      await apiClient.post('/api/auth/register', userData);
      message.success('注册成功！请登录');
      return { success: true };
    } catch (error) {
      message.error(error.message || '注册失败，请稍后重试');
      return { success: false };
    }
  };

  const logout = (showMessage = true) => {
    clearAuth();
    if (showMessage) {
      message.success('已退出登录');
    }
  };

  const handleTokenExpired = () => {
    clearAuth();
    message.error('登录已过期，请重新登录');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    handleTokenExpired,
    updateUser,
    isAdmin,
    getDefaultRouteByRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
