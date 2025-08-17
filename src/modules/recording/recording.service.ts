import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface RecordingSession {
  id: string;
  roomId: string;
  status: 'recording' | 'stopped' | 'processing' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  outputPath?: string;
  duration?: number;
  fileSize?: number;
}

@Injectable()
export class RecordingService {
  private readonly logger = new Logger(RecordingService.name);
  private activeRecordings = new Map<string, RecordingSession>();

  constructor(private configService: ConfigService) {
    // Ensure recording directory exists
    const recordingPath = this.configService.get('recording.path');
    if (!fs.existsSync(recordingPath)) {
      fs.mkdirSync(recordingPath, { recursive: true });
    }
  }

  async startRecording(
    roomId: string,
    rtpUrl: string,
  ): Promise<RecordingSession> {
    const recordingId = uuidv4();
    const outputPath = path.join(
      this.configService.get('recording.path'),
      `${roomId}_${recordingId}.mp4`,
    );

    const session: RecordingSession = {
      id: recordingId,
      roomId,
      status: 'recording',
      startTime: new Date(),
      outputPath,
    };

    this.activeRecordings.set(recordingId, session);

    this.logger.log(
      `Started recording session ${recordingId} for room ${roomId}`,
    );
    return session;
  }

  async stopRecording(recordingId: string): Promise<RecordingSession> {
    const session = this.activeRecordings.get(recordingId);
    if (!session) {
      throw new Error(`Recording session ${recordingId} not found`);
    }

    session.status = 'stopped';
    session.endTime = new Date();
    session.duration = session.endTime.getTime() - session.startTime.getTime();

    this.logger.log(`Stopped recording session ${recordingId}`);
    return session;
  }

  async getRecordingSession(
    recordingId: string,
  ): Promise<RecordingSession | null> {
    return this.activeRecordings.get(recordingId) || null;
  }

  async getRoomRecordings(roomId: string): Promise<RecordingSession[]> {
    const recordings: RecordingSession[] = [];

    for (const session of this.activeRecordings.values()) {
      if (session.roomId === roomId) {
        recordings.push(session);
      }
    }

    return recordings.sort(
      (a, b) => b.startTime.getTime() - a.startTime.getTime(),
    );
  }

  async deleteRecording(recordingId: string): Promise<void> {
    const session = this.activeRecordings.get(recordingId);
    if (!session) {
      throw new Error(`Recording session ${recordingId} not found`);
    }

    // Stop recording if it's still active
    if (session.status === 'recording') {
      await this.stopRecording(recordingId);
    }

    // Delete file if it exists
    if (session.outputPath && fs.existsSync(session.outputPath)) {
      fs.unlinkSync(session.outputPath);
      this.logger.log(`Deleted recording file: ${session.outputPath}`);
    }

    this.activeRecordings.delete(recordingId);
  }

  async getRecordingStats(): Promise<{
    activeRecordings: number;
    totalRecordings: number;
    totalDuration: number;
    totalFileSize: number;
  }> {
    let activeCount = 0;
    let totalDuration = 0;
    let totalFileSize = 0;

    for (const session of this.activeRecordings.values()) {
      if (session.status === 'recording') {
        activeCount++;
      }

      if (session.duration) {
        totalDuration += session.duration;
      }

      if (session.fileSize) {
        totalFileSize += session.fileSize;
      }
    }

    return {
      activeRecordings: activeCount,
      totalRecordings: this.activeRecordings.size,
      totalDuration,
      totalFileSize,
    };
  }
}
