import type { JSX } from 'react';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageBubbleProps } from '../../@types';
import { ATTACHMENT_ICON, formatBubbleTimestamp, splitTextByUrls } from '../../utils';

export function MessageBubble({ message }: MessageBubbleProps): JSX.Element {
  const isAdmin = message.sender === 'admin';

  return (
    <div className={cn('flex', isAdmin ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] space-y-2 rounded-2xl px-4 py-2.5 text-sm',
          isAdmin
            ? 'rounded-br-sm bg-primary text-primary-foreground'
            : 'rounded-bl-sm border border-border bg-card text-foreground',
        )}
      >
        {message.text && (
          <p className="whitespace-pre-wrap break-words">
            {splitTextByUrls(message.text).map((segment, index) =>
              segment.type === 'url' ? (
                <a
                  key={index}
                  href={segment.value}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    'underline underline-offset-2',
                    isAdmin ? 'text-primary-foreground' : 'text-primary',
                  )}
                >
                  {segment.value}
                </a>
              ) : (
                <span key={index}>{segment.value}</span>
              ),
            )}
          </p>
        )}

        {message.attachments.map((attachment) => {
          if (attachment.kind === 'image') {
            return (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-xl"
              >
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="max-h-56 w-full object-cover"
                />
              </a>
            );
          }

          const Icon = ATTACHMENT_ICON[attachment.kind];
          return (
            <a
              key={attachment.id}
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition-colors',
                isAdmin
                  ? 'bg-primary-foreground/10 hover:bg-primary-foreground/15'
                  : 'bg-accent-soft hover:bg-accent-soft/70',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate font-medium">{attachment.name}</span>
              {attachment.sizeLabel && (
                <span className="shrink-0 opacity-70">{attachment.sizeLabel}</span>
              )}
              <Download className="h-3.5 w-3.5 shrink-0 opacity-70" />
            </a>
          );
        })}

        <p
          className={cn(
            'text-right text-[10px]',
            isAdmin ? 'text-primary-foreground/70' : 'text-muted-foreground',
          )}
        >
          {formatBubbleTimestamp(message.sentAt)}
        </p>
      </div>
    </div>
  );
}
