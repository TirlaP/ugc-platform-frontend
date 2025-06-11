/**
 * Authentication hook using Better Auth
 * Provides auth state and actions
 */

import { useSession } from '@/lib/auth-client';
import { authService } from '@/services/auth.service';
import type { LoginCredentials, RegisterData, User } from '@/types/auth.types';

export const useAuth = () => {
  const { data: session, isPending: isLoading, error, refetch } = useSession();

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('🔐 Starting login process...');
      const response = await authService.signIn(credentials);
      
      console.log('✅ Login successful');
      console.log('- User:', response.user);
      console.log('- Session:', response.session);
      
      // Check cookies after login
      console.log('🍪 Cookies after login:', document.cookie);
      
      // Wait a moment for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refetch the session to update the hook state
      console.log('🔄 Refetching session...');
      const refetchResult = await refetch();
      console.log('🔄 Refetch result:', refetchResult);
      
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.signUp(data);
      
      // Refetch the session to update the hook state
      await refetch();
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      // Session will be automatically updated by the useSession hook
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUserData = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      await refetch();
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const checkAuth = async () => {
    return await refetch();
  };

  return {
    // Session data from Better Auth
    user: session?.user as User | null,
    session: session?.session || null,
    isLoading,
    isAuthenticated: !!session?.user,
    error,
    
    // Auth actions
    login,
    register,
    logout,
    updateUser: updateUserData,
    checkAuth,
    refetch,
  };
};

// Export a simple hook that just wraps useSession for other components
export const useAuthSync = () => {
  // This is now just a passthrough to Better Auth's built-in session management
  return useSession();
};
