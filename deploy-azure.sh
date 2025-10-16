#!/bin/bash

# Azure Quick Deploy Script
# This script automates the Azure deployment process

echo "🚀 MERN App - Azure Quick Deploy"
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
# Default to Free tier to save your $100 credit; change to B1 later if needed
SKU="F1"

echo -e "${BLUE}This script will:${NC}"
echo "  1. Create Azure resource group"
echo "  2. Create App Service Plan ($SKU tier)"
echo "  3. Deploy your backend (Azure App Service Linux)"
echo "  4. Deploy your frontend (Azure App Service Linux)"
echo ""
echo -e "${YELLOW}Required:${NC}"
echo "  - Azure CLI installed and logged in"
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

# Check if logged in
az account show &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Not logged in to Azure. Opening login...${NC}"
    az login
fi

echo ""
echo -e "${GREEN}✓ Azure CLI ready${NC}"
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
echo "  Plan: $APP_SERVICE_PLAN ($SKU)"
echo "  Backend: $BACKEND_NAME"
echo "  Frontend: $FRONTEND_NAME"
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

# Create App Service Plan
echo ""
echo -e "${YELLOW}Creating App Service Plan...${NC}"
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku $SKU \
  --is-linux
echo -e "${GREEN}✓ App Service Plan created${NC}"

# Deploy Backend
echo ""
echo -e "${YELLOW}Creating backend web app...${NC}"
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $BACKEND_NAME \
  --runtime "NODE:18-lts"

echo -e "${YELLOW}Setting backend environment variables...${NC}"
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_NAME \
  --settings \
    NODE_ENV=production \
    MONGODB_URI="$MONGODB_URI" \
    JWT_SECRET="$JWT_SECRET" \
    FRONTEND_URL="$FRONTEND_URL"

echo -e "${YELLOW}Deploying backend code...${NC}"
cd node-app
zip -r ../backend.zip . -x "node_modules/*" ".env"
cd ..
az webapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_NAME \
  --src backend.zip
rm backend.zip
echo -e "${GREEN}✓ Backend deployed${NC}"

# Deploy Frontend
echo ""
echo -e "${YELLOW}Preparing frontend...${NC}"
echo "REACT_APP_API_URL=$BACKEND_URL" > react-app/.env.production

echo -e "${YELLOW}Building frontend...${NC}"
cd react-app
npm install --legacy-peer-deps
npm run build

echo -e "${YELLOW}Creating frontend web app...${NC}"
cd ..
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $FRONTEND_NAME \
  --runtime "NODE:18-lts"

echo -e "${YELLOW}Deploying frontend...${NC}"
cd react-app/build
zip -r ../../frontend.zip .
cd ../..
az webapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name $FRONTEND_NAME \
  --src frontend.zip
rm frontend.zip
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
