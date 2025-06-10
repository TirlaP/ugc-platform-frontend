/**
 * Content and media management type definitions
 */

import type { User } from './auth.types';
import type { Campaign, Order } from './campaign.types';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
}

export enum MediaStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

export enum RightsType {
  FULL_RIGHTS = 'FULL_RIGHTS',
  LIMITED_RIGHTS = 'LIMITED_RIGHTS',
  EXCLUSIVE = 'EXCLUSIVE',
  NON_EXCLUSIVE = 'NON_EXCLUSIVE',
}

export enum AgreementStatus {
  PENDING = 'PENDING',
  SIGNED = 'SIGNED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export interface Media {
  id: string;
  orderId?: string;
  campaignId: string;
  uploadedBy: string;
  url: string;
  thumbnailUrl?: string;
  type: MediaType;
  size: number;
  filename: string;
  mimeType: string;
  version: number;
  status: MediaStatus;
  metadata?: MediaMetadata;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  order?: Order;
  campaign?: Campaign;
  uploader?: User;
}

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  tags?: string[];
  description?: string;
}

export interface CreateMediaData {
  orderId?: string;
  campaignId: string;
  file: File;
  metadata?: MediaMetadata;
}

export interface UpdateMediaData {
  status?: MediaStatus;
  metadata?: MediaMetadata;
}

export interface MediaFilters {
  campaignId?: string;
  orderId?: string;
  uploadedBy?: string;
  type?: MediaType;
  status?: MediaStatus;
  search?: string;
}

export interface RightsAgreement {
  id: string;
  campaignId: string;
  userId: string;
  type: RightsType;
  status: AgreementStatus;
  terms: string;
  signedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface CreateRightsAgreementData {
  campaignId: string;
  userId: string;
  type: RightsType;
  terms: string;
  expiresAt?: Date;
}
