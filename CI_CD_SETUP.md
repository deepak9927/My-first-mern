# CI/CD Setup Guide - GitHub Actions → Azure

This guide walks you through setting up an industry-standard CI/CD pipeline that automatically deploys your MERN app to Azure whenever you push to the `main` branch.

## Overview

**Architecture:**
- **Frontend:** Deployed to Azure Static Web Apps (free tier, CDN-backed, auto SSL)
- **Backend:** Deployed to Azure App Service (Linux, Node 18, Free F1 or Basic B1)
- **Database:** MongoDB Atlas Free or Azure Cosmos DB
- **CI/CD:** GitHub Actions workflow triggers on push to `main`

**Benefits:**
- Zero-downtime deployments
- Automatic environment variable management
- Rollback capability via Git
- Industry-standard practices (secrets, concurrency control, outputs)

---

## Prerequisites

1. **Azure Account** with active subscription (your $100 student credit)
2. **GitHub Repository** (already set up: deepak9927/My-first-mern)
3. **Azure CLI** installed locally for initial setup
4. **MongoDB Connection String** (Atlas or Cosmos DB)

---

## Step 1: Create Azure Resources

You need to create the backend App Service and Static Web App first. The GitHub Actions workflow will deploy code to these resources.

### Option A: Use the Quick Script (Recommended)

This creates everything you need on the Free tier:

```bash
# Log in to Azure
az login

# Run the deploy script (it creates resources + does first deploy)
chmod +x ./deploy-azure.sh
./deploy-azure.sh
```

When prompted:
- Backend name: `mern-backend-yourname` (globally unique)
- Frontend name: `mern-frontend-yourname` (just a label for now)
- MongoDB URI: your Atlas connection string
- Generate JWT secret: `y`

**Note:** The script currently deploys frontend to App Service. We'll switch to Static Web Apps in the next step for better performance and cost.

### Option B: Manual Resource Creation

```bash
# Variables
RESOURCE_GROUP="mern-app-rg"
LOCATION="eastus"
BACKEND_NAME="mern-backend-yourname"  # Must be globally unique
FRONTEND_SWA_NAME="mern-frontend-yourname"  # For Static Web App

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service Plan (Free F1)
az appservice plan create \
  --name mern-app-plan \
  --resource-group $RESOURCE_GROUP \
  --sku F1 \
  --is-linux

# Create backend App Service
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan mern-app-plan \
  --name $BACKEND_NAME \
  --runtime "NODE:18-lts"

# Create Static Web App for frontend (free tier)
az staticwebapp create \
  --name $FRONTEND_SWA_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

---

## Step 2: Configure GitHub Secrets

Go to your GitHub repository: **Settings → Secrets and variables → Actions**

### Required Secrets

Click **New repository secret** for each:

#### 1. `AZURE_CREDENTIALS`
Service Principal credentials for Azure login. Create it with:

```bash
az ad sp create-for-rbac \
  --name "github-actions-mern" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/mern-app-rg \
  --sdk-auth
```

Copy the entire JSON output and paste it as the secret value.

#### 2. `MONGODB_URI`
Your MongoDB connection string:
```
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mern?retryWrites=true&w=majority
```

#### 3. `JWT_SECRET`
Generate a secure random secret:
```bash
openssl rand -hex 32
```
Copy the output and paste it as the secret value.

#### 4. `AZURE_STATIC_WEB_APPS_API_TOKEN`
Get the deployment token for your Static Web App:

```bash
az staticwebapp secrets list \
  --name $FRONTEND_SWA_NAME \
  --resource-group $RESOURCE_GROUP \
  --query properties.apiKey -o tsv
```

Copy the token and paste it as the secret value.

---

## Step 3: Configure GitHub Variables

Go to **Settings → Secrets and variables → Actions → Variables tab**

Click **New repository variable** for each:

#### 1. `AZURE_RESOURCE_GROUP`
Value: `mern-app-rg`

#### 2. `AZURE_WEBAPP_BACKEND_NAME`
Value: Your backend app name (e.g., `mern-backend-yourname`)

---

## Step 4: Update Workflow File

The workflow is already configured in `.github/workflows/azure-deploy.yml`.

Review the file and ensure:
- `AZURE_RESOURCE_GROUP` matches your resource group name
- `AZURE_WEBAPP_BACKEND_NAME` matches your backend app name

The workflow will:
1. Build and deploy frontend to Static Web Apps (outputs the URL)
2. Build backend
3. Set backend environment variables (MONGODB_URI, JWT_SECRET, FRONTEND_URL)
4. Deploy backend to App Service

---

## Step 5: Test the Pipeline

### Trigger a Deployment

Push any change to the `main` branch:

```bash
git add .
git commit -m "chore: trigger CI/CD pipeline"
git push origin main
```

### Monitor the Workflow

1. Go to your GitHub repo: **Actions** tab
2. Click the latest workflow run
3. Watch the `frontend` and `backend` jobs

### Check Deployment Status

**Frontend URL:**
```bash
az staticwebapp show \
  --name $FRONTEND_SWA_NAME \
  --resource-group $RESOURCE_GROUP \
  --query defaultHostname -o tsv
```

**Backend URL:**
```bash
az webapp show \
  --name $BACKEND_NAME \
  --resource-group $RESOURCE_GROUP \
  --query defaultHostName -o tsv
```

---

## Step 6: Verify the Deployment

### Test Frontend
Open the Static Web App URL in your browser. You should see the React app.

### Test Backend
```bash
curl https://$BACKEND_NAME.azurewebsites.net/
```

Expected response:
```json
{
  "message": "MERN Stack API is running!",
  "version": "2.0.0",
  "timestamp": "..."
}
```

### Test Full Flow
1. Open the frontend URL
2. Sign up for a new account
3. Log in
4. Add a product
5. View products on the home page

---

## Troubleshooting

### Workflow Fails at Azure Login
- Check that `AZURE_CREDENTIALS` secret is valid JSON
- Verify the service principal has `Contributor` role on the resource group

### Workflow Fails at Static Web Apps Deploy
- Check that `AZURE_STATIC_WEB_APPS_API_TOKEN` is correct
- Regenerate the token if needed:
  ```bash
  az staticwebapp secrets reset \
    --name $FRONTEND_SWA_NAME \
    --resource-group $RESOURCE_GROUP
  ```

### Backend Deployment Succeeds but App Returns Errors
- Check backend logs:
  ```bash
  az webapp log tail --name $BACKEND_NAME --resource-group $RESOURCE_GROUP
  ```
- Verify environment variables are set:
  ```bash
  az webapp config appsettings list \
    --name $BACKEND_NAME \
    --resource-group $RESOURCE_GROUP
  ```

### CORS Errors
- The workflow automatically sets `FRONTEND_URL` to the Static Web App URL
- If CORS still fails, manually update it:
  ```bash
  az webapp config appsettings set \
    --name $BACKEND_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings FRONTEND_URL="https://<your-swa-url>.azurestaticapps.net"
  ```

---

## Cost Optimization Tips

**Free Tier Resources:**
- Static Web Apps: 100 GB bandwidth/month free
- App Service F1: 60 CPU minutes/day, 1 GB RAM, 1 GB storage (free)
- MongoDB Atlas: 512 MB free

**To Keep Costs at $0/month:**
- Use Free F1 for backend
- Use Static Web Apps free tier for frontend
- Use MongoDB Atlas free tier

**If You Upgrade Later:**
- B1 App Service: ~$13/month (always-on, no cold starts)
- Cosmos DB: ~$25/month (400 RU/s, 1 GB storage)

With your $100 credit, you can run B1 + Cosmos DB for ~2-3 months.

---

## Advanced: Environment-Specific Deployments

To add staging/production environments:

1. Create separate branches: `staging`, `production`
2. Create separate Azure resources for each environment
3. Update the workflow to deploy based on branch:

```yaml
on:
  push:
    branches: [ main, staging, production ]

jobs:
  frontend:
    steps:
      - name: Determine environment
        id: env
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/production" ]]; then
            echo "env=production" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == "refs/heads/staging" ]]; then
            echo "env=staging" >> $GITHUB_OUTPUT
          else
            echo "env=development" >> $GITHUB_OUTPUT
          fi
```

---

## Next Steps

- [ ] Set up Azure Application Insights for monitoring
- [ ] Add health check endpoints
- [ ] Implement blue-green deployments
- [ ] Set up custom domains and SSL
- [ ] Add automated testing to the pipeline
- [ ] Configure Azure CDN for static assets

For questions or issues, check the troubleshooting section or refer to:
- [Azure Static Web Apps Docs](https://learn.microsoft.com/azure/static-web-apps/)
- [Azure App Service Docs](https://learn.microsoft.com/azure/app-service/)
- [GitHub Actions Azure Docs](https://learn.microsoft.com/azure/developer/github/github-actions)
