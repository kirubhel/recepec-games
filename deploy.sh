#!/bin/bash

# Deployment script for respect-minimal-games
# Server: 196.189.50.57
# Port: 9014

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
SERVER_IP="196.189.50.57"
SERVER_USER="administrator"
SERVER_PASSWORD="Girar@2025"
APP_NAME="respect-minimal-games"
REMOTE_DIR="/home/administrator/respect-minimal-games"
IMAGE_NAME="respect-minimal-games"

echo -e "${GREEN}Starting deployment of ${APP_NAME} to ${SERVER_IP}...${NC}"

# 1. Build locally
echo -e "${YELLOW}Step 1: Building Docker image locally...${NC}"
docker build --platform linux/amd64 -t ${IMAGE_NAME}:latest . 

# 2. Transfer image directly to server
echo -e "${YELLOW}Step 2: Transferring image and files to server (Streaming)...${NC}"
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "mkdir -p ${REMOTE_DIR}"
sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no docker-compose.yml ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/

echo -e "${YELLOW}Saving and streaming Docker image with high compression...${NC}"
docker save ${IMAGE_NAME}:latest | gzip | sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "gunzip | docker load"

# 3. Restart on server
echo -e "${YELLOW}Step 3: Restarting services on server...${NC}"
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << EOF
    cd ${REMOTE_DIR}
    
    echo "Stopping existing instance..."
    docker compose stop 2>/dev/null || true
    docker compose rm -f 2>/dev/null || true
    
    echo "Starting new instance..."
    docker compose up -d
    
    echo "Connecting to network..."
    docker network connect e-learning_elearning-network ${APP_NAME} 2>/dev/null || true
    
    echo "Deployment complete!"
    docker ps | grep ${APP_NAME}
EOF

echo -e "${GREEN}Successfully deployed! Accessible at: https://kokeb.et/respect-minimal-games${NC}"
