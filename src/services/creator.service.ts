/**
 * Creator service
 * Handles all creator-related API calls
 */

import { apiClient } from '@/lib/api-client';
import type { User, UserRates } from '@/types/auth.types';

interface Creator extends User {
  rating?: number;
  completedOrders?: number;
  activeOrders?: number;
}

interface CreatorFilters {
  search?: string;
  skills?: string[];
  status?: string;
  page?: number;
  limit?: number;
}

interface CreateCreatorData {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  portfolioUrl?: string;
  socialMedia?: string;
  rates?: number;
}

interface UpdateCreatorData {
  name?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  portfolio?: string[];
  rates?: UserRates;
}

interface CreatorStats {
  period: string;
  orders: Array<{ status: string; _count: number }>;
  media: Array<{ status: string; _count: number }>;
  totalEarnings: number;
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

class CreatorService {
  /**
   * Get all creators with optional filters
   */
  async getCreators(filters?: CreatorFilters) {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.skills?.length) {
        params.append('skills', filters.skills.join(','));
      }

      ['search', 'status', 'page', 'limit'].forEach((key) => {
        const value = filters[key as keyof CreatorFilters];
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<{
      creators: Creator[];
      pagination: PaginatedResponse<Creator>['pagination'];
    }>(`/creators?${params}`);

    return response.data;
  }

  /**
   * Get creator by ID
   */
  async getCreator(id: string): Promise<Creator> {
    const response = await apiClient.get<Creator>(`/creators/${id}`);
    return response.data;
  }

  /**
   * Create a new creator
   */
  async createCreator(data: CreateCreatorData): Promise<Creator> {
    const response = await apiClient.post<Creator>('/creators', data);
    return response.data;
  }

  /**
   * Update creator profile
   */
  async updateCreator(id: string, data: UpdateCreatorData): Promise<Creator> {
    const response = await apiClient.patch<Creator>(`/creators/${id}`, data);
    return response.data;
  }

  /**
   * Delete creator
   */
  async deleteCreator(id: string): Promise<void> {
    await apiClient.delete(`/creators/${id}`);
  }

  /**
   * Get creator availability
   */
  async getCreatorAvailability(id: string, from?: Date, to?: Date) {
    const params = new URLSearchParams();
    if (from) params.append('from', from.toISOString());
    if (to) params.append('to', to.toISOString());

    const response = await apiClient.get(`/creators/${id}/availability?${params}`);
    return response.data;
  }

  /**
   * Get creator statistics
   */
  async getCreatorStats(id: string, period: '7d' | '30d' | '90d' = '30d'): Promise<CreatorStats> {
    const response = await apiClient.get<CreatorStats>(`/creators/${id}/stats?period=${period}`);
    return response.data;
  }

  /**
   * Invite creator to platform
   */
  async inviteCreator(email: string, message?: string) {
    const response = await apiClient.post('/creators/invite', { email, message });
    return response.data;
  }
}

export const creatorService = new CreatorService();
