/**
 * Simple Home Component - Basic working version
 * This is a simplified version that works with the existing backend
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../constants';

const SimpleHome = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/get-products`);
      if (response.data.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!search.trim()) {
      alert('Please enter a search term');
      return;
    }

    const userLoc = localStorage.getItem('userLoc') || '28.6139,77.2090';
    const url = `${API_URL}/search?search=${search}&loc=${userLoc}`;
    
    axios.get(url)
      .then((res) => {
        setProducts(res.data.products || []);
        setIsSearching(true);
      })
      .catch((err) => {
        console.error('Search error:', err);
        alert('Search failed');
      });
  };

  const handleClearSearch = () => {
    setIsSearching(false);
    setSearch('');
    fetchProducts();
  };

  const handleLike = (productId, e) => {
    e.stopPropagation();
    const userId = localStorage.getItem('userId');

    if (!userId) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    const data = { userId, productId };
    axios.post(`${API_URL}/like-product`, data)
      .then((res) => {
        if (res.data.message) {
          alert('Product liked!');
        }
      })
      .catch((err) => {
        console.error('Like error:', err);
        alert('Failed to like product');
      });
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            {isSearching && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isSearching && (
          <h2 className="text-xl font-semibold mb-6">
            Search Results for "{search}"
          </h2>
        )}

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {isSearching ? 'No products found' : 'No products available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => handleProductClick(product._id)}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={`${API_URL}/${product.pimage}`}
                    alt={product.pname}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                  
                  {/* Like Button */}
                  <button
                    onClick={(e) => handleLike(product._id, e)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    <FaHeart className="text-gray-600 hover:text-red-500" />
                  </button>

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.pname}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">
                    ₹{product.price}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {product.pdesc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleHome;
