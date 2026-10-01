import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { Message, MessageAttachment, MessageSender } from '../entities/message.entity';

interface CreateMessageData {
  conversationId: string;
  sender: MessageSender;
  text: string | null;
  attachments: MessageAttachment[];
}

@Injectable()
export class ChatRepository {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversations: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messages: Repository<Message>,
  ) {}

  async findConversationByStudentId(studentId: string): Promise<Conversation | null> {
    return this.conversations.findOne({ where: { studentId }, relations: ['student'] });
  }

  async findConversationById(id: string): Promise<Conversation | null> {
    return this.conversations.findOne({ where: { id }, relations: ['student'] });
  }

  /** Ordered by most recent activity (last update, or creation if never touched). */
  async listConversations(): Promise<Conversation[]> {
    return this.conversations
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.student', 'student')
      .orderBy('COALESCE(conversation.updated_at, conversation.created_at)', 'DESC')
      .getMany();
  }

  async createConversation(studentId: string): Promise<Conversation> {
    const conversation = this.conversations.create({ studentId });
    const saved = await this.conversations.save(conversation);
    const withStudent = await this.findConversationById(saved.id);
    if (!withStudent) {
      throw new Error(`Failed to load conversation ${saved.id} immediately after creating it`);
    }
    return withStudent;
  }

  async findLastMessage(conversationId: string): Promise<Message | null> {
    return this.messages.findOne({ where: { conversationId }, order: { sentAt: 'DESC' } });
  }

  /** One query for "last message per conversation" instead of N+1 in a loop. */
  async findLastMessagesFor(conversationIds: string[]): Promise<Message[]> {
    if (conversationIds.length === 0) return [];
    return this.messages
      .createQueryBuilder('message')
      .distinctOn(['message.conversation_id'])
      .where('message.conversation_id IN (:...ids)', { ids: conversationIds })
      .orderBy('message.conversation_id')
      .addOrderBy('message.sent_at', 'DESC')
      .getMany();
  }

  async listMessages(conversationId: string): Promise<Message[]> {
    return this.messages.find({ where: { conversationId }, order: { sentAt: 'ASC' } });
  }

  async createMessage(data: CreateMessageData): Promise<Message> {
    const message = this.messages.create(data);
    return this.messages.save(message);
  }

  async clearMessages(conversationId: string): Promise<void> {
    await this.messages.delete({ conversationId });
  }

  async markRead(conversationId: string): Promise<void> {
    await this.conversations.update(conversationId, { adminUnreadCount: 0, updatedAt: new Date() });
  }

  async touchConversation(conversationId: string): Promise<void> {
    await this.conversations.update(conversationId, { updatedAt: new Date() });
  }
}
