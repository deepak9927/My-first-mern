const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import controllers
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const userController = require('./controllers/userController'); // Keep for backward compatibility

// Import middleware
const { authenticateToken, optionalAuth } = require('./middleware/auth');
const validate = require('./middleware/zodValidation');
const {
  signupSchema,
  loginSchema,
  addProductSchema,
  searchSchema,
  profileUpdateSchema,
  userIdParamSchema,
} = require('./lib/validations');

// Security middleware
const app = express();
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const port = process.env.PORT || 5000;

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-marketplace';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB:', mongoUri))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.log('💡 Make sure MongoDB is running on localhost:27017');
  console.log('💡 Or set MONGODB_URI environment variable');
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MERN Stack API is running!', 
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// ==================== API ROUTES ====================

// Authentication Routes
app.post('/api/auth/signup', validate(signupSchema), authController.signup);
app.post('/api/auth/login', validate(loginSchema), authController.login);
app.get('/api/auth/profile', authenticateToken, authController.getProfile);
app.put('/api/auth/profile', authenticateToken, validate(profileUpdateSchema), authController.updateProfile);
app.get('/api/auth/user/:userId', validate(userIdParamSchema), authController.getUserById);

// Product Routes
app.get('/api/products', productController.getProducts);
app.get('/api/products/search', validate(searchSchema), productController.searchProducts);
app.get('/api/products/category/:category', productController.getProductsByCategory);
app.get('/api/products/:productId', productController.getProductById);
app.post('/api/products', authenticateToken, validate(addProductSchema), upload.fields([{ name: 'pimage' }, { name: 'pimage2' }]), productController.addProduct);
app.put('/api/products/:productId', authenticateToken, productController.updateProduct);
app.delete('/api/products/:productId', authenticateToken, productController.deleteProduct);
app.post('/api/products/my-products', authenticateToken, productController.getUserProducts);

// User Interaction Routes (Likes, etc.)
app.post('/api/like-product', authenticateToken, userController.likeProducts);
app.post('/api/liked-products', authenticateToken, userController.likedProducts);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});
