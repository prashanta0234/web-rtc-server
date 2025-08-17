import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessageResponseDto } from '../../common/dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('rooms/:roomId/messages')
  async getMessages(
    @Param('roomId') roomId: string,
    @Query('limit') limit: number = 50,
  ): Promise<MessageResponseDto[]> {
    return this.chatService.getMessages(roomId, limit);
  }

  @Get('rooms/:roomId/participants')
  async getParticipants(@Param('roomId') roomId: string) {
    const participants = await this.chatService.getRoomParticipants(roomId);
    return { success: true, participants };
  }

  @Post('rooms/:roomId/join')
  async joinRoom(
    @Param('roomId') roomId: string,
    @Body() body: { participantId: string; participantName: string },
  ) {
    await this.chatService.joinRoom(
      roomId,
      body.participantId,
      body.participantName,
    );
    return { success: true, message: 'Joined room successfully' };
  }

  @Post('rooms/:roomId/leave')
  async leaveRoom(
    @Param('roomId') roomId: string,
    @Body() body: { participantId: string },
  ) {
    await this.chatService.leaveRoom(roomId, body.participantId);
    return { success: true, message: 'Left room successfully' };
  }
}
