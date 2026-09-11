import type { ChatMessage, Conversation, ConversationApiDto, MessageApiDto } from '../@types';

export function apiDtoToMessage(dto: MessageApiDto): ChatMessage {
  return {
    id: dto.id,
    conversationId: dto.conversationId,
    sender: dto.sender,
    text: dto.text ?? undefined,
    attachments: dto.attachments,
    sentAt: dto.sentAt,
  };
}

export function apiDtoToConversation(dto: ConversationApiDto): Conversation {
  return {
    id: dto.id,
    participant: dto.participant,
    lastMessage: dto.lastMessage ? apiDtoToMessage(dto.lastMessage) : undefined,
    unreadCount: dto.unreadCount,
  };
}
