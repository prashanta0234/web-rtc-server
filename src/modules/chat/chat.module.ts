import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [ConfigModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const Redis = require('ioredis');
        return new Redis({
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          db: configService.get('redis.db'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [ChatService],
})
export class ChatModule {}
