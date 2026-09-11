import { formatDistanceToNowStrict, format, isToday } from 'date-fns';

export function formatConversationTimestamp(iso: string): string {
  const date = new Date(iso);
  return isToday(date)
    ? format(date, 'h:mm a')
    : formatDistanceToNowStrict(date, { addSuffix: true });
}

export function formatBubbleTimestamp(iso: string): string {
  return format(new Date(iso), 'h:mm a');
}

const URL_SPLIT_PATTERN = /(https?:\/\/[^\s]+)/g;
const URL_MATCH_PATTERN = /^https?:\/\//;

export interface TextSegment {
  type: 'text' | 'url';
  value: string;
}

export function splitTextByUrls(text: string): TextSegment[] {
  return text
    .split(URL_SPLIT_PATTERN)
    .filter((segment) => segment.length > 0)
    .map((segment) => ({
      type: URL_MATCH_PATTERN.test(segment) ? 'url' : 'text',
      value: segment,
    }));
}
