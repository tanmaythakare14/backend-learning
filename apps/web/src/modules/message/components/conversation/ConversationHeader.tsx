import type { JSX } from 'react';
import { ChevronLeft, MoreVertical, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/utils/initials';
import type { ConversationHeaderProps } from '../../@types';

export function ConversationHeader({
  participant,
  onBack,
  onClearConversation,
}: ConversationHeaderProps): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent-soft hover:text-primary lg:hidden"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <Avatar>
          <AvatarFallback>{getInitials(participant.fullName)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{participant.fullName}</p>
          <p className="text-xs text-muted-foreground">{participant.studentId}</p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label="More options"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent-soft hover:text-primary data-[popup-open]:bg-accent-soft data-[popup-open]:text-primary"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          }
        />
        <DropdownMenuContent>
          <DropdownMenuItem destructive onClick={onClearConversation}>
            <Trash2 className="h-4 w-4" />
            Clear conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
