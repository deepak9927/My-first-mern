# Quick Deployment Checklist for Azure

## Before You Start
- [ ] Azure account with student credits activated
- [ ] MongoDB Atlas free cluster created
- [ ] Azure CLI installed locally
- [ ] Project pushed to GitHub

## Step-by-Step Deployment

### 1. MongoDB Setup (5 minutes)
```bash
1. Go to mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP: 0.0.0.0/0
5. Copy connection string
```

### 2. Azure Login (2 minutes)
```bash
az login
az account show  # Verify student subscription is active
```

### 3. Create Resources (3 minutes)
```bash
# Create resource group
az group create --name mern-app-rg --location eastus

# Create App Service Plan (Basic tier - ~$13/month)
az appservice plan create \
  --name mern-plan \
  --resource-group mern-app-rg \
  --sku B1 \
  --is-linux
```

### 4. Deploy Backend (5 minutes)
```bash
# Create backend web app
az webapp create \
  --resource-group mern-app-rg \
  --plan mern-plan \
  --name YOUR-UNIQUE-BACKEND-NAME \
  --runtime "NODE:18-lts"

# Set environment variables (replace with your values)
az webapp config appsettings set \
  --resource-group mern-app-rg \
  --name YOUR-UNIQUE-BACKEND-NAME \
  --settings \
    NODE_ENV=production \
    MONGODB_URI="YOUR_MONGODB_CONNECTION_STRING" \
    JWT_SECRET="$(openssl rand -hex 32)" \
    FRONTEND_URL="https://YOUR-UNIQUE-FRONTEND-NAME.azurewebsites.net"

# Deploy code
cd node-app
zip -r ../backend.zip .
cd ..
az webapp deployment source config-zip \
  --resource-group mern-app-rg \
  --name YOUR-UNIQUE-BACKEND-NAME \
  --src backend.zip
```

### 5. Deploy Frontend (5 minutes)
```bash
# Update API URL
echo "REACT_APP_API_URL=https://YOUR-UNIQUE-BACKEND-NAME.azurewebsites.net" > react-app/.env.production

# Build React app
cd react-app
npm install
npm run build
cd ..

# Create frontend web app
az webapp create \
  --resource-group mern-app-rg \
  --plan mern-plan \
  --name YOUR-UNIQUE-FRONTEND-NAME \
  --runtime "NODE:18-lts"

# Deploy frontend
cd react-app/build
zip -r ../../frontend.zip .
cd ../..
az webapp deployment source config-zip \
  --resource-group mern-app-rg \
  --name YOUR-UNIQUE-FRONTEND-NAME \
  --src frontend.zip
```

### 6. Test Your Deployment
```bash
# Check backend
curl https://YOUR-UNIQUE-BACKEND-NAME.azurewebsites.net

# Open frontend in browser
https://YOUR-UNIQUE-FRONTEND-NAME.azurewebsites.net
```

## Estimated Costs (with $100 student credit)

| Service | Tier | Monthly Cost | Credit Usage |
|---------|------|-------------|--------------|
| App Service Plan (B1) | Basic | $13 | Covered |
| Backend Web App | - | Included in plan | - |
| Frontend Web App | - | Included in plan | - |
| MongoDB Atlas | Free | $0 | - |
| **Total** | | **~$13/month** | **7 months of hosting** |

## Alternative: Save Money with Free Tier

```bash
# Use F1 Free tier (limited but enough for testing)
az appservice plan create \
  --name mern-free-plan \
  --resource-group mern-app-rg \
  --sku F1 \
  --is-linux

# Deploy with free plan - extends your credit to 100+ months!
```

## Monitoring Your Spending

```bash
# Check current costs
az consumption usage list --start-date 2025-10-01 --end-date 2025-10-16

# Set up budget alert
az consumption budget create \
  --budget-name "student-budget" \
  --amount 100 \
  --time-grain Monthly \
  --start-date 2025-10-01 \
  --end-date 2026-10-01
```

## Common Issues & Fixes

### Backend won't start?
```bash
# Check logs
az webapp log tail --name YOUR-UNIQUE-BACKEND-NAME --resource-group mern-app-rg

# Restart app
az webapp restart --name YOUR-UNIQUE-BACKEND-NAME --resource-group mern-app-rg
```

### Frontend can't connect to backend?
1. Check CORS settings in backend
2. Verify REACT_APP_API_URL is correct
3. Check backend is running: `curl https://YOUR-UNIQUE-BACKEND-NAME.azurewebsites.net`

### App names taken?
Try adding numbers or your initials: `mern-backend-dk2025`, `my-react-app-dt`

## Cleanup (when done testing)

```bash
# Delete everything to stop charges
az group delete --name mern-app-rg --yes --no-wait
```

## Next Steps

1. [ ] Set up custom domain (optional)
2. [ ] Configure SSL (included free with Azure)
3. [ ] Set up CI/CD with GitHub Actions
4. [ ] Enable Application Insights for monitoring
5. [ ] Scale up if needed

---

**Total setup time: ~20 minutes**

**Questions?** Check AZURE_DEPLOYMENT.md for detailed documentation!
