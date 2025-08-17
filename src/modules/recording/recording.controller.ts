import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RecordingService } from './recording.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recording')
@UseGuards(JwtAuthGuard)
export class RecordingController {
  constructor(private recordingService: RecordingService) {}

  @Post('rooms/:roomId/start')
  async startRecording(
    @Param('roomId') roomId: string,
    @Body() body: { rtpUrl: string },
  ) {
    const session = await this.recordingService.startRecording(
      roomId,
      body.rtpUrl,
    );
    return { success: true, session };
  }

  @Post('sessions/:recordingId/stop')
  async stopRecording(@Param('recordingId') recordingId: string) {
    const session = await this.recordingService.stopRecording(recordingId);
    return { success: true, session };
  }

  @Get('sessions/:recordingId')
  async getRecordingSession(@Param('recordingId') recordingId: string) {
    const session =
      await this.recordingService.getRecordingSession(recordingId);
    return { success: true, session };
  }

  @Get('rooms/:roomId/recordings')
  async getRoomRecordings(@Param('roomId') roomId: string) {
    const recordings = await this.recordingService.getRoomRecordings(roomId);
    return { success: true, recordings };
  }

  @Delete('sessions/:recordingId')
  async deleteRecording(@Param('recordingId') recordingId: string) {
    await this.recordingService.deleteRecording(recordingId);
    return { success: true, message: 'Recording deleted successfully' };
  }

  @Get('stats')
  async getRecordingStats() {
    const stats = await this.recordingService.getRecordingStats();
    return { success: true, stats };
  }
}
