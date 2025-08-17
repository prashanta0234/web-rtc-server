import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from '../../common/dto';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedClients = new Map<
    string,
    { socket: Socket; roomId?: string; participantId?: string }
  >();

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Chat client connected: ${client.id}`);
    this.connectedClients.set(client.id, { socket: client });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Chat client disconnected: ${client.id}`);
    const clientData = this.connectedClients.get(client.id);

    if (clientData?.roomId && clientData?.participantId) {
      this.chatService.leaveRoom(clientData.roomId, clientData.participantId);
    }

    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join-chat')
  async handleJoinChat(
    @MessageBody()
    data: { roomId: string; participantId: string; participantName: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId, participantId, participantName } = data;

      // Join the chat room
      await client.join(`chat:${roomId}`);

      // Update client data
      this.connectedClients.set(client.id, {
        socket: client,
        roomId,
        participantId,
      });

      // Join room in chat service
      await this.chatService.joinRoom(roomId, participantId, participantName);

      // Send recent messages
      const messages = await this.chatService.getMessages(roomId, 50);
      client.emit('chat-history', messages);

      this.logger.log(`Client ${client.id} joined chat for room ${roomId}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error joining chat: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody()
    data: {
      roomId: string;
      message: SendMessageDto;
      senderId: string;
      senderName: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId, message, senderId, senderName } = data;

      const messageData = await this.chatService.sendMessage(
        roomId,
        message,
        senderId,
        senderName,
      );

      // Broadcast message to all clients in the room
      this.server.to(`chat:${roomId}`).emit('new-message', messageData);

      return { success: true, message: messageData };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('leave-chat')
  async handleLeaveChat(
    @MessageBody() data: { roomId: string; participantId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId, participantId } = data;

      // Leave the chat room
      await client.leave(`chat:${roomId}`);

      // Leave room in chat service
      await this.chatService.leaveRoom(roomId, participantId);

      // Update client data
      this.connectedClients.set(client.id, { socket: client });

      this.logger.log(`Client ${client.id} left chat for room ${roomId}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error leaving chat: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('get-participants')
  async handleGetParticipants(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId } = data;
      const participants = await this.chatService.getRoomParticipants(roomId);

      client.emit('participants-list', participants);

      return { success: true, participants };
    } catch (error) {
      this.logger.error(`Error getting participants: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('set-status')
  async handleSetStatus(
    @MessageBody()
    data: { roomId: string; participantId: string; status: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId, participantId, status } = data;

      await this.chatService.setParticipantStatus(
        roomId,
        participantId,
        status,
      );

      // Broadcast status change to all clients in the room
      this.server.to(`chat:${roomId}`).emit('participant-status-changed', {
        participantId,
        status,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Error setting status: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
