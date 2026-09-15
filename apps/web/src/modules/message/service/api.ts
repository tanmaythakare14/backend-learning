import { config } from '@/config/environment';
import { handleHttpError } from '@/utils/apiError';
import type {
  ConversationApiDto,
  MessageApiDto,
  MessageAttachment,
  SendMessagePayload,
  StudentSummaryDto,
  UploadedAttachmentDto,
} from '../@types';

const CHAT_BASE_URL = `${config.apiUrl}/api/v1/chat`;

async function parseJson<TData>(res: Response): Promise<TData> {
  const body: { data?: TData; message?: string } | undefined = await res
    .json()
    .catch(() => undefined);
  if (!res.ok) {
    handleHttpError(res.status, body);
  }
  return (body as { data: TData }).data;
}

async function assertOk(res: Response): Promise<void> {
  if (res.ok) return;
  const body: { message?: string } | undefined = await res.json().catch(() => undefined);
  handleHttpError(res.status, body);
}

export async function listConversations(): Promise<ConversationApiDto[]> {
  const res = await fetch(`${CHAT_BASE_URL}/conversations`);
  return parseJson<ConversationApiDto[]>(res);
}

export async function listMessages(conversationId: string): Promise<MessageApiDto[]> {
  const res = await fetch(`${CHAT_BASE_URL}/conversations/${conversationId}/messages`);
  return parseJson<MessageApiDto[]>(res);
}

export async function startConversation(studentId: string): Promise<ConversationApiDto> {
  const res = await fetch(`${CHAT_BASE_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId }),
  });
  return parseJson<ConversationApiDto>(res);
}

export async function uploadAttachment(file: File): Promise<UploadedAttachmentDto> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${CHAT_BASE_URL}/attachments`, { method: 'POST', body: formData });
  return parseJson<UploadedAttachmentDto>(res);
}

export async function sendMessage(
  conversationId: string,
  payload: SendMessagePayload,
): Promise<MessageApiDto> {
  const attachments: MessageAttachment[] = await Promise.all(
    (payload.files ?? []).map(async (file) => ({
      id: crypto.randomUUID(),
      ...(await uploadAttachment(file)),
    })),
  );

  const res = await fetch(`${CHAT_BASE_URL}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: payload.text, attachments }),
  });
  return parseJson<MessageApiDto>(res);
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const res = await fetch(`${CHAT_BASE_URL}/conversations/${conversationId}/read`, {
    method: 'PATCH',
  });
  return assertOk(res);
}

export async function clearConversation(conversationId: string): Promise<void> {
  const res = await fetch(`${CHAT_BASE_URL}/conversations/${conversationId}/messages`, {
    method: 'DELETE',
  });
  return assertOk(res);
}

export async function listActiveStudents(): Promise<StudentSummaryDto[]> {
  const res = await fetch(`${config.apiUrl}/api/v1/students?status=active`);
  return parseJson<StudentSummaryDto[]>(res);
}
