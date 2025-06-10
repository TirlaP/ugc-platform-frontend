import { apiClient } from '@/lib/api-client';
import type { Message } from '@/types/message.types';

export interface SendMessageData {
  campaignId: string;
  content: string;
  attachments?: Array<{
    url: string;
    filename: string;
    size: number;
    type: string;
  }>;
}

export interface MessagesResponse {
  messages: Message[];
  campaign: any;
}

class MessageService {
  async getCampaignsWithMessages() {
    const response = await apiClient.get('/messages/campaigns');
    return response.data;
  }

  async getMessages(campaignId: string, before?: string) {
    const params = before ? { before } : {};
    const response = await apiClient.get<MessagesResponse>(`/messages/campaign/${campaignId}`, {
      params,
    });
    return response.data.messages;
  }

  async sendMessage(data: SendMessageData) {
    const response = await apiClient.post<Message>('/messages', data);
    return response.data;
  }
  async editMessage(id: string, content: string) {
    const response = await apiClient.patch<Message>(`/messages/${id}`, { content });
    return response.data;
  }

  async deleteMessage(id: string) {
    await apiClient.delete(`/messages/${id}`);
  }
}

export const messageService = new MessageService();
