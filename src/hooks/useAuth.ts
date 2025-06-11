/**
 * Authentication hook using Jotai atoms
 * Provides auth state and actions
 */

import {
  authStateAtom,
  clearAuthAtom,
  setLoadingAtom,
  setSessionAtom,
  setUserAtom,
  updateUserAtom,
} from '@/atoms/auth.atoms';
import { useSession } from '@/lib/auth-client';
import { authService } from '@/services/auth.service';
import type { LoginCredentials, RegisterData, User } from '@/types/auth.types';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

export const useAuth = () => {
  const authState = useAtomValue(authStateAtom);
  const setUser = useSetAtom(setUserAtom);
  const setSession = useSetAtom(setSessionAtom);
  const setLoading = useSetAtom(setLoadingAtom);
  const updateUser = useSetAtom(updateUserAtom);
  const clearAuth = useSetAtom(clearAuthAtom);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const response = await authService.signIn(credentials);
      console.log('response', response);
      setUser(response.user);
      setSession(response.session);
      
      // Wait a moment for session to be established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if session was established
      const currentSession = await authService.getSession();
      if (currentSession?.session) {
        setSession(currentSession.session);
        setLoading(false);
        return response;
      } else {
        throw new Error('Session not established');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const response = await authService.signUp(data);
      setUser(response.user);
      setSession(response.session);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
      clearAuth();
    }
  };

  const checkAuth = async () => {
    setLoading(true);
    try {
      const session = await authService.getSession();
      if (session?.session && session.user) {
        setUser(session.user as User);
        setSession(session.session);
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      clearAuth();
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };
};

// Hook to sync Better Auth session with Jotai atoms
export const useAuthSync = () => {
  const { data: session, isPending } = useSession();
  const setUser = useSetAtom(setUserAtom);
  const setLoading = useSetAtom(setLoadingAtom);
  const clearAuth = useSetAtom(clearAuthAtom);

  useEffect(() => {
    if (!isPending) {
      setLoading(false);
      if (session?.user) {
        setUser(session.user as User);
      } else {
        clearAuth();
      }
    }
  }, [session, isPending]); // Remove setter dependencies to prevent infinite loop
};
