import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mediasoup from 'mediasoup';
import { v4 as uuidv4 } from 'uuid';

export interface Worker {
  worker: mediasoup.types.Worker;
  router: mediasoup.types.Router;
  rooms: Map<string, Room>;
}

export interface Room {
  id: string;
  router: mediasoup.types.Router;
  peers: Map<string, Peer>;
  producers: Map<string, mediasoup.types.Producer>;
  consumers: Map<string, mediasoup.types.Consumer>;
  transports: Map<string, mediasoup.types.WebRtcTransport>;
}

export interface Peer {
  id: string;
  name: string;
  role: string;
  transports: Map<string, mediasoup.types.WebRtcTransport>;
  producers: Map<string, mediasoup.types.Producer>;
  consumers: Map<string, mediasoup.types.Consumer>;
}

@Injectable()
export class WebRTCService implements OnModuleInit {
  private readonly logger = new Logger(WebRTCService.name);
  private workers: Worker[] = [];
  private nextWorkerIndex = 0;
  private isMediaSoupAvailable = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      await this.createWorkers();
      this.isMediaSoupAvailable = true;
      this.logger.log('MediaSoup workers initialized successfully');
    } catch (error) {
      this.logger.warn(
        'MediaSoup initialization failed, running in limited mode:',
        error.message,
      );
      this.isMediaSoupAvailable = false;
      // Don't throw error, allow the app to start without MediaSoup
    }
  }

  private async createWorkers(): Promise<void> {
    const numWorkers = 4; // Number of CPU cores

    for (let i = 0; i < numWorkers; i++) {
      try {
        const worker = await mediasoup.createWorker({
          logLevel: this.configService.get('mediasoup.worker.logLevel'),
          logTags: [this.configService.get('mediasoup.worker.logTag')],
          rtcMinPort: this.configService.get('mediasoup.worker.rtcMinPort'),
          rtcMaxPort: this.configService.get('mediasoup.worker.rtcMaxPort'),
        });

        worker.on('died', () => {
          this.logger.error(
            'MediaSoup worker died, exiting in 2 seconds... [pid:%d]',
            worker.pid,
          );
          setTimeout(() => process.exit(1), 2000);
        });

        const router = await worker.createRouter({
          mediaCodecs: [
            {
              kind: 'audio',
              mimeType: 'audio/opus',
              clockRate: 48000,
              channels: 2,
            },
            {
              kind: 'video',
              mimeType: 'video/VP8',
              clockRate: 90000,
              parameters: {
                'x-google-start-bitrate': 1000,
              },
            },
            {
              kind: 'video',
              mimeType: 'video/H264',
              clockRate: 90000,
              parameters: {
                'packetization-mode': 1,
                'profile-level-id': '42e01f',
                'level-asymmetry-allowed': 1,
              },
            },
          ],
        });

        this.workers.push({
          worker,
          router,
          rooms: new Map(),
        });

        this.logger.log(`MediaSoup worker created [pid:${worker.pid}]`);
      } catch (error) {
        this.logger.error(
          `Failed to create MediaSoup worker ${i}:`,
          error.message,
        );
        throw error; // Re-throw to stop worker creation
      }
    }
  }

  private getWorker(): Worker {
    if (!this.isMediaSoupAvailable || this.workers.length === 0) {
      throw new Error('MediaSoup is not available');
    }
    const worker = this.workers[this.nextWorkerIndex];
    this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length;
    return worker;
  }

  async createRoom(roomId: string): Promise<Room> {
    if (!this.isMediaSoupAvailable) {
      throw new Error(
        'MediaSoup is not available. WebRTC functionality is disabled.',
      );
    }

    const worker = this.getWorker();

    if (worker.rooms.has(roomId)) {
      throw new Error(`Room ${roomId} already exists`);
    }

    const room: Room = {
      id: roomId,
      router: worker.router,
      peers: new Map(),
      producers: new Map(),
      consumers: new Map(),
      transports: new Map(),
    };

    worker.rooms.set(roomId, room);
    this.logger.log(`Room created: ${roomId}`);

    return room;
  }

  async deleteRoom(roomId: string): Promise<void> {
    if (!this.isMediaSoupAvailable) {
      return;
    }

    for (const worker of this.workers) {
      const room = worker.rooms.get(roomId);
      if (room) {
        // Close all transports
        for (const transport of room.transports.values()) {
          transport.close();
        }

        // Close all producers
        for (const producer of room.producers.values()) {
          producer.close();
        }

        // Close all consumers
        for (const consumer of room.consumers.values()) {
          consumer.close();
        }

        worker.rooms.delete(roomId);
        this.logger.log(`Room deleted: ${roomId}`);
        break;
      }
    }
  }

  async createTransport(
    roomId: string,
    direction: 'send' | 'recv',
  ): Promise<any> {
    if (!this.isMediaSoupAvailable) {
      throw new Error(
        'MediaSoup is not available. WebRTC functionality is disabled.',
      );
    }

    const room = await this.findRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    const transport = await room.router.createWebRtcTransport({
      listenIps: [
        {
          ip: this.configService.get('webrtc.listenIp'),
          announcedIp: this.configService.get('webrtc.announcedIp'),
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate: 1000000,
      maxSctpMessageSize: 262144,
    });

    room.transports.set(transport.id, transport);

    transport.on('@close', () => {
      this.logger.log('Transport closed:', transport.id);
      room.transports.delete(transport.id);
    });

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
      sctpParameters: transport.sctpParameters,
    };
  }

  async connectTransport(
    roomId: string,
    transportId: string,
    dtlsParameters: any,
  ): Promise<void> {
    if (!this.isMediaSoupAvailable) {
      throw new Error(
        'MediaSoup is not available. WebRTC functionality is disabled.',
      );
    }

    const room = await this.findRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    const transport = room.transports.get(transportId);
    if (!transport) {
      throw new Error(`Transport ${transportId} not found`);
    }

    await transport.connect({ dtlsParameters });
  }

  async produce(
    roomId: string,
    transportId: string,
    kind: 'audio' | 'video',
    rtpParameters: any,
    appData?: any,
  ): Promise<any> {
    if (!this.isMediaSoupAvailable) {
      throw new Error(
        'MediaSoup is not available. WebRTC functionality is disabled.',
      );
    }

    const room = await this.findRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    const transport = room.transports.get(transportId);
    if (!transport) {
      throw new Error(`Transport ${transportId} not found`);
    }

    const producer = await transport.produce({
      kind,
      rtpParameters,
      appData,
      // Enable simulcast for video
      ...(kind === 'video' && {
        encodings: [
          { maxBitrate: 1000000, scalabilityMode: 'S3T3' }, // 720p
          { maxBitrate: 500000, scalabilityMode: 'S2T3' }, // 480p
          { maxBitrate: 150000, scalabilityMode: 'S1T3' }, // 180p
        ],
        codecOptions: {
          videoGoogleStartBitrate: 1000,
        },
      }),
    });

    room.producers.set(producer.id, producer);

    producer.on('@close', () => {
      this.logger.log('Producer closed:', producer.id);
      room.producers.delete(producer.id);
    });

    return { producerId: producer.id };
  }

  async consume(
    roomId: string,
    transportId: string,
    producerId: string,
    rtpCapabilities: any,
  ): Promise<any> {
    if (!this.isMediaSoupAvailable) {
      throw new Error(
        'MediaSoup is not available. WebRTC functionality is disabled.',
      );
    }

    const room = await this.findRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    const transport = room.transports.get(transportId);
    if (!transport) {
      throw new Error(`Transport ${transportId} not found`);
    }

    const producer = room.producers.get(producerId);
    if (!producer) {
      throw new Error(`Producer ${producerId} not found`);
    }

    if (!room.router.canConsume({ producerId, rtpCapabilities })) {
      throw new Error('Cannot consume this producer');
    }

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: false,
    });

    room.consumers.set(consumer.id, consumer);

    consumer.on('@close', () => {
      this.logger.log('Consumer closed:', consumer.id);
      room.consumers.delete(consumer.id);
    });

    return {
      id: consumer.id,
      producerId: consumer.producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      type: consumer.type,
      producerPaused: consumer.producerPaused,
    };
  }

  private async findRoom(roomId: string): Promise<Room | undefined> {
    for (const worker of this.workers) {
      const room = worker.rooms.get(roomId);
      if (room) {
        return room;
      }
    }
    return undefined;
  }

  // Health check method
  isHealthy(): boolean {
    return this.isMediaSoupAvailable && this.workers.length > 0;
  }

  // Get service status
  getStatus(): { available: boolean; workerCount: number; roomCount: number } {
    let totalRooms = 0;
    for (const worker of this.workers) {
      totalRooms += worker.rooms.size;
    }

    return {
      available: this.isMediaSoupAvailable,
      workerCount: this.workers.length,
      roomCount: totalRooms,
    };
  }
}
