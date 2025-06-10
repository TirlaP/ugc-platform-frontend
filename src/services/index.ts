/**
 * Service layer exports
 * Centralized exports for all service modules
 */

export { authService } from './auth.service';
export { campaignService } from './campaign.service';
export { clientService } from './client.service';
export { creatorService } from './creator.service';
export { dashboardService } from './dashboard.service';
export { mediaService } from './media.service';
export { messageService } from './message.service';
export { organizationService } from './organization.service';
export { userService } from './user.service';

// Export types for convenience
export type {
  MessageType,
  MessageStatus,
  ConversationType,
  Message,
  Conversation,
  CreateMessageData,
  CreateConversationData,
  MessageFilters,
  ConversationFilters,
} from './message.service';
