/**
 * Authentication service layer
 * Handles all auth-related API calls using Better Auth
 */

import {
  authClient,
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
} from '@/lib/auth-client';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth.types';

class AuthService {
  /**
   * Sign in with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await authSignIn.email({
      email: credentials.email,
      password: credentials.password,
    });

    if (response.error) {
      throw new Error(response.error.message || 'Sign in failed');
    }

    if (!response.data) {
      throw new Error('Sign in failed - no data returned');
    }

    return {
      user: response.data.user as User,
      session: response.data.session,
    };
  }

  /**
   * Register a new user
   */
  async signUp(data: RegisterData): Promise<AuthResponse> {
    const response = await authSignUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    if (response.error) {
      throw new Error(response.error.message || 'Sign up failed');
    }

    if (!response.data) {
      throw new Error('Sign up failed - no data returned');
    }

    return {
      user: response.data.user as User,
      session: response.data.session,
    };
  }

  /**
   * Sign in with social provider
   */
  async signInWithProvider(provider: 'google' | 'github'): Promise<void> {
    const response = await authSignIn.social({
      provider,
    });

    if (response.error) {
      throw new Error(response.error.message || 'Social sign in failed');
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    const response = await authSignOut();
    if (response.error) {
      console.error('Sign out error:', response.error);
    }
  }

  /**
   * Get current session
   */
  async getSession() {
    const session = await authClient.getSession();
    return session.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await authClient.updateUser(data);
    if (response.error) {
      throw new Error(response.error.message || 'Profile update failed');
    }
    return response.data as User;
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    const response = await authClient.forgetPassword({
      email,
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (response.error) {
      throw new Error(response.error.message || 'Password reset failed');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(newPassword: string): Promise<void> {
    const response = await authClient.resetPassword({
      newPassword,
    });
    
    if (response.error) {
      throw new Error(response.error.message || 'Password reset failed');
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    const response = await authClient.verifyEmail({
      query: { token },
    });
    
    if (response.error) {
      throw new Error(response.error.message || 'Email verification failed');
    }
  }
}

export const authService = new AuthService();
