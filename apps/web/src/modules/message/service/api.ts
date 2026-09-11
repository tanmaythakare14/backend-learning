import { formatFileSize, inferAttachmentKind } from '../utils';
import type {
  ChatParticipant,
  ConversationApiDto,
  MessageApiDto,
  SendMessagePayload,
} from '../@types';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_PARTICIPANTS } from './mockData';

// In-memory store standing in for a real backend — no chat endpoint exists
// yet. Shape mirrors what a real API would return, so swapping these for
// real `fetch` calls later is a drop-in replacement.
let conversations: ConversationApiDto[] = MOCK_CONVERSATIONS.map((conversation) => ({
  ...conversation,
}));
let messages: MessageApiDto[] = [...MOCK_MESSAGES];
let nextMessageSeq = messages.length + 1;

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function lastMessageFor(conversationId: string): MessageApiDto | null {
  const thread = messages.filter((message) => message.conversationId === conversationId);
  return thread.length > 0 ? thread[thread.length - 1] : null;
}

export async function listConversations(): Promise<ConversationApiDto[]> {
  const withLastMessage = conversations
    .map((conversation) => ({ ...conversation, lastMessage: lastMessageFor(conversation.id) }))
    .sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.sentAt).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.sentAt).getTime() : 0;
      return bTime - aTime;
    });
  return delay(withLastMessage);
}

export async function listMessages(conversationId: string): Promise<MessageApiDto[]> {
  return delay(messages.filter((message) => message.conversationId === conversationId));
}

export async function listParticipants(): Promise<ChatParticipant[]> {
  return delay(MOCK_PARTICIPANTS);
}

export async function markConversationRead(conversationId: string): Promise<void> {
  conversations = conversations.map((conversation) =>
    conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
  );
  return delay(undefined, 0);
}

export async function sendMessage(
  conversationId: string,
  payload: SendMessagePayload,
): Promise<MessageApiDto> {
  const attachments = (payload.files ?? []).map((file, index) => ({
    id: `att-${nextMessageSeq}-${index}`,
    kind: inferAttachmentKind(file),
    name: file.name,
    url: URL.createObjectURL(file),
    sizeLabel: formatFileSize(file.size),
  }));

  const message: MessageApiDto = {
    id: `msg-${nextMessageSeq++}`,
    conversationId,
    sender: 'admin',
    text: payload.text?.trim() || null,
    attachments,
    sentAt: new Date().toISOString(),
  };

  messages = [...messages, message];
  return delay(message);
}

export async function startConversation(participant: ChatParticipant): Promise<ConversationApiDto> {
  const existing = conversations.find(
    (conversation) => conversation.participant.studentDbId === participant.studentDbId,
  );
  if (existing) return delay(existing);

  const created: ConversationApiDto = {
    id: `conv-new-${participant.studentDbId}`,
    participant,
    lastMessage: null,
    unreadCount: 0,
  };
  conversations = [...conversations, created];
  return delay(created);
}
