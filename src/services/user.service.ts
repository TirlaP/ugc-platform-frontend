/**
 * User service
 * Handles user profile management and related API calls
 */

import { apiClient } from '@/lib/api-client';
import type { User, UserAvailability, UserRates, UserStatus } from '@/types/auth.types';

interface UpdateUserProfileData {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  image?: string;
  skills?: string[];
  portfolio?: string[];
  rates?: UserRates;
  availability?: UserAvailability;
}

interface UserFilters {
  search?: string;
  role?: string;
  status?: UserStatus;
  skills?: string[];
  page?: number;
  limit?: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
  usersByStatus: Record<string, number>;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class UserService {
  private readonly basePath = '/users';

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(`${this.basePath}/me`);
    return response.data;
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: UpdateUserProfileData): Promise<User> {
    const response = await apiClient.patch<User>(`${this.basePath}/me`, data);
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`${this.basePath}/${userId}`);
    return response.data;
  }

  /**
   * Get all users with filters (admin only)
   */
  async getUsers(filters?: UserFilters): Promise<{
    users: User[];
    pagination: PaginatedResponse<User>['pagination'];
  }> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.skills?.length) {
        params.append('skills', filters.skills.join(','));
      }

      ['search', 'role', 'status', 'page', 'limit'].forEach((key) => {
        const value = filters[key as keyof UserFilters];
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<{
      users: User[];
      pagination: PaginatedResponse<User>['pagination'];
    }>(`${this.basePath}?${params}`);

    return response.data;
  }

  /**
   * Update user (admin only)
   */
  async updateUser(userId: string, data: Partial<UpdateUserProfileData>): Promise<User> {
    const response = await apiClient.patch<User>(`${this.basePath}/${userId}`, data);
    return response.data;
  }

  /**
   * Ban/suspend user (admin only)
   */
  async banUser(userId: string, reason?: string, expiresAt?: Date): Promise<User> {
    const response = await apiClient.post<User>(`${this.basePath}/${userId}/ban`, {
      reason,
      expiresAt: expiresAt?.toISOString(),
    });
    return response.data;
  }

  /**
   * Unban user (admin only)
   */
  async unbanUser(userId: string): Promise<User> {
    const response = await apiClient.post<User>(`${this.basePath}/${userId}/unban`);
    return response.data;
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${userId}`);
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ url: string }>(`${this.basePath}/me/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Get user statistics (admin only)
   */
  async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get<UserStats>(`${this.basePath}/stats`);
    return response.data;
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string): Promise<User[]> {
    const response = await apiClient.get<User[]>(`${this.basePath}/search`, {
      params: { q: query },
    });
    return response.data;
  }

  /**
   * Get user activity log
   */
  async getUserActivity(userId: string, page = 1, limit = 20) {
    const response = await apiClient.get(`${this.basePath}/${userId}/activity`, {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Update user rates (for creators)
   */
  async updateRates(rates: UserRates): Promise<User> {
    const response = await apiClient.patch<User>(`${this.basePath}/me/rates`, rates);
    return response.data;
  }

  /**
   * Update user availability (for creators)
   */
  async updateAvailability(availability: UserAvailability): Promise<User> {
    const response = await apiClient.patch<User>(`${this.basePath}/me/availability`, availability);
    return response.data;
  }

  /**
   * Get user's earnings summary (for creators)
   */
  async getEarnings(period: '7d' | '30d' | '90d' | '1y' = '30d') {
    const response = await apiClient.get(`${this.basePath}/me/earnings`, {
      params: { period },
    });
    return response.data;
  }
}

export const userService = new UserService();
