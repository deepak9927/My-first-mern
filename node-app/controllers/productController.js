/**
 * Product Controller - Handles product-related operations
 * 
 * This controller manages:
 * - Product creation and management
 * - Product search and filtering
 * - Location-based product discovery
 * - Product likes and interactions
 * - Category-based product retrieval
 */

const Product = require('../models/Product');
const User = require('../models/User');

/**
 * Add New Product
 * POST /api/products
 * 
 * Creates a new product listing with image uploads and location data
 */
const addProduct = async (req, res) => {
  try {
    const {
      pname,
      pdesc,
      price,
      category,
      plat, // latitude
      plong, // longitude
      condition = 'good'
    } = req.body;

    const addedBy = req.user.userId; // Rely solely on authenticated user ID

    // Validate primary image
    if (!req.files || !req.files.pimage || req.files.pimage.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Primary product image is required'
      });
    }

    // Create product object
    const productData = {
      pname,
      pdesc,
      price: parseFloat(price),
      category,
      pimage: req.files.pimage[0].path,
      addedBy,
      condition,
      pLoc: {
        type: 'Point',
        coordinates: [parseFloat(plong), parseFloat(plat)] // [longitude, latitude]
      }
    };

    // Add second image if provided
    if (req.files.pimage2 && req.files.pimage2.length > 0) {
      productData.pimage2 = req.files.pimage2[0].path;
    }

    // Create and save product
    const product = new Product(productData);
    const savedProduct = await product.save();

    // Populate user information
    await savedProduct.populate('addedBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: { product: savedProduct }
    });

  } catch (error) {
    console.error('Add product error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * Get All Products
 * GET /api/products
 * 
 * Retrieves products with optional category filtering and pagination
 */
const getProducts = async (req, res) => {
  try {
    const { catName, page = 1, limit = 20, status = 'active', minPrice, maxPrice, sortBy } = req.query;
    
    // Build query
    const query = { status };
    if (catName) {
      query.category = catName;
    }

    // Add price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    // Build sort options
    let sortOptions = { createdAt: -1 }; // Default to newest
    if (sortBy === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sortBy === 'price-desc') {
      sortOptions = { price: -1 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination and sorting
    const products = await Product.find(query)
      .populate('addedBy', 'username email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const totalProducts = await Product.countDocuments(query);

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProducts / parseInt(limit)),
          totalProducts,
          hasNext: skip + products.length < totalProducts,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * Get Product by ID
 * GET /api/products/:productId
 * 
 * Retrieves a specific product by its ID and increments view count
 */
const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate('addedBy', 'username email mobile');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    await product.incrementViews();

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Get product by ID error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * Search Products
 * GET /api/products/search
 * 
 * Searches products by text and location with geospatial queries
 */
const searchProducts = async (req, res) => {
  try {
    const { search, loc, category, maxDistance = 50 } = req.query;

    // Parse location coordinates
    const [latitude, longitude] = loc.split(',').map(coord => parseFloat(coord.trim()));

    // Build search query
    const query = {
        $or: [
        { pname: { $regex: search, $options: 'i' } }, // Case-insensitive search
        { pdesc: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ],
      status: 'active'
    };

    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Add location filter
    query.pLoc = {
            $near: {
                $geometry: {
                    type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    };

    const products = await Product.find(query)
      .populate('addedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Search completed successfully',
      data: {
        products,
        searchTerm: search,
        location: { latitude, longitude },
        resultsCount: products.length
      }
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * Get Products by Category
 * GET /api/products/category/:category
 * 
 * Retrieves all products in a specific category
 */
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.getByCategory(category)
      .populate('addedBy', 'username email')
      .skip(skip)
      .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments({ 
      category, 
      status: 'active' 
    });

    res.json({
      success: true,
      message: `Products in ${category} category retrieved successfully`,
      data: {
        products,
        category,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProducts / parseInt(limit)),
          totalProducts
        }
      }
    });

  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * Get User's Products
 * POST /api/products/my-products
 * 
 * Retrieves all products added by a specific user
 */
const getUserProducts = async (req, res) => {
  try {
    const userId = req.user.userId; // Rely solely on authenticated user ID

    const products = await Product.getUserProducts(userId)
      .populate('addedBy', 'username email');

    res.json({
      success: true,
      message: 'User products retrieved successfully',
      data: { products }
    });

  } catch (error) {
    console.error('Get user products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * Update Product
 * PUT /api/products/:productId
 * 
 * Updates an existing product (only by owner)
 */
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.userId;
    const updates = req.body;

    // Find product and check ownership
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.addedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own products'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.addedBy;
    delete updates.createdAt;
    delete updates.updatedAt;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updates,
      { new: true, runValidators: true }
    ).populate('addedBy', 'username email');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * Delete Product
 * DELETE /api/products/:productId
 * 
 * Deletes a product (only by owner)
 */
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.userId;

    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.addedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own products'
      });
    }

    await Product.findByIdAndDelete(productId);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getUserProducts,
  updateProduct,
  deleteProduct
};
