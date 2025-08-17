import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateToken(
    userId: string,
    username: string,
    role: string,
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      username,
      role,
    };

    return this.jwtService.sign(payload);
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async generateParticipantToken(
    participantName: string,
    role: string = 'participant',
  ): Promise<string> {
    const userId = uuidv4();
    return this.generateToken(userId, participantName, role);
  }
}
