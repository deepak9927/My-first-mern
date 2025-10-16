/**
 * ProductCard Component - Reusable product card component
 * 
 * This component displays:
 * - Product image with hover effects
 * - Product information (name, price, description)
 * - Like button with animation
 * - Click handler for navigation
 * 
 * Features:
 * - Responsive design
 * - Hover animations
 * - Like functionality
 * - Image loading states
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ProductCard = ({ 
  product, 
  isLiked = false, 
  onLike, 
  onClick,
  showLocation = false 
}) => {
  // Local state for image loading
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  /**
   * Handle image load success
   */
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  /**
   * Handle image load error
   */
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  /**
   * Format price for display
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  /**
   * Truncate text to specified length
   */
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {/* Product Image Container */}
      <div className="relative aspect-w-16 aspect-h-9 bg-gray-200">
        {/* Loading State */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Product Image */}
        {!imageError ? (
          <img
            src={`http://localhost:5000/${product.pimage}`}
            alt={product.pname}
            className={`w-full h-48 object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="text-2xl mb-2">📷</div>
              <div className="text-sm">Image not available</div>
            </div>
          </div>
        )}

        {/* Like Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onLike}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-colors ${
            isLiked 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-red-50'
          }`}
        >
          <FaHeart className={`text-sm ${isLiked ? 'fill-current' : ''}`} />
        </motion.button>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>

        {/* Location Badge (if enabled) */}
        {showLocation && product.pLoc && (
          <div className="absolute bottom-3 left-3">
            <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <FaMapMarkerAlt className="mr-1" />
              Nearby
            </div>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.pname}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-primary-600">
            {formatPrice(product.price)}
          </span>
          {product.condition && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {product.condition}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {truncateText(product.pdesc)}
        </p>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Added {new Date(product.createdAt).toLocaleDateString()}</span>
          {product.likesCount > 0 && (
            <span className="flex items-center">
              <FaHeart className="mr-1 text-red-500" />
              {product.likesCount}
            </span>
          )}
        </div>

        {/* View Details Link */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link
            to={`/product/${product._id}`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            View Details →
          </Link>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 pointer-events-none" />
    </motion.div>
  );
};

export default ProductCard;

