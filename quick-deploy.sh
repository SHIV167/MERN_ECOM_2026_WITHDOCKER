#!/bin/bash

# 🚀 Quick Deploy Script for Ecommerce Pro
# This script handles the complete deployment process

set -e

# Configuration
APP_NAME="ecommerce-pro"
APP_DIR="/opt/ecommerce"
DOCKER_USERNAME="yourusername"  # Change this to your Docker Hub username
REPO_URL="https://github.com/yourusername/ecommerce-pro.git"  # Change to your repo

echo "🚀 Starting Ecommerce Pro deployment..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "❌ Please don't run as root. Create a user and add to docker group."
    exit 1
fi

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please log out and log back in, then run this script again."
    exit 0
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
cd $APP_DIR

# Clone or update repository
if [ -d ".git" ]; then
    echo "📥 Updating repository..."
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone $REPO_URL .
fi

# Setup environment file
if [ ! -f ".env" ]; then
    echo "⚙️ Setting up environment configuration..."
    cp .env.docker .env
    
    echo "📝 Please edit .env file with your configuration:"
    echo "   - MongoDB credentials"
    echo "   - JWT secret"
    echo "   - Cloudinary credentials"
    echo "   - Email settings"
    echo ""
    read -p "Press Enter to continue after editing .env file..."
fi

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Pull latest Docker image
echo "📦 Pulling Docker image..."
docker pull $DOCKER_USERNAME/$APP_NAME:latest

# Update docker-compose.yml for production
echo "🔧 Updating docker-compose configuration..."
sed -i "s/build:/image: $DOCKER_USERNAME\/$APP_NAME:latest/" docker-compose.yml

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy!"
else
    echo "❌ Backend health check failed"
    echo "📋 Container logs:"
    docker-compose logs backend
    exit 1
fi

# Show status
echo "📊 Deployment Status:"
docker-compose ps

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure your domain DNS to point to this server"
echo "2. Set up SSL certificates: sudo certbot --nginx"
echo "3. Configure firewall: sudo ufw allow 80,443"
echo "4. Set up monitoring and backups"
echo ""
echo "🌐 Application URLs:"
echo "   - Backend API: http://$(curl -s ifconfig.me):5000"
echo "   - Health Check: http://$(curl -s ifconfig.me):5000/api/health"
echo ""
echo "📝 Useful Commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Restart services: docker-compose restart"
echo "   - Stop services: docker-compose down"
echo "   - Update: git pull && docker-compose up -d --build"
