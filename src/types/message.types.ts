/**
 * Message types for campaign communication
 */

export interface Message {
  id: string;
  campaignId: string;
  senderId: string;
  content: string;
  attachments?: MessageAttachment[] | null;
  createdAt: string;
  editedAt?: string | null;
  sender: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string | null;
  };
}

export interface MessageAttachment {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export interface MessageThread {
  campaignId: string;
  campaignTitle: string;
  clientName: string;
  lastMessage?: Message;
  unreadCount: number;
  participantCount: number;
}
