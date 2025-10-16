/**
 * User Model - Defines the structure and behavior of User documents in MongoDB
 * 
 * This model represents a user in our application with the following features:
 * - User authentication (username, email, password)
 * - Contact information (mobile)
 * - Product interactions (liked products)
 * - Data validation and security
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

// Define the User schema - this is like a blueprint for user documents
const userSchema = new mongoose.Schema({
  // Username field with validation
  username: {
    type: String,
    required: [true, 'Username is required'], // Required field with custom error message
    unique: true, // No two users can have the same username
    trim: true, // Remove whitespace from beginning and end
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },

  // Email field with validation
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true, // Convert to lowercase
    validate: [validator.isEmail, 'Please provide a valid email address']
  },

  // Mobile number field
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    validate: {
      validator: function(v) {
        // Check if mobile number is valid (10 digits)
        return /^[0-9]{10}$/.test(v);
      },
      message: 'Mobile number must be 10 digits'
    }
  },

  // Password field (will be hashed before saving)
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default (security)
  },

  // Array of product IDs that the user has liked
  likedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product' // Reference to Product model
  }],

  // User profile information
  profile: {
    firstName: String,
    lastName: String,
    avatar: String, // URL to profile picture
    bio: String
  },

  // Account status
  isActive: {
    type: Boolean,
    default: true
  },

  // Timestamps
  lastLogin: Date
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

/**
 * Pre-save middleware - runs before saving a user document
 * This is where we hash the password for security
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to check if a password is correct
 * This method is available on all user documents
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

/**
 * Instance method to get user data without sensitive information
 */
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  
  // Remove sensitive fields from JSON output
  delete userObject.password;
  delete userObject.__v;
  
  return userObject;
};

/**
 * Static method to find user by email or username
 */
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  });
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;

