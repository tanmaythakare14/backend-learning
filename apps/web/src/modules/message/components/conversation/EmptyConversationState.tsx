import type { JSX } from 'react';
import { MessageSquare } from 'lucide-react';

export function EmptyConversationState(): JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MessageSquare className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">Select a conversation</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a student from the list, or start a new chat.
        </p>
      </div>
    </div>
  );
}
