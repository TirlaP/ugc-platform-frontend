/**
 * API client configuration
 * Centralized Axios instance for all API calls
 */

import axios, { AxiosError, type AxiosInstance } from 'axios';
import { authClient, signOut } from './auth-client';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env['VITE_API_URL'] || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for auth cookies
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Add token from localStorage if available (fallback for cross-domain issues)
    const token = localStorage.getItem('ugc-auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Better Auth handles auth automatically with cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest) {
      // Clear invalid token
      localStorage.removeItem('ugc-auth-token');
      
      // Try to refresh the session
      try {
        await authClient.getSession();
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await signOut();
        window.location.href = '/auth/login';
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      console.error("Forbidden: You don't have permission");
    }

    if (error.response?.status === 404) {
      console.error('Resource not found');
    }

    if (error.response?.status >= 500) {
      console.error('Server error');
    }

    return Promise.reject(error);
  }
);

// Helper function to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

export default apiClient;
