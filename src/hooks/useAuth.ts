/**
 * Simple authentication hook
 */

import { authService, type User } from '@/services/auth.service';
import type { LoginCredentials, RegisterData } from '@/types/auth.types';
import { useCallback, useEffect, useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!authService.getToken());

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.signIn(credentials.email, credentials.password);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.signUp(data.email, data.password, data.name);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error('Register failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = useCallback(async () => {
    const token = authService.getToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = await authService.getMe();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        authService.clearAuth();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authService.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };
};