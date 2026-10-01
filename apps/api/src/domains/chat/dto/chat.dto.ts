import type { AttachmentKind } from '../entities/message.entity';

export interface MessageAttachmentDto {
  id: string;
  kind: AttachmentKind;
  name: string;
  url: string;
  sizeLabel?: string;
}

export interface StartConversationDto {
  studentId: string;
}

export interface SendMessageDto {
  text?: string;
  attachments?: MessageAttachmentDto[];
}

export interface MessageOutDto {
  id: string;
  conversationId: string;
  sender: 'admin' | 'student';
  text: string | null;
  attachments: MessageAttachmentDto[];
  sentAt: Date;
}

export interface ConversationParticipantDto {
  studentDbId: string;
  studentId: string;
  fullName: string;
  course: string;
}

export interface ConversationOutDto {
  id: string;
  participant: ConversationParticipantDto;
  lastMessage: MessageOutDto | null;
  unreadCount: number;
}

export interface UploadedAttachmentDto {
  kind: AttachmentKind;
  name: string;
  url: string;
  sizeLabel: string;
}
