# Deployment Todo - Resume After Quota Reset

## Current Status ✅
- [x] Created Azure Resource Group: `mern-app-rg`
- [x] Created App Service Plan: `mern-app-plan` (Free F1)
- [x] Created Backend App: `olx-api-deepak2025`
- [x] Set up MongoDB Atlas Free cluster
- [x] Set environment variables (MONGODB_URI, JWT_SECRET, NODE_ENV)
- [x] Deployed backend code to Azure

## Issue 🚫
Backend app exceeded Free F1 quota (60 CPU minutes/day). Quota resets at **midnight UTC**.

## Next Steps (After Quota Reset - Tomorrow)

### Step 1: Verify Backend is Running
Wait until after midnight UTC (check current time: https://time.is/UTC)

Then run:
```bash
az webapp show --name olx-api-deepak2025 --resource-group mern-app-rg --query state -o tsv
```

Expected: `Running`

### Step 2: Test Backend API
```bash
curl https://olx-api-deepak2025.azurewebsites.net/
```

Expected response:
```json
{
  "message": "MERN Stack API is running!",
  "version": "2.0.0",
  "timestamp": "..."
}
```

### Step 3: Create Static Web App for Frontend

```bash
# Create Static Web App (free tier, CDN, auto SSL)
az staticwebapp create \
  --name olx-web-deepak2025 \
  --resource-group mern-app-rg \
  --location eastus
```

### Step 4: Get Static Web App Deployment Token

```bash
az staticwebapp secrets list \
  --name olx-web-deepak2025 \
  --resource-group mern-app-rg \
  --query properties.apiKey -o tsv
```

Save this token - you'll need it for GitHub Actions.

### Step 5: Build and Deploy Frontend Manually (First Time)

```bash
# Set backend URL for build
echo "REACT_APP_API_URL=https://olx-api-deepak2025.azurewebsites.net" > react-app/.env.production

# Build frontend
cd react-app
npm install
npm run build
cd ..

# Get Static Web App deployment token from Step 4 and deploy
# (You'll use GitHub Actions for future deploys)
```

### Step 6: Update Backend FRONTEND_URL

Once frontend is deployed, get its URL:
```bash
az staticwebapp show \
  --name olx-web-deepak2025 \
  --resource-group mern-app-rg \
  --query defaultHostname -o tsv
```

Then update backend CORS:
```bash
FRONTEND_URL=$(az staticwebapp show --name olx-web-deepak2025 --resource-group mern-app-rg --query defaultHostname -o tsv)

az webapp config appsettings set \
  --resource-group mern-app-rg \
  --name olx-api-deepak2025 \
  --settings FRONTEND_URL="https://$FRONTEND_URL"
```

### Step 7: Set Up GitHub Actions CI/CD

Go to: https://github.com/deepak9927/My-first-mern/settings/secrets/actions

#### Add Secrets:
1. **AZURE_CREDENTIALS**
   ```bash
   # Get your subscription ID first
   SUBSCRIPTION_ID=$(az account show --query id -o tsv)
   
   # Create service principal
   az ad sp create-for-rbac \
     --name "github-actions-mern" \
     --role contributor \
     --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/mern-app-rg \
     --sdk-auth
   ```
   Copy the entire JSON output and paste as secret.

2. **MONGODB_URI**
   ```
   mongodb+srv://olxadmin:pvLuafa5Ppang1X1@cluster0.du6elbn.mongodb.net/mern?retryWrites=true&w=majority&appName=Cluster0
   ```

3. **JWT_SECRET**
   ```bash
   openssl rand -hex 32
   ```
   Copy the output.

4. **AZURE_STATIC_WEB_APPS_API_TOKEN**
   Use the token from Step 4.

#### Add Variables:
Go to: https://github.com/deepak9927/My-first-mern/settings/variables/actions

1. **AZURE_RESOURCE_GROUP**: `mern-app-rg`
2. **AZURE_WEBAPP_BACKEND_NAME**: `olx-api-deepak2025`

### Step 8: Test CI/CD Pipeline

```bash
git commit --allow-empty -m "chore: trigger CI/CD pipeline"
git push origin main
```

Watch deployment: https://github.com/deepak9927/My-first-mern/actions

### Step 9: Verify Full Stack

1. **Frontend URL:** Get from Step 6
2. **Backend URL:** https://olx-api-deepak2025.azurewebsites.net

Test:
- Sign up for account
- Log in
- Add a product
- View products

---

## Important Notes

**MongoDB Atlas:**
- Username: `olxadmin`
- Password: `pvLuafa5Ppang1X1`
- Database: `mern`
- You can change password in MongoDB Atlas → Database Access

**Azure Resources:**
- Resource Group: `mern-app-rg`
- Backend: `olx-api-deepak2025.azurewebsites.net`
- Frontend: Will be `olx-web-deepak2025.azurestaticapps.net`

**Free Tier Limits:**
- App Service F1: 60 CPU minutes/day, resets at midnight UTC
- Static Web Apps: 100 GB bandwidth/month
- MongoDB Atlas: 512 MB storage

**Cost:** $0/month with free tiers

---

## If You Want to Upgrade Later (Optional)

Upgrade to B1 for no quotas:
```bash
az appservice plan update \
  --name mern-app-plan \
  --resource-group mern-app-rg \
  --sku B1
```

Cost: ~$13/month from your $100 credit

---

## Quick Reference Commands

**View backend logs:**
```bash
az webapp log tail --name olx-api-deepak2025 --resource-group mern-app-rg
```

**Restart backend:**
```bash
az webapp restart --name olx-api-deepak2025 --resource-group mern-app-rg
```

**Delete everything (cleanup):**
```bash
az group delete --name mern-app-rg --yes
```

---

## Documentation Files Created

- `AZURE_DEPLOYMENT.md` - Complete Azure deployment guide
- `CI_CD_SETUP.md` - GitHub Actions CI/CD setup
- `BACKEND_GUIDE.md` - Backend code explanation
- `API_REFERENCE.md` - API endpoints documentation

Good luck with your deployment! 🚀
