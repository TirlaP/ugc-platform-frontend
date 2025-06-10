import { apiClient } from '@/lib/api-client';

export interface EmailSettings {
  provider: 'gmail' | 'outlook' | 'custom';
  emailAddress: string;
  enableCampaignEmails: boolean;
  autoForward: boolean;
  configured: boolean;
}

export interface EmailThread {
  id: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  date: string;
  body: string;
  attachments?: any[];
  read: boolean;
}

export interface SendEmailData {
  campaignId: string;
  subject: string;
  to: string[];
  cc?: string[];
  body: string;
  attachments?: any[];
}

class EmailService {
  async getSettings() {
    const response = await apiClient.get<EmailSettings>('/email/settings');
    return response.data;
  }

  async updateSettings(settings: Partial<EmailSettings>) {
    const response = await apiClient.post('/email/settings', settings);
    return response.data;
  }

  async getCampaignThreads(campaignId: string) {
    const response = await apiClient.get<{ threads: EmailThread[] }>(
      `/email/campaign/${campaignId}/threads`
    );
    return response.data.threads;
  }

  async sendEmail(data: SendEmailData) {
    const response = await apiClient.post('/email/send', data);
    return response.data;
  }

  async syncEmails() {
    const response = await apiClient.post('/email/sync');
    return response.data;
  }

  async getEmailTemplate(campaignId: string) {
    const response = await apiClient.get(`/email/campaign/${campaignId}/template`);
    return response.data;
  }
}

export const emailService = new EmailService();
