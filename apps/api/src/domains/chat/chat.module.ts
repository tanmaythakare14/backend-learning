import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ChatRepository } from './repository/chat.repository';
import { ChatService } from './service/chat.service';
import { ChatController } from './controller/chat.controller';
import { ChatGateway } from './gateway/chat.gateway';
import { StudentModule } from '../student/student.module';
import { validate } from '../../common/middleware/validate.middleware';
import { startConversationSchema, sendMessageSchema } from './validator/chat.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message]), StudentModule],
  providers: [ChatRepository, ChatService, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(validate(startConversationSchema))
      .forRoutes({ path: 'chat/conversations', method: RequestMethod.POST });
    consumer
      .apply(validate(sendMessageSchema))
      .forRoutes({ path: 'chat/conversations/:id/messages', method: RequestMethod.POST });
  }
}
