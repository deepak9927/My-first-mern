# Azure Cloud Deployment Guide

This guide provides step-by-step instructions to deploy your MERN Stack OLX Clone application to Azure Cloud, leveraging your $100 free credit.

There are two paths:

1) Quick Start (Free Tier, simplest) — Recommended for student credit
  - Backend on Azure App Service Free (F1)
  - Frontend on Azure App Service Free (F1)
  - Database on MongoDB Atlas Free (or Cosmos DB if you prefer)
  - No Docker or ACR required

2) Advanced (Containerized, more control) — Uses student credit faster
  - Azure Container Apps for backend and frontend
  - Azure Container Registry (ACR) for images
  - Azure Cosmos DB (MongoDB API)
  - Azure Blob Storage for images

Pick 1) for fastest $0/month hosting with your $100 credit preserved. Pick 2) if you specifically want container orchestration.

---

## 0. Quick Start (Free Tier, no Docker) — App Service + MongoDB Atlas

This uses the provided script `deploy-azure.sh` and costs $0/month on F1. You’ll need a MongoDB Atlas free cluster connection string.

Prerequisites:
- Azure CLI installed and logged in (`az login`)
- Node 18+ and npm/pnpm
- MongoDB Atlas free cluster (copy the connection string)

Steps:
```bash
chmod +x ./deploy-azure.sh
./deploy-azure.sh
```
When prompted:
- Backend name: a globally unique name like mern-backend-yourname
- Frontend name: a unique label like mern-frontend-yourname
- MongoDB URI: paste your Atlas connection string (Database Access user required)
- Generate JWT secret: choose y for convenience

The script will:
- Create Resource Group and App Service Plan (F1 free)
- Deploy backend to App Service (Node 18)
- Build and deploy frontend to App Service (static files)
- Set environment variables (MONGODB_URI, JWT_SECRET, FRONTEND_URL)

Outputs:
- Backend URL: https://<your-backend>.azurewebsites.net
- Frontend URL: https://<your-frontend>.azurewebsites.net

Notes:
- CORS is auto-configured via FRONTEND_URL.
- Image uploads currently save to local filesystem; for production durability use Azure Blob (see section 5).
- Free tier has CPU/memory limits and cold starts. It’s great for demos and student projects.

---

## Table of Contents

1.  [Prerequisites](#prerequisites)
2.  [Azure Setup](#azure-setup)
    *   [Login to Azure](#login-to-azure)
    *   [Create Resource Group](#create-resource-group)
    *   [Create Azure Container Registry (ACR)](#create-azure-container-registry-acr)
    *   [Create Azure Cosmos DB (MongoDB API)](#create-azure-cosmos-db-mongodb-api)
    *   [Create Azure Storage Account (for Blob Storage)](#create-azure-storage-account-for-blob-storage)
3.  [Build and Push Docker Images to ACR](#build-and-push-docker-images-to-acr)
    *   [Build Backend Image](#build-backend-image)
    *   [Push Backend Image to ACR](#push-backend-image-to-acr)
    *   [Build Frontend Image](#build-frontend-image)
    *   [Push Frontend Image to ACR](#push-frontend-image-to-acr)
4.  [Deploy to Azure Container Apps](#deploy-to-azure-container-apps)
    *   [Create Container Apps Environment](#create-container-apps-environment)
    *   [Deploy Backend Container App](#deploy-backend-container-app)
    *   [Deploy Frontend Container App](#deploy-frontend-container-app)
5.  [Configure Persistent Storage for Uploads](#configure-persistent-storage-for-uploads)
6.  [Configure Environment Variables](#configure-environment-variables)
7.  [Testing the Deployment](#testing-the-deployment)
8.  [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

*   An Azure account with an active subscription (and your $100 free credit).
*   Azure CLI installed and configured on your local machine.
*   Docker Desktop installed and running.
*   `pnpm` (recommended) or `npm` installed.
*   Git installed.

## 2. Azure Setup

### Login to Azure

Open your terminal and log in to Azure:
```bash
az login
```
Follow the prompts to authenticate.

### Create Resource Group

A resource group is a logical container for your Azure resources.
```bash
RESOURCE_GROUP="olx-mern-rg"
LOCATION="eastus" # Choose a region close to you
az group create --name $RESOURCE_GROUP --location $LOCATION
```

### Create Azure Container Registry (ACR)

ACR will store your Docker images.
```bash
ACR_NAME="olxmernregistry$(head /dev/urandom | tr -dc a-z0-9 | head -c 5)" # Unique name
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true
```
Note down your `ACR_NAME`.

### Create Azure Cosmos DB (MongoDB API)

This will be your MongoDB database.
```bash
COSMOSDB_ACCOUNT_NAME="olxmerncosmosdb$(head /dev/urandom | tr -dc a-z0-9 | head -c 5)" # Unique name
az cosmosdb create --resource-group $RESOURCE_GROUP --name $COSMOSDB_ACCOUNT_NAME --kind MongoDB --locations regionName=$LOCATION failoverPriority=0 isZoneRedundant=False
```
Once created, retrieve the connection string:
```bash
az cosmosdb keys list --resource-group $RESOURCE_GROUP --name $COSMOSDB_ACCOUNT_NAME --type connection-strings --query connectionStrings[0].connectionString --output tsv
```
Save this connection string; it will be your `MONGODB_URI`. Remember to replace `&replicaSet=globaldb` with `&replicaSet=cosmosdb` if it's present in the connection string.

### Create Azure Storage Account (for Blob Storage)

This will be used for persistent storage of product images.
```bash
STORAGE_ACCOUNT_NAME="olxmernstorage$(head /dev/urandom | tr -dc a-z0-9 | head -c 5)" # Unique name
az storage account create --resource-group $RESOURCE_GROUP --name $STORAGE_ACCOUNT_NAME --location $LOCATION --sku Standard_LRS --kind StorageV2
```
Create a Blob container for uploads:
```bash
CONTAINER_NAME="product-uploads"
az storage container create --name $CONTAINER_NAME --account-name $STORAGE_ACCOUNT_NAME --public-access off
```
Retrieve the connection string for the storage account:
```bash
az storage account show-connection-string --resource-group $RESOURCE_GROUP --name $STORAGE_ACCOUNT_NAME --query connectionString --output tsv
```
Save this connection string. You will use it in your backend.

## 3. Build and Push Docker Images to ACR

First, log in to your ACR:
```bash
az acr login --name $ACR_NAME
```

### Build Backend Image

Navigate to the `node-app` directory and build the Docker image:
```bash
cd node-app
docker build -t $ACR_NAME.azurecr.io/mern-backend:latest .
cd ..
```

### Push Backend Image to ACR

```bash
docker push $ACR_NAME.azurecr.io/mern-backend:latest
```

### Build Frontend Image

Navigate to the `react-app` directory and build the Docker image. Note: `REACT_APP_API_URL` is a build-time variable for React apps. For Azure, this should point to your *future* backend Container App URL. You can update this later or use a placeholder for now.
```bash
cd react-app
docker build -t $ACR_NAME.azurecr.io/mern-frontend:latest --build-arg REACT_APP_API_URL=/api .
cd ..
```
**Note:** We are setting `REACT_APP_API_URL=/api` here because Nginx will proxy `/api/` requests to the backend. This simplifies the frontend configuration.

### Push Frontend Image to ACR

```bash
docker push $ACR_NAME.azurecr.io/mern-frontend:latest
```

## 4. Deploy to Azure Container Apps

Azure Container Apps is a fully managed serverless container service that enables you to run microservices and containerized applications on a serverless platform.

### Create Container Apps Environment

A Container Apps environment acts as a secure boundary for your container apps.
```bash
CONTAINER_APP_ENV_NAME="olx-mern-env"
az containerapp env create --resource-group $RESOURCE_GROUP --name $CONTAINER_APP_ENV_NAME --location $LOCATION
```

### Deploy Backend Container App

```bash
BACKEND_APP_NAME="olx-mern-backend"
az containerapp create \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_APP_ENV_NAME \
  --name $BACKEND_APP_NAME \
  --image $ACR_NAME.azurecr.io/mern-backend:latest \
  --target-port 5000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 1 \
  --environment-variables \
    MONGODB_URI="<Your_CosmosDB_Connection_String>" \
    JWT_SECRET="your_strong_jwt_secret" \
    FRONTEND_URL="<Future_Frontend_URL>" \
    AZURE_STORAGE_CONNECTION_STRING="<Your_Storage_Account_Connection_String>" \
    NODE_ENV="production" \
  --query properties.latestRevision.fqdn --output tsv
```
**Important:**
*   Replace `<Your_CosmosDB_Connection_String>` with the Cosmos DB connection string you saved earlier.
*   Replace `your_strong_jwt_secret` with a strong, random secret.
*   The output of this command will be the FQDN (Fully Qualified Domain Name) of your backend. Save this URL. This will be your `BACKEND_URL`.
*   For `FRONTEND_URL`, you can initially use a placeholder or set it to `*` for development. Once your frontend is deployed, you'll update this to the frontend's URL.

### Deploy Frontend Container App

```bash
FRONTEND_APP_NAME="olx-mern-frontend"
az containerapp create \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_APP_ENV_NAME \
  --name $FRONTEND_APP_NAME \
  --image $ACR_NAME.azurecr.io/mern-frontend:latest \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 1 \
  --query properties.latestRevision.fqdn --output tsv
```
**Important:**
*   The output of this command will be the FQDN of your frontend. Save this URL. This will be your `FRONTEND_URL`.
*   Now, go back to your backend container app in the Azure portal or use `az containerapp update` to set its `FRONTEND_URL` environment variable to this new frontend URL.

## 5. Configure Persistent Storage for Uploads

For the `node-app/uploads` directory, you need to use Azure Blob Storage.
1.  **Update Backend Code:** Modify your `node-app` to use Azure Blob Storage SDK for uploading and serving images instead of local disk storage (Multer's `diskStorage`). This is a significant code change. You would typically use a library like `@azure/storage-blob` in your Node.js backend.
    *   **Multer Integration:** Instead of `multer.diskStorage`, you'd use a custom storage engine for Multer that uploads directly to Azure Blob Storage.
    *   **Serving Images:** When serving images, generate SAS URLs for private blobs or serve directly if blobs are public.
2.  **Environment Variable:** Ensure `AZURE_STORAGE_CONNECTION_STRING` is set in your backend Container App's environment variables (as shown in the backend deployment step).

**Note:** Implementing Azure Blob Storage integration requires code changes in the `node-app`. The current `Dockerfile` and `docker-compose.yml` are set up for local disk storage. For a production-ready solution, this step is crucial.

## 6. Configure Environment Variables

Ensure all necessary environment variables are correctly set for both your backend and frontend Container Apps in the Azure Portal or via Azure CLI.

**Backend Container App:**
*   `MONGODB_URI`: Your Azure Cosmos DB connection string.
*   `JWT_SECRET`: A strong, random secret key.
*   `FRONTEND_URL`: The URL of your deployed frontend Container App.
*   `AZURE_STORAGE_CONNECTION_STRING`: Connection string for your Azure Storage Account.
*   `NODE_ENV`: `production`

**Frontend Container App:**
*   No specific runtime environment variables are needed if Nginx is configured to proxy `/api/` and React is built with `REACT_APP_API_URL=/api`.

## 7. Testing the Deployment

1.  Open your `FRONTEND_URL` in a web browser.
2.  Test user registration, login, adding products (ensure images are uploaded and displayed correctly), searching, and liking products.
3.  Monitor logs in Azure Portal for any errors.

## 8. Troubleshooting

*   **Container Logs:** Check the logs of your Container Apps in the Azure Portal for any errors during startup or runtime.
*   **Network Issues:** Ensure your backend and frontend can communicate. If using Nginx proxy, verify the `proxy_pass` URL.
*   **Environment Variables:** Double-check that all environment variables are correctly set and accessible by your containers.
*   **CORS:** If you encounter CORS errors, ensure `FRONTEND_URL` in your backend's environment variables is correctly set to your frontend's domain.
*   **Image Uploads:** If images are not appearing, verify your Azure Blob Storage configuration and the backend code for uploading/serving.

This guide provides a solid foundation for deploying your MERN stack application to Azure. Remember to secure your secrets and manage your resources effectively.
