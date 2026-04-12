import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';

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

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.code === 200) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        message.success('登录成功！');
        return {
          success: true,
          redirectPath: getDefaultRouteByRole(data.data.user)
        };
      } else {
        message.error(data.message || '登录失败');
        return { success: false };
      }
    } catch (error) {
      message.error('登录失败，请稍后重试');
      return { success: false };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.code === 201) {
        message.success('注册成功！请登录');
        return { success: true };
      } else {
        message.error(data.message || '注册失败');
        return { success: false };
      }
    } catch (error) {
      message.error('注册失败，请稍后重试');
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
