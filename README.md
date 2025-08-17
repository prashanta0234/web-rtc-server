<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Scalable Webinar System with WebRTC and Simulcast

A comprehensive Nest.js backend for a scalable webinar system featuring WebRTC video/audio streaming with simulcast support, real-time chat, and server-side recording.

## 🚀 Features

- **WebRTC with Simulcast**: Multi-layer video streaming (720p, 480p, 180p) for optimal bandwidth usage
- **MediaSoup SFU**: Scalable media routing supporting up to 200 participants per room
- **Real-time Chat**: Redis Pub/Sub based chat system with message persistence
- **Server-side Recording**: FFmpeg-based recording with multiple format support
- **JWT Authentication**: Secure participant authentication and authorization
- **REST + WebSocket APIs**: Comprehensive API for room management and real-time communication
- **Scalable Architecture**: Multi-worker setup for handling concurrent rooms

## 🛠 Tech Stack

- **Backend**: Nest.js (TypeScript)
- **WebRTC**: MediaSoup (SFU)
- **Real-time**: Socket.io + Redis Pub/Sub
- **Authentication**: JWT + Passport
- **Recording**: FFmpeg
- **Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- Node.js 18+
- Redis Server
- FFmpeg (for recording)
- MediaSoup worker binary

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment file and configure your settings:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# MediaSoup Configuration
MEDIASOUP_WORKER_BIN=/usr/local/bin/mediasoup-worker
MEDIASOUP_WORKER_LOG_LEVEL=warn
MEDIASOUP_WORKER_RTC_MIN_PORT=10000
MEDIASOUP_WORKER_RTC_MAX_PORT=10100

# WebRTC Configuration
WEBRTC_LISTEN_IP=0.0.0.0
WEBRTC_ANNOUNCED_IP=127.0.0.1

# Recording Configuration
RECORDING_PATH=./recordings
FFMPEG_PATH=/usr/bin/ffmpeg

# Room Configuration
MAX_PARTICIPANTS_PER_ROOM=200
ROOM_TIMEOUT_MINUTES=120

# Simulcast Configuration
SIMULCAST_LAYERS=3
SIMULCAST_MAX_BITRATE=1000000
SIMULCAST_MIN_BITRATE=100000
```

### 3. Start Redis

```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# macOS
brew install redis
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### 4. Install FFmpeg

```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### 5. Install MediaSoup Worker

```bash
# Build from source (recommended)
git clone https://github.com/versatica/mediasoup.git
cd mediasoup
npm install
npm run build
sudo cp worker/out/Release/mediasoup-worker /usr/local/bin/
```

### 6. Run the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`
API Documentation: `http://localhost:3000/api`

## 📚 API Documentation

### Authentication

#### Generate Token

```http
POST /auth/token
Content-Type: application/json

{
  "participantName": "John Doe",
  "role": "host"
}
```

#### Validate Token

```http
POST /auth/validate
Authorization: Bearer <token>
```

### WebRTC Room Management

#### Create Room

```http
POST /webrtc/rooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Webinar",
  "description": "A great webinar session",
  "maxParticipants": 200
}
```

#### Get Room Capabilities

```http
GET /webrtc/rooms/{roomId}/capabilities
Authorization: Bearer <token>
```

#### Get Room Stats

```http
GET /webrtc/rooms/{roomId}/stats
Authorization: Bearer <token>
```

#### Delete Room

```http
DELETE /webrtc/rooms/{roomId}
Authorization: Bearer <token>
```

### Chat System

#### Get Messages

```http
GET /chat/rooms/{roomId}/messages?limit=50
Authorization: Bearer <token>
```

#### Get Participants

```http
GET /chat/rooms/{roomId}/participants
Authorization: Bearer <token>
```

#### Join Chat Room

```http
POST /chat/rooms/{roomId}/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "participantId": "user123",
  "participantName": "John Doe"
}
```

### Recording

#### Start Recording

```http
POST /recording/rooms/{roomId}/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "rtpUrl": "rtp://127.0.0.1:5004"
}
```

#### Stop Recording

```http
POST /recording/sessions/{recordingId}/stop
Authorization: Bearer <token>
```

#### Get Recording Stats

```http
GET /recording/stats
Authorization: Bearer <token>
```

## 🔌 WebSocket Events

### WebRTC Signaling

Connect to WebSocket at `ws://localhost:3000`

#### Join Room

```javascript
socket.emit('join-room', {
  roomId: 'room123',
  participantName: 'John Doe',
  role: 'host',
});
```

#### Get Router Capabilities

```javascript
socket.emit('get-router-rtp-capabilities', {
  roomId: 'room123',
});
```

#### Create Transport

```javascript
socket.emit('create-transport', {
  roomId: 'room123',
  direction: 'send', // or 'recv'
});
```

#### Connect Transport

```javascript
socket.emit('connect-transport', {
  roomId: 'room123',
  transportId: 'transport123',
  dtlsParameters: {
    /* DTLS parameters */
  },
});
```

#### Produce Media

```javascript
socket.emit('produce', {
  roomId: 'room123',
  transportId: 'transport123',
  kind: 'video', // or 'audio'
  rtpParameters: {
    /* RTP parameters */
  },
  appData: { mediaPeerId: 'peer123' },
});
```

#### Consume Media

```javascript
socket.emit('consume', {
  roomId: 'room123',
  transportId: 'transport123',
  producerId: 'producer123',
  rtpCapabilities: {
    /* RTP capabilities */
  },
});
```

### Chat Events

Connect to WebSocket at `ws://localhost:3000/chat`

#### Join Chat

```javascript
socket.emit('join-chat', {
  roomId: 'room123',
  participantId: 'user123',
  participantName: 'John Doe',
});
```

#### Send Message

```javascript
socket.emit('send-message', {
  roomId: 'room123',
  message: {
    content: 'Hello everyone!',
    type: 'text',
  },
  senderId: 'user123',
  senderName: 'John Doe',
});
```

#### Get Participants

```javascript
socket.emit('get-participants', {
  roomId: 'room123',
});
```

## 🎥 Simulcast Configuration

The system is configured with 3-layer simulcast for optimal bandwidth usage:

- **Layer 0**: 180p (150 kbps) - Low bandwidth
- **Layer 1**: 480p (500 kbps) - Medium bandwidth
- **Layer 2**: 720p (1000 kbps) - High bandwidth

### MediaSoup Configuration

```typescript
// Video codecs with simulcast support
{
  kind: 'video',
  mimeType: 'video/VP8',
  clockRate: 90000,
  parameters: {
    'x-google-start-bitrate': 1000,
  },
},
{
  kind: 'video',
  mimeType: 'video/H264',
  clockRate: 90000,
  parameters: {
    'packetization-mode': 1,
    'profile-level-id': '42e01f',
    'level-asymmetry-allowed': 1,
  },
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Host, speaker, and participant roles
- **Room-level Security**: Participants can only access authorized rooms
- **Transport Security**: DTLS encryption for all WebRTC connections

## 📊 Scalability

- **Multi-worker Architecture**: 4 MediaSoup workers by default
- **Redis Pub/Sub**: Scalable real-time messaging
- **Room Isolation**: Each room operates independently
- **Load Balancing**: Automatic worker distribution

## 🎯 Performance Optimization

- **Simulcast**: Automatic quality adaptation based on bandwidth
- **Connection Pooling**: Efficient Redis connection management
- **Memory Management**: Automatic cleanup of inactive sessions
- **Recording Optimization**: Efficient FFmpeg pipeline configuration

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Environment Variables

| Variable               | Description                  | Default                         |
| ---------------------- | ---------------------------- | ------------------------------- |
| `PORT`                 | Server port                  | 3000                            |
| `JWT_SECRET`           | JWT signing secret           | -                               |
| `REDIS_HOST`           | Redis server host            | localhost                       |
| `REDIS_PORT`           | Redis server port            | 6379                            |
| `MEDIASOUP_WORKER_BIN` | MediaSoup worker binary path | /usr/local/bin/mediasoup-worker |
| `WEBRTC_LISTEN_IP`     | WebRTC listen IP             | 0.0.0.0                         |
| `WEBRTC_ANNOUNCED_IP`  | WebRTC announced IP          | 127.0.0.1                       |
| `RECORDING_PATH`       | Recording output directory   | ./recordings                    |
| `FFMPEG_PATH`          | FFmpeg binary path           | /usr/bin/ffmpeg                 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the API documentation at `/api`
- Review the WebSocket event documentation above
