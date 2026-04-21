import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On app load, if a token exists in localStorage, verify it by fetching the profile.
    // The axios interceptor will automatically attach the token as a Bearer header,
    // so this works even when cross-domain cookies are blocked by the browser.
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await API.get('/users/profile');
        setUserInfo(data);
      } catch {
        // Token is invalid or expired — clean up
        localStorage.removeItem('token');
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

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
    <AuthContext.Provider value={{ userInfo, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
