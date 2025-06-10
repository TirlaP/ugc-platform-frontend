import { apiClient } from '@/lib/api-client';

export interface DriveSettings {
  enabled: boolean;
  connected: boolean;
  email: string | null;
  folderId: string | null;
  folderStructure: 'flat' | 'by-client' | 'by-campaign' | 'by-date';
  autoSync: boolean;
  syncInterval: number;
  lastSync: string | null;
  usage: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink: string;
  thumbnailLink: string | null;
  parents: string[];
  capabilities: {
    canEdit: boolean;
    canDownload: boolean;
    canDelete: boolean;
  };
}

export interface CreateFolderData {
  name: string;
  parentId?: string;
  campaignId?: string;
  clientId?: string;
}

export interface ShareFileData {
  fileId: string;
  email: string;
  role: 'reader' | 'writer' | 'commenter';
  sendNotification?: boolean;
}

class DriveService {
  async getSettings() {
    const response = await apiClient.get<DriveSettings>('/drive/settings');
    return response.data;
  }

  async updateSettings(settings: Partial<DriveSettings>) {
    const response = await apiClient.post('/drive/settings', settings);
    return response.data;
  }

  async connect() {
    const response = await apiClient.get<{ authUrl: string }>('/drive/connect');
    return response.data.authUrl;
  }

  async getFiles(params?: { folderId?: string; campaignId?: string; search?: string }) {
    const response = await apiClient.get<{ files: DriveFile[]; nextPageToken?: string }>(
      '/drive/files',
      { params }
    );
    return response.data;
  }

  async createFolder(data: CreateFolderData) {
    const response = await apiClient.post<DriveFile>('/drive/folders', data);
    return response.data;
  }

  async syncCampaign(campaignId: string) {
    const response = await apiClient.post(`/drive/sync/campaign/${campaignId}`);
    return response.data;
  }

  async getCampaignStructure(campaignId: string) {
    const response = await apiClient.get(`/drive/campaign/${campaignId}/structure`);
    return response.data;
  }

  async shareFile(data: ShareFileData) {
    const response = await apiClient.post('/drive/share', data);
    return response.data;
  }

  // Helper function to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Helper to check if file is video
  isVideo(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  // Helper to check if file is image
  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }
}

export const driveService = new DriveService();
