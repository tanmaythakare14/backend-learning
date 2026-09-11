import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { toast } from 'sonner';
import type { ChatMessage, ChatParticipant, Conversation, SendMessagePayload } from '../@types';
import {
  apiDtoToConversation,
  apiDtoToMessage,
  listConversations,
  listMessages,
  listParticipants,
  markConversationRead,
  sendMessage,
  startConversation,
} from '../service';
import { ConversationListPanel } from './conversation-list';
import { ConversationPanel } from './conversation';
import { NewChatDialog } from './new-chat';

export function MessageScreen(): JSX.Element {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  // No conversation is auto-selected — on mobile that would jump straight
  // past the list with no way back to it on first load.
  useEffect(() => {
    let cancelled = false;
    listConversations().then((dtos) => {
      if (cancelled) return;
      setConversations(dtos.map(apiDtoToConversation));
      setIsLoadingConversations(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    listParticipants().then(setParticipants);
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
      const dto = await sendMessage(selectedConversationId, payload);
      const message = apiDtoToMessage(dto);
      setMessages((prev) => [...prev, message]);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === selectedConversationId
            ? { ...conversation, lastMessage: message }
            : conversation,
        ),
      );
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleClearConversation = (): void => {
    setMessages([]);
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === selectedConversationId
          ? { ...conversation, lastMessage: undefined }
          : conversation,
      ),
    );
    toast.success('Conversation cleared');
  };

  const handleSelectParticipant = async (participant: ChatParticipant): Promise<void> => {
    const dto = await startConversation(participant);
    setConversations((prev) =>
      prev.some((conversation) => conversation.id === dto.id)
        ? prev
        : [apiDtoToConversation(dto), ...prev],
    );
    setSelectedConversationId(dto.id);
    setIsNewChatOpen(false);
  };

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  );

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[2fr_3fr]">
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
          onClearConversation={handleClearConversation}
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
