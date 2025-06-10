/**
 * Campaign service
 * Handles all campaign-related API calls
 */

import { apiClient } from '@/lib/api-client';
import type {
  AssignCreatorData,
  Campaign,
  CampaignFilters,
  CreateCampaignData,
  UpdateCampaignData,
} from '@/types/campaign.types';

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class CampaignService {
  /**
   * Get all campaigns with optional filters
   */
  async getCampaigns(filters?: CampaignFilters & { page?: number; limit?: number }) {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<{
      campaigns: Campaign[];
      pagination: PaginatedResponse<Campaign>['pagination'];
    }>(`/campaigns?${params}`);

    return response.data;
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(id: string): Promise<Campaign> {
    const response = await apiClient.get<Campaign>(`/campaigns/${id}`);
    return response.data;
  }

  /**
   * Create a new campaign
   */
  async createCampaign(data: CreateCampaignData): Promise<Campaign> {
    const response = await apiClient.post<Campaign>('/campaigns', data);
    return response.data;
  }

  /**
   * Update campaign
   */
  async updateCampaign(id: string, data: Partial<UpdateCampaignData>): Promise<Campaign> {
    const response = await apiClient.patch<Campaign>(`/campaigns/${id}`, data);
    return response.data;
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(id: string): Promise<void> {
    await apiClient.delete(`/campaigns/${id}`);
  }

  /**
   * Assign creator to campaign
   */
  async assignCreator(data: AssignCreatorData) {
    console.log('Assigning creator with data:', data);
    const response = await apiClient.post(`/campaigns/${data.campaignId}/assign`, {
      creatorId: data.creatorId,
      notes: data.notes,
    });
    return response.data;
  }

  /**
   * Unassign creator from campaign
   */
  async unassignCreator(campaignId: string, orderId: string) {
    const response = await apiClient.delete(`/campaigns/${campaignId}/orders/${orderId}`);
    return response.data;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(campaignId: string, orderId: string, status: string) {
    const response = await apiClient.patch(`/campaigns/${campaignId}/orders/${orderId}`, {
      status,
    });
    return response.data;
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(id: string) {
    const response = await apiClient.get(`/campaigns/${id}/stats`);
    return response.data;
  }
}

export const campaignService = new CampaignService();
