# 🐳 Docker Setup for Ecommerce Pro

A complete containerized deployment solution for the MERN Ecommerce Pro application using Docker and Docker Compose.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Services](#services)
- [Environment Configuration](#environment-configuration)
- [Available Commands](#available-commands)
- [Development vs Production](#development-vs-production)
- [Docker Hub Deployment](#docker-hub-deployment)
- [Troubleshooting](#troubleshooting)

## 🚀 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- [Node.js](https://nodejs.org/) (for local development)
- [Git](https://git-scm.com/)

## ⚡ Quick Start

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd EcommercePro-main
```

### 2. Environment Configuration
```bash
# Copy the environment template
cp .env.docker .env

# Edit the environment file with your actual values
nano .env  # or use your preferred editor
```

### 3. Build and Run
```bash
# Build and start all services
npm run docker:compose:build

# Or simply
docker-compose up -d --build
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 🏗️ Services Architecture

### Core Services
| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| **mongodb** | mongo:6.0 | 27017 | Primary database |
| **redis** | redis:7-alpine | 6379 | Caching & sessions |
| **backend** | custom build | 5000 | Node.js API server |
| **frontend** | nginx:alpine | 3000 | Static web server |

### Data Persistence
- **MongoDB data**: Stored in `mongodb_data` volume
- **Redis data**: Stored in `redis_data` volume
- **Uploads**: Mounted from `./uploads` directory

## ⚙️ Environment Configuration

### Required Variables
```bash
# Database
MONGODB_URI=mongodb://admin:password123@mongodb:27017/newecom?authSource=admin

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary (Required for banner operations)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174
```

### Optional Variables
```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

## 🛠️ Available Commands

### Docker Commands
```bash
# Build Docker image
npm run docker:build

# Run single container
npm run docker:run

# Start all services
npm run docker:compose

# Build and start all services
npm run docker:compose:build

# Stop all services
npm run docker:compose:down
```

### Docker Compose Commands
```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Scale services
docker-compose up -d --scale backend=2

# Execute commands in container
docker-compose exec backend sh
docker-compose exec mongodb mongosh
```

## 🔧 Development vs Production

### Development Mode
```bash
# Use existing npm scripts
npm run dev

# Or with Docker
docker-compose -f docker-compose.dev.yml up
```

### Production Mode
```bash
# Production build
docker-compose -f docker-compose.yml up -d --build
```

## 📦 Docker Hub Deployment

### Build and Push
```bash
# 1. Build the image
docker build -t yourusername/ecommerce-pro:latest .

# 2. Tag for different versions
docker tag yourusername/ecommerce-pro:latest yourusername/ecommerce-pro:v1.0.0

# 3. Push to Docker Hub
docker push yourusername/ecommerce-pro:latest
docker push yourusername/ecommerce-pro:v1.0.0
```

### Pull and Run
```bash
# Pull from Docker Hub
docker pull yourusername/ecommerce-pro:latest

# Run with environment file
docker run -d \
  --name ecommerce-pro \
  -p 5000:5000 \
  --env-file .env \
  yourusername/ecommerce-pro:latest
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :5000

# Kill the process
sudo kill -9 <PID>
```

#### 2. MongoDB Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin
```

#### 3. Build Failures
```bash
# Clean build
docker-compose down -v
docker system prune -f
docker-compose build --no-cache
```

#### 4. Permission Issues
```bash
# Fix upload directory permissions
sudo chown -R 1001:1001 ./uploads
chmod -R 755 ./uploads
```

### Health Checks
```bash
# Check service status
docker-compose ps

# Check backend health
curl http://localhost:5000/api/health

# Check all services
docker-compose exec backend curl http://localhost:5000/api/health
```

### Logs and Debugging
```bash
# Real-time logs
docker-compose logs -f

# Service-specific logs
docker-compose logs -f backend
docker-compose logs -f mongodb

# Container inspection
docker-compose exec backend sh
docker inspect ecommercepro_backend_1
```

## 📁 File Structure

```
EcommercePro-main/
├── Dockerfile              # Main application build
├── Dockerfile.frontend     # Frontend build with nginx
├── docker-compose.yml      # Production orchestration
├── docker-compose.dev.yml  # Development orchestration
├── nginx.conf             # Nginx configuration
├── mongo-init.js          # MongoDB initialization
├── .dockerignore          # Docker build exclusions
├── .env.docker            # Environment template
└── uploads/               # Persistent file storage
```

## 🔒 Security Considerations

1. **Change Default Passwords**: Update MongoDB and Redis passwords
2. **Use Secrets**: Consider using Docker secrets for sensitive data
3. **Network Isolation**: Services communicate within private network
4. **Non-root User**: Application runs as non-root user
5. **HTTPS**: Configure SSL certificates for production

## 📈 Performance Optimization

1. **Multi-stage Builds**: Smaller production images
2. **Layer Caching**: Optimized Dockerfile structure
3. **Resource Limits**: Set memory and CPU limits in production
4. **Database Indexing**: Proper MongoDB indexes configured
5. **Redis Caching**: Implemented for session storage

## 🌐 Production Deployment

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
PORT=5000
HOSTNAME=0.0.0.0

# Production database
MONGODB_URI=mongodb://username:password@production-db:27017/ecommerce

# Production Redis
REDIS_URL=redis://production-redis:6379
```

### Scaling
```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Load balance with nginx
# Configure upstream blocks in nginx.conf
```

## 📞 Support

For issues and questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review Docker logs: `docker-compose logs`
3. Check service health: `docker-compose ps`
4. Verify environment variables

---

**Note**: This Docker setup is optimized for production deployment. For development, consider using the standard npm scripts with local MongoDB and Redis instances.
