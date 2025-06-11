/**
 * API client configuration
 * Centralized Axios instance for all API calls
 */

import axios, { AxiosError, type AxiosInstance } from 'axios';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor 
apiClient.interceptors.request.use(
  async (config) => {
    // Token is added by auth service when available
    
    // Add organization ID header if available in localStorage
    const orgId = localStorage.getItem('current_organization_id');
    if (orgId && !config.headers['X-Organization-ID']) {
      config.headers['X-Organization-ID'] = orgId;
    }
    
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
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🚫 401 Unauthorized');
      
      // Clear auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/auth/')) {
        window.location.href = '/auth/login';
      }
      
      return Promise.reject(error);
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
    return error.response?.data?.message || error.response?.data?.error || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

export default apiClient;