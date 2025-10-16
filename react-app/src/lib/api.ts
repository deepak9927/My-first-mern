/**
 * Advanced API Layer with React Query
 * 
 * This file provides:
 * - Type-safe API functions
 * - React Query integration
 * - Error handling
 * - Request/response interceptors
 * - Zod validation
 */

import axios, { AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import {
  Product,
  User,
  LoginForm,
  SignupForm,
  AddProductForm,
  UpdateProductForm,
  ProfileUpdateForm,
  SearchForm,
  ApiResponse,
  ProductsResponse,
  ProductResponse,
  AuthResponse,
  productSchema,
  productsResponseSchema,
  productResponseSchema,
  authResponseSchema,
  apiResponseSchema,
  userSchema,
} from './validations';

// ==================== API CONFIGURATION ====================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== REQUEST INTERCEPTOR ====================

api.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      clearStoredToken();
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

// ==================== TOKEN MANAGEMENT ====================

const getStoredToken = (): string | null => {
  try {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.state?.token || null;
    }
  } catch (error) {
    console.error('Error parsing stored token:', error);
  }
  return null;
};

const clearStoredToken = (): void => {
  localStorage.removeItem('auth-storage');
};

// ==================== AUTH API ====================

export const authAPI = {
  login: async (credentials: LoginForm): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', credentials);
    return authResponseSchema.parse(response.data);
  },

  signup: async (userData: SignupForm): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/signup', userData);
    return authResponseSchema.parse(response.data);
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/api/auth/profile');
    return { user: userSchema.parse(response.data.data.user) };
  },

  updateProfile: async (userData: ProfileUpdateForm): Promise<{ user: User }> => {
    const response = await api.put('/api/auth/profile', userData);
    return { user: userSchema.parse(response.data.data.user) };
  },

  getUserById: async (userId: string): Promise<{ user: User }> => {
    const response = await api.get(`/api/auth/user/${userId}`);
    return { user: userSchema.parse(response.data.data.user) };
  },
};

// ==================== PRODUCTS API ====================

export const productsAPI = {
  getAll: async (
    params?: {
      catName?: string;
      minPrice?: string;
      maxPrice?: string;
      sortBy?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ProductsResponse> => {
    const response = await api.get('/api/products', { params });
    return productsResponseSchema.parse(response.data);
  },

  getById: async (productId: string): Promise<ProductResponse> => {
    const response = await api.get(`/api/products/${productId}`);
    return productResponseSchema.parse(response.data);
  },

  create: async (productData: AddProductForm, files: { pimage: File; pimage2: File }): Promise<ProductResponse> => {
    const formData = new FormData();
    
    // Add product data
    Object.entries(productData).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    
    // Add files
    formData.append('pimage', files.pimage);
    formData.append('pimage2', files.pimage2);

    const response = await api.post('/api/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return productResponseSchema.parse(response.data);
  },

  update: async (productId: string, productData: UpdateProductForm): Promise<ProductResponse> => {
    const response = await api.put(`/api/products/${productId}`, productData);
    return productResponseSchema.parse(response.data);
  },

  delete: async (productId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/api/products/${productId}`);
    return apiResponseSchema.parse(response.data);
  },

  search: async (searchParams: SearchForm): Promise<ProductsResponse> => {
    const response = await api.get('/api/products/search', { params: searchParams });
    return productsResponseSchema.parse(response.data);
  },

  getByCategory: async (category: string, params?: { page?: number; limit?: number }): Promise<ProductsResponse> => {
    const response = await api.get(`/api/products/category/${category}`, { params });
    return productsResponseSchema.parse(response.data);
  },

  getUserProducts: async (): Promise<ProductsResponse> => {
    const response = await api.post('/api/products/my-products');
    return productsResponseSchema.parse(response.data);
  },

  likeProduct: async (productId: string): Promise<ApiResponse> => {
    const response = await api.post('/api/like-product', { productId });
    return apiResponseSchema.parse(response.data);
  },

  getLikedProducts: async (): Promise<ProductsResponse> => {
    const response = await api.post('/api/liked-products');
    return productsResponseSchema.parse(response.data);
  },
};

// ==================== LEGACY API SUPPORT ====================

export const legacyAPI = {
  // Legacy endpoints for backward compatibility
  getProducts: async (): Promise<ProductsResponse> => {
    const response = await api.get('/api/get-products');
    return productsResponseSchema.parse(response.data);
  },

  getProduct: async (productId: string): Promise<ProductResponse> => {
    const response = await api.get(`/api/get-product/${productId}`);
    return productResponseSchema.parse(response.data);
  },

  addProduct: async (productData: AddProductForm, files: { pimage: File; pimage2: File }): Promise<ProductResponse> => {
    const formData = new FormData();
    
    Object.entries(productData).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    
    formData.append('pimage', files.pimage);
    formData.append('pimage2', files.pimage2);

    const response = await api.post('/api/add-product', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return productResponseSchema.parse(response.data);
  },

  search: async (searchParams: SearchForm): Promise<ProductsResponse> => {
    const response = await api.get('/api/search', { params: searchParams });
    return productsResponseSchema.parse(response.data);
  },
};

// ==================== UTILITY FUNCTIONS ====================

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getImageUrl = (imagePath: string): string => {
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}/${imagePath}`;
};

export default api;
