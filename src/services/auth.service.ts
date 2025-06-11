/**
 * Simple JWT-based authentication client
 */

import apiClient from "@/lib/api-client";

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get stored user
   */
  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Store auth data
   */
  setAuth(data: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    // Set token in axios default headers
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    
    // Fetch and set user's default organization
    this.setDefaultOrganization();
  }

  /**
   * Set user's default organization
   */
  private async setDefaultOrganization(): Promise<void> {
    try {
      // Use a small delay to ensure token is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Temporarily remove org header to make this call
      const orgHeader = apiClient.defaults.headers.common['X-Organization-ID'];
      delete apiClient.defaults.headers.common['X-Organization-ID'];
      
      const response = await apiClient.get('/organizations/me');
      const organizations = response.data;
      
      // Set the first organization as default
      if (organizations && organizations.length > 0) {
        const defaultOrg = organizations[0];
        localStorage.setItem('current_organization_id', defaultOrg.id);
        localStorage.setItem('current_organization', JSON.stringify(defaultOrg));
        
        // Set it in axios headers immediately
        apiClient.defaults.headers.common['X-Organization-ID'] = defaultOrg.id;
        
        console.log('✅ Set default organization:', defaultOrg.name, defaultOrg.id);
      } else {
        console.log('⚠️ No organizations found for user');
      }
      
      // Restore org header if it existed
      if (orgHeader && !organizations?.length) {
        apiClient.defaults.headers.common['X-Organization-ID'] = orgHeader;
      }
    } catch (error) {
      console.log('Could not fetch organizations:', error);
    }
  }

  /**
   * Clear auth data
   */
  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('current_organization_id');
    localStorage.removeItem('current_organization');
    delete apiClient.defaults.headers.common['Authorization'];
    delete apiClient.defaults.headers.common['X-Organization-ID'];
  }

  /**
   * Sign in
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/sign-in', {
      email,
      password,
    });
    
    this.setAuth(response.data);
    return response.data;
  }

  /**
   * Sign up
   */
  async signUp(userData: {
    email: string;
    password: string;
    name: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
    organizationName?: string;
  }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/sign-up', userData);
    
    this.setAuth(response.data);
    return response.data;
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await apiClient.post('/auth/sign-out');
    } catch (error) {
      // Ignore errors
    }
    this.clearAuth();
  }

  /**
   * Get current user from server
   */
  async getMe(): Promise<User | null> {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/me');
      return response.data.user;
    } catch {
      return null;
    }
  }

  /**
   * Initialize auth (set token in headers if exists)
   */
  init(): void {
    const token = this.getToken();
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Set organization header if exists
    const orgId = localStorage.getItem('current_organization_id');
    if (orgId) {
      apiClient.defaults.headers.common['X-Organization-ID'] = orgId;
    }
  }
}

export const authService = new AuthService();

// Initialize on import
authService.init();