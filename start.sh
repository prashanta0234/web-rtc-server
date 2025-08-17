#!/bin/bash

echo "🚀 Starting Webinar System..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please update .env file with your configuration before running!"
    echo "🔧 Edit .env file and set your JWT_SECRET and other values"
    exit 1
fi

# Check if Redis is running
echo "🔍 Checking Redis connection..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not running!"
    echo "📋 Please start Redis first:"
    echo "   Ubuntu/Debian: sudo systemctl start redis-server"
    echo "   macOS: brew services start redis"
    echo "   Docker: docker run -d -p 6379:6379 redis:alpine"
    exit 1
fi
echo "✅ Redis is running"

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg not found. Recording functionality will be limited."
    echo "📋 Install FFmpeg:"
    echo "   Ubuntu/Debian: sudo apt-get install ffmpeg"
    echo "   macOS: brew install ffmpeg"
fi

# Check if MediaSoup worker is available
if [ ! -f "/usr/local/bin/mediasoup-worker" ]; then
    echo "⚠️  MediaSoup worker not found. WebRTC functionality will not work."
    echo "📋 Install MediaSoup worker:"
    echo "   git clone https://github.com/versatica/mediasoup.git"
    echo "   cd mediasoup && npm install && npm run build"
    echo "   sudo cp worker/out/Release/mediasoup-worker /usr/local/bin/"
fi

# Create recordings directory
mkdir -p recordings

echo "🚀 Starting the application..."
echo "📚 API Documentation will be available at: http://localhost:3000/api"
echo "🌐 WebSocket endpoints:"
echo "   - WebRTC: ws://localhost:3000"
echo "   - Chat: ws://localhost:3000/chat"
echo ""
echo "Press Ctrl+C to stop the application"

# Start the application
npm run start:dev 