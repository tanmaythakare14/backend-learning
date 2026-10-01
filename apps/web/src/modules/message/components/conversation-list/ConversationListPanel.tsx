import { useMemo, useState } from 'react';
import type { JSX } from 'react';
import { Loader2, Search, SquarePen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ConversationListPanelProps } from '../../@types';
import { ConversationListItem } from './ConversationListItem';

export function ConversationListPanel({
  conversations,
  selectedConversationId,
  isLoading,
  onSelect,
  onNewChat,
}: ConversationListPanelProps): JSX.Element {
  const [search, setSearch] = useState('');

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) =>
      conversation.participant.fullName.toLowerCase().includes(query),
    );
  }, [conversations, search]);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border p-4">
        <h2 className="text-base font-semibold text-foreground">Messages</h2>
        <button
          type="button"
          onClick={onNewChat}
          title="Start a new chat"
          aria-label="Start a new chat"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10"
        >
          <SquarePen className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            className="h-10 pl-9"
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-1 p-2">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading conversations…
            </div>
          ) : filteredConversations.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No conversations found.
            </p>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
