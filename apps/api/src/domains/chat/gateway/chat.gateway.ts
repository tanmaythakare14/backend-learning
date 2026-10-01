import { Injectable } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LoggerService } from '../../../common/utils/logger.service';
import { ConversationOutDto, MessageOutDto } from '../dto/chat.dto';

/**
 * Push-only: clients never emit writes here. REST (`ChatController`) is the
 * single write path; this gateway just broadcasts the resulting change to
 * every connected admin client so open tabs/sessions stay in sync live.
 * There's no separate student-facing app in this codebase, so "real-time"
 * here means "other admin sessions see it immediately," not a second party
 * replying live.
 */
@Injectable()
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly logger: LoggerService) {}

  handleConnection(client: Socket): void {
    this.logger.info(`Chat socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.info(`Chat socket disconnected: ${client.id}`);
  }

  broadcastConversationStarted(conversation: ConversationOutDto): void {
    this.server.emit('conversation:started', conversation);
  }

  broadcastNewMessage(message: MessageOutDto): void {
    this.server.emit('message:new', message);
  }

  broadcastConversationRead(conversationId: string): void {
    this.server.emit('conversation:read', { conversationId });
  }

  broadcastConversationCleared(conversationId: string): void {
    this.server.emit('conversation:cleared', { conversationId });
  }
}
