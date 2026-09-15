import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

export type MessageSender = 'admin' | 'student';

export type AttachmentKind = 'pdf' | 'doc' | 'image' | 'video' | 'link';

export interface MessageAttachment {
  id: string;
  kind: AttachmentKind;
  name: string;
  url: string;
  sizeLabel?: string;
}

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'conversation_id' })
  conversationId!: string;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: Conversation;

  @Column({ type: 'varchar', length: 10 })
  sender!: MessageSender;

  @Column({ type: 'text', nullable: true })
  text!: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  attachments!: MessageAttachment[];

  @Column({ type: 'timestamptz', name: 'sent_at', default: () => 'NOW()' })
  sentAt!: Date;
}
