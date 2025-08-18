import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WebRTCService } from './webrtc.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRoomDto, RoomResponseDto } from '../../common/dto';

@ApiTags('WebRTC')
@Controller('webrtc')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WebRTCController {
  constructor(private webRTCService: WebRTCService) {}

  @Post('rooms')
  @ApiOperation({ summary: 'Create a new webinar room' })
  @ApiResponse({
    status: 201,
    description: 'Room created successfully',
    type: RoomResponseDto,
  })
  async createRoom(
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<RoomResponseDto> {
    try {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const room = await this.webRTCService.createRoom(roomId);

      return {
        id: room.id,
        name: createRoomDto.name,
        description: createRoomDto.description,
        maxParticipants: createRoomDto.maxParticipants || 200,
        participantCount: 0,
        createdAt: new Date(),
        isActive: true,
      };
    } catch (error) {
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }

  @Get('rooms/:roomId/capabilities')
  @ApiOperation({ summary: 'Get router RTP capabilities for a room' })
  @ApiResponse({
    status: 200,
    description: 'RTP capabilities retrieved successfully',
  })
  async getRouterRtpCapabilities(@Param('roomId') roomId: string) {
    try {
      if (!this.webRTCService.isHealthy()) {
        return {
          success: false,
          error:
            'MediaSoup is not available. WebRTC functionality is disabled.',
        };
      }

      // Create room if it doesn't exist
      await this.webRTCService.createRoom(roomId);

      // Get router capabilities from the first available worker
      const workers = (this.webRTCService as any).workers;
      if (workers && workers.length > 0) {
        const rtpCapabilities = workers[0].router.rtpCapabilities;
        return { success: true, rtpCapabilities };
      } else {
        throw new Error('No MediaSoup workers available');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('rooms/:roomId/stats')
  @ApiOperation({ summary: 'Get room statistics' })
  @ApiResponse({
    status: 200,
    description: 'Room stats retrieved successfully',
  })
  async getRoomStats(@Param('roomId') roomId: string) {
    try {
      if (!this.webRTCService.isHealthy()) {
        return {
          success: false,
          error:
            'MediaSoup is not available. WebRTC functionality is disabled.',
        };
      }

      const status = this.webRTCService.getStatus();
      return {
        success: true,
        stats: {
          roomId,
          participantCount: 0,
          producerCount: 0,
          consumerCount: 0,
          transportCount: 0,
          mediaSoupStatus: status,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Delete('rooms/:roomId')
  @ApiOperation({ summary: 'Delete a webinar room' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  async deleteRoom(@Param('roomId') roomId: string) {
    try {
      await this.webRTCService.deleteRoom(roomId);
      return { success: true, message: 'Room deleted successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Get WebRTC service health status' })
  @ApiResponse({
    status: 200,
    description: 'Health status retrieved successfully',
  })
  async getHealth() {
    try {
      const status = this.webRTCService.getStatus();
      return {
        success: true,
        status,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
