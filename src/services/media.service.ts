/**
 * Media service
 * Handles all media/content-related API calls
 */

import { apiClient } from '@/lib/api-client';
import type { CreateMediaData, Media, MediaFilters, UpdateMediaData } from '@/types/content.types';

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class MediaService {
  /**
   * Get all media
   */
  async getAllMedia(filters?: MediaFilters & { page?: number; limit?: number }): Promise<{
    media: Media[];
    pagination: PaginatedResponse<Media>['pagination'];
  }> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<{
      media: Media[];
      pagination: PaginatedResponse<Media>['pagination'];
    }>(`/media?${params}`);

    return response.data;
  }

  /**
   * Get media for a campaign
   */
  async getCampaignMedia(
    campaignId: string,
    filters?: MediaFilters & { page?: number; limit?: number }
  ) {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'campaignId') {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<{
      media: Media[];
      pagination: PaginatedResponse<Media>['pagination'];
    }>(`/media/campaign/${campaignId}?${params}`);

    return response.data;
  }

  /**
   * Get single media item
   */
  async getMedia(id: string): Promise<Media> {
    const response = await apiClient.get<Media>(`/media/${id}`);
    return response.data;
  }

  /**
   * Upload media (mock for now)
   */
  async uploadMedia(data: CreateMediaData): Promise<Media> {
    // In production, this would handle actual file upload
    const uploadData = {
      campaignId: data.campaignId,
      orderId: data.orderId,
      type: this.getMediaType(data.file),
      metadata: data.metadata,
    };

    const response = await apiClient.post<Media>('/media/upload', uploadData);
    return response.data;
  }

  /**
   * Update media (status, metadata)
   */
  async updateMedia(id: string, data: UpdateMediaData): Promise<Media> {
    const response = await apiClient.patch<Media>(`/media/${id}`, data);
    return response.data;
  }

  /**
   * Delete/archive media
   */
  async deleteMedia(id: string): Promise<void> {
    await apiClient.delete(`/media/${id}`);
  }

  /**
   * Approve media
   */
  async approveMedia(id: string): Promise<Media> {
    return this.updateMedia(id, { status: 'APPROVED' });
  }

  /**
   * Reject media
   */
  async rejectMedia(id: string, reason?: string): Promise<Media> {
    return this.updateMedia(id, {
      status: 'REJECTED',
      metadata: { rejectionReason: reason },
    });
  }

  /**
   * Helper to determine media type from file
   */
  private getMediaType(file: File): 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER' {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (imageTypes.includes(file.type)) return 'IMAGE';
    if (videoTypes.includes(file.type)) return 'VIDEO';
    if (documentTypes.includes(file.type)) return 'DOCUMENT';
    return 'OTHER';
  }
}

export const mediaService = new MediaService();
