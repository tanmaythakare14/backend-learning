import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { diskStorage, type StorageEngine } from 'multer';
import { BadRequestException } from '../../../common/exceptions';

/**
 * Submissions are private student work. Unlike chat attachments, this directory
 * is NOT mounted with express.static in main.ts — files are only ever written
 * here, and any future download route must check who is asking first.
 */
export const ASSIGNMENT_UPLOADS_DIR = join(process.cwd(), 'uploads', 'assignments');

export const MAX_SUBMISSION_FILE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_SUBMISSION_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'];

if (!existsSync(ASSIGNMENT_UPLOADS_DIR)) {
  mkdirSync(ASSIGNMENT_UPLOADS_DIR, { recursive: true });
}

export const assignmentFileStorage: StorageEngine = diskStorage({
  destination: ASSIGNMENT_UPLOADS_DIR,
  // The original name is kept in the database for display; on disk it is only a UUID,
  // so a hostile filename can never reach the filesystem.
  filename: (_req, file, callback) => {
    callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
  },
});

export function submissionFileFilter(
  _req: unknown,
  file: { originalname: string },
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  const extension = extname(file.originalname).replace('.', '').toLowerCase();
  if (!ALLOWED_SUBMISSION_EXTENSIONS.includes(extension)) {
    callback(
      new BadRequestException(
        `Unsupported file type. Use one of: ${ALLOWED_SUBMISSION_EXTENSIONS.join(', ')}.`,
      ),
      false,
    );
    return;
  }
  callback(null, true);
}
