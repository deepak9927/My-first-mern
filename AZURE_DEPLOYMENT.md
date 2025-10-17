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

## 3. GitHub Actions for Azure Container Apps Deployment

This section outlines how to set up a GitHub Actions workflow to automate the build, push, and deployment of your MERN stack application to Azure Container Apps.

### 3.1. Configure Azure Credentials in GitHub Secrets

To allow GitHub Actions to interact with your Azure subscription, you need to create an Azure Service Principal and store its credentials as a GitHub Secret.

1.  **Create a Service Principal:**
    Open your terminal and run the following Azure CLI command. This will create a Service Principal with Contributor role on your resource group.
    ```bash
    az ad sp create-for-rbac --name "github-actions-sp" --role contributor --scopes /subscriptions/<YOUR_SUBSCRIPTION_ID>/resourceGroups/$RESOURCE_GROUP --json-auth
    ```
    *   Replace `<YOUR_SUBSCRIPTION_ID>` with your Azure subscription ID. You can find it by running `az account show --query id --output tsv`.
    *   Ensure `$RESOURCE_GROUP` is set to the name of your resource group (e.g., `olx-mern-rg`).

    The output will be a JSON object. Copy the entire JSON output. It will look something like this:
    ```json
    {
      "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
      "resourceManagerEndpointUrl": "https://management.azure.com/",
      "activeDirectoryGraphResourceId": "https://graph.windows.net/",
      "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
      "galleryEndpointUrl": "https://gallery.azure.com/",
      "managementEndpointUrl": "https://management.core.windows.net/"
    }
    ```

2.  **Add GitHub Secret:**
    *   Go to your GitHub repository.
    *   Navigate to `Settings` > `Secrets and variables` > `Actions`.
    *   Click `New repository secret`.
    *   Name the secret `AZURE_CREDENTIALS`.
    *   Paste the entire JSON output from the Azure CLI command into the `Secret` field.
    *   Click `Add secret`.

### 3.2. Create GitHub Actions Workflow File

Create a new file named `azure-container-apps-deploy.yml` in the `.github/workflows/` directory of your repository.

```yaml
name: Deploy to Azure Container Apps

on:
  push:
    branches:
      - main
  workflow_dispatch: # Allows manual triggering

env:
  RESOURCE_GROUP: olx-mern-rg          # Your Azure Resource Group name
  LOCATION: eastus                     # Your Azure region
  ACR_NAME: <YOUR_ACR_NAME>            # Your Azure Container Registry name
  CONTAINER_APP_ENV_NAME: olx-mern-env # Your Azure Container Apps Environment name
  BACKEND_APP_NAME: olx-mern-backend   # Your backend Container App name
  FRONTEND_APP_NAME: olx-mern-frontend # Your frontend Container App name
  NODE_VERSION: '18.x'                 # Node.js version for build

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment: production # Optional: specify environment for protection rules

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Log in to Azure Container Registry
        run: az acr login --name ${{ env.ACR_NAME }}

      # Build and push backend image
      - name: Build and push backend Docker image
        working-directory: ./node-app
        run: |
          docker build -t ${{ env.ACR_NAME }}.azurecr.io/${{ env.BACKEND_APP_NAME }}:latest .
          docker push ${{ env.ACR_NAME }}.azurecr.io/${{ env.BACKEND_APP_NAME }}:latest

      # Build and push frontend image
      - name: Build and push frontend Docker image
        working-directory: ./react-app
        run: |
          # REACT_APP_API_URL is set to /api because Nginx will proxy requests
          docker build -t ${{ env.ACR_NAME }}.azurecr.io/${{ env.FRONTEND_APP_NAME }}:latest --build-arg REACT_APP_API_URL=/api .
          docker push ${{ env.ACR_NAME }}.azurecr.io/${{ env.FRONTEND_APP_NAME }}:latest

      # Create Container Apps Environment (if not exists)
      - name: Create Container Apps Environment
        run: |
          az containerapp env show --name ${{ env.CONTAINER_APP_ENV_NAME }} --resource-group ${{ env.RESOURCE_GROUP }} || \
          az containerapp env create --name ${{ env.CONTAINER_APP_ENV_NAME }} --resource-group ${{ env.RESOURCE_GROUP }} --location ${{ env.LOCATION }}

      # Deploy Backend Container App
      - name: Deploy Backend Container App
        id: deploybackend
        run: |
          BACKEND_FQDN=$(az containerapp create \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --environment ${{ env.CONTAINER_APP_ENV_NAME }} \
            --name ${{ env.BACKEND_APP_NAME }} \
            --image ${{ env.ACR_NAME }}.azurecr.io/${{ env.BACKEND_APP_NAME }}:latest \
            --target-port 5000 \
            --ingress external \
            --min-replicas 1 \
            --max-replicas 1 \
            --environment-variables \
              MONGODB_URI="${{ secrets.MONGODB_URI }}" \
              JWT_SECRET="${{ secrets.JWT_SECRET }}" \
              FRONTEND_URL="<FUTURE_FRONTEND_URL>" \
              NODE_ENV="production" \
            --query properties.latestRevision.fqdn --output tsv)
          echo "BACKEND_FQDN=$BACKEND_FQDN" >> $GITHUB_OUTPUT

      # Deploy Frontend Container App
      - name: Deploy Frontend Container App
        id: deployfrontend
        run: |
          FRONTEND_FQDN=$(az containerapp create \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --environment ${{ env.CONTAINER_APP_ENV_NAME }} \
            --name ${{ env.FRONTEND_APP_NAME }} \
            --image ${{ env.ACR_NAME }}.azurecr.io/${{ env.FRONTEND_APP_NAME }}:latest \
            --target-port 80 \
            --ingress external \
            --min-replicas 1 \
            --max-replicas 1 \
            --query properties.latestRevision.fqdn --output tsv)
          echo "FRONTEND_FQDN=$FRONTEND_FQDN" >> $GITHUB_OUTPUT

      # Update Backend with Frontend URL
      - name: Update Backend with Frontend URL
        run: |
          az containerapp update \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --name ${{ env.BACKEND_APP_NAME }} \
            --set-env-vars FRONTEND_URL=${{ steps.deployfrontend.outputs.FRONTEND_FQDN }}

      - name: Output Deployment URLs
        run: |
          echo "Frontend URL: https://${{ steps.deployfrontend.outputs.FRONTEND_FQDN }}"
          echo "Backend URL: https://${{ steps.deploybackend.outputs.BACKEND_FQDN }}"
```

**Important Notes for the Workflow File:**

*   Replace `<YOUR_ACR_NAME>` with the actual name of your Azure Container Registry.
*   **GitHub Secrets:**
    *   `AZURE_CREDENTIALS`: The JSON output from your Service Principal creation (as configured in step 3.1).
    *   `MONGODB_URI`: Your Azure Cosmos DB connection string.
    *   `JWT_SECRET`: A strong, random secret for your JWT.
    *   You will need to add `MONGODB_URI` and `JWT_SECRET` as new repository secrets in GitHub, similar to how you added `AZURE_CREDENTIALS`.
*   The `FRONTEND_URL` for the backend is initially set to `<FUTURE_FRONTEND_URL>` and then updated in a subsequent step once the frontend's FQDN is known. This ensures correct cross-service communication.

## 4. Deploy to Azure Container Apps (Manual Steps for Initial Setup)

Before running the GitHub Actions workflow, you need to perform some initial setup in Azure.

### 4.1. Create Azure Resources (if not already done)

Follow steps 2.1 to 2.5 in this document to manually create:
*   Resource Group
*   Azure Container Registry (ACR)
*   Azure Cosmos DB (MongoDB API)
*   Azure Storage Account (for Blob Storage - *though Blob Storage integration in code is a future step, the account itself is a prerequisite for the connection string*)

### 4.2. Configure Environment Variables (Initial Manual Setup)

For the very first deployment, you might need to manually set some environment variables in your Azure Container Apps via the Azure Portal or Azure CLI after they are created, especially if the GitHub Actions workflow fails to set them initially.

**Backend Container App:**
*   `MONGODB_URI`: Your Azure Cosmos DB connection string.
*   `JWT_SECRET`: A strong, random secret key.
*   `FRONTEND_URL`: The URL of your deployed frontend Container App (you'll get this after frontend deployment).
*   `AZURE_STORAGE_CONNECTION_STRING`: Connection string for your Azure Storage Account.
*   `NODE_ENV`: `production`

**Frontend Container App:**
*   No specific runtime environment variables are needed if Nginx is configured to proxy `/api/` and React is built with `REACT_APP_API_URL=/api`.

## 5. Persistent Storage for Uploads (Future Improvement)

**Important Note:** The current application stores uploaded images on the local filesystem of the `node-app` container. This is **not suitable for production deployments on Azure Container Apps** because containers are ephemeral. Any uploaded images will be lost if the container restarts, scales, or is replaced.

To implement persistent storage, you will need to:
1.  **Install `@azure/storage-blob` SDK** in your `node-app`.
2.  **Refactor your backend code** to use Azure Blob Storage for all image uploads and retrieval. This involves:
    *   Replacing Multer's `diskStorage` with a custom storage engine that uploads directly to Azure Blob Storage.
    *   Updating the logic in `productController.js` to store and retrieve image URLs from Azure Blob Storage.
    *   Potentially generating Shared Access Signature (SAS) URLs for secure access to private blobs.
3.  Ensure the `AZURE_STORAGE_CONNECTION_STRING` environment variable is correctly configured in your backend Container App.

This is a significant code change and is recommended for a production-ready application.

## 6. Testing the Deployment

1.  After the GitHub Actions workflow completes successfully, navigate to the `FRONTEND_URL` provided in the workflow logs.
2.  Test user registration, login, adding products (note: images will not persist without Blob Storage integration), searching, and liking products.
3.  Monitor the logs of your Azure Container Apps in the Azure Portal for any errors.

## 7. Troubleshooting

*   **GitHub Actions Logs:** If the workflow fails, check the GitHub Actions run logs for detailed error messages.
*   **Azure Container Apps Logs:** Check the logs of your Container Apps in the Azure Portal for any errors during startup or runtime.
*   **Network Issues:** Ensure your backend and frontend can communicate. If using Nginx proxy, verify the `proxy_pass` URL in `react-app/nginx.conf`.
*   **Environment Variables:** Double-check that all environment variables (especially secrets) are correctly set in GitHub Secrets and Azure Container Apps.
*   **CORS:** If you encounter CORS errors, ensure `FRONTEND_URL` in your backend's environment variables is correctly set to your frontend's domain.

This guide provides a solid foundation for deploying your MERN stack application to Azure Container Apps using GitHub Actions. Remember to secure your secrets and manage your resources effectively.
