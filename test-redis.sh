#!/bin/bash

echo "🚀 Testing Redis Implementation"
echo "================================"

# Start Redis with Docker
echo "📦 Starting Redis container..."
docker run -d --name redis-test -p 6379:6379 redis:7-alpine

# Wait for Redis to start
echo "⏳ Waiting for Redis to start..."
sleep 5

# Test Redis connection
echo "🔍 Testing Redis connection..."
docker exec redis-test redis-cli ping

# Set environment variable for Redis
export REDIS_URL=redis://localhost:6379

# Start the server with Redis
echo "🖥️ Starting server with Redis..."
timeout 30 npm run dev:server &

# Wait for server to start
sleep 10

# Test health endpoint
echo "🏥 Testing health endpoint..."
curl -s http://localhost:5000/api/health | jq '.'

# Test caching (if server has cache endpoints)
echo "💾 Testing Redis caching..."
curl -s http://localhost:5000/api/health
curl -s http://localhost:5000/api/health

# Clean up
echo "🧹 Cleaning up..."
docker stop redis-test
docker rm redis-test
taskkill /F /IM node.exe 2>/dev/null

echo "✅ Redis test completed!"
