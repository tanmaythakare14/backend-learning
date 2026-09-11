export type MessageSender = 'admin' | 'student';

export type AttachmentKind = 'pdf' | 'doc' | 'image' | 'video' | 'link';

export interface MessageAttachment {
  id: string;
  kind: AttachmentKind;
  name: string;
  url: string;
  sizeLabel?: string;
}

export interface ChatParticipant {
  studentDbId: string;
  studentId: string;
  fullName: string;
  course: string;
}

// DTO — shape from the (mocked, future-real) API
export interface MessageApiDto {
  id: string;
  conversationId: string;
  sender: MessageSender;
  text: string | null;
  attachments: MessageAttachment[];
  sentAt: string;
}

export interface ConversationApiDto {
  id: string;
  participant: ChatParticipant;
  lastMessage: MessageApiDto | null;
  unreadCount: number;
}

// Domain types used by the UI
export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: MessageSender;
  text?: string;
  attachments: MessageAttachment[];
  sentAt: string;
}

export interface Conversation {
  id: string;
  participant: ChatParticipant;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface SendMessagePayload {
  text?: string;
  files?: File[];
}

// Component props
export interface ConversationListPanelProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  isLoading: boolean;
  onSelect: (conversationId: string) => void;
  onNewChat: () => void;
}

export interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversationId: string) => void;
}

export interface ConversationPanelProps {
  conversation: Conversation | undefined;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (payload: SendMessagePayload) => Promise<void>;
  onBack: () => void;
  onClearConversation: () => void;
}

export interface ConversationHeaderProps {
  participant: ChatParticipant;
  onBack: () => void;
  onClearConversation: () => void;
}

export interface MessageBubbleProps {
  message: ChatMessage;
}

export interface MessageComposerProps {
  onSend: (payload: SendMessagePayload) => Promise<void>;
}

export interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: ChatParticipant[];
  onSelect: (participant: ChatParticipant) => void;
}
