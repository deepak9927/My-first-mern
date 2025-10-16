import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import API_URL from '../constants';

const addProduct = async (formData) => {
  const url = `${API_URL}/add-product`;
  const res = await axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const useAddProduct = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: addProduct,
    onSuccess: (data) => {
      if (data.message) {
        toast.success(data.message);
        navigate('/');
      }
    },
    onError: (err) => {
      console.error('Add product error:', err);
      const errorMessage = err.response?.data?.message || 'SERVER ERROR. Please try again.';
      toast.error(errorMessage);
    },
  });
};