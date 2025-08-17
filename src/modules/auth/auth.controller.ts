import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('token')
  @ApiOperation({ summary: 'Generate participant token' })
  @ApiResponse({ status: 201, description: 'Token generated successfully' })
  async generateToken(
    @Body() body: { participantName: string; role?: string },
  ): Promise<{ token: string }> {
    const token = await this.authService.generateParticipantToken(
      body.participantName,
      body.role,
    );
    return { token };
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Validate token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  async validateToken(): Promise<{ valid: boolean }> {
    return { valid: true };
  }
}
