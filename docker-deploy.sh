#!/bin/bash

# Docker Build and Push Script for Ecommerce Pro
# Replace 'yourusername' with your actual Docker Hub username

set -e

DOCKER_USERNAME="yourusername"
IMAGE_NAME="ecommerce-pro"
VERSION="v1.0.0"

echo "🐳 Building Docker image for Ecommerce Pro..."

# Build the image
echo "📦 Building image: $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
docker build -t $DOCKER_USERNAME/$IMAGE_NAME:$VERSION .
docker tag $DOCKER_USERNAME/$IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:latest

# Test locally
echo "🧪 Testing image locally..."
docker run -d --name ecommerce-test -p 5000:5000 --env-file .env $DOCKER_USERNAME/$IMAGE_NAME:latest

# Wait for container to start
sleep 10

# Check health
echo "🏥 Checking container health..."
if curl -f http://localhost:5000/api/health; then
    echo "✅ Container is healthy!"
else
    echo "❌ Container health check failed"
    docker stop ecommerce-test
    docker rm ecommerce-test
    exit 1
fi

# Stop test container
docker stop ecommerce-test
docker rm ecommerce-test

# Login to Docker Hub
echo "🔐 Logging into Docker Hub..."
docker login

# Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
docker push $DOCKER_USERNAME/$IMAGE_NAME:$VERSION
docker push $DOCKER_USERNAME/$IMAGE_NAME:latest

echo "✅ Successfully pushed to Docker Hub!"
echo "📋 Image details:"
echo "   - Repository: $DOCKER_USERNAME/$IMAGE_NAME"
echo "   - Version: $VERSION"
echo "   - Latest: $DOCKER_USERNAME/$IMAGE_NAME:latest"
echo ""
echo "🚀 To deploy: docker run -d -p 5000:5000 --env-file .env $DOCKER_USERNAME/$IMAGE_NAME:latest"
