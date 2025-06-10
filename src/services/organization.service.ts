/**
 * Organization service
 * Handles organization management and multi-tenancy API calls
 */

import { apiClient } from '@/lib/api-client';
import type { User } from '@/types/auth.types';
import type {
  CreateOrganizationData,
  InviteMemberData,
  Organization,
  OrganizationMember,
  OrganizationRole,
  OrganizationStats,
  UpdateOrganizationData,
} from '@/types/organization.types';

interface OrganizationFilters {
  search?: string;
  page?: number;
  limit?: number;
}

interface MemberFilters {
  role?: OrganizationRole;
  search?: string;
  page?: number;
  limit?: number;
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

interface InvitationResponse {
  id: string;
  email: string;
  role: OrganizationRole;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  expiresAt: Date;
  invitedBy: string;
  createdAt: Date;
}

class OrganizationService {
  private readonly basePath = '/organizations';

  /**
   * Get current user's organizations
   */
  async getMyOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get<Organization[]>(`${this.basePath}/me`);
    return response.data;
  }

  /**
   * Get all organizations (admin only)
   */
  async getOrganizations(filters?: OrganizationFilters): Promise<{
    organizations: Organization[];
    pagination: PaginatedResponse<Organization>['pagination'];
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
      organizations: Organization[];
      pagination: PaginatedResponse<Organization>['pagination'];
    }>(`${this.basePath}?${params}`);

    return response.data;
  }

  /**
   * Get organization by ID
   */
  async getOrganization(organizationId: string): Promise<Organization> {
    const response = await apiClient.get<Organization>(`${this.basePath}/${organizationId}`);
    return response.data;
  }

  /**
   * Create a new organization
   */
  async createOrganization(data: CreateOrganizationData): Promise<Organization> {
    const response = await apiClient.post<Organization>(this.basePath, data);
    return response.data;
  }

  /**
   * Update organization
   */
  async updateOrganization(
    organizationId: string,
    data: UpdateOrganizationData
  ): Promise<Organization> {
    const response = await apiClient.patch<Organization>(
      `${this.basePath}/${organizationId}`,
      data
    );
    return response.data;
  }

  /**
   * Delete organization
   */
  async deleteOrganization(organizationId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${organizationId}`);
  }

  /**
   * Upload organization logo
   */
  async uploadLogo(organizationId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await apiClient.post<{ url: string }>(
      `${this.basePath}/${organizationId}/logo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /**
   * Get organization members
   */
  async getMembers(
    organizationId: string,
    filters?: MemberFilters
  ): Promise<{
    members: OrganizationMember[];
    pagination: PaginatedResponse<OrganizationMember>['pagination'];
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
      members: OrganizationMember[];
      pagination: PaginatedResponse<OrganizationMember>['pagination'];
    }>(`${this.basePath}/${organizationId}/members?${params}`);

    return response.data;
  }

  /**
   * Invite member to organization
   */
  async inviteMember(organizationId: string, data: InviteMemberData): Promise<InvitationResponse> {
    const response = await apiClient.post<InvitationResponse>(
      `${this.basePath}/${organizationId}/invitations`,
      data
    );
    return response.data;
  }

  /**
   * Get pending invitations
   */
  async getInvitations(organizationId: string): Promise<InvitationResponse[]> {
    const response = await apiClient.get<InvitationResponse[]>(
      `${this.basePath}/${organizationId}/invitations`
    );
    return response.data;
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(organizationId: string, invitationId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${organizationId}/invitations/${invitationId}`);
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(token: string): Promise<Organization> {
    const response = await apiClient.post<Organization>('/invitations/accept', { token });
    return response.data;
  }

  /**
   * Decline invitation
   */
  async declineInvitation(token: string): Promise<void> {
    await apiClient.post('/invitations/decline', { token });
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    organizationId: string,
    memberId: string,
    role: OrganizationRole
  ): Promise<OrganizationMember> {
    const response = await apiClient.patch<OrganizationMember>(
      `${this.basePath}/${organizationId}/members/${memberId}`,
      { role }
    );
    return response.data;
  }

  /**
   * Remove member from organization
   */
  async removeMember(organizationId: string, memberId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${organizationId}/members/${memberId}`);
  }

  /**
   * Leave organization
   */
  async leaveOrganization(organizationId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${organizationId}/leave`);
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStats(organizationId: string): Promise<OrganizationStats> {
    const response = await apiClient.get<OrganizationStats>(
      `${this.basePath}/${organizationId}/stats`
    );
    return response.data;
  }

  /**
   * Transfer organization ownership
   */
  async transferOwnership(organizationId: string, newOwnerId: string): Promise<Organization> {
    const response = await apiClient.post<Organization>(
      `${this.basePath}/${organizationId}/transfer-ownership`,
      { newOwnerId }
    );
    return response.data;
  }

  /**
   * Check if slug is available
   */
  async checkSlugAvailability(slug: string): Promise<{ available: boolean }> {
    const response = await apiClient.get<{ available: boolean }>(
      `${this.basePath}/check-slug/${slug}`
    );
    return response.data;
  }

  /**
   * Search organizations (admin only)
   */
  async searchOrganizations(query: string): Promise<Organization[]> {
    const response = await apiClient.get<Organization[]>(`${this.basePath}/search`, {
      params: { q: query },
    });
    return response.data;
  }

  /**
   * Get organization activity log
   */
  async getActivityLog(organizationId: string, page = 1, limit = 20) {
    const response = await apiClient.get(`${this.basePath}/${organizationId}/activity`, {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Switch current organization context
   */
  async switchOrganization(organizationId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${organizationId}/switch`);
  }

  /**
   * Get current organization context
   */
  async getCurrentOrganization(): Promise<Organization> {
    const response = await apiClient.get<Organization>(`${this.basePath}/current`);
    return response.data;
  }

  /**
   * Bulk invite members via CSV
   */
  async bulkInviteMembers(
    organizationId: string,
    file: File,
    defaultRole: OrganizationRole = OrganizationRole.MEMBER
  ): Promise<{
    invited: number;
    errors: Array<{ row: number; email: string; error: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('defaultRole', defaultRole);

    const response = await apiClient.post(
      `${this.basePath}/${organizationId}/bulk-invite`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /**
   * Export members to CSV
   */
  async exportMembers(organizationId: string): Promise<Blob> {
    const response = await apiClient.get(`${this.basePath}/${organizationId}/members/export`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const organizationService = new OrganizationService();
