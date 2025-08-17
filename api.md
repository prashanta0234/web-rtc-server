# 🎥 Webinar System API Documentation

## Overview

Complete API specification for a scalable webinar system with WebRTC, Simulcast, Chat, and Recording capabilities.

**Base URL**: `http://localhost:5050`  
**WebSocket URL**: `ws://localhost:5050`  
**Chat WebSocket URL**: `ws://localhost:5050/chat`

---

## 🔐 Authentication

### Generate JWT Token

```http
POST /auth/token
Content-Type: application/json

{
  "participantName": "John Doe",
  "role": "host"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Use this token in the Authorization header for all protected endpoints:**

```http
Authorization: Bearer <your-jwt-token>
```

### Validate Token

```http
POST /auth/validate
Authorization: Bearer <token>
```

**Response:**

```json
{
  "valid": true
}
```

---

## 🎥 WebRTC Room Management

### Create Room

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

**Response:**

```json
{
  "id": "room_1734567890_abc123def",
  "name": "My Webinar",
  "description": "A great webinar session",
  "maxParticipants": 200,
  "participantCount": 0,
  "createdAt": "2025-08-15T18:34:56.789Z",
  "isActive": true
}
```

### Get Room Capabilities

```http
GET /webrtc/rooms/{roomId}/capabilities
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "rtpCapabilities": {
    "codecs": [...],
    "headerExtensions": [...],
    "fecMechanisms": [...]
  }
}
```

### Get Room Statistics

```http
GET /webrtc/rooms/{roomId}/stats
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "stats": {
    "roomId": "room_123",
    "participantCount": 5,
    "producerCount": 8,
    "consumerCount": 12,
    "transportCount": 10
  }
}
```

### Delete Room

```http
DELETE /webrtc/rooms/{roomId}
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Room deleted successfully"
}
```

---

## 💬 Chat System

### Get Chat Messages

```http
GET /chat/rooms/{roomId}/messages?limit=50
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "msg_123",
    "content": "Hello everyone!",
    "type": "text",
    "senderId": "user_456",
    "senderName": "John Doe",
    "timestamp": "2025-08-15T18:34:56.789Z"
  }
]
```

### Get Room Participants

```http
GET /chat/rooms/{roomId}/participants
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "participants": [
    {
      "id": "user_123",
      "name": "John Doe",
      "joinedAt": "2025-08-15T18:30:00.000Z"
    }
  ]
}
```

### Join Chat Room

```http
POST /chat/rooms/{roomId}/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "participantId": "user_123",
  "participantName": "John Doe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Joined room successfully"
}
```

### Leave Chat Room

```http
POST /chat/rooms/{roomId}/leave
Authorization: Bearer <token>
Content-Type: application/json

{
  "participantId": "user_123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Left room successfully"
}
```

---

## 🎬 Recording System

### Start Recording

```http
POST /recording/rooms/{roomId}/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "rtpUrl": "rtp://127.0.0.1:5004"
}
```

**Response:**

```json
{
  "success": true,
  "session": {
    "id": "rec_123",
    "roomId": "room_456",
    "status": "recording",
    "startTime": "2025-08-15T18:34:56.789Z",
    "outputPath": "./recordings/room_456_rec_123.mp4"
  }
}
```

### Stop Recording

```http
POST /recording/sessions/{recordingId}/stop
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "session": {
    "id": "rec_123",
    "status": "stopped",
    "endTime": "2025-08-15T18:44:56.789Z",
    "duration": 600000
  }
}
```

### Get Recording Session

```http
GET /recording/sessions/{recordingId}
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "session": {
    "id": "rec_123",
    "roomId": "room_456",
    "status": "completed",
    "startTime": "2025-08-15T18:34:56.789Z",
    "endTime": "2025-08-15T18:44:56.789Z",
    "duration": 600000,
    "outputPath": "./recordings/room_456_rec_123.mp4"
  }
}
```

### Get Room Recordings

```http
GET /recording/rooms/{roomId}/recordings
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "recordings": [
    {
      "id": "rec_123",
      "status": "completed",
      "startTime": "2025-08-15T18:34:56.789Z",
      "duration": 600000
    }
  ]
}
```

### Delete Recording

```http
DELETE /recording/sessions/{recordingId}
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Recording deleted successfully"
}
```

### Get Recording Statistics

```http
GET /recording/stats
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "stats": {
    "activeRecordings": 2,
    "totalRecordings": 15,
    "totalDuration": 3600000,
    "totalFileSize": 0
  }
}
```

---

## 🔌 WebSocket Events

### WebRTC Signaling Connection

Connect to: `ws://localhost:5050`

#### Emit Events:

**Join Room:**

```javascript
socket.emit('join-room', {
  roomId: 'room_123',
  participantName: 'John Doe',
  role: 'host',
});
```

**Get Router Capabilities:**

```javascript
socket.emit('get-router-rtp-capabilities', {
  roomId: 'room_123',
});
```

**Create Transport:**

```javascript
socket.emit('create-transport', {
  roomId: 'room_123',
  direction: 'send', // or 'recv'
});
```

**Connect Transport:**

```javascript
socket.emit('connect-transport', {
  roomId: 'room_123',
  transportId: 'transport_123',
  dtlsParameters: {
    /* DTLS parameters */
  },
});
```

**Produce Media:**

```javascript
socket.emit('produce', {
  roomId: 'room_123',
  transportId: 'transport_123',
  kind: 'video', // or 'audio'
  rtpParameters: {
    /* RTP parameters */
  },
  appData: { mediaPeerId: 'peer_123' },
});
```

**Consume Media:**

```javascript
socket.emit('consume', {
  roomId: 'room_123',
  transportId: 'transport_123',
  producerId: 'producer_123',
  rtpCapabilities: {
    /* RTP capabilities */
  },
});
```

#### Listen Events:

**Participant Joined:**

```javascript
socket.on('participant-joined', (data) => {
  console.log('New participant:', data);
  // data: { participantId, participantName, role }
});
```

**Participant Left:**

```javascript
socket.on('participant-left', (data) => {
  console.log('Participant left:', data);
  // data: { participantId }
});
```

**New Producer:**

```javascript
socket.on('new-producer', (data) => {
  console.log('New producer:', data);
  // data: { producerId, kind, appData }
});
```

---

### Chat Connection

Connect to: `ws://localhost:5050/chat`

#### Emit Events:

**Join Chat:**

```javascript
chatSocket.emit('join-chat', {
  roomId: 'room_123',
  participantId: 'user_123',
  participantName: 'John Doe',
});
```

**Send Message:**

```javascript
chatSocket.emit('send-message', {
  roomId: 'room_123',
  message: {
    content: 'Hello everyone!',
    type: 'text',
  },
  senderId: 'user_123',
  senderName: 'John Doe',
});
```

**Leave Chat:**

```javascript
chatSocket.emit('leave-chat', {
  roomId: 'room_123',
  participantId: 'user_123',
});
```

**Get Participants:**

```javascript
chatSocket.emit('get-participants', {
  roomId: 'room_123',
});
```

**Set Status:**

```javascript
chatSocket.emit('set-status', {
  roomId: 'room_123',
  participantId: 'user_123',
  status: 'muted',
});
```

#### Listen Events:

**Chat History:**

```javascript
chatSocket.on('chat-history', (messages) => {
  console.log('Chat history:', messages);
  // messages: Array of MessageResponseDto
});
```

**New Message:**

```javascript
chatSocket.on('new-message', (message) => {
  console.log('New message:', message);
  // message: MessageResponseDto
});
```

**Participants List:**

```javascript
chatSocket.on('participants-list', (participants) => {
  console.log('Participants:', participants);
  // participants: Array of participant objects
});
```

**Participant Status Changed:**

```javascript
chatSocket.on('participant-status-changed', (data) => {
  console.log('Status changed:', data);
  // data: { participantId, status }
});
```

---

## 📋 Data Types & Enums

### ParticipantRole

```typescript
enum ParticipantRole {
  HOST = 'host',
  SPEAKER = 'speaker',
  PARTICIPANT = 'participant',
}
```

### ParticipantStatus

```typescript
enum ParticipantStatus {
  ACTIVE = 'active',
  MUTED = 'muted',
  BANNED = 'banned',
}
```

### MessageResponseDto

```typescript
interface MessageResponseDto {
  id: string;
  content: string;
  type: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
}
```

### Room Interface

```typescript
interface Room {
  id: string;
  name: string;
  description: string;
  maxParticipants: number;
  participantCount: number;
  createdAt: Date;
  isActive: boolean;
}
```

---

## 🚀 Next.js Integration Guide

### 1. Install Dependencies

```bash
npm install socket.io-client axios
```

### 2. Create API Client

```typescript
// lib/api.ts
const API_BASE = 'http://localhost:5050';

export const api = {
  auth: {
    getToken: async (data: { participantName: string; role: string }) => {
      const response = await fetch(`${API_BASE}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    validateToken: async (token: string) => {
      const response = await fetch(`${API_BASE}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
  },

  webrtc: {
    createRoom: async (data: any, token: string) => {
      const response = await fetch(`${API_BASE}/webrtc/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    getRoomCapabilities: async (roomId: string, token: string) => {
      const response = await fetch(
        `${API_BASE}/webrtc/rooms/${roomId}/capabilities`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.json();
    },

    getRoomStats: async (roomId: string, token: string) => {
      const response = await fetch(`${API_BASE}/webrtc/rooms/${roomId}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
  },

  chat: {
    getMessages: async (roomId: string, token: string, limit = 50) => {
      const response = await fetch(
        `${API_BASE}/chat/rooms/${roomId}/messages?limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.json();
    },

    getParticipants: async (roomId: string, token: string) => {
      const response = await fetch(
        `${API_BASE}/chat/rooms/${roomId}/participants`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.json();
    },
  },

  recording: {
    startRecording: async (roomId: string, data: any, token: string) => {
      const response = await fetch(
        `${API_BASE}/recording/rooms/${roomId}/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );
      return response.json();
    },

    stopRecording: async (recordingId: string, token: string) => {
      const response = await fetch(
        `${API_BASE}/recording/sessions/${recordingId}/stop`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.json();
    },
  },
};
```

### 3. WebSocket Connection Setup

```typescript
// lib/websocket.ts
import { io, Socket } from 'socket.io-client';

export const connectWebRTC = (url: string): Socket => io(url);
export const connectChat = (url: string): Socket => io(`${url}/chat`);

export const createWebRTCConnection = (
  roomId: string,
  participantName: string,
  role: string,
) => {
  const socket = connectWebRTC('http://localhost:5050');

  socket.on('connect', () => {
    console.log('Connected to WebRTC server');
    socket.emit('join-room', { roomId, participantName, role });
  });

  return socket;
};

export const createChatConnection = (
  roomId: string,
  participantId: string,
  participantName: string,
) => {
  const socket = connectChat('http://localhost:5050');

  socket.on('connect', () => {
    console.log('Connected to chat server');
    socket.emit('join-chat', { roomId, participantId, participantName });
  });

  return socket;
};
```

### 4. React Hook Example

```typescript
// hooks/useWebinar.ts
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { createWebRTCConnection, createChatConnection } from '../lib/websocket';

export const useWebinar = (roomId: string, token: string) => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize connections
    const webrtcSocket = createWebRTCConnection(roomId, 'User', 'participant');
    const chatSocket = createChatConnection(roomId, 'user_123', 'User');

    // Load initial data
    const loadRoomData = async () => {
      try {
        const [roomData, participantsData, messagesData] = await Promise.all([
          api.webrtc.getRoomStats(roomId, token),
          api.chat.getParticipants(roomId, token),
          api.chat.getMessages(roomId, token),
        ]);

        setRoom(roomData);
        setParticipants(participantsData.participants);
        setMessages(messagesData);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to load room data:', error);
      }
    };

    loadRoomData();

    // Cleanup
    return () => {
      webrtcSocket.disconnect();
      chatSocket.disconnect();
    };
  }, [roomId, token]);

  return {
    room,
    participants,
    messages,
    isConnected,
  };
};
```

### 5. Component Example

```typescript
// components/WebinarRoom.tsx
import React, { useState } from 'react';
import { useWebinar } from '../hooks/useWebinar';

export const WebinarRoom: React.FC<{ roomId: string; token: string }> = ({ roomId, token }) => {
  const { room, participants, messages, isConnected } = useWebinar(roomId, token);
  const [newMessage, setNewMessage] = useState('');

  if (!isConnected) {
    return <div>Connecting to room...</div>;
  }

  return (
    <div className="webinar-room">
      <div className="video-section">
        <h2>Room: {room?.name}</h2>
        <div className="participants">
          {participants.map(p => (
            <div key={p.id} className="participant">
              {p.name}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-section">
        <div className="messages">
          {messages.map(msg => (
            <div key={msg.id} className="message">
              <strong>{msg.senderName}:</strong> {msg.content}
            </div>
          ))}
        </div>

        <div className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button>Send</button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔧 Environment Variables

Create a `.env.local` file in your Next.js project:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5050
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:5050
```

---

## 📱 API Testing

### Test with curl:

**Get Token:**

```bash
curl -X POST http://localhost:5050/auth/token \
  -H "Content-Type: application/json" \
  -d '{"participantName":"Test User","role":"host"}'
```

**Create Room:**

```bash
curl -X POST http://localhost:5050/webrtc/rooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Room","description":"Test","maxParticipants":50}'
```

**Get Room Stats:**

```bash
curl -X GET http://localhost:5050/webrtc/rooms/ROOM_ID/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚨 Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

Common HTTP Status Codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔒 Security Notes

1. **JWT tokens expire after 24 hours** (configurable)
2. **All protected endpoints require valid JWT token**
3. **CORS is enabled for WebRTC compatibility**
4. **Rate limiting should be implemented in production**

---

## 📚 Additional Resources

- **Swagger Documentation**: `http://localhost:5050/api`
- **MediaSoup Documentation**: https://mediasoup.org/
- **Socket.io Documentation**: https://socket.io/docs/
- **WebRTC Documentation**: https://webrtc.org/

---

This API specification provides everything needed to build a complete Next.js frontend for your webinar system! 🎥✨
