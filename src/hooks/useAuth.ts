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
      console.log('🔐 Starting login process...');
      const response = await authService.signIn(credentials);
      
      console.log('✅ Login successful:');
      console.log('- User:', response.user);
      console.log('- Session:', response.session);
      
      // Set user first (this will set isAuthenticated to true via atomWithStorage)
      setUser(response.user);
      setSession(response.session);
      
      console.log('📱 Auth state updated, localStorage should now contain user');
      
      setLoading(false);
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
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
    console.log('🔄 useAuthSync running:');
    console.log('- isPending:', isPending);
    console.log('- session:', session);
    
    // Don't interfere with auth state if user is already logged in from localStorage
    const storedUser = localStorage.getItem('ugc-auth-user');
    console.log('- storedUser:', storedUser);
    
    if (storedUser && storedUser !== 'null') {
      console.log('✅ User found in localStorage, preserving auth state');
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      if (!isPending) {
        if (session?.user) {
          console.log('✅ Better Auth session found, updating Jotai state');
          setUser(session.user as User);
          setLoading(false);
        } else {
          console.log('⚠️ No Better Auth session, but not clearing auth (localStorage takes precedence)');
          setLoading(false);
        }
      }
    };

    initAuth();
  }, [session, isPending]);
};
