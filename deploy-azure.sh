#!/bin/bash

# Azure Quick Deploy Script
# This script automates the Azure deployment process for a Dockerized MERN stack

echo "🚀 MERN App - Azure Quick Deploy (Dockerized)"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
RESOURCE_GROUP="mern-app-rg"
LOCATION="eastus"
APP_SERVICE_PLAN="mern-plan"
SKU="B1" # Changed to B1 for Docker support, F1 does not support custom containers
ACR_NAME="mernappacr$(head /dev/urandom | tr -dc a-z0-9 | head -c 5)" # Unique ACR name

echo -e "${BLUE}This script will:${NC}"
echo "  1. Create Azure resource group"
echo "  2. Create Azure Container Registry (ACR)"
echo "  3. Create App Service Plan ($SKU tier)"
echo "  4. Build and push Docker images to ACR"
echo "  5. Deploy your backend (Azure App Service Linux with Docker)"
echo "  6. Deploy your frontend (Azure App Service Linux with Docker)"
echo ""
echo -e "${YELLOW}Required:${NC}"
echo "  - Azure CLI installed and logged in"
echo "  - Docker installed and running"
echo "  - MongoDB Atlas (or Cosmos DB Mongo) connection string"
echo "  - Unique app names (will prompt)"
echo ""

# Allow non-interactive mode if NON_INTERACTIVE=1 is set
if [ "${NON_INTERACTIVE}" != "1" ]; then
  read -p "Press enter to continue or Ctrl+C to cancel..."
fi

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed.${NC}"
    echo "Install from: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed or not running.${NC}"
    echo "Install from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if logged in
az account show &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Not logged in to Azure. Opening login...${NC}"
    az login
fi

echo ""
echo -e "${GREEN}✓ Azure CLI ready${NC}"
echo -e "${GREEN}✓ Docker ready${NC}"
echo ""

# Get user inputs (allow env var overrides for non-interactive mode)
if [ -z "${BACKEND_NAME}" ]; then
  read -p "Enter a unique name for your backend app (e.g., mern-backend-yourname): " BACKEND_NAME
fi
if [ -z "${FRONTEND_NAME}" ]; then
  read -p "Enter a unique name for your frontend app (e.g., mern-frontend-yourname): " FRONTEND_NAME
fi
if [ -z "${MONGODB_URI}" ]; then
  read -p "Enter your MongoDB Atlas connection string: " MONGODB_URI
fi

# JWT secret handling: allow preset JWT_SECRET or auto-generate when NON_INTERACTIVE=1 or GEN_JWT=y
if [ -z "${JWT_SECRET}" ]; then
  if [ "${NON_INTERACTIVE}" = "1" ] || [ "${GEN_JWT}" = "y" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
    echo -e "${GREEN}✓ Generated JWT secret${NC}"
  else
    read -p "Generate a random JWT secret? (y/n): " GEN_JWT
    if [ "$GEN_JWT" = "y" ]; then
      JWT_SECRET=$(openssl rand -hex 32)
      echo -e "${GREEN}✓ Generated JWT secret${NC}"
    else
      read -p "Enter your JWT secret: " JWT_SECRET
    fi
  fi
fi

FRONTEND_URL="https://${FRONTEND_NAME}.azurewebsites.net"
BACKEND_URL="https://${BACKEND_NAME}.azurewebsites.net"

echo ""
echo -e "${BLUE}Configuration:${NC}"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  App Service Plan: $APP_SERVICE_PLAN ($SKU)"
echo "  Azure Container Registry: $ACR_NAME"
echo "  Backend App Name: $BACKEND_NAME"
echo "  Frontend App Name: $FRONTEND_NAME"
echo ""

if [ "${NON_INTERACTIVE}" = "1" ]; then
  PROCEED="y"
else
  read -p "Proceed with deployment? (y/n): " PROCEED
fi
if [ "$PROCEED" != "y" ]; then
  echo "Deployment cancelled."
  exit 0
fi

# Create resource group
echo ""
echo -e "${YELLOW}Creating resource group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION
echo -e "${GREEN}✓ Resource group created${NC}"

# Create Azure Container Registry
echo ""
echo -e "${YELLOW}Creating Azure Container Registry ($ACR_NAME)...${NC}"
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true
echo -e "${GREEN}✓ ACR created${NC}"

# Log in to ACR
echo ""
echo -e "${YELLOW}Logging in to Azure Container Registry...${NC}"
az acr login --name $ACR_NAME
echo -e "${GREEN}✓ Logged in to ACR${NC}"

# Create App Service Plan
echo ""
echo -e "${YELLOW}Creating App Service Plan...${NC}"
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku $SKU \
  --is-linux
echo -e "${GREEN}✓ App Service Plan created${NC}"

# Build and push Backend Docker image
echo ""
echo -e "${YELLOW}Building and pushing backend Docker image...${NC}"
docker build -t ${ACR_NAME}.azurecr.io/${BACKEND_NAME}:latest ./node-app
docker push ${ACR_NAME}.azurecr.io/${BACKEND_NAME}:latest
echo -e "${GREEN}✓ Backend Docker image pushed to ACR${NC}"

# Deploy Backend
echo ""
echo -e "${YELLOW}Creating backend web app from Docker image...${NC}"
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $BACKEND_NAME \
  --deployment-container-image-name ${ACR_NAME}.azurecr.io/${BACKEND_NAME}:latest

echo -e "${YELLOW}Setting backend environment variables...${NC}"
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_NAME \
  --settings \
    NODE_ENV=production \
    MONGODB_URI="$MONGODB_URI" \
    JWT_SECRET="$JWT_SECRET" \
    FRONTEND_URL="$FRONTEND_URL" \
    PORT=5000 # Ensure the backend listens on the correct port

echo -e "${GREEN}✓ Backend deployed${NC}"

# Build and push Frontend Docker image
echo ""
echo -e "${YELLOW}Building and pushing frontend Docker image...${NC}"
# Ensure REACT_APP_API_URL is set during frontend build for production
# This needs to be done before building the image
echo "REACT_APP_API_URL=$BACKEND_URL" > react-app/.env.production
docker build -t ${ACR_NAME}.azurecr.io/${FRONTEND_NAME}:latest ./react-app
docker push ${ACR_NAME}.azurecr.io/${FRONTEND_NAME}:latest
rm react-app/.env.production # Clean up temporary .env file
echo -e "${GREEN}✓ Frontend Docker image pushed to ACR${NC}"

# Deploy Frontend
echo ""
echo -e "${YELLOW}Creating frontend web app from Docker image...${NC}"
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $FRONTEND_NAME \
  --deployment-container-image-name ${ACR_NAME}.azurecr.io/${FRONTEND_NAME}:latest

echo -e "${YELLOW}Setting frontend environment variables (if any, e.g., for Nginx config)...${NC}"
# No specific environment variables needed for Nginx serving static files,
# but keeping this block for completeness if future needs arise.
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $FRONTEND_NAME \
  --settings \
    WEBSITES_PORT=80 # Nginx listens on port 80

echo -e "${GREEN}✓ Frontend deployed${NC}"

# Summary
echo ""
echo "================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "================================="
echo ""
echo "Your application is now live at:"
echo -e "  ${BLUE}Frontend:${NC} $FRONTEND_URL"
echo -e "  ${BLUE}Backend:${NC}  $BACKEND_URL"
echo ""
echo "Useful commands:"
echo "  View backend logs:  az webapp log tail --name $BACKEND_NAME --resource-group $RESOURCE_GROUP"
echo "  View frontend logs: az webapp log tail --name $FRONTEND_NAME --resource-group $RESOURCE_GROUP"
echo "  Stop apps:          az webapp stop --name $BACKEND_NAME --resource-group $RESOURCE_GROUP"
echo "  Delete everything:  az group delete --name $RESOURCE_GROUP --yes"
echo ""
echo -e "${YELLOW}Note: It may take 2-3 minutes for your apps to fully start.${NC}"
echo ""
