/**
 * Home Component - Main landing page of the application
 * 
 * This component displays:
 * - Product listings with search and filtering
 * - Category-based product filtering
 * - Product like functionality
 * - Responsive design with modern UI
 * 
 * Features:
 * - Uses React Query for data fetching and caching
 * - Zustand for state management
 * - Tailwind CSS for styling
 * - Framer Motion for animations
 * - Error handling and loading states
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Import custom hooks and utilities
import useAuthStore from '../store/authStore';
import useProductStore from '../store/productStore';
import { useProducts } from '../hooks/useProducts';
import { useProductLike } from '../hooks/useProductLike';

// Import components
import Header from './Header.tsx';
import Categories from './Categories';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const Home = () => {
  // ==================== STATE MANAGEMENT ====================
  
  // Local component state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState(''); // 'newest', 'price-asc', 'price-desc'
  const [isSearching, setIsSearching] = useState(false);

  // Zustand stores
  const { isAuthenticated } = useAuthStore();
  const { likedProducts } = useProductStore();

  // React Router
  const navigate = useNavigate();

  // ==================== DATA FETCHING ====================

  const {
    productsData,
    productsLoading,
    productsError,
    refetchProducts,
    searchMutation,
  } = useProducts(selectedCategory, minPrice, maxPrice, sortBy);

  const likeMutation = useProductLike();

  // ==================== EFFECTS ====================

  /**
   * Get user's location for search functionality
   * This runs once when the component mounts
   */
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            localStorage.setItem('userLoc', `${latitude},${longitude}`);
          },
          (error) => {
            console.warn('Location access denied:', error);
            // Default to a central location if user denies access
            localStorage.setItem('userLoc', '28.6139,77.2090'); // Delhi coordinates
          }
        );
      }
    };

    getUserLocation();
  }, []);

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle search functionality
   * @param {string} searchValue - The search term
   */
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  /**
   * Execute search with location data
   */
  const handleSearchSubmit = () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    const userLocation = localStorage.getItem('userLoc');
    if (!userLocation) {
      toast.error('Location not available. Please enable location access.');
      return;
    }

    setIsSearching(true);
    searchMutation.mutate({
      search: searchTerm,
      location: userLocation
    });
  };

  /**
   * Handle category selection
   * @param {string} category - Selected category
   */
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsSearching(false);
    setSearchTerm('');
  };

  /**
   * Clear search results
   */
  const handleClearSearch = () => {
    setIsSearching(false);
    setSearchTerm('');
    searchMutation.reset();
  };

  /**
   * Handle product like/unlike
   * @param {string} productId - ID of the product to like/unlike
   * @param {Event} event - Click event to prevent navigation
   */
  const handleLikeProduct = (productId, event) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to like products');
      navigate('/login');
      return;
    }

    likeMutation.mutate({
      userId: localStorage.getItem('userId'),
      productId: productId,
    });
  };

  /**
   * Navigate to product detail page
   * @param {string} productId - ID of the product
   */
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // ==================== COMPUTED VALUES ====================

  // Get products to display
  const productsToShow = isSearching
    ? searchMutation.data?.products || []
    : productsData?.products || [];

  // Check if products are loading
  const isLoading = productsLoading || searchMutation.isPending;

  // Check if there's an error
  const hasError = productsError || searchMutation.error;

  // ==================== RENDER ====================

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          search={searchTerm}
          onSearch={handleSearch}
          onSearchSubmit={handleSearchSubmit}
        />
        <ErrorMessage 
          message="Failed to load products"
          onRetry={refetchProducts}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Component */}
      <Header 
        search={searchTerm}
        onSearch={handleSearch}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Categories Component */}
      <Categories
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />

      {/* Filter Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-4 bg-white shadow-sm border-b">
        <div className="flex items-center space-x-2">
          <label htmlFor="minPrice" className="text-sm font-medium text-gray-700">Price:</label>
          <input
            type="number"
            id="minPrice"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          <span>-</span>
          <input
            type="number"
            id="maxPrice"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="sortBy" className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <button
          onClick={() => refetchProducts()}
          className="ml-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Apply Filters
        </button>
      </div>

      {/* Search Results Header */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white shadow-sm border-b"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Search Results for "{searchTerm}"
                  {searchMutation.data && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({searchMutation.data.products.length} results)
                    </span>
                  )}
                </h2>
                <button
                  onClick={handleClearSearch}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <FaTimes className="mr-1" />
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="large" />
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && (
          <AnimatePresence>
            {productsToShow.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {productsToShow.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard
                      product={product}
                      isLiked={likedProducts.includes(product._id)}
                      onLike={(event) => handleLikeProduct(product._id, event)}
                      onClick={() => handleProductClick(product._id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-gray-400 text-6xl mb-4">
                  <FaSearch />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isSearching ? 'No products found' : 'No products available'}
                </h3>
                <p className="text-gray-500">
                  {isSearching 
                    ? 'Try adjusting your search terms or filters'
                    : 'Check back later for new products'
                  }
                </p>
                {isSearching && (
                  <button
                    onClick={handleClearSearch}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default Home;