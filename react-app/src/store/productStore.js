import { create } from 'zustand';

const useProductStore = create((set, get) => ({
  products: [],
  categories: [],
  likedProducts: [],
  cart: [],
  isLoading: false,
  error: null,
  
  // Actions
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  addProduct: (product) => {
    const currentProducts = get().products;
    set({ products: [...currentProducts, product] });
  },
  
  updateProduct: (productId, updatedProduct) => {
    const currentProducts = get().products;
    set({ 
      products: currentProducts.map(product => 
        product._id === productId ? { ...product, ...updatedProduct } : product
      )
    });
  },
  
  deleteProduct: (productId) => {
    const currentProducts = get().products;
    set({ 
      products: currentProducts.filter(product => product._id !== productId)
    });
  },
  
  toggleLike: (productId) => {
    const currentLiked = get().likedProducts;
    const isLiked = currentLiked.includes(productId);
    
    set({ 
      likedProducts: isLiked 
        ? currentLiked.filter(id => id !== productId)
        : [...currentLiked, productId]
    });
  },
  
  addToCart: (product) => {
    const currentCart = get().cart;
    const existingItem = currentCart.find(item => item._id === product._id);
    
    if (existingItem) {
      set({
        cart: currentCart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      set({ cart: [...currentCart, { ...product, quantity: 1 }] });
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
    set({
      cart: currentCart.map(item =>
        item._id === productId
          ? { ...item, quantity }
          : item
      )
    });
  },
  
  clearCart: () => set({ cart: [] }),
  
  getCartTotal: () => {
    const cart = get().cart;
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
}));

export default useProductStore;

