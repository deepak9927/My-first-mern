/**
 * User Interaction Controller - Handles user-specific interactions
 * 
 * This controller manages:
 * - Liking and unliking products
 * - Retrieving a user's liked products
 */

const User = require('../models/User');
const Product = require('../models/Product');

/**
 * Toggle Product Like
 * POST /api/like-product
 * 
 * Adds or removes a product from a user's liked products list
 * and updates the product's likes count.
 */
const likeProducts = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId; // Authenticated user ID from middleware

    // Find user and product
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const isLiked = user.likedProducts.includes(productId);

    if (isLiked) {
      // Unlike product
      user.likedProducts.pull(productId);
      await product.decrementLikes();
      await user.save();
      res.json({ success: true, message: 'Product unliked successfully', data: { isLiked: false } });
    } else {
      // Like product
      user.likedProducts.push(productId);
      await product.incrementLikes();
      await user.save();
      res.json({ success: true, message: 'Product liked successfully', data: { isLiked: true } });
    }

  } catch (error) {
    console.error('Toggle like product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * Get Liked Products
 * POST /api/liked-products
 * 
 * Retrieves all products liked by the authenticated user
 */
const likedProducts = async (req, res) => {
  try {
    const userId = req.user.userId; // Authenticated user ID from middleware

    const user = await User.findById(userId).populate('likedProducts');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Liked products retrieved successfully',
      data: { products: user.likedProducts }
    });

  } catch (error) {
    console.error('Get liked products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

module.exports = {
  likeProducts,
  likedProducts
};
