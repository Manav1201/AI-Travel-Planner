"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Configure axios defaults
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  // Protect routes client-side
  useEffect(() => {
    if (loading) return;

    const publicPages = ['/', '/login', '/register'];
    const isPublicPage = publicPages.includes(pathname);

    if (!user && !isPublicPage) {
      router.push('/login');
    } else if (user && (pathname === '/login' || pathname === '/register')) {
      router.push('/dashboard');
    }
  }, [user, pathname, loading, router]);

  // Login User
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { token: userToken, user: userData } = response.data;

      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(userToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Login Auth Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid credentials. Please try again.'
      };
    }
  };

  // Register User
  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password });
      const { token: userToken, user: userData } = response.data;

      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(userToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Registration Auth Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed. Email might already be taken.'
      };
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    router.push('/');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
