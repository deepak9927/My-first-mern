#!/bin/bash

# Local Docker Test Script
# This script helps you test your Docker containers locally before deploying to Azure

echo "🐳 MERN App - Local Docker Test"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose is not installed. Please install docker-compose first.${NC}"
    exit 1
fi

# Check if .env file exists in node-app
if [ ! -f node-app/.env ]; then
    echo -e "${YELLOW}⚠️  .env file not found in node-app directory${NC}"
    echo "Creating from .env.example..."
    cp node-app/.env.example node-app/.env
    echo -e "${YELLOW}⚠️  Please edit node-app/.env with your MongoDB URI and JWT secret${NC}"
    read -p "Press enter when ready to continue..."
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Build and start containers
echo "Building Docker images..."
docker-compose build

echo ""
echo "Starting containers..."
docker-compose up -d

echo ""
echo "Waiting for containers to be ready..."
sleep 10

# Check if containers are running
BACKEND_STATUS=$(docker inspect -f '{{.State.Running}}' mern-backend 2>/dev/null)
FRONTEND_STATUS=$(docker inspect -f '{{.State.Running}}' mern-frontend 2>/dev/null)

if [ "$BACKEND_STATUS" = "true" ]; then
    echo -e "${GREEN}✓ Backend container is running${NC}"
else
    echo -e "${RED}❌ Backend container failed to start${NC}"
    docker logs mern-backend
    exit 1
fi

if [ "$FRONTEND_STATUS" = "true" ]; then
    echo -e "${GREEN}✓ Frontend container is running${NC}"
else
    echo -e "${RED}❌ Frontend container failed to start${NC}"
    docker logs mern-frontend
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}🎉 Docker containers are running!${NC}"
echo ""
echo "Access your application at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo ""
echo "Useful commands:"
echo "  View logs:     docker-compose logs -f"
echo "  Stop:          docker-compose down"
echo "  Restart:       docker-compose restart"
echo "  Rebuild:       docker-compose up -d --build"
echo ""
echo "Testing backend..."
curl -s http://localhost:5000 > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Backend might not be ready yet. Check logs with: docker-compose logs backend${NC}"
fi
echo ""
