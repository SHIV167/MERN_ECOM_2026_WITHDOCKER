# 🚀 Docker Setup Instructions for Windows

## ⚡ Quick Fix: Install Docker Desktop

### Step 1: Download and Install
1. **Download Docker Desktop**: https://www.docker.com/products/docker-desktop
2. **Run installer** as Administrator
3. **Restart your computer** after installation

### Step 2: Verify Installation
Open **new PowerShell** and run:
```powershell
docker --version
docker-compose --version
```

### Step 3: Run Deploy Script
```powershell
npm run docker:deploy
```

---

## 🌐 Alternative: Use GitHub Actions (No Local Docker Needed)

### Step 1: Setup GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `DOCKER_USERNAME`: `shivjha5`
- `DOCKER_PASSWORD`: Your Docker Hub access token

### Step 2: Trigger Build
Push to main branch or manually trigger the workflow

### Step 3: Deploy from Docker Hub
```bash
# Pull your image
docker pull shivjha5/ecommerce-pro:latest

# Run with environment file
docker run -d -p 5000:5000 --env-file .env shivjha5/ecommerce-pro:latest
```

---

## 🔧 Manual Docker Commands (After Installation)

### Build Image
```powershell
docker build -t shivjha5/ecommerce-pro:v1.0.0 .
docker tag shivjha5/ecommerce-pro:v1.0.0 shivjha5/ecommerce-pro:latest
```

### Test Image
```powershell
docker run -d --name ecommerce-test -p 5000:5000 --env-file .env shivjha5/ecommerce-pro:latest
```

### Push to Docker Hub
```powershell
docker login
docker push shivjha5/ecommerce-pro:latest
docker push shivjha5/ecommerce-pro:v1.0.0
```

---

## 📱 Quick Deploy on Any Server

Once your image is on Docker Hub, deploy anywhere:

```bash
# Create environment file
echo "NODE_ENV=production" > .env
echo "JWT_SECRET=your-secret-key" >> .env
echo "CLOUDINARY_CLOUD_NAME=your-cloud-name" >> .env

# Deploy
docker run -d \
  --name ecommerce-pro \
  -p 5000:5000 \
  --env-file .env \
  --restart unless-stopped \
  shivjha5/ecommerce-pro:latest
```

---

## 🎯 Next Steps

1. **Install Docker Desktop** (recommended)
2. **Or use GitHub Actions** for cloud builds
3. **Deploy on any server** using the Docker Hub image

Your image will be available at: `shivjha5/ecommerce-pro:latest`
