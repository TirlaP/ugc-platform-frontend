/**
 * Client service layer
 * Handles all client-related API calls
 */

import { apiClient } from '@/lib/api-client';
import { ClientStatus } from '@/types/client.types';
import type {
  Client,
  ClientFilters,
  ClientListResponse,
  ClientStats,
  CreateClientData,
  UpdateClientData,
} from '@/types/client.types';

class ClientService {
  private readonly basePath = '/clients';

  /**
   * Get all clients for current user's organization
   */
  async getClients(filters?: ClientFilters): Promise<ClientListResponse> {
    const params = new URLSearchParams();

    if (filters?.status) {
      params.set('status', filters.status);
    }
    if (filters?.search) {
      params.set('search', filters.search);
    }
    if (filters?.sortBy) {
      params.set('sortBy', filters.sortBy);
    }
    if (filters?.sortOrder) {
      params.set('sortOrder', filters.sortOrder);
    }

    const response = await apiClient.get(`${this.basePath}?${params.toString()}`);
    return response.data;
  }

  /**
   * Get a single client by ID
   */
  async getClient(clientId: string): Promise<Client> {
    const response = await apiClient.get(`${this.basePath}/${clientId}`);
    return response.data;
  }

  /**
   * Create a new client
   */
  async createClient(data: CreateClientData): Promise<Client> {
    const response = await apiClient.post(this.basePath, data);
    return response.data;
  }

  /**
   * Update a client
   */
  async updateClient(clientId: string, data: UpdateClientData): Promise<Client> {
    const response = await apiClient.patch(`${this.basePath}/${clientId}`, data);
    return response.data;
  }

  /**
   * Delete a client (soft delete - sets status to ARCHIVED)
   */
  async deleteClient(clientId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${clientId}`);
  }

  /**
   * Archive a client
   */
  async archiveClient(clientId: string): Promise<Client> {
    return this.updateClient(clientId, { status: ClientStatus.ARCHIVED });
  }

  /**
   * Reactivate an archived client
   */
  async reactivateClient(clientId: string): Promise<Client> {
    return this.updateClient(clientId, { status: ClientStatus.ACTIVE });
  }

  /**
   * Get client statistics
   */
  async getClientStats(clientId: string): Promise<ClientStats> {
    const response = await apiClient.get(`${this.basePath}/${clientId}/stats`);
    return response.data;
  }

  /**
   * Search clients across organizations (for admins)
   */
  async searchClients(query: string): Promise<Client[]> {
    const response = await apiClient.get(`${this.basePath}/search`, {
      params: { q: query },
    });
    return response.data;
  }

  /**
   * Export clients to CSV
   */
  async exportClients(organizationId: string, filters?: ClientFilters): Promise<Blob> {
    const params = new URLSearchParams();
    params.set('organizationId', organizationId);

    if (filters?.status) {
      params.set('status', filters.status);
    }
    if (filters?.search) {
      params.set('search', filters.search);
    }

    const response = await apiClient.get(`${this.basePath}/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Bulk import clients from CSV
   */
  async importClients(
    organizationId: string,
    file: File
  ): Promise<{ imported: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('organizationId', organizationId);

    const response = await apiClient.post(`${this.basePath}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const clientService = new ClientService();
