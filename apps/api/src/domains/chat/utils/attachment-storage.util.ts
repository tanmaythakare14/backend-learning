import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { diskStorage, type StorageEngine } from 'multer';
import type { AttachmentKind } from '../entities/message.entity';

export const CHAT_UPLOADS_DIR = join(process.cwd(), 'uploads', 'chat');
export const CHAT_UPLOADS_URL_PREFIX = '/uploads/chat';

if (!existsSync(CHAT_UPLOADS_DIR)) {
  mkdirSync(CHAT_UPLOADS_DIR, { recursive: true });
}

export const chatAttachmentStorage: StorageEngine = diskStorage({
  destination: CHAT_UPLOADS_DIR,
  filename: (_req, file, callback) => {
    callback(null, `${randomUUID()}${extname(file.originalname)}`);
  },
});

const EXTENSION_KIND_MAP: Record<string, AttachmentKind> = {
  pdf: 'pdf',
  doc: 'doc',
  docx: 'doc',
};

export function inferAttachmentKind(mimetype: string, originalname: string): AttachmentKind {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';

  const extension = originalname.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_KIND_MAP[extension] ?? 'doc';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
