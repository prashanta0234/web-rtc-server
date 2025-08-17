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

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.createWorkers();
  }

  private async createWorkers(): Promise<void> {
    const numWorkers = 4; // Number of CPU cores

    for (let i = 0; i < numWorkers; i++) {
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
    }
  }

  private getWorker(): Worker {
    const worker = this.workers[this.nextWorkerIndex];
    this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length;
    return worker;
  }

  async createRoom(roomId: string): Promise<Room> {
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
        return;
      }
    }
  }

  async createTransport(
    roomId: string,
    direction: 'send' | 'recv',
  ): Promise<{
    transport: mediasoup.types.WebRtcTransport;
    params: any;
  }> {
    const room = this.getRoom(roomId);

    const transport = await room.router.createWebRtcTransport({
      listenIps: [
        {
          ip: this.configService.get('mediasoup.webRtc.listenIp'),
          announcedIp: this.configService.get('mediasoup.webRtc.announcedIp'),
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate: 1000000,
    });

    room.transports.set(transport.id, transport);

    const params = {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
      sctpParameters: transport.sctpParameters,
    };

    return { transport, params };
  }

  async connectTransport(
    roomId: string,
    transportId: string,
    dtlsParameters: mediasoup.types.DtlsParameters,
  ): Promise<void> {
    const room = this.getRoom(roomId);
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
    rtpParameters: mediasoup.types.RtpParameters,
    appData?: any,
  ): Promise<mediasoup.types.Producer> {
    const room = this.getRoom(roomId);
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

    producer.on('transportclose', () => {
      this.logger.log('Producer transport closed');
      room.producers.delete(producer.id);
    });

    producer.on('@close', () => {
      this.logger.log('Producer closed');
      room.producers.delete(producer.id);
    });

    return producer;
  }

  async consume(
    roomId: string,
    transportId: string,
    producerId: string,
    rtpCapabilities: mediasoup.types.RtpCapabilities,
  ): Promise<{
    consumer: mediasoup.types.Consumer;
    params: any;
  }> {
    const room = this.getRoom(roomId);
    const transport = room.transports.get(transportId);
    const producer = room.producers.get(producerId);

    if (!transport) {
      throw new Error(`Transport ${transportId} not found`);
    }

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
      appData: { mediaPeerId: producer.appData?.mediaPeerId },
    });

    room.consumers.set(consumer.id, consumer);

    consumer.on('transportclose', () => {
      this.logger.log('Consumer transport closed');
      room.consumers.delete(consumer.id);
    });

    consumer.on('@close', () => {
      this.logger.log('Consumer closed');
      room.consumers.delete(consumer.id);
    });

    const params = {
      id: consumer.id,
      producerId: consumer.producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      type: consumer.type,
      appData: consumer.appData,
      producerPaused: consumer.producerPaused,
    };

    return { consumer, params };
  }

  async getRouterRtpCapabilities(
    roomId: string,
  ): Promise<mediasoup.types.RtpCapabilities> {
    const room = this.getRoom(roomId);
    return room.router.rtpCapabilities;
  }

  private getRoom(roomId: string): Room {
    for (const worker of this.workers) {
      const room = worker.rooms.get(roomId);
      if (room) {
        return room;
      }
    }
    throw new Error(`Room ${roomId} not found`);
  }

  async getRoomStats(roomId: string): Promise<any> {
    const room = this.getRoom(roomId);

    const stats = {
      roomId,
      participantCount: room.peers.size,
      producerCount: room.producers.size,
      consumerCount: room.consumers.size,
      transportCount: room.transports.size,
    };

    return stats;
  }
}
