/**
 * React Query Configuration
 * 
 * This file configures React Query with:
 * - Default options for queries and mutations
 * - Error handling
 * - Retry logic
 * - Cache management
 */

import { QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      cacheTime: 10 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Don't refetch on window focus
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect
      refetchOnReconnect: false,
      // Error handling
      onError: (error: any) => {
        console.error('Query error:', error);
        if (error.response?.status !== 401) {
          toast.error('Failed to load data. Please try again.');
        }
      },
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Error handling
      onError: (error: any) => {
        console.error('Mutation error:', error);
        // Don't show toast for validation errors (400)
        if (error.response?.status !== 400) {
          toast.error('Operation failed. Please try again.');
        }
      },
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  // Auth queries
  auth: {
    profile: ['auth', 'profile'] as const,
    user: (userId: string) => ['auth', 'user', userId] as const,
  },
  
  // Product queries
  products: {
    all: ['products'] as const,
    list: (params?: any) => ['products', 'list', params] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    category: (category: string, params?: any) => ['products', 'category', category, params] as const,
    search: (params: any) => ['products', 'search', params] as const,
    user: ['products', 'user'] as const,
    liked: ['products', 'liked'] as const,
  },
  
  // Categories
  categories: {
    all: ['categories'] as const,
  },
} as const;
