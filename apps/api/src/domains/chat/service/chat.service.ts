import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../repository/chat.repository';
import { StudentService } from '../../student/service/student.service';
import { LoggerService } from '../../../common/utils/logger.service';
import { AuditLogger } from '../../../common/utils/audit-logger.service';
import { BadRequestException, NotFoundException } from '../../../common/exceptions';
import { isValidUuid } from '../../../common/utils/uuid.util';
import { inferAttachmentKind, formatFileSize } from '../utils/attachment-storage.util';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import {
  ConversationOutDto,
  MessageOutDto,
  SendMessageDto,
  StartConversationDto,
  UploadedAttachmentDto,
} from '../dto/chat.dto';

/** Anything shaped like a student record — satisfied by both the Student entity and StudentOutDto. */
interface ParticipantSource {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  course: string;
}

@Injectable()
export class ChatService {
  constructor(
    private readonly repository: ChatRepository,
    private readonly students: StudentService,
    private readonly logger: LoggerService,
    private readonly audit: AuditLogger,
  ) {}

  async listConversations(): Promise<ConversationOutDto[]> {
    const conversations = await this.repository.listConversations();
    if (conversations.length === 0) return [];

    const lastMessages = await this.repository.findLastMessagesFor(
      conversations.map((conversation) => conversation.id),
    );
    const lastMessageByConversationId = new Map(
      lastMessages.map((message) => [message.conversationId, message]),
    );

    return conversations.map((conversation) =>
      this.toConversationOutDto(
        conversation,
        lastMessageByConversationId.get(conversation.id) ?? null,
      ),
    );
  }

  async listMessages(conversationId: string): Promise<MessageOutDto[]> {
    await this.requireConversation(conversationId);
    const messages = await this.repository.listMessages(conversationId);
    return messages.map((message) => this.toMessageOutDto(message));
  }

  async startConversation(data: StartConversationDto): Promise<ConversationOutDto> {
    const student = await this.students.getById(data.studentId);

    const existing = await this.repository.findConversationByStudentId(student.id);
    const conversation = existing ?? (await this.repository.createConversation(student.id));
    const lastMessage = await this.repository.findLastMessage(conversation.id);

    this.logger.info(existing ? 'Existing conversation reused' : 'New conversation started');
    return this.toConversationOutDto(conversation, lastMessage, student);
  }

  async sendMessage(conversationId: string, data: SendMessageDto): Promise<MessageOutDto> {
    const conversation = await this.requireConversation(conversationId);

    const message = await this.repository.createMessage({
      conversationId: conversation.id,
      sender: 'admin',
      text: data.text?.trim() || null,
      attachments: data.attachments ?? [],
    });

    await this.repository.touchConversation(conversation.id);
    this.audit.log('ChatService', 'Message sent', { conversationId }, 'info');
    return this.toMessageOutDto(message);
  }

  async markRead(conversationId: string): Promise<void> {
    await this.requireConversation(conversationId);
    await this.repository.markRead(conversationId);
  }

  async clearConversation(conversationId: string): Promise<void> {
    await this.requireConversation(conversationId);
    await this.repository.clearMessages(conversationId);
    this.audit.log('ChatService', 'Conversation cleared', { conversationId }, 'info');
  }

  toUploadedAttachmentDto(file: Express.Multer.File): UploadedAttachmentDto {
    return {
      kind: inferAttachmentKind(file.mimetype, file.originalname),
      name: file.originalname,
      url: `/uploads/chat/${file.filename}`,
      sizeLabel: formatFileSize(file.size),
    };
  }

  private async requireConversation(id: string): Promise<Conversation> {
    if (!isValidUuid(id)) {
      throw new BadRequestException(`"${id}" is not a valid conversation id`);
    }
    const conversation = await this.repository.findConversationById(id);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return conversation;
  }

  private toConversationOutDto(
    conversation: Conversation,
    lastMessage: Message | null,
    participant?: ParticipantSource,
  ): ConversationOutDto {
    const source = participant ?? conversation.student;
    return {
      id: conversation.id,
      participant: {
        studentDbId: source.id,
        studentId: source.studentId,
        fullName: `${source.firstName} ${source.lastName}`,
        course: source.course,
      },
      lastMessage: lastMessage ? this.toMessageOutDto(lastMessage) : null,
      unreadCount: conversation.adminUnreadCount,
    };
  }

  private toMessageOutDto(message: Message): MessageOutDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      sender: message.sender,
      text: message.text,
      attachments: message.attachments,
      sentAt: message.sentAt,
    };
  }
}
