import { FileText, Image, Link2, Video, type LucideIcon } from 'lucide-react';
import type { AttachmentKind } from '../@types';

const EXTENSION_KIND_MAP: Record<string, AttachmentKind> = {
  pdf: 'pdf',
  doc: 'doc',
  docx: 'doc',
};

export function inferAttachmentKind(file: File): AttachmentKind {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';

  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_KIND_MAP[extension] ?? 'doc';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export const ATTACHMENT_ICON: Record<AttachmentKind, LucideIcon> = {
  pdf: FileText,
  doc: FileText,
  image: Image,
  video: Video,
  link: Link2,
};
