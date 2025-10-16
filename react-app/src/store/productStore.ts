/**
 * Product Store with Zustand
 * 
 * This store manages:
 * - Product listings
 * - Search and filtering
 * - Cart functionality
 * - Liked products
 * - UI state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../lib/validations';

interface ProductState {
  // State
  products: Product[];
  categories: string[];
  likedProducts: string[];
  cart: CartItem[];
  searchResults: Product[];
  currentProduct: Product | null;
  
  // UI State
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  selectedCategory: string;
  searchTerm: string;

  // Actions
  setProducts: (products: Product[]) => void;
  setCategories: (categories: string[]) => void;
  setLoading: (isLoading: boolean) => void;
  setSearching: (isSearching: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentProduct: (product: Product | null) => void;
  setSelectedCategory: (category: string) => void;
  setSearchTerm: (term: string) => void;
  setSearchResults: (results: Product[]) => void;
  
  // Product actions
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updatedProduct: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  
  // Like actions
  toggleLike: (productId: string) => void;
  setLikedProducts: (productIds: string[]) => void;
  
  // Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Utility actions
  clearError: () => void;
  reset: () => void;
}

interface CartItem extends Product {
  quantity: number;
}

const initialState = {
  products: [],
  categories: [],
  likedProducts: [],
  cart: [],
  searchResults: [],
  currentProduct: null,
  isLoading: false,
  isSearching: false,
  error: null,
  selectedCategory: '',
  searchTerm: '',
};

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Basic setters
      setProducts: (products) => set({ products }),
      setCategories: (categories) => set({ categories }),
      setLoading: (isLoading) => set({ isLoading }),
      setSearching: (isSearching) => set({ isSearching }),
      setError: (error) => set({ error }),
      setCurrentProduct: (currentProduct) => set({ currentProduct }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setSearchResults: (searchResults) => set({ searchResults }),

      // Product actions
      addProduct: (product) => {
        const currentProducts = get().products;
        set({ products: [product, ...currentProducts] });
      },

      updateProduct: (productId, updatedProduct) => {
        const currentProducts = get().products;
        set({
          products: currentProducts.map(product =>
            product._id === productId
              ? { ...product, ...updatedProduct }
              : product
          )
        });
      },

      deleteProduct: (productId) => {
        const currentProducts = get().products;
        set({
          products: currentProducts.filter(product => product._id !== productId)
        });
      },

      // Like actions
      toggleLike: (productId) => {
        const currentLiked = get().likedProducts;
        const isLiked = currentLiked.includes(productId);
        
        set({
          likedProducts: isLiked
            ? currentLiked.filter(id => id !== productId)
            : [...currentLiked, productId]
        });
      },

      setLikedProducts: (productIds) => set({ likedProducts: productIds }),

      // Cart actions
      addToCart: (product, quantity = 1) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find(item => item._id === product._id);
        
        if (existingItem) {
          set({
            cart: currentCart.map(item =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          set({
            cart: [...currentCart, { ...product, quantity }]
          });
        }
      },

      removeFromCart: (productId) => {
        const currentCart = get().cart;
        set({
          cart: currentCart.filter(item => item._id !== productId)
        });
      },

      updateCartQuantity: (productId, quantity) => {
        const currentCart = get().cart;
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        
        set({
          cart: currentCart.map(item =>
            item._id === productId
              ? { ...item, quantity }
              : item
          )
        });
      },

      clearCart: () => set({ cart: [] }),

      // Utility actions
      clearError: () => set({ error: null }),
      reset: () => set(initialState),
    }),
    {
      name: 'product-storage',
      partialize: (state) => ({
        likedProducts: state.likedProducts,
        cart: state.cart,
        selectedCategory: state.selectedCategory,
      }),
    }
  )
);

// Selectors for better performance
export const useProducts = () => useProductStore((state) => ({
  products: state.products,
  isLoading: state.isLoading,
  error: state.error,
}));

export const useCart = () => useProductStore((state) => ({
  cart: state.cart,
  cartTotal: state.cart.reduce((total, item) => total + (item.price * item.quantity), 0),
  cartCount: state.cart.reduce((count, item) => count + item.quantity, 0),
}));

export const useLikedProducts = () => useProductStore((state) => ({
  likedProducts: state.likedProducts,
  isLiked: (productId: string) => state.likedProducts.includes(productId),
}));

export const useSearch = () => useProductStore((state) => ({
  searchResults: state.searchResults,
  isSearching: state.isSearching,
  searchTerm: state.searchTerm,
  selectedCategory: state.selectedCategory,
}));

export const useProductActions = () => useProductStore((state) => ({
  setProducts: state.setProducts,
  setLoading: state.setLoading,
  setError: state.setError,
  addProduct: state.addProduct,
  updateProduct: state.updateProduct,
  deleteProduct: state.deleteProduct,
  toggleLike: state.toggleLike,
  addToCart: state.addToCart,
  removeFromCart: state.removeFromCart,
  updateCartQuantity: state.updateCartQuantity,
  clearCart: state.clearCart,
  setSearchResults: state.setSearchResults,
  setSearching: state.setSearching,
  setSelectedCategory: state.setSelectedCategory,
  setSearchTerm: state.setSearchTerm,
  clearError: state.clearError,
}));
