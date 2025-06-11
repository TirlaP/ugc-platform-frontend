/**
 * Authentication service layer
 * Handles all auth-related API calls
 */

import { apiClient } from '@/lib/api-client';
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

    if (!response.data) {
      throw new Error('Sign in failed');
    }

    // Store token in localStorage as fallback for cross-domain issues
    if (response.data.token) {
      localStorage.setItem('ugc-auth-token', response.data.token);
    }

    // Create a complete auth response
    const authResponse = {
      user: response.data.user as User,
      session: response.data.session || { token: response.data.token },
    };

    console.log('Auth service signIn returning:', authResponse);
    return authResponse;
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

    if (!response.data) {
      throw new Error('Sign up failed');
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
    await authSignIn.social({
      provider,
    });
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    // Clear stored token
    localStorage.removeItem('ugc-auth-token');
    await authSignOut();
  }

  /**
   * Get current session
   */
  async getSession() {
    const session = await authClient.getSession();
    
    // If no session from cookies, try using stored token
    if (!session.data?.session) {
      const storedToken = localStorage.getItem('ugc-auth-token');
      if (storedToken) {
        // Validate token by making a request with it
        try {
          const response = await fetch(`${import.meta.env.VITE_BETTER_AUTH_URL || 'http://localhost:3000'}/api/auth/get-session`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              return {
                session: { token: storedToken },
                user: data.user,
              };
            }
          }
        } catch (error) {
          console.log('Token validation failed:', error);
          localStorage.removeItem('ugc-auth-token');
        }
      }
    }
    
    return session.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.patch('/auth/user', data);
    return response.data;
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    await authClient.forgetPassword({
      email,
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(newPassword: string): Promise<void> {
    await authClient.resetPassword({
      newPassword,
    });
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    await authClient.verifyEmail({
      query: { token },
    });
  }
}

export const authService = new AuthService();
