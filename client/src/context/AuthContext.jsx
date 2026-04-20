import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem('userInfo');

    const loadUser = async () => {
      try {
        const { data } = await API.get('/users/profile');
        setUserInfo(data);
      } catch {
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/users/login', { email, password });
    setUserInfo(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await API.post('/users', { name, email, password });
    setUserInfo(data);
    return data;
  };

  const logout = async () => {
    await API.post('/users/logout');
    setUserInfo(null);
  };

  const updateProfile = async (profileData) => {
    const { data } = await API.put('/users/profile', profileData);
    setUserInfo(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ userInfo, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
