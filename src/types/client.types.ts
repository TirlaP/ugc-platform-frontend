/**
 * Client type definitions
 * Represents clients who create campaigns within organizations
 */

import type { Campaign } from './campaign.types';
import type { Organization } from './organization.types';

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface Client {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  notes?: string;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  organization?: Organization;
  campaigns?: Campaign[];
  campaignCount?: number;
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  notes?: string;
  status?: ClientStatus;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
  notes?: string;
  status?: ClientStatus;
}

export interface ClientFilters {
  organizationId?: string;
  status?: ClientStatus;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ClientStats {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalSpent: number;
}

export interface ClientListResponse {
  clients: Client[];
  total: number;
  page: number;
  pageSize: number;
}
