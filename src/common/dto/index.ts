import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ParticipantRole {
  HOST = 'host',
  SPEAKER = 'speaker',
  PARTICIPANT = 'participant',
}

export enum ParticipantStatus {
  ACTIVE = 'active',
  MUTED = 'muted',
  BANNED = 'banned',
}

// Room DTOs
export class CreateRoomDto {
  @ApiProperty({ description: 'Room name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Room description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Maximum participants', default: 200 })
  @IsOptional()
  maxParticipants?: number;
}

export class JoinRoomDto {
  @ApiProperty({ description: 'Room ID' })
  @IsUUID()
  roomId: string;

  @ApiProperty({ description: 'Participant name' })
  @IsString()
  @IsNotEmpty()
  participantName: string;

  @ApiPropertyOptional({
    description: 'Participant role',
    enum: ParticipantRole,
  })
  @IsEnum(ParticipantRole)
  @IsOptional()
  role?: ParticipantRole = ParticipantRole.PARTICIPANT;
}

// Participant DTOs
export class UpdateParticipantDto {
  @ApiPropertyOptional({ description: 'Mute/unmute participant' })
  @IsBoolean()
  @IsOptional()
  muted?: boolean;

  @ApiPropertyOptional({
    description: 'Participant role',
    enum: ParticipantRole,
  })
  @IsEnum(ParticipantRole)
  @IsOptional()
  role?: ParticipantRole;
}

export class KickParticipantDto {
  @ApiProperty({ description: 'Participant ID to kick' })
  @IsUUID()
  participantId: string;

  @ApiPropertyOptional({ description: 'Reason for kicking' })
  @IsString()
  @IsOptional()
  reason?: string;
}

// Chat DTOs
export class SendMessageDto {
  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Message type', default: 'text' })
  @IsString()
  @IsOptional()
  type?: string = 'text';
}

// WebRTC DTOs
export class CreateTransportDto {
  @ApiProperty({ description: 'Transport direction', enum: ['send', 'recv'] })
  @IsString()
  direction: 'send' | 'recv';
}

export class ConnectTransportDto {
  @ApiProperty({ description: 'Transport ID' })
  @IsString()
  transportId: string;

  @ApiProperty({ description: 'DTLS parameters' })
  dtlsParameters: any;
}

export class ProduceDto {
  @ApiProperty({ description: 'Transport ID' })
  @IsString()
  transportId: string;

  @ApiProperty({ description: 'Kind of media', enum: ['audio', 'video'] })
  @IsString()
  kind: 'audio' | 'video';

  @ApiProperty({ description: 'RTP parameters' })
  rtpParameters: any;

  @ApiPropertyOptional({ description: 'App data' })
  appData?: any;
}

export class ConsumeDto {
  @ApiProperty({ description: 'Transport ID' })
  @IsString()
  transportId: string;

  @ApiProperty({ description: 'Producer ID' })
  @IsString()
  producerId: string;

  @ApiPropertyOptional({ description: 'RTP capabilities' })
  rtpCapabilities?: any;
}

// Response DTOs
export class RoomResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  maxParticipants: number;

  @ApiProperty()
  participantCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  isActive: boolean;
}

export class ParticipantResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ParticipantRole })
  role: ParticipantRole;

  @ApiProperty({ enum: ParticipantStatus })
  status: ParticipantStatus;

  @ApiProperty()
  isMuted: boolean;

  @ApiProperty()
  joinedAt: Date;
}

export class MessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  senderName: string;

  @ApiProperty()
  timestamp: Date;
}
