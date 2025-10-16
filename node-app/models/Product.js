/**
 * Product Model - Defines the structure and behavior of Product documents in MongoDB
 * 
 * This model represents a product in our marketplace with the following features:
 * - Product information (name, description, price, category)
 * - Image storage (multiple images)
 * - Location-based search (geospatial indexing)
 * - User ownership tracking
 */

const mongoose = require('mongoose');

// Define the Product schema
const productSchema = new mongoose.Schema({
  // Product name
  pname: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },

  // Product description
  pdesc: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [500, 'Product description cannot exceed 500 characters']
  },

  // Product price
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0.01, 'Price must be greater than 0'] // Align with frontend Zod schema
  },

  // Product category
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true,
    enum: {
      values: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Vehicles', 'Other'],
      message: 'Invalid category'
    }
  },

  // Product images
  pimage: {
    type: String,
    required: [true, 'Product image is required']
  },
  
  pimage2: {
    type: String,
    required: false // Make second image optional
  },

  // Additional images array for more flexibility
  additionalImages: [{
    type: String
  }],

  // User who added this product
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Product owner is required']
  },

  // Location information for geospatial search
  pLoc: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required'],
      validate: {
        validator: function(v) {
          // Validate coordinates: longitude between -180 and 180, latitude between -90 and 90
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && 
                 v[1] >= -90 && v[1] <= 90;
        },
        message: 'Invalid coordinates'
      }
    }
  },

  // Product status
  status: {
    type: String,
    enum: ['active', 'sold', 'inactive'],
    default: 'active'
  },

  // Product condition
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    default: 'good'
  },

  // Number of likes
  likesCount: {
    type: Number,
    default: 0
  },

  // Views count
  viewsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create geospatial index for location-based queries
productSchema.index({ pLoc: '2dsphere' });

// Create text index for search functionality
productSchema.index({ 
  pname: 'text', 
  pdesc: 'text', 
  category: 'text' 
});

// Create compound indexes for better query performance
productSchema.index({ category: 1, status: 1 });
productSchema.index({ addedBy: 1, status: 1 });

/**
 * Instance method to increment views count
 */
productSchema.methods.incrementViews = function() {
  this.viewsCount += 1;
  return this.save();
};

/**
 * Instance method to increment likes count
 */
productSchema.methods.incrementLikes = function() {
  this.likesCount += 1;
  return this.save();
};

/**
 * Instance method to decrement likes count
 */
productSchema.methods.decrementLikes = function() {
  if (this.likesCount > 0) {
    this.likesCount -= 1;
  }
  return this.save();
};

/**
 * Static method to find products by location
 */
productSchema.statics.findByLocation = function(longitude, latitude, maxDistance = 50000) {
  return this.find({
    pLoc: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // Distance in meters
      }
    },
    status: 'active'
  });
};

/**
 * Static method to search products by text
 */
productSchema.statics.searchProducts = function(searchTerm, category = null) {
  const query = {
    $text: { $search: searchTerm },
    status: 'active'
  };

  if (category) {
    query.category = category;
  }

  return this.find(query).sort({ score: { $meta: 'textScore' } });
};

/**
 * Static method to get products by category
 */
productSchema.statics.getByCategory = function(category) {
  return this.find({ 
    category: category, 
    status: 'active' 
  }).sort({ createdAt: -1 });
};

/**
 * Static method to get user's products
 */
productSchema.statics.getUserProducts = function(userId) {
  return this.find({ 
    addedBy: userId 
  }).sort({ createdAt: -1 });
};

// Create and export the Product model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
