import { useMemo, useState } from 'react';
import type { JSX } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/utils/initials';
import type { NewChatDialogProps } from '../../@types';

export function NewChatDialog({
  open,
  onOpenChange,
  participants,
  onSelect,
}: NewChatDialogProps): JSX.Element {
  const [search, setSearch] = useState('');

  const filteredParticipants = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return participants;
    return participants.filter((participant) => participant.fullName.toLowerCase().includes(query));
  }, [participants, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a new chat</DialogTitle>
          <DialogDescription>Pick a student to begin a conversation with.</DialogDescription>
        </DialogHeader>

        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students"
            className="h-10 pl-9"
            autoFocus
          />
        </div>

        <ScrollArea className="h-72">
          <div className="space-y-1 pr-2">
            {filteredParticipants.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No students found.</p>
            ) : (
              filteredParticipants.map((participant) => (
                <button
                  key={participant.studentDbId}
                  type="button"
                  onClick={() => onSelect(participant)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-accent-soft"
                >
                  <Avatar>
                    <AvatarFallback>{getInitials(participant.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {participant.fullName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{participant.course}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
