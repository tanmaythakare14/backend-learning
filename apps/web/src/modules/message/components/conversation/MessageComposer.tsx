import { useRef, useState } from 'react';
import type { ChangeEvent, JSX, KeyboardEvent } from 'react';
import { Loader2, Paperclip, Send, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ACCEPTED_ATTACHMENT_TYPES } from '../../constants';
import type { MessageComposerProps } from '../../@types';

export function MessageComposer({ onSend }: MessageComposerProps): JSX.Element {
  const [text, setText] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = (text.trim().length > 0 || pendingFiles.length > 0) && !isSending;

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files ?? []);
    setPendingFiles((prev) => [...prev, ...files]);
    event.target.value = '';
  };

  const handleRemoveFile = (index: number): void => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (): Promise<void> => {
    if (!canSend) return;
    setIsSending(true);
    try {
      await onSend({ text: text.trim() || undefined, files: pendingFiles });
      setText('');
      setPendingFiles([]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="border-t border-border p-3">
      {pendingFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {pendingFiles.map((file, index) => (
            <span
              key={`${file.name}-${index}`}
              className="flex items-center gap-1.5 rounded-lg bg-accent-soft px-2.5 py-1 text-xs text-foreground"
            >
              {file.name}
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                aria-label={`Remove ${file.name}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_ATTACHMENT_TYPES}
          onChange={handleFilesSelected}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach a file"
          title="Attach a file"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent-soft hover:text-primary"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message…"
          rows={1}
          className="max-h-32 min-h-[2.5rem] flex-1 py-2.5"
        />

        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!canSend}
          aria-label="Send message"
          title="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
