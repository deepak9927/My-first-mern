# 📚 Code Standards & Best Practices

## TypeScript Standards

### Component Structure

```typescript
/**
 * Component Name - Brief description
 * 
 * @description Detailed description of what this component does
 * @features List of key features
 * @example Usage example
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';

// Types
interface ComponentProps {
  prop1: string;
  prop2?: number;
  onAction?: (data: SomeType) => void;
}

// Constants
const CONSTANT_VALUE = 'value';

export const Component: React.FC<ComponentProps> = ({
  prop1,
  prop2 = 0,
  onAction
}) => {
  // ==================== STATE ====================
  const [localState, setLocalState] = useState<string>('');
  
  // ==================== HOOKS ====================
  const { data, isLoading, error } = useQuery({
    queryKey: ['key'],
    queryFn: fetchData
  });
  
  // ==================== EFFECTS ====================
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // ==================== HANDLERS ====================
  const handleAction = (event: React.MouseEvent) => {
    // Handler logic
  };
  
  // ==================== RENDER ====================
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className="container">
      {/* Component JSX */}
    </div>
  );
};

export default Component;
```

### Type Definitions

```typescript
// models/types.ts

export interface User {
  _id: string;
  username: string;
  email: string;
  mobile: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  pname: string;
  pdesc: string;
  price: number;
  category: string;
  pimage: string;
  pimage2?: string;
  addedBy: string | User;
  pLoc: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = 'available' | 'sold' | 'reserved';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

### Zod Validation Schemas

```typescript
// lib/validations.ts

import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string()
    .min(3, 'Identifier must be at least 3 characters')
    .max(50, 'Identifier is too long'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
});

export const signupSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .email('Invalid email address'),
  mobile: z.string()
    .regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const productSchema = z.object({
  pname: z.string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name is too long'),
  pdesc: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description is too long'),
  price: z.number()
    .min(1, 'Price must be greater than 0')
    .max(10000000, 'Price is too high'),
  category: z.string()
    .min(1, 'Please select a category'),
  pLoc: z.string()
    .min(2, 'Location is required')
});

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type ProductForm = z.infer<typeof productSchema>;
```

---

## React Query Patterns

### Custom Hooks

```typescript
// hooks/useProducts.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/get-products');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data } = await api.get(`/get-product/${productId}`);
      return data;
    },
    enabled: !!productId, // Only fetch if productId exists
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/add-product', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create product');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await api.post(`/edit-product`, data);
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['product', id] });
      const previousProduct = queryClient.getQueryData(['product', id]);
      
      queryClient.setQueryData(['product', id], (old: any) => ({
        ...old,
        ...Object.fromEntries(data.entries())
      }));
      
      return { previousProduct };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['product', variables.id],
        context?.previousProduct
      );
      toast.error('Failed to update product');
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onSuccess: () => {
      toast.success('Product updated successfully!');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await api.post('/delete-product', { pid: productId });
      return data;
    },
    onSuccess: (data, productId) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.removeQueries({ queryKey: ['product', productId] });
      toast.success('Product deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete product');
    },
  });
};
```

---

## Zustand Store Patterns

```typescript
// store/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../lib/validations';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setToken: (token: string) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      
      // Actions
      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true
      }),
      
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false
      }),
      
      updateUser: (updatedUser) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedUser } : null
      })),
      
      setToken: (token) => set({ token }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

export default useAuthStore;
```

---

## Tailwind CSS Conventions

### Component Classes

```typescript
// Use template literals for dynamic classes
const buttonClasses = `
  px-6 py-2 rounded-lg font-semibold
  transition-all duration-200
  ${variant === 'primary' 
    ? 'bg-primary-600 hover:bg-primary-700 text-white' 
    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
  }
  ${disabled && 'opacity-50 cursor-not-allowed'}
`;

// Use clsx for complex conditions
import clsx from 'clsx';

const cardClasses = clsx(
  'bg-white rounded-lg shadow-md p-6',
  'hover:shadow-xl transition-shadow',
  isActive && 'ring-2 ring-primary-500',
  isDisabled && 'opacity-50 pointer-events-none'
);
```

### Responsive Design

```tsx
<div className="
  grid gap-4
  grid-cols-1
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
  xl:grid-cols-5
">
  {/* Content */}
</div>
```

### Custom Components

```tsx
// components/common/Button.tsx

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2',
    lg: 'px-8 py-3 text-lg',
  };
  
  return (
    <button
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
```

---

## Error Handling

### API Error Handler

```typescript
// lib/errorHandler.ts

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: any[]
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || 'An error occurred';
    const statusCode = error.response.status;
    
    switch (statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Please login to continue.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return message;
    }
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your internet connection.';
  } else {
    // Error in request setup
    return error.message || 'An unexpected error occurred.';
  }
};
```

### Error Boundary

```typescript
// components/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Log to error reporting service
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## File Organization

```
src/
├── components/
│   ├── common/              # Reusable components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── layout/              # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── features/            # Feature-specific components
│       ├── auth/
│       │   ├── Login.tsx
│       │   └── Signup.tsx
│       ├── products/
│       │   ├── ProductList.tsx
│       │   ├── ProductCard.tsx
│       │   └── ProductDetail.tsx
│       └── user/
│           ├── Profile.tsx
│           └── Dashboard.tsx
├── hooks/                   # Custom hooks
│   ├── useAuth.ts
│   ├── useProducts.ts
│   └── useDebounce.ts
├── lib/                     # Utilities
│   ├── api.ts
│   ├── queryClient.ts
│   ├── validations.ts
│   └── utils.ts
├── store/                   # Zustand stores
│   ├── authStore.ts
│   └── productStore.ts
├── types/                   # TypeScript types
│   ├── index.ts
│   └── api.ts
└── constants/               # Constants
    ├── categories.ts
    └── config.ts
```

---

## Naming Conventions

### Files
- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Hooks: `camelCase.ts` starting with `use` (e.g., `useAuth.ts`)
- Utilities: `camelCase.ts` (e.g., `api.ts`)
- Types: `PascalCase.ts` or `camelCase.types.ts`

### Variables
- Constants: `UPPER_SNAKE_CASE`
- Variables/Functions: `camelCase`
- Components: `PascalCase`
- Types/Interfaces: `PascalCase`

### Props
- Boolean props: Start with `is`, `has`, `should`
  ```typescript
  interface Props {
    isLoading: boolean;
    hasError: boolean;
    shouldAutoFocus: boolean;
  }
  ```

- Event handlers: Start with `on`
  ```typescript
  interface Props {
    onClick: () => void;
    onSubmit: (data: FormData) => void;
    onError: (error: Error) => void;
  }
  ```

---

## Git Commit Conventions

```bash
feat: Add messaging system
fix: Resolve image upload bug
docs: Update README with deployment steps
style: Format code with Prettier
refactor: Simplify authentication logic
perf: Optimize product queries
test: Add unit tests for ProductCard
chore: Update dependencies
```

---

## Performance Best Practices

1. **Use React.memo** for expensive components
2. **Use useMemo** for expensive calculations
3. **Use useCallback** for functions passed to children
4. **Code splitting** with React.lazy
5. **Image optimization** (lazy loading, WebP format)
6. **Debounce** search inputs
7. **Virtualization** for long lists
8. **Minimize re-renders** with proper dependencies

---

**Follow these standards for consistent, maintainable, and scalable code!**
