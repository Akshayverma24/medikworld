import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medfinder_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('medfinder_token'));
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    const checkUser = async () => {
      const storedToken = localStorage.getItem('medfinder_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
          localStorage.setItem('medfinder_user', JSON.stringify(res.data));
        } catch (error) {
          console.error('Session expired:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authAPI.login(credentials);
      const { token, ...userData } = res.data;
      localStorage.setItem('medfinder_token', token);
      localStorage.setItem('medfinder_user', JSON.stringify(userData));
      setToken(token);
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      return userData;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      const res = await authAPI.register(formData);
      const { token, ...userData } = res.data;
      localStorage.setItem('medfinder_token', token);
      localStorage.setItem('medfinder_user', JSON.stringify(userData));
      setToken(token);
      setUser(userData);
      toast.success(`Account created! Welcome, ${userData.name}`);
      return userData;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('medfinder_token');
    localStorage.removeItem('medfinder_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const isPharmacy = user?.role === 'pharmacy';
  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isPharmacy,
        isAdmin,
        login,
        register,
        logout,
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
