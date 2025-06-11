/**
 * Better Auth client configuration
 * Handles authentication on the frontend
 */

import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

// Create the auth client with our backend URL
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL || 'http://localhost:3000',
  
  // Configure fetch options for cross-domain requests
  fetchOptions: {
    credentials: 'include',
  },

  // Infer additional fields we added on the backend
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: 'string',
        },
        phone: {
          type: 'string',
        },
        bio: {
          type: 'string',
        },
        banned: {
          type: 'boolean',
        },
        banReason: {
          type: 'string',
        },
        banExpires: {
          type: 'date',
        },
        firstName: {
          type: 'string',
        },
        lastName: {
          type: 'string',
        },
      },
    }),
  ],
});

// Export auth hooks and methods
export const {
  useSession,
  signIn,
  signUp,
  signOut,
  forgetPassword,
  resetPassword,
  verifyEmail,
  useUser,
} = authClient;

// Export inferred types
export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
