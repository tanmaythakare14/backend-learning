import { FileText, Image, Link2, Video, type LucideIcon } from 'lucide-react';
import type { AttachmentKind } from '../@types';

export const ATTACHMENT_ICON: Record<AttachmentKind, LucideIcon> = {
  pdf: FileText,
  doc: FileText,
  image: Image,
  video: Video,
  link: Link2,
};
