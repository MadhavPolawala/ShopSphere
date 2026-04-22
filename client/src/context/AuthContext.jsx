import React, { createContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    console.log('AuthContext: loadUser called, token exists:', !!token);
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.get('/users/profile');
      console.log('AuthContext: User profile loaded successfully');
      setUserInfo(data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error('AuthContext: Failed to load user profile', errorMsg);
      toast.error(`Login failed: ${errorMsg}`);
      localStorage.removeItem('token');
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await API.post('/users/login', { email, password });
    if (data.token) localStorage.setItem('token', data.token);
    setUserInfo(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await API.post('/users', { name, email, password });
    if (data.token) localStorage.setItem('token', data.token);
    setUserInfo(data);
    return data;
  };

  const logout = async () => {
    try {
      await API.post('/users/logout');
    } catch {
      // Ignore errors during logout (e.g. token already expired)
    } finally {
      localStorage.removeItem('token');
      setUserInfo(null);
    }
  };

  const updateProfile = async (profileData) => {
    const { data } = await API.put('/users/profile', profileData);
    setUserInfo(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ userInfo, loading, login, register, logout, updateProfile, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
