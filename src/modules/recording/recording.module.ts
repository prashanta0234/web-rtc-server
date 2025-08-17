import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RecordingController } from './recording.controller';
import { RecordingService } from './recording.service';

@Module({
  imports: [ConfigModule],
  controllers: [RecordingController],
  providers: [RecordingService],
  exports: [RecordingService],
})
export class RecordingModule {}
