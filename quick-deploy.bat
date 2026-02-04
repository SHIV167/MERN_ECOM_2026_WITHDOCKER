@echo off
REM 🚀 Quick Deploy Script for Ecommerce Pro (Windows Server)
REM This script handles the complete deployment process

setlocal enabledelayedexpansion

REM Configuration
set APP_NAME=ecommerce-pro
set APP_DIR=C:\ecommerce
set DOCKER_USERNAME=yourusername  REM Change this to your Docker Hub username
set REPO_URL=https://github.com/yourusername/ecommerce-pro.git  REM Change to your repo

echo 🚀 Starting Ecommerce Pro deployment...

REM Check Docker installation
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker not found. Please install Docker Desktop first.
    echo    Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Create application directory
echo 📁 Creating application directory...
if not exist "%APP_DIR%" (
    mkdir "%APP_DIR%"
)
cd /d "%APP_DIR%"

REM Clone or update repository
if exist ".git" (
    echo 📥 Updating repository...
    git pull origin main
) else (
    echo 📥 Cloning repository...
    git clone %REPO_URL% .
)

REM Setup environment file
if not exist ".env" (
    echo ⚙️ Setting up environment configuration...
    copy .env.docker .env
    
    echo 📝 Please edit .env file with your configuration:
    echo    - MongoDB credentials
    echo    - JWT secret
    echo    - Cloudinary credentials
    echo    - Email settings
    echo.
    pause
)

REM Create uploads directory
if not exist "uploads" (
    mkdir uploads
)

REM Pull latest Docker image
echo 📦 Pulling Docker image...
docker pull %DOCKER_USERNAME%/%APP_NAME%:latest

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose down 2>nul

REM Start services
echo 🚀 Starting services...
docker-compose up -d

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Health check
echo 🏥 Performing health check...
curl -f http://localhost:5000/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend health check failed
    echo 📋 Container logs:
    docker-compose logs backend
    pause
    exit /b 1
) else (
    echo ✅ Backend is healthy!
)

REM Show status
echo 📊 Deployment Status:
docker-compose ps

echo.
echo 🎉 Deployment completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Configure your domain DNS to point to this server
echo 2. Set up SSL certificates
echo 3. Configure Windows Firewall
echo 4. Set up monitoring and backups
echo.
echo 🌐 Application URLs:
echo    - Backend API: http://localhost:5000
echo    - Health Check: http://localhost:5000/api/health
echo.
echo 📝 Useful Commands:
echo    - View logs: docker-compose logs -f
echo    - Restart services: docker-compose restart
echo    - Stop services: docker-compose down
echo    - Update: git pull && docker-compose up -d --build

pause
