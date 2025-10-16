# 🛒 OLX Clone - Modern MERN Marketplace Application

## 📋 Project Overview

This is a full-stack marketplace application (OLX clone) where users can buy and sell second-hand items. Built with modern technologies and industry-standard practices.

### 🎯 Core Features

1. **User Authentication**
   - Register/Login with JWT authentication
   - Protected routes for authenticated users
   - Persistent sessions with Zustand

2. **Product Management**
   - List products for sale with images
   - Browse products by category
   - Search and filter products
   - Like/favorite products
   - View detailed product information

3. **User Dashboard**
   - My Products - Manage your listings
   - Liked Products - View favorited items
   - User Profile - Update account details

4. **Categories**
   - Pre-defined product categories
   - Category-based filtering
   - Category-wise product browsing

## 🏗️ Architecture

### Tech Stack

#### Frontend
- **React 18.3.1** - UI Library with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS 3.4.15** - Utility-first styling
- **Zustand 5.0.8** - Lightweight state management
- **React Query 5.90.2** - Server state management & caching
- **React Hook Form 7.65.0** - Form handling
- **Zod 4.1.12** - Schema validation
- **React Router 6.28.0** - Client-side routing
- **Framer Motion 11.18.2** - Animations
- **Axios 1.7.9** - HTTP client

#### Backend
- **Node.js & Express 4.21.2** - Server framework
- **MongoDB 8.9.4** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Helmet** - Security headers
- **Express Validator** - Input validation

### Project Structure

```
My-first-mern/
├── node-app/                     # Backend API
│   ├── controllers/              # Route controllers
│   │   ├── authController.js    # Authentication logic
│   │   ├── productController.js # Product CRUD operations
│   │   └── userController.js    # User management
│   ├── middleware/               # Custom middleware
│   │   ├── auth.js              # JWT authentication
│   │   └── validation.js        # Input validation
│   ├── models/                   # MongoDB models
│   │   ├── User.js              # User schema
│   │   └── Product.js           # Product schema
│   ├── uploads/                  # Product images
│   ├── index.js                 # Main server file
│   ├── package.json
│   └── .env                     # Environment variables
│
├── react-app/                    # Frontend React App
│   ├── public/                  # Static files
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Header.jsx       # Navigation header
│   │   │   ├── Home.jsx         # Main product listing
│   │   │   ├── Login.tsx        # Login page
│   │   │   ├── Signup.tsx       # Registration page
│   │   │   ├── ProductCard.jsx  # Product card component
│   │   │   ├── ProductDetail.jsx# Product details page
│   │   │   ├── AddProduct.jsx   # Create product form
│   │   │   ├── MyProducts.jsx   # User's products
│   │   │   ├── LikedProducts.jsx# Favorited products
│   │   │   ├── Categories.jsx   # Category list
│   │   │   └── ProtectedRoute.tsx# Route protection
│   │   ├── hooks/               # Custom React hooks
│   │   │   └── useAuth.ts       # Authentication hooks
│   │   ├── lib/                 # Utilities
│   │   │   ├── api.ts           # API client
│   │   │   ├── queryClient.ts   # React Query config
│   │   │   └── validations.ts   # Zod schemas
│   │   ├── store/               # Zustand stores
│   │   │   ├── authStore.ts     # Auth state
│   │   │   └── productStore.ts  # Product state
│   │   ├── App.tsx              # Main app component
│   │   ├── index.css            # Global styles
│   │   └── constants.js         # API constants
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── postcss.config.js        # PostCSS config
│   ├── tsconfig.json            # TypeScript config
│   └── package.json
│
├── docker-compose.yml            # Docker configuration
├── .github/workflows/            # CI/CD pipelines
│   └── azure-deploy.yml         # Azure deployment
├── AZURE_DEPLOYMENT.md          # Deployment guide
├── TAILWIND_UPGRADE.md          # Tailwind usage guide
└── README.md                    # Project documentation
```

## 🔐 Authentication Flow

1. **Registration**
   - User submits form with username, email, mobile, password
   - Form validated with Zod schema
   - Password hashed with bcrypt
   - User stored in MongoDB
   - JWT token generated and returned

2. **Login**
   - User submits email/username and password
   - Credentials validated
   - JWT token generated
   - Token stored in localStorage
   - User data stored in Zustand

3. **Protected Routes**
   - Token included in API requests via Axios interceptors
   - Backend verifies token on protected routes
   - Invalid tokens redirect to login

## 📊 Data Models

### User Model
```javascript
{
  username: String (required, unique, 3-20 chars),
  email: String (required, unique, valid email),
  mobile: String (required, 10 digits),
  password: String (required, hashed, min 6 chars),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  pname: String (required, product name),
  pdesc: String (required, description),
  price: Number (required, > 0),
  category: String (required),
  pimage: String (image path),
  pimage2: String (optional second image),
  addedBy: ObjectId (ref: User),
  pLoc: String (product location),
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 UI/UX Features

### Modern Design Elements
- **Responsive Design** - Works on all devices
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Loading States** - Skeleton screens and spinners
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Success/error feedback
- **Image Optimization** - Lazy loading and fallbacks

### Key Pages

1. **Home** (`/`)
   - Product grid with search
   - Category filters
   - Like functionality
   - Infinite scroll (ready for implementation)

2. **Product Detail** (`/product/:id`)
   - Large image view
   - Product information
   - Seller contact details
   - Related products

3. **Add Product** (`/add-product`)
   - Multi-step form
   - Image upload
   - Form validation
   - Category selection

4. **My Products** (`/my-products`)
   - User's listed products
   - Edit/Delete functionality
   - Quick actions

5. **Liked Products** (`/liked`)
   - Favorited items
   - Quick access to saved products

## 🔧 State Management

### Zustand Stores

#### Auth Store
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  login: (user, token) => void,
  logout: () => void,
  updateUser: (user) => void
}
```

#### Product Store
```typescript
{
  products: Product[],
  likedProducts: string[],
  selectedCategory: string,
  searchTerm: string,
  toggleLike: (productId) => void,
  setProducts: (products) => void,
  setSelectedCategory: (category) => void
}
```

### React Query

- **Products Query** - Fetch all products with caching
- **Product Detail Query** - Individual product data
- **User Products Query** - User's listings
- **Mutations** - Create, update, delete products
- **Optimistic Updates** - Instant UI feedback

## 🚀 API Endpoints

### Authentication
- `POST /signup` - Register new user
- `POST /login` - Login user
- `GET /my-profile` - Get current user (protected)

### Products
- `GET /get-products` - Get all products
- `GET /get-product/:id` - Get single product
- `POST /add-product` - Create product (protected)
- `POST /edit-product` - Update product (protected)
- `POST /delete-product` - Delete product (protected)
- `GET /my-products` - Get user's products (protected)
- `GET /search` - Search products

### Likes
- `POST /like-product` - Toggle like (protected)
- `GET /liked-products` - Get liked products (protected)

## 🔒 Security Features

1. **Authentication**
   - JWT tokens with expiry
   - Password hashing with bcrypt
   - Protected routes

2. **Validation**
   - Input sanitization
   - Zod schema validation
   - Express validator on backend

3. **Security Headers**
   - Helmet.js for security headers
   - CORS configuration
   - Rate limiting

4. **File Upload**
   - File type validation
   - File size limits
   - Secure file storage

## 🧪 Testing (Ready for Implementation)

### Recommended Testing Strategy

1. **Unit Tests**
   - Component testing with React Testing Library
   - Hook testing
   - Utility function tests

2. **Integration Tests**
   - API endpoint testing
   - Database operations
   - Authentication flow

3. **E2E Tests**
   - User flows (Cypress/Playwright)
   - Critical paths testing

## 📈 Performance Optimizations

1. **Frontend**
   - React Query caching
   - Code splitting
   - Image lazy loading
   - Memoization where needed
   - Production build optimization

2. **Backend**
   - MongoDB indexing
   - Response compression
   - Query optimization
   - Rate limiting

3. **Network**
   - API request batching
   - Debounced search
   - Optimistic updates

## 🌐 Deployment

### Azure Deployment (Using $100 Student Credit)

See detailed guides:
- `AZURE_DEPLOYMENT.md` - Complete deployment documentation
- `DEPLOYMENT_CHECKLIST.md` - Quick start guide
- `deploy-azure.sh` - Automated deployment script

### Cost Estimate
- **Basic Tier (B1)**: ~$13/month = 7 months with $100 credit
- **Free Tier (F1)**: $0/month = Use credit for scaling
- **MongoDB Atlas**: Free tier (512MB)

## 🔄 Future Enhancements

### High Priority
- [ ] Messaging system between buyers/sellers
- [ ] Payment integration
- [ ] User ratings and reviews
- [ ] Advanced search with filters
- [ ] Product bidding functionality

### Medium Priority
- [ ] Email notifications
- [ ] Social media sharing
- [ ] Product recommendations
- [ ] Save search functionality
- [ ] Multiple image upload

### Nice to Have
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Analytics and insights
- [ ] Multi-language support
- [ ] Dark mode

## 🛠️ Development

### Prerequisites
```bash
- Node.js 18+
- MongoDB (Atlas or local)
- pnpm/npm
```

### Setup
```bash
# Install dependencies
pnpm install

# Backend
cd node-app
cp .env.example .env  # Configure your environment
pnpm run dev

# Frontend
cd react-app
pnpm start
```

### Environment Variables

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000
```

## 📚 Additional Documentation

- `README.md` - Quick start guide
- `TAILWIND_UPGRADE.md` - Tailwind CSS usage
- `AZURE_DEPLOYMENT.md` - Azure deployment
- `GETTING_STARTED.md` - Development guide

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

This project is for educational purposes.

## 👨‍💻 Developer

Built by Deepak Thakur as a learning project for modern full-stack development.

---

**Last Updated**: October 2025  
**Version**: 2.0.0 (Modern Stack Upgrade)
