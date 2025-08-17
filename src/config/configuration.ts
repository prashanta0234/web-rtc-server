export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret:
      process.env.JWT_SECRET ||
      'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  mediasoup: {
    worker: {
      bin:
        process.env.MEDIASOUP_WORKER_BIN || '/usr/local/bin/mediasoup-worker',
      logLevel: process.env.MEDIASOUP_WORKER_LOG_LEVEL || 'warn',
      logTag: process.env.MEDIASOUP_WORKER_LOG_TAG || 'worker',
      rtcMinPort:
        parseInt(process.env.MEDIASOUP_WORKER_RTC_MIN_PORT, 10) || 10000,
      rtcMaxPort:
        parseInt(process.env.MEDIASOUP_WORKER_RTC_MAX_PORT, 10) || 10100,
    },
    webRtc: {
      listenIp: process.env.WEBRTC_LISTEN_IP || '0.0.0.0',
      announcedIp: process.env.WEBRTC_ANNOUNCED_IP || '127.0.0.1',
    },
  },

  recording: {
    path: process.env.RECORDING_PATH || './recordings',
    ffmpegPath: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',
  },

  room: {
    maxParticipants: parseInt(process.env.MAX_PARTICIPANTS_PER_ROOM, 10) || 200,
    timeoutMinutes: parseInt(process.env.ROOM_TIMEOUT_MINUTES, 10) || 120,
  },

  simulcast: {
    layers: parseInt(process.env.SIMULCAST_LAYERS, 10) || 3,
    maxBitrate: parseInt(process.env.SIMULCAST_MAX_BITRATE, 10) || 1000000,
    minBitrate: parseInt(process.env.SIMULCAST_MIN_BITRATE, 10) || 100000,
  },
});
