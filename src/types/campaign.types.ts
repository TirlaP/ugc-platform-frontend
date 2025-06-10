/**
 * Campaign and order management type definitions
 */

import type { Decimal } from 'decimal.js';
import type { User } from './auth.types';
import type { Organization } from './organization.types';

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OrderStatus {
  NEW = 'NEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CampaignRequirements {
  contentType: string[];
  platform: string[];
  deliverables: string[];
  guidelines: string;
  references?: string[];
  restrictions?: string[];
}

export interface Campaign {
  id: string;
  organizationId: string;
  clientId: string;
  createdById: string;
  title: string;
  brief: string;
  requirements?: CampaignRequirements;
  budget?: Decimal | string | number;
  deadline?: Date;
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  organization?: Organization;
  client?: Client;
  createdBy?: User;
  orders?: Order[];
  orderCount?: number;
  completedOrderCount?: number;
}

export interface Order {
  id: string;
  campaignId: string;
  creatorId: string;
  status: OrderStatus;
  assignedAt: Date;
  completedAt?: Date;
  notes?: string;

  // Relations
  campaign?: Campaign;
  creator?: User;
  mediaCount?: number;
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

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface CreateCampaignData {
  clientId: string;
  title: string;
  brief: string;
  requirements?: CampaignRequirements;
  budget?: string | number;
  deadline?: string | Date;
  status?: CampaignStatus;
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {
  id: string;
}

export interface AssignCreatorData {
  campaignId: string;
  creatorId: string;
  notes?: string;
}

export interface CampaignFilters {
  status?: CampaignStatus;
  clientId?: string;
  creatorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}
