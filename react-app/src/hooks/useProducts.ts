/**
 * React Query Hooks for Products
 * 
 * This file provides custom hooks for:
 * - Fetching products with caching
 * - Mutations for CRUD operations
 * - Optimistic updates
 * - Error handling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { productsAPI, legacyAPI } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import { useProductActions } from '../store/productStore';
import { AddProductForm, UpdateProductForm, SearchForm, Product, ProductsResponse } from '../lib/validations';

// ==================== QUERY HOOKS ====================

export const useProducts = (
  catName?: string,
  minPrice?: string,
  maxPrice?: string,
  sortBy?: string,
  page?: number,
  limit?: number
) => {
  const params = { catName, minPrice, maxPrice, sortBy, page, limit };
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsAPI.getAll(params),
    enabled: true,
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => productsAPI.getById(productId),
    enabled: !!productId,
  });
};

export const useProductsByCategory = (category: string, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: queryKeys.products.category(category, params),
    queryFn: () => productsAPI.getByCategory(category, params),
    enabled: !!category,
  });
};

export const useUserProducts = () => {
  return useQuery({
    queryKey: queryKeys.products.user,
    queryFn: () => productsAPI.getUserProducts(),
  });
};

export const useLikedProducts = () => {
  return useQuery({
    queryKey: queryKeys.products.liked,
    queryFn: () => productsAPI.getLikedProducts(),
  });
};

export const useSearchProducts = (searchParams: SearchForm) => {
  return useQuery({
    queryKey: queryKeys.products.search(searchParams),
    queryFn: () => productsAPI.search(searchParams),
    enabled: !!searchParams.search && !!searchParams.loc,
  });
};

// ==================== MUTATION HOOKS ====================

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { addProduct } = useProductActions();

  return useMutation({
    mutationFn: ({ productData, files }: { productData: AddProductForm; files: { pimage: File; pimage2: File } }) =>
      productsAPI.create(productData, files),
    onSuccess: (data) => {
      // Add to store
      addProduct(data.data.product);
      
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      
      toast.success('Product added successfully!');
    },
    onError: (error: any) => {
      console.error('Create product error:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { updateProduct } = useProductActions();

  return useMutation({
    mutationFn: ({ productId, productData }: { productId: string; productData: UpdateProductForm }) =>
      productsAPI.update(productId, productData),
    onSuccess: (data, variables) => {
      // Update in store
      updateProduct(variables.productId, data.data.product);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      
      toast.success('Product updated successfully!');
    },
    onError: (error: any) => {
      console.error('Update product error:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { deleteProduct } = useProductActions();

  return useMutation({
    mutationFn: (productId: string) => productsAPI.delete(productId),
    onSuccess: (_, productId) => {
      // Remove from store
      deleteProduct(productId);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.user });
      
      toast.success('Product deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete product error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    },
  });
};

export const useLikeProduct = () => {
  const queryClient = useQueryClient();
  const { toggleLike } = useProductActions();

  return useMutation({
    mutationFn: (productId: string) => productsAPI.likeProduct(productId),
    onMutate: async (productId) => {
      // Optimistic update
      toggleLike(productId);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.products.liked });
      
      // Return context for rollback
      return { productId };
    },
    onSuccess: (_, productId) => {
      // Invalidate liked products
      queryClient.invalidateQueries({ queryKey: queryKeys.products.liked });
      
      // Show success message
      const likedProductsData = queryClient.getQueryData(queryKeys.products.liked) as ProductsResponse | undefined;
      const isLiked = likedProductsData?.data?.products?.some((p: Product) => p._id === productId);
      toast.success(isLiked ? 'Product liked!' : 'Product unliked!');
    },
    onError: (error, productId, context) => {
      // Rollback optimistic update
      if (context) {
        toggleLike(context.productId);
      }
      
      console.error('Like product error:', error);
      toast.error('Failed to update like status');
    },
  });
};

// ==================== LEGACY HOOKS (for backward compatibility) ====================

export const useLegacyProducts = () => {
  return useQuery({
    queryKey: ['legacy', 'products'],
    queryFn: () => legacyAPI.getProducts(),
  });
};

export const useLegacyProduct = (productId: string) => {
  return useQuery({
    queryKey: ['legacy', 'product', productId],
    queryFn: () => legacyAPI.getProduct(productId),
    enabled: !!productId,
  });
};

export const useLegacySearch = (searchParams: SearchForm) => {
  return useQuery({
    queryKey: ['legacy', 'search', searchParams],
    queryFn: () => legacyAPI.search(searchParams),
    enabled: !!searchParams.search && !!searchParams.loc,
  });
};

export const useLegacyCreateProduct = () => {
  const queryClient = useQueryClient();
  const { addProduct } = useProductActions();

  return useMutation({
    mutationFn: ({ productData, files }: { productData: AddProductForm; files: { pimage: File; pimage2: File } }) =>
      legacyAPI.addProduct(productData, files),
    onSuccess: (data) => {
      addProduct(data.data.product);
      queryClient.invalidateQueries({ queryKey: ['legacy', 'products'] });
      toast.success('Product added successfully!');
    },
    onError: (error: any) => {
      console.error('Create product error:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    },
  });
};
