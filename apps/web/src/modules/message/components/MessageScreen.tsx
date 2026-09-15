import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { toast } from 'sonner';
import type {
  ChatMessage,
  ChatParticipant,
  Conversation,
  ConversationApiDto,
  MessageApiDto,
  SendMessagePayload,
} from '../@types';
import {
  apiDtoToConversation,
  apiDtoToMessage,
  clearConversation,
  getChatSocket,
  listActiveStudents,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
  startConversation,
  studentSummaryToParticipant,
} from '../service';
import { ConversationListPanel } from './conversation-list';
import { ConversationPanel } from './conversation';
import { NewChatDialog } from './new-chat';

function sortByLastMessageDesc(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.sentAt).getTime() : 0;
    const bTime = b.lastMessage ? new Date(b.lastMessage.sentAt).getTime() : 0;
    return bTime - aTime;
  });
}

export function MessageScreen(): JSX.Element {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const selectedConversationIdRef = useRef<string | null>(null);
  selectedConversationIdRef.current = selectedConversationId;

  // Auto-selects the most recent conversation so the message center isn't
  // empty on first load; the mobile back button still returns to the list.
  useEffect(() => {
    let cancelled = false;
    listConversations().then((dtos) => {
      if (cancelled) return;
      const mapped = dtos.map(apiDtoToConversation);
      setConversations(mapped);
      setIsLoadingConversations(false);
      setSelectedConversationId((current) => current ?? mapped[0]?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    listActiveStudents().then((students) => {
      setParticipants(students.map(studentSummaryToParticipant));
    });
  }, []);

  // Live updates over WebSocket — keeps every open tab/session in sync,
  // including the tab that triggered the change (the gateway broadcasts to
  // all connected clients, so this is also how the sender's own message
  // ends up rendered, not a separate optimistic-update path).
  useEffect(() => {
    const socket = getChatSocket();

    const handleConversationStarted = (dto: ConversationApiDto): void => {
      setConversations((prev) =>
        prev.some((conversation) => conversation.id === dto.id)
          ? prev
          : sortByLastMessageDesc([apiDtoToConversation(dto), ...prev]),
      );
    };

    const handleNewMessage = (dto: MessageApiDto): void => {
      const message = apiDtoToMessage(dto);
      if (message.conversationId === selectedConversationIdRef.current) {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      }
      setConversations((prev) =>
        sortByLastMessageDesc(
          prev.map((conversation) =>
            conversation.id === message.conversationId
              ? { ...conversation, lastMessage: message }
              : conversation,
          ),
        ),
      );
    };

    const handleConversationRead = ({ conversationId }: { conversationId: string }): void => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
        ),
      );
    };

    const handleConversationCleared = ({ conversationId }: { conversationId: string }): void => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, lastMessage: undefined }
            : conversation,
        ),
      );
      setMessages((prev) => (selectedConversationIdRef.current === conversationId ? [] : prev));
    };

    socket.on('conversation:started', handleConversationStarted);
    socket.on('message:new', handleNewMessage);
    socket.on('conversation:read', handleConversationRead);
    socket.on('conversation:cleared', handleConversationCleared);

    return () => {
      socket.off('conversation:started', handleConversationStarted);
      socket.off('message:new', handleNewMessage);
      socket.off('conversation:read', handleConversationRead);
      socket.off('conversation:cleared', handleConversationCleared);
    };
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setIsLoadingMessages(true);
    listMessages(selectedConversationId).then((dtos) => {
      if (cancelled) return;
      setMessages(dtos.map(apiDtoToMessage));
      setIsLoadingMessages(false);
    });
    markConversationRead(selectedConversationId).then(() => {
      if (cancelled) return;
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === selectedConversationId
            ? { ...conversation, unreadCount: 0 }
            : conversation,
        ),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [selectedConversationId]);

  const handleSendMessage = async (payload: SendMessagePayload): Promise<void> => {
    if (!selectedConversationId) return;
    try {
      await sendMessage(selectedConversationId, payload);
      // The socket's message:new handler appends it once the server broadcasts —
      // no local append here, so there's a single source of truth for message state.
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleClearConversation = async (): Promise<void> => {
    if (!selectedConversationId) return;
    try {
      await clearConversation(selectedConversationId);
      toast.success('Conversation cleared');
    } catch {
      toast.error('Failed to clear the conversation. Please try again.');
    }
  };

  const handleSelectParticipant = async (participant: ChatParticipant): Promise<void> => {
    try {
      const dto = await startConversation(participant.studentDbId);
      setConversations((prev) =>
        prev.some((conversation) => conversation.id === dto.id)
          ? prev
          : sortByLastMessageDesc([apiDtoToConversation(dto), ...prev]),
      );
      setSelectedConversationId(dto.id);
      setIsNewChatOpen(false);
    } catch {
      toast.error('Failed to start the conversation. Please try again.');
    }
  };

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  );

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_3fr]">
      <div className={selectedConversationId ? 'hidden lg:block' : 'block'}>
        <ConversationListPanel
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          isLoading={isLoadingConversations}
          onSelect={setSelectedConversationId}
          onNewChat={() => setIsNewChatOpen(true)}
        />
      </div>

      <div className={selectedConversationId ? 'block' : 'hidden lg:block'}>
        <ConversationPanel
          conversation={selectedConversation}
          messages={messages}
          isLoading={isLoadingMessages}
          onSendMessage={handleSendMessage}
          onBack={() => setSelectedConversationId(null)}
          onClearConversation={() => void handleClearConversation()}
        />
      </div>

      <NewChatDialog
        open={isNewChatOpen}
        onOpenChange={setIsNewChatOpen}
        participants={participants}
        onSelect={(participant) => void handleSelectParticipant(participant)}
      />
    </div>
  );
}
