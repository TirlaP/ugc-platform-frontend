/**
 * Organization and multi-tenancy type definitions
 */

import type { User } from './auth.types';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  members?: OrganizationMember[];
  memberCount?: number;
}

export enum OrganizationRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  joinedAt: Date;

  // Relations
  organization?: Organization;
  user?: User;
}

export interface CreateOrganizationData {
  name: string;
  slug?: string;
  logo?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  logo?: string;
}

export interface InviteMemberData {
  email: string;
  role: OrganizationRole;
  message?: string;
}

export interface OrganizationStats {
  totalMembers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalClients: number;
  totalCreators: number;
}
