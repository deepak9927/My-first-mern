import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import API_URL from '../constants';

const fetchProducts = async (selectedCategory) => {
  const url = selectedCategory
    ? `${API_URL}/get-products?catName=${selectedCategory}`
    : `${API_URL}/get-products`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const searchProducts = async ({ search, location }) => {
  const url = `${API_URL}/search?search=${search}&loc=${location}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const useProducts = (selectedCategory) => {
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => fetchProducts(selectedCategory),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const searchMutation = useMutation({
    mutationFn: searchProducts,
    onSuccess: (data) => {
      toast.success(`Found ${data.products.length} products`);
    },
    onError: (error) => {
      toast.error('Search failed. Please try again.');
      console.error('Search error:', error);
    },
  });

  return {
    productsData,
    productsLoading,
    productsError,
    refetchProducts,
    searchMutation,
  };
};