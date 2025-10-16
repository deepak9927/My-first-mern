import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import useProductStore from '../store/productStore';
import API_URL from '../constants';

const likeProduct = async ({ userId, productId }) => {
  const response = await fetch(`${API_URL}/like-product`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, productId }),
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const useProductLike = () => {
  const { toggleLike, likedProducts } = useProductStore();

  const likeMutation = useMutation({
    mutationFn: likeProduct,
    onMutate: async ({ productId }) => {
      // Optimistic update
      toggleLike(productId);
    },
    onSuccess: (data, variables) => {
      const isLiked = likedProducts.includes(variables.productId);
      toast.success(isLiked ? 'Product liked!' : 'Product unliked!');
    },
    onError: (error, variables) => {
      // Revert optimistic update on error
      toggleLike(variables.productId);
      toast.error('Failed to update like status');
      console.error('Like error:', error);
    },
  });

  return likeMutation;
};