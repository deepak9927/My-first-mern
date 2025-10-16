/**
 * ErrorMessage Component - Reusable error display component
 * 
 * This component provides:
 * - Error message display
 * - Retry functionality
 * - Different error types
 * - User-friendly error messages
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ErrorMessage = ({ 
  message = 'Something went wrong',
  error = null,
  onRetry = null,
  showHomeButton = true,
  className = ''
}) => {
  /**
   * Get user-friendly error message
   */
  const getErrorMessage = () => {
    if (error?.response?.status === 404) {
      return 'The requested resource was not found';
    }
    if (error?.response?.status === 403) {
      return 'You do not have permission to access this resource';
    }
    if (error?.response?.status === 401) {
      return 'Please login to access this resource';
    }
    if (error?.response?.status >= 500) {
      return 'Server error. Please try again later';
    }
    if (error?.code === 'NETWORK_ERROR') {
      return 'Network error. Please check your connection';
    }
    return message;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center min-h-64 p-8 ${className}`}
    >
      {/* Error Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="text-red-500 text-6xl mb-4"
      >
        <FaExclamationTriangle />
      </motion.div>

      {/* Error Message */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-gray-900 mb-2 text-center"
      >
        {getErrorMessage()}
      </motion.h2>

      {/* Additional Error Details (Development Only) */}
      {process.env.NODE_ENV === 'development' && error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-100 p-4 rounded-lg mt-4 max-w-md"
        >
          <p className="text-sm text-gray-600 mb-2">Debug Information:</p>
          <pre className="text-xs text-gray-800 overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 mt-6"
      >
        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FaRedo className="mr-2" />
            Try Again
          </button>
        )}

        {/* Home Button */}
        {showHomeButton && (
          <Link
            to="/"
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaHome className="mr-2" />
            Go Home
          </Link>
        )}
      </motion.div>

      {/* Help Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-gray-500 mt-4 text-center max-w-md"
      >
        If this problem persists, please contact support or try refreshing the page.
      </motion.p>
    </motion.div>
  );
};

export default ErrorMessage;

