import { config } from '@/config/environment';
import type {
  ChatMessage,
  ChatParticipant,
  Conversation,
  ConversationApiDto,
  MessageApiDto,
  StudentSummaryDto,
} from '../@types';

/** Uploaded attachments come back as a path relative to the API origin, not the frontend's. */
function resolveAttachmentUrl(url: string): string {
  return url.startsWith('/') ? `${config.apiUrl}${url}` : url;
}

export function apiDtoToMessage(dto: MessageApiDto): ChatMessage {
  return {
    id: dto.id,
    conversationId: dto.conversationId,
    sender: dto.sender,
    text: dto.text ?? undefined,
    attachments: dto.attachments.map((attachment) => ({
      ...attachment,
      url: resolveAttachmentUrl(attachment.url),
    })),
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

export function studentSummaryToParticipant(dto: StudentSummaryDto): ChatParticipant {
  return {
    studentDbId: dto.id,
    studentId: dto.studentId,
    fullName: `${dto.firstName} ${dto.lastName}`,
    course: dto.course,
  };
}
