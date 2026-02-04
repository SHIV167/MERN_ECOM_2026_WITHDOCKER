# 🚀 Deployment Guide for Ecommerce Pro

Complete guide for deploying the Dockerized Ecommerce Pro application on any machine or server.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Deployment](#quick-deployment)
- [Production Server Setup](#production-server-setup)
- [Cloud Platform Deployment](#cloud-platform-deployment)
- [Environment Configuration](#environment-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## 🚀 Prerequisites

### Required Software
```bash
# Docker Engine (version 20.10+)
# Docker Compose (version 2.0+)
# Git (for cloning repository)
```

### System Requirements
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 10GB free space
- **CPU**: 2+ cores recommended
- **OS**: Linux (Ubuntu 20.04+, CentOS 8+), Windows Server, or macOS

## ⚡ Quick Deployment

### Method 1: Using Docker Hub Image
```bash
# 1. Clone repository (for configuration files)
git clone <your-repo-url>
cd EcommercePro-main

# 2. Copy and configure environment
cp .env.docker .env
nano .env  # Edit with your values

# 3. Pull and run from Docker Hub
docker run -d \
  --name ecommerce-pro \
  -p 5000:5000 \
  --env-file .env \
  --restart unless-stopped \
  yourusername/ecommerce-pro:latest
```

### Method 2: Using Docker Compose (Recommended)
```bash
# 1. Clone repository
git clone <your-repo-url>
cd EcommercePro-main

# 2. Configure environment
cp .env.docker .env
nano .env

# 3. Update docker-compose.yml with your Docker Hub image
sed -i 's/build:/image: yourusername\/ecommerce-pro:latest/' docker-compose.yml

# 4. Deploy
docker-compose up -d
```

## 🖥️ Production Server Setup

### Ubuntu/Debian Server
```bash
#!/bin/bash
# Ubuntu Server Setup Script

# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Create application directory
sudo mkdir -p /opt/ecommerce
sudo chown $USER:$USER /opt/ecommerce
cd /opt/ecommerce

# 5. Clone and setup
git clone <your-repo-url> .
cp .env.docker .env
nano .env

# 6. Deploy
docker-compose up -d

# 7. Setup firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 5000  # Backend (if needed)
sudo ufw enable
```

### CentOS/RHEL Server
```bash
#!/bin/bash
# CentOS/RHEL Server Setup Script

# 1. Install dependencies
sudo yum update -y
sudo yum install -y git curl

# 2. Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# 3. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Create application directory
sudo mkdir -p /opt/ecommerce
sudo chown $USER:$USER /opt/ecommerce
cd /opt/ecommerce

# 5. Clone and setup
git clone <your-repo-url> .
cp .env.docker .env
nano .env

# 6. Deploy
docker-compose up -d

# 7. Setup firewall
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## ☁️ Cloud Platform Deployment

### AWS EC2
```bash
# 1. Launch EC2 instance (Ubuntu 20.04 LTS recommended)
# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Run Ubuntu setup script (above)
# 4. Configure security groups:
#    - Port 22 (SSH)
#    - Port 80 (HTTP)
#    - Port 443 (HTTPS)
#    - Port 5000 (Backend API)

# 5. Deploy application
cd /opt/ecommerce
docker-compose up -d
```

### DigitalOcean Droplet
```bash
# 1. Create Droplet (Ubuntu 20.04+)
# 2. SSH into droplet
ssh root@your-droplet-ip

# 3. Run Ubuntu setup script
# 4. Deploy application
cd /opt/ecommerce
docker-compose up -d
```

### Google Cloud Platform
```bash
# 1. Create VM instance (Ubuntu 20.04+)
# 2. SSH via gcloud
gcloud compute ssh instance-name --zone=your-zone

# 3. Run Ubuntu setup script
# 4. Configure firewall rules:
gcloud compute firewall-rules create allow-http --allow tcp:80
gcloud compute firewall-rules create allow-https --allow tcp:443

# 5. Deploy application
cd /opt/ecommerce
docker-compose up -d
```

## ⚙️ Environment Configuration

### Production .env Template
```bash
# Database Configuration
MONGODB_URI=mongodb://admin:your-secure-password@mongodb:27017/newecom?authSource=admin
REDIS_URL=redis://redis:6379

# Security (CHANGE THESE!)
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Server Configuration
NODE_ENV=production
PORT=5000
HOSTNAME=0.0.0.0

# CORS (Update with your domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (Optional)
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-app-password

# Payment (Optional)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Application URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### Production docker-compose.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: ecommerce_mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: newecom
    volumes:
      - mongodb_data:/data/db
    networks:
      - ecommerce_network
    # Remove external port exposure in production
    # ports:
    #   - "27017:27017"

  redis:
    image: redis:7-alpine
    container_name: ecommerce_redis
    restart: always
    volumes:
      - redis_data:/data
    networks:
      - ecommerce_network
    # Remove external port exposure in production
    # ports:
    #   - "6379:6379"

  backend:
    image: yourusername/ecommerce-pro:latest
    container_name: ecommerce_backend
    restart: always
    env_file:
      - .env
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - mongodb
      - redis
    networks:
      - ecommerce_network
    # Remove external port exposure in production (use reverse proxy)
    # ports:
    #   - "5000:5000"

  nginx:
    image: nginx:alpine
    container_name: ecommerce_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    networks:
      - ecommerce_network

volumes:
  mongodb_data:
    driver: local
  redis_data:
    driver: local

networks:
  ecommerce_network:
    driver: bridge
```

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Recommended)
```bash
# 1. Install Certbot
sudo apt install certbot python3-certbot-nginx

# 2. Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 3. Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx SSL Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring and Maintenance

### Health Check Script
```bash
#!/bin/bash
# health-check.sh

echo "🏥 Checking Ecommerce Pro Health..."

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Some containers are down"
    docker-compose ps
    exit 1
fi

# Check backend health
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️  Disk usage is high: ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
echo "📊 Memory usage: ${MEMORY_USAGE}%"

echo "✅ Health check completed"
```

### Auto-restart Script
```bash
#!/bin/bash
# auto-restart.sh

# Add to crontab: */5 * * * * /path/to/auto-restart.sh

cd /opt/ecommerce

# Restart if backend is not responding
if ! curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "🔄 Restarting containers..."
    docker-compose restart
    echo "✅ Containers restarted"
fi
```

### Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/opt/backups/ecommerce"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MongoDB
docker-compose exec -T mongodb mongodump --authenticationDatabase admin -u admin -p yourpassword --out /tmp/backup
docker cp $(docker-compose ps -q mongodb):/tmp/backup $BACKUP_DIR/mongodb_$DATE

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/

# Backup configuration
cp .env $BACKUP_DIR/env_$DATE

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR"
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Check configuration
docker-compose config

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

#### 2. Database Connection Issues
```bash
# Check MongoDB status
docker-compose exec mongodb mongosh --eval "db.adminCommand('ismaster')"

# Reset MongoDB
docker-compose down -v
docker-compose up -d mongodb
```

#### 3. Permission Issues
```bash
# Fix upload permissions
sudo chown -R 1001:1001 ./uploads
chmod -R 755 ./uploads
```

#### 4. SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Performance Monitoring
```bash
# Monitor container resources
docker stats

# Check disk usage
docker system df

# Clean up unused images
docker system prune -f
```

## 📱 Deployment Checklist

### Pre-deployment
- [ ] Server meets minimum requirements
- [ ] Docker and Docker Compose installed
- [ ] Firewall configured
- [ ] Domain name pointed to server IP
- [ ] SSL certificates obtained
- [ ] Environment variables configured
- [ ] Database credentials secured

### Post-deployment
- [ ] Application accessible via HTTPS
- [ ] All services running and healthy
- [ ] Database connections working
- [ ] File uploads functional
- [ ] Email services configured
- [ ] Payment gateway integrated
- [ ] Monitoring and backups set up
- [ ] Log rotation configured

---

**Note**: Always test deployment in a staging environment before going to production.
