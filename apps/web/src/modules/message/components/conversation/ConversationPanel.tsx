import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ConversationPanelProps } from '../../@types';
import { ConversationHeader } from './ConversationHeader';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { EmptyConversationState } from './EmptyConversationState';

export function ConversationPanel({
  conversation,
  messages,
  isLoading,
  onSendMessage,
  onBack,
  onClearConversation,
}: ConversationPanelProps): JSX.Element {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, conversation?.id]);

  if (!conversation) {
    return (
      <div className="flex h-full min-h-0 flex-col rounded-xl border border-border bg-card">
        <EmptyConversationState />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-border bg-card">
      <ConversationHeader
        participant={conversation.participant}
        onBack={onBack}
        onClearConversation={onClearConversation}
      />

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading messages…
            </div>
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <MessageComposer onSend={onSendMessage} />
    </div>
  );
}
