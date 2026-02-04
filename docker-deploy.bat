@echo off
REM Docker Build and Push Script for Ecommerce Pro (Windows)
REM Replace 'yourusername' with your actual Docker Hub username

set DOCKER_USERNAME=shivjha5
set IMAGE_NAME=ecommerce-pro
set VERSION=v1.0.0

echo 🐳 Building Docker image for Ecommerce Pro...

REM Build the image
echo 📦 Building image: %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION%
docker build -t %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION% .
docker tag %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION% %DOCKER_USERNAME%/%IMAGE_NAME%:latest

REM Test locally
echo 🧪 Testing image locally...
docker run -d --name ecommerce-test -p 5000:5000 --env-file .env %DOCKER_USERNAME%/%IMAGE_NAME%:latest

REM Wait for container to start
timeout /t 10 /nobreak >nul

REM Check health
echo 🏥 Checking container health...
curl -f http://localhost:5000/api/health
if %ERRORLEVEL% EQU 0 (
    echo ✅ Container is healthy!
) else (
    echo ❌ Container health check failed
    docker stop ecommerce-test
    docker rm ecommerce-test
    pause
    exit /b 1
)

REM Stop test container
docker stop ecommerce-test
docker rm ecommerce-test

REM Login to Docker Hub
echo 🔐 Logging into Docker Hub...
docker login

REM Push to Docker Hub
echo 📤 Pushing to Docker Hub...
docker push %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION%
docker push %DOCKER_USERNAME%/%IMAGE_NAME%:latest

echo ✅ Successfully pushed to Docker Hub!
echo 📋 Image details:
echo    - Repository: %DOCKER_USERNAME%/%IMAGE_NAME%
echo    - Version: %VERSION%
echo    - Latest: %DOCKER_USERNAME%/%IMAGE_NAME%:latest
echo.
echo 🚀 To deploy: docker run -d -p 5000:5000 --env-file .env %DOCKER_USERNAME%/%IMAGE_NAME%:latest

pause
