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
  }

  @Get('rooms/:roomId/capabilities')
  @ApiOperation({ summary: 'Get router RTP capabilities for a room' })
  @ApiResponse({
    status: 200,
    description: 'RTP capabilities retrieved successfully',
  })
  async getRouterRtpCapabilities(@Param('roomId') roomId: string) {
    const rtpCapabilities =
      await this.webRTCService.getRouterRtpCapabilities(roomId);
    return { success: true, rtpCapabilities };
  }

  @Get('rooms/:roomId/stats')
  @ApiOperation({ summary: 'Get room statistics' })
  @ApiResponse({
    status: 200,
    description: 'Room stats retrieved successfully',
  })
  async getRoomStats(@Param('roomId') roomId: string) {
    const stats = await this.webRTCService.getRoomStats(roomId);
    return { success: true, stats };
  }

  @Delete('rooms/:roomId')
  @ApiOperation({ summary: 'Delete a webinar room' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  async deleteRoom(@Param('roomId') roomId: string) {
    await this.webRTCService.deleteRoom(roomId);
    return { success: true, message: 'Room deleted successfully' };
  }
}
