/**
 * Modern App Component with Advanced Features
 * 
 * This component includes:
 * - React Query for data fetching
 * - Zustand for state management
 * - React Router for navigation
 * - Framer Motion for animations
 * - React Hot Toast for notifications
 * - Tailwind CSS for styling
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Configuration
import { queryClient } from './lib/queryClient';

// Components
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import ProductDetail from './components/ProductDetail';
import CategoryPage from './components/CategoryPage';
import MyProducts from './components/MyProducts';
import MyProfile from './components/MyProfile';
import LikedProducts from './components/LikedProducts';
import AddProduct from './components/AddProduct';
import Categories from './components/Categories';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Styles
import './App.css';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

// Animated page wrapper
const AnimatedPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App min-h-screen bg-gray-50">
            <Header />
            
            <main className="flex-1">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <AnimatedPage>
                        <Home />
                      </AnimatedPage>
                    }
                  />
                  
                  <Route
                    path="/login"
                    element={
                      <AnimatedPage>
                        <Login />
                      </AnimatedPage>
                    }
                  />
                  
                  <Route
                    path="/signup"
                    element={
                      <AnimatedPage>
                        <Signup />
                      </AnimatedPage>
                    }
                  />
                  
                  <Route
                    path="/product/:id"
                    element={
                      <AnimatedPage>
                        <ProductDetail />
                      </AnimatedPage>
                    }
                  />
                  
                  <Route
                    path="/category/:category"
                    element={
                      <AnimatedPage>
                        <CategoryPage />
                      </AnimatedPage>
                    }
                  />
                  
                  <Route
                    path="/categories"
                    element={
                      <AnimatedPage>
                        <Categories />
                      </AnimatedPage>
                    }
                  />
                  
                  <Route
                    path="/my-products"
                    element={
                      <ProtectedRoute>
                        <AnimatedPage>
                          <MyProducts />
                        </AnimatedPage>
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <AnimatedPage>
                          <MyProfile />
                        </AnimatedPage>
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/liked"
                    element={
                      <ProtectedRoute>
                        <AnimatedPage>
                          <LikedProducts />
                        </AnimatedPage>
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/add-product"
                    element={
                      <ProtectedRoute>
                        <AnimatedPage>
                          <AddProduct />
                        </AnimatedPage>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* 404 Route */}
                  <Route
                    path="*"
                    element={
                      <AnimatedPage>
                        <div className="flex items-center justify-center min-h-screen">
                          <div className="text-center">
                            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                              Page Not Found
                            </h2>
                            <p className="text-gray-500 mb-8">
                              The page you're looking for doesn't exist.
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => window.history.back()}
                              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Go Back
                            </motion.button>
                          </div>
                        </div>
                      </AnimatedPage>
                    }
                  />
                </Routes>
              </AnimatePresence>
            </main>
            
            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#f9fafb',
                  borderRadius: '8px',
                  padding: '12px 16px',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#f9fafb',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#f9fafb',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#3b82f6',
                    secondary: '#f9fafb',
                  },
                },
              }}
            />
          </div>
        </Router>
        
        {/* React Query DevTools */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
