# 🚀 Quick Start Guide

## Prerequisites
- Node.js (v18 or higher)
- pnpm (recommended) or npm
- MongoDB (local or Atlas)

## 1. Install Dependencies
```bash
# Install all dependencies
pnpm install
```

## 2. Set up Environment Variables

Create `.env` file in `node-app/` directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mern-marketplace
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
```

## 3. Start MongoDB (Local)
```bash
# Option 1: Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option 2: Install MongoDB locally
# Follow instructions at: https://docs.mongodb.com/manual/installation/
```

## 4. Start the Application
```bash
# Terminal 1: Start backend
cd node-app
pnpm run dev

# Terminal 2: Start frontend
cd react-app
pnpm start
```

## 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Quick Test
1. Open http://localhost:3000
2. Try to sign up with a new account
3. Add a product
4. Search for products

## Troubleshooting
- Make sure MongoDB is running on port 27017
- Check that ports 3000 and 5000 are available
- Verify environment variables are set correctly
