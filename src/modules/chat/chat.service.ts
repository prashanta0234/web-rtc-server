import { Injectable, Logger, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { SendMessageDto, MessageResponseDto } from '../../common/dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async sendMessage(
    roomId: string,
    message: SendMessageDto,
    senderId: string,
    senderName: string,
  ): Promise<MessageResponseDto> {
    const messageId = uuidv4();
    const timestamp = new Date();

    const messageData: MessageResponseDto = {
      id: messageId,
      content: message.content,
      type: message.type || 'text',
      senderId,
      senderName,
      timestamp,
    };

    // Store message in Redis
    const messageKey = `chat:${roomId}:messages`;
    await this.redis.lpush(messageKey, JSON.stringify(messageData));

    // Keep only last 100 messages per room
    await this.redis.ltrim(messageKey, 0, 99);

    // Publish message to Redis channel
    const channel = `chat:${roomId}`;
    await this.redis.publish(channel, JSON.stringify(messageData));

    this.logger.log(`Message sent in room ${roomId} by ${senderName}`);

    return messageData;
  }

  async getMessages(
    roomId: string,
    limit: number = 50,
  ): Promise<MessageResponseDto[]> {
    const messageKey = `chat:${roomId}:messages`;
    const messages = await this.redis.lrange(messageKey, 0, limit - 1);

    return messages
      .reverse() // Get messages in chronological order
      .map((msg) => JSON.parse(msg) as MessageResponseDto);
  }

  async joinRoom(
    roomId: string,
    participantId: string,
    participantName: string,
  ): Promise<void> {
    const participantKey = `room:${roomId}:participants`;
    const participantData = {
      id: participantId,
      name: participantName,
      joinedAt: new Date().toISOString(),
    };

    await this.redis.hset(
      participantKey,
      participantId,
      JSON.stringify(participantData),
    );

    // Publish join event
    const channel = `room:${roomId}:events`;
    await this.redis.publish(
      channel,
      JSON.stringify({
        type: 'participant_joined',
        data: participantData,
      }),
    );

    this.logger.log(`Participant ${participantName} joined room ${roomId}`);
  }

  async leaveRoom(roomId: string, participantId: string): Promise<void> {
    const participantKey = `room:${roomId}:participants`;
    const participantData = await this.redis.hget(
      participantKey,
      participantId,
    );

    if (participantData) {
      const participant = JSON.parse(participantData);
      await this.redis.hdel(participantKey, participantId);

      // Publish leave event
      const channel = `room:${roomId}:events`;
      await this.redis.publish(
        channel,
        JSON.stringify({
          type: 'participant_left',
          data: { id: participantId, name: participant.name },
        }),
      );

      this.logger.log(`Participant ${participant.name} left room ${roomId}`);
    }
  }

  async getRoomParticipants(roomId: string): Promise<any[]> {
    const participantKey = `room:${roomId}:participants`;
    const participants = await this.redis.hgetall(participantKey);

    return Object.values(participants).map((p: string) => JSON.parse(p));
  }

  async subscribeToRoom(
    roomId: string,
    callback: (message: any) => void,
  ): Promise<void> {
    const channel = `chat:${roomId}`;
    const subscriber = this.redis.duplicate();

    await subscriber.subscribe(channel, (err) => {
      if (err) {
        this.logger.error(`Error subscribing to channel ${channel}:`, err);
      } else {
        this.logger.log(`Subscribed to chat channel: ${channel}`);
      }
    });

    subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        try {
          const messageData = JSON.parse(message);
          callback(messageData);
        } catch (error) {
          this.logger.error('Error parsing message:', error);
        }
      }
    });
  }

  async subscribeToRoomEvents(
    roomId: string,
    callback: (event: any) => void,
  ): Promise<void> {
    const channel = `room:${roomId}:events`;
    const subscriber = this.redis.duplicate();

    await subscriber.subscribe(channel, (err) => {
      if (err) {
        this.logger.error(
          `Error subscribing to events channel ${channel}:`,
          err,
        );
      } else {
        this.logger.log(`Subscribed to room events channel: ${channel}`);
      }
    });

    subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        try {
          const eventData = JSON.parse(message);
          callback(eventData);
        } catch (error) {
          this.logger.error('Error parsing event:', error);
        }
      }
    });
  }

  async setParticipantStatus(
    roomId: string,
    participantId: string,
    status: string,
  ): Promise<void> {
    const participantKey = `room:${roomId}:participants`;
    const participantData = await this.redis.hget(
      participantKey,
      participantId,
    );

    if (participantData) {
      const participant = JSON.parse(participantData);
      participant.status = status;
      participant.updatedAt = new Date().toISOString();

      await this.redis.hset(
        participantKey,
        participantId,
        JSON.stringify(participant),
      );

      // Publish status change event
      const channel = `room:${roomId}:events`;
      await this.redis.publish(
        channel,
        JSON.stringify({
          type: 'participant_status_changed',
          data: { id: participantId, status, name: participant.name },
        }),
      );
    }
  }

  async clearRoomData(roomId: string): Promise<void> {
    const messageKey = `chat:${roomId}:messages`;
    const participantKey = `room:${roomId}:participants`;

    await this.redis.del(messageKey);
    await this.redis.del(participantKey);

    this.logger.log(`Cleared data for room ${roomId}`);
  }
}
