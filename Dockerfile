# Use Debian-based Node.js 20
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    make \
    g++ \
    bash \
    libc-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (skip mediasoup postinstall first)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Now build mediasoup worker
RUN npm rebuild mediasoup

# Build the NestJS app
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Create non-root user
RUN useradd -m nestjs
USER nestjs

# Expose port
EXPOSE 5050

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5050/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "run", "start:prod"]
