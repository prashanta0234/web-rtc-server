import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { WebRTCModule } from './modules/webrtc/webrtc.module';
import { ChatModule } from './modules/chat/chat.module';
import { RecordingModule } from './modules/recording/recording.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    AuthModule,
    WebRTCModule,
    ChatModule,
    RecordingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
