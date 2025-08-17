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
import { WebRTCService } from './webrtc.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class WebRTCGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebRTCGateway.name);
  private connectedClients = new Map<string, Socket>();

  constructor(private webRTCService: WebRTCService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody()
    data: { roomId: string; participantName: string; role?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId, participantName, role } = data;

      await client.join(roomId);

      client.to(roomId).emit('participant-joined', {
        participantId: client.id,
        participantName,
        role: role || 'participant',
      });

      this.logger.log(`Client ${client.id} joined room ${roomId}`);

      return { success: true, roomId };
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('get-router-rtp-capabilities')
  async handleGetRouterRtpCapabilities(
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const { roomId } = data;
      const rtpCapabilities =
        await this.webRTCService.getRouterRtpCapabilities(roomId);
      return { success: true, rtpCapabilities };
    } catch (error) {
      this.logger.error(`Error getting RTP capabilities: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('create-transport')
  async handleCreateTransport(
    @MessageBody() data: { roomId: string; direction: 'send' | 'recv' },
  ) {
    try {
      const { roomId, direction } = data;
      const { transport, params } = await this.webRTCService.createTransport(
        roomId,
        direction,
      );
      return { success: true, params };
    } catch (error) {
      this.logger.error(`Error creating transport: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('connect-transport')
  async handleConnectTransport(
    @MessageBody()
    data: {
      roomId: string;
      transportId: string;
      dtlsParameters: any;
    },
  ) {
    try {
      const { roomId, transportId, dtlsParameters } = data;
      await this.webRTCService.connectTransport(
        roomId,
        transportId,
        dtlsParameters,
      );
      return { success: true };
    } catch (error) {
      this.logger.error(`Error connecting transport: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('produce')
  async handleProduce(
    @MessageBody()
    data: {
      roomId: string;
      transportId: string;
      kind: 'audio' | 'video';
      rtpParameters: any;
      appData?: any;
    },
  ) {
    try {
      const { roomId, transportId, kind, rtpParameters, appData } = data;
      const producer = await this.webRTCService.produce(
        roomId,
        transportId,
        kind,
        rtpParameters,
        appData,
      );

      this.server.to(roomId).emit('new-producer', {
        producerId: producer.id,
        kind: producer.kind,
        appData: producer.appData,
      });

      return { success: true, producerId: producer.id };
    } catch (error) {
      this.logger.error(`Error producing: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('consume')
  async handleConsume(
    @MessageBody()
    data: {
      roomId: string;
      transportId: string;
      producerId: string;
      rtpCapabilities: any;
    },
  ) {
    try {
      const { roomId, transportId, producerId, rtpCapabilities } = data;
      const { consumer, params } = await this.webRTCService.consume(
        roomId,
        transportId,
        producerId,
        rtpCapabilities,
      );

      return { success: true, params };
    } catch (error) {
      this.logger.error(`Error consuming: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
