import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebRTCController } from './webrtc.controller';
import { WebRTCGateway } from './webrtc.gateway';
import { WebRTCService } from './webrtc.service';

@Module({
  imports: [ConfigModule],
  controllers: [WebRTCController],
  providers: [WebRTCService, WebRTCGateway],
  exports: [WebRTCService],
})
export class WebRTCModule {}
