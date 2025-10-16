/**
 * LoadingSpinner Component - Reusable loading spinner
 * 
 * This component provides:
 * - Different sizes (small, medium, large)
 * - Customizable colors
 * - Smooth animations
 * - Accessibility features
 */

import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  className = '',
  text = null 
}) => {
  // Size configurations
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Color configurations
  const colorClasses = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600',
    red: 'border-red-600',
    green: 'border-green-600',
    blue: 'border-blue-600'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
        className={`${sizeClasses[size]} border-2 border-t-transparent rounded-full ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      />
      
      {/* Loading Text */}
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-sm text-gray-600"
        >
          {text}
        </motion.p>
      )}
      
      {/* Screen reader text */}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;

