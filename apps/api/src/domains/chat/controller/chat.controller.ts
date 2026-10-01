import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ChatService } from '../service/chat.service';
import { ChatGateway } from '../gateway/chat.gateway';
import { StartConversationDto, SendMessageDto } from '../dto/chat.dto';
import { chatAttachmentStorage } from '../utils/attachment-storage.util';
import { HttpStatus } from '../../../common/constants/http-status.constants';
import { SuccessMessages } from '../../../common/constants/success-messages.constants';
import { generateResponse } from '../../../common/utils/response.util';
import { BadRequestException } from '../../../common/exceptions';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly service: ChatService,
    private readonly gateway: ChatGateway,
  ) {}

  @Get('conversations')
  @ApiOperation({ summary: 'List all conversations with participant info and last message' })
  @ApiOkResponse({ description: 'List of conversations' })
  async listConversations(@Res() res: Response): Promise<Response> {
    const data = await this.service.listConversations();
    return generateResponse(res, { statusCode: HttpStatus.OK, data });
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get the message history for a conversation' })
  @ApiOkResponse({ description: 'List of messages' })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  async listMessages(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    const data = await this.service.listMessages(id);
    return generateResponse(res, { statusCode: HttpStatus.OK, data });
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Start a conversation with a student, or return the existing one' })
  @ApiCreatedResponse({ description: 'Conversation started or found' })
  @ApiBadRequestResponse({ description: 'Invalid student id' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  async startConversation(
    @Body() body: StartConversationDto,
    @Res() res: Response,
  ): Promise<Response> {
    const data = await this.service.startConversation(body);
    this.gateway.broadcastConversationStarted(data);
    return generateResponse(res, {
      statusCode: HttpStatus.CREATED,
      message: SuccessMessages.CREATED,
      data,
    });
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message — also broadcast live over WebSocket' })
  @ApiCreatedResponse({ description: 'Message sent' })
  @ApiBadRequestResponse({ description: 'Invalid id, or an empty message' })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  async sendMessage(
    @Param('id') id: string,
    @Body() body: SendMessageDto,
    @Res() res: Response,
  ): Promise<Response> {
    const data = await this.service.sendMessage(id, body);
    this.gateway.broadcastNewMessage(data);
    return generateResponse(res, {
      statusCode: HttpStatus.CREATED,
      message: SuccessMessages.CREATED,
      data,
    });
  }

  @Patch('conversations/:id/read')
  @ApiOperation({ summary: 'Mark a conversation as read (resets the unread count)' })
  @ApiOkResponse({ description: 'Marked read' })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  async markRead(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    await this.service.markRead(id);
    this.gateway.broadcastConversationRead(id);
    return generateResponse(res, { statusCode: HttpStatus.OK, message: SuccessMessages.UPDATED });
  }

  @Delete('conversations/:id/messages')
  @ApiOperation({ summary: 'Clear every message in a conversation' })
  @ApiOkResponse({ description: 'Conversation cleared' })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  async clearConversation(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    await this.service.clearConversation(id);
    this.gateway.broadcastConversationCleared(id);
    return generateResponse(res, { statusCode: HttpStatus.OK, message: SuccessMessages.DELETED });
  }

  @Post('attachments')
  @ApiOperation({ summary: 'Upload a chat attachment (pdf, doc, image, or video)' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ description: 'Attachment uploaded' })
  @ApiBadRequestResponse({ description: 'No file provided' })
  @UseInterceptors(FileInterceptor('file', { storage: chatAttachmentStorage }))
  uploadAttachment(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Res() res: Response,
  ): Response {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const data = this.service.toUploadedAttachmentDto(file);
    return generateResponse(res, {
      statusCode: HttpStatus.CREATED,
      message: SuccessMessages.CREATED,
      data,
    });
  }
}
