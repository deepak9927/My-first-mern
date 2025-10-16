/**
 * React Query Hooks for Authentication
 * 
 * This file provides custom hooks for:
 * - User authentication
 * - Profile management
 * - Token handling
 * - Protected routes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import { useAuthActions } from '../store/authStore';
import { LoginForm, SignupForm, ProfileUpdateForm } from '../lib/validations';

// ==================== QUERY HOOKS ====================

export const useProfile = () => {
  const { setUser } = useAuthActions();
  
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => authAPI.getProfile(),
    enabled: false, // Only fetch when explicitly called
    onSuccess: (data) => {
      setUser(data.user);
    },
  });
};

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.auth.user(userId),
    queryFn: () => authAPI.getUserById(userId),
    enabled: !!userId,
  });
};

// ==================== MUTATION HOOKS ====================

export const useLogin = () => {
  const navigate = useNavigate();
  const { login, setLoading, setError } = useAuthActions();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginForm) => authAPI.login(credentials),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      // Update auth store
      login(data.data.user, data.data.token);
      
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
      
      toast.success('Login successful!');
      navigate('/');
    },
    onError: (error: any) => {
      setLoading(false);
      setError(error.response?.data?.message || 'Login failed');
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

export const useSignup = () => {
  const navigate = useNavigate();
  const { login, setLoading, setError } = useAuthActions();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: SignupForm) => authAPI.signup(userData),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      // Update auth store
      login(data.data.user, data.data.token);
      
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
      
      toast.success('Account created successfully!');
      navigate('/');
    },
    onError: (error: any) => {
      setLoading(false);
      setError(error.response?.data?.message || 'Signup failed');
      toast.error(error.response?.data?.message || 'Signup failed');
    },
  });
};

export const useUpdateProfile = () => {
  const { updateUser, setLoading } = useAuthActions();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: ProfileUpdateForm) => authAPI.updateProfile(userData),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      // Update auth store
      updateUser(data.user);
      
      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
      
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

// ==================== UTILITY HOOKS ====================

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuthActions();
  const queryClient = useQueryClient();

  return () => {
    // Clear auth store
    logout();
    
    // Clear all queries
    queryClient.clear();
    
    // Clear localStorage
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('product-storage');
    
    toast.success('Logged out successfully');
    navigate('/login');
  };
};

export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuthActions();
  
  return {
    isAuthenticated,
    isLoading,
    requireAuth: (redirectTo = '/login') => {
      if (!isAuthenticated && !isLoading) {
        return redirectTo;
      }
      return null;
    },
  };
};

// ==================== FORM HOOKS ====================

export const useLoginForm = () => {
  const loginMutation = useLogin();
  
  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isLoading,
    error: loginMutation.error,
  };
};

export const useSignupForm = () => {
  const signupMutation = useSignup();
  
  return {
    signup: signupMutation.mutate,
    isLoading: signupMutation.isLoading,
    error: signupMutation.error,
  };
};

export const useProfileForm = () => {
  const updateMutation = useUpdateProfile();
  
  return {
    updateProfile: updateMutation.mutate,
    isLoading: updateMutation.isLoading,
    error: updateMutation.error,
  };
};
