"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// API base URL - update this based on your backend configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// User type matching backend response
export interface User {
  id: string;
  name: string;
  email: string;
  organization?: string;
  role: 'provider' | 'manager';
  organizationId: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, organization: string, role?: 'provider' | 'manager') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored token and fetch user on mount
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const mappedUser: User = {
          id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          organizationId: userData.organizationId,
          createdAt: userData.createdAt,
          lastLoginAt: userData.lastLoginAt,
        };
        setUser(mappedUser);
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('authToken', data.token);
      
      // Map user data
      const mappedUser: User = {
        id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        organizationId: data.user.organizationId,
        createdAt: data.user.createdAt,
        lastLoginAt: data.user.lastLoginAt,
      };
      
      setUser(mappedUser);
      setIsLoading(false);
      router.push('/');
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, organization: string, role: 'provider' | 'manager' = 'provider') => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          organizationName: organization,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('authToken', data.token);
      
      // Map user data
      const mappedUser: User = {
        id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        organizationId: data.user.organizationId,
        createdAt: data.user.createdAt,
        lastLoginAt: data.user.lastLoginAt,
      };
      
      setUser(mappedUser);
      setIsLoading(false);
      router.push('/');
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Call logout endpoint (optional, mainly for server-side cleanup if needed)
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      localStorage.removeItem('authToken');
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
