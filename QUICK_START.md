# 🚀 Quick Start Guide - Running Ecommerce Pro on Any Machine

## ⚡ Super Quick Deployment (5 Minutes)

### 1. Prerequisites
```bash
# Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2. One-Command Deploy
```bash
# Linux/macOS
curl -sSL https://raw.githubusercontent.com/yourusername/ecommerce-pro/main/quick-deploy.sh | bash

# Windows (PowerShell)
iwr -useb https://raw.githubusercontent.com/yourusername/ecommerce-pro/main/quick-deploy.bat | iex
```

### 3. Access Your Application
- **Backend API**: http://YOUR_SERVER_IP:5000
- **Health Check**: http://YOUR_SERVER_IP:5000/api/health

---

## 🖥️ Step-by-Step Manual Deployment

### Method 1: Using Docker Hub Image (Easiest)

```bash
# 1. Create app directory
mkdir ecommerce && cd ecommerce

# 2. Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
MONGODB_URI=mongodb://localhost:27017/newecom
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EOF

# 3. Run the container
docker run -d \
  --name ecommerce-pro \
  -p 5000:5000 \
  --env-file .env \
  --restart unless-stopped \
  yourusername/ecommerce-pro:latest
```

### Method 2: Full Stack with Docker Compose (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/ecommerce-pro.git
cd ecommerce-pro

# 2. Setup environment
cp .env.docker .env
nano .env  # Edit with your values

# 3. Deploy
docker-compose up -d
```

---

## 🌐 Cloud Platform Deployment

### AWS EC2
```bash
# Launch Ubuntu 20.04 instance, then:
ssh -i your-key.pem ubuntu@your-ec2-ip

# Run quick deploy
curl -sSL https://raw.githubusercontent.com/yourusername/ecommerce-pro/main/quick-deploy.sh | bash
```

### DigitalOcean
```bash
# Create Ubuntu droplet, then:
ssh root@your-droplet-ip

# Run quick deploy
curl -sSL https://raw.githubusercontent.com/yourusername/ecommerce-pro/main/quick-deploy.sh | bash
```

### Google Cloud
```bash
# Create VM instance, then:
gcloud compute ssh instance-name

# Run quick deploy
curl -sSL https://raw.githubusercontent.com/yourusername/ecommerce-pro/main/quick-deploy.sh | bash
```

---

## 🔧 Configuration Required

### Minimum .env Configuration
```bash
# Required - Change these values
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Optional - Use defaults if not specified
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/newecom
```

### Get Cloudinary Credentials
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → Settings
3. Copy your Cloud Name, API Key, and API Secret

---

## 📱 Accessing Your Application

### Local Development
```bash
# After deployment
curl http://localhost:5000/api/health
```

### Remote Server
```bash
# Replace with your server IP
curl http://YOUR_SERVER_IP:5000/api/health

# Or access in browser:
http://YOUR_SERVER_IP:5000
```

### With Domain (Production)
```bash
# After setting up DNS and SSL
https://yourdomain.com/api/health
https://yourdomain.com
```

---

## 🛠️ Management Commands

### Check Status
```bash
# Check containers
docker ps

# Check logs
docker logs ecommerce-pro

# Check health
curl http://localhost:5000/api/health
```

### Update Application
```bash
# Pull latest image
docker pull yourusername/ecommerce-pro:latest

# Restart with new image
docker stop ecommerce-pro
docker rm ecommerce-pro
docker run -d --name ecommerce-pro -p 5000:5000 --env-file .env --restart unless-stopped yourusername/ecommerce-pro:latest
```

### Stop/Start
```bash
# Stop
docker stop ecommerce-pro

# Start
docker start ecommerce-pro

# Remove
docker stop ecommerce-pro && docker rm ecommerce-pro
```

---

## 🔒 Security Setup (Production)

### Basic Security
```bash
# Setup firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Setup SSL (after domain setup)
sudo certbot --nginx -d yourdomain.com
```

### Environment Security
```bash
# Secure .env file
chmod 600 .env

# Use strong passwords
JWT_SECRET=$(openssl rand -base64 32)
```

---

## 📊 Monitoring

### Health Check Script
```bash
#!/bin/bash
# Save as health-check.sh
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Application is healthy"
else
    echo "❌ Application is down"
    docker restart ecommerce-pro
fi
```

### Auto-restart with Cron
```bash
# Add to crontab: crontab -e
*/5 * * * * /path/to/health-check.sh
```

---

## 🆘 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker logs ecommerce-pro

# Check configuration
docker run --rm --env-file .env yourusername/ecommerce-pro:latest npm run check
```

#### Port Already in Use
```bash
# Check what's using port 5000
sudo netstat -tulpn | grep :5000

# Kill process
sudo kill -9 <PID>
```

#### Permission Issues
```bash
# Fix permissions
sudo chown -R 1001:1001 ./uploads
chmod -R 755 ./uploads
```

### Get Help
```bash
# Check container status
docker ps
docker-compose ps

# View detailed logs
docker logs --tail 50 ecommerce-pro

# Enter container for debugging
docker exec -it ecommerce-pro sh
```

---

## 📋 Deployment Checklist

### Before Deployment
- [ ] Docker installed
- [ ] Server meets requirements (2GB+ RAM)
- [ ] Cloudinary account created
- [ ] Domain name (optional)

### After Deployment
- [ ] Application accessible
- [ ] Health check passing
- [ ] Environment configured
- [ ] SSL setup (production)
- [ ] Firewall configured
- [ ] Monitoring setup

---

**🎉 That's it! Your Ecommerce Pro application is now running on any machine or server!**
