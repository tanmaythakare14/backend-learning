import type { JSX } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getInitials } from '@/utils/initials';
import type { ConversationListItemProps } from '../../@types';
import { formatConversationTimestamp } from '../../utils';

export function ConversationListItem({
  conversation,
  isSelected,
  onSelect,
}: ConversationListItemProps): JSX.Element {
  const { participant, lastMessage, unreadCount } = conversation;
  const previewText =
    lastMessage?.text ??
    (lastMessage && lastMessage.attachments.length > 0 ? 'Sent an attachment' : 'No messages yet');

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
        isSelected ? 'bg-primary/10' : 'hover:bg-accent-soft',
      )}
    >
      <Avatar>
        <AvatarFallback>{getInitials(participant.fullName)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{participant.fullName}</p>
          {lastMessage && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatConversationTimestamp(lastMessage.sentAt)}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted-foreground">{previewText}</p>
          {unreadCount > 0 && (
            <Badge className="shrink-0 px-1.5 py-0 text-[10px]">{unreadCount}</Badge>
          )}
        </div>
      </div>
    </button>
  );
}
