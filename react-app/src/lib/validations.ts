
/**
 * Zod Validation Schemas & TypeScript Types
 *
 * This file defines all validation schemas for forms, API responses, and data types in the frontend.
 *
 * Why Zod?
 * - Zod is a TypeScript-first validation library. It lets you define what valid data looks like, and automatically checks it at runtime.
 * - It helps catch errors early, keeps your forms robust, and ensures your frontend and backend agree on data shapes.
 *
 * How to use:
 * - Use these schemas to validate form data before sending to the backend.
 * - Use them to validate API responses from the backend (for type safety).
 * - Use the exported types for props, state, and API calls in your React components.
 *
 * Example:
 *   loginSchema.parse({ identifier: 'user', password: 'pass123' }) // Throws if invalid
 *
 * If you're new to Zod or TypeScript, see the comments below each schema for explanations.
 */


import { z } from 'zod'; // Zod is a schema validation library for TypeScript/JavaScript


// ==================== AUTH SCHEMAS ====================
// These schemas validate authentication forms (login, signup, profile update)


/**
 * Login form validation
 * - identifier: can be email or username
 * - password: must be at least 6 characters
 */
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});


/**
 * Signup form validation
 * - username: 3-30 chars, only letters/numbers/underscores
 * - email: must be valid
 * - password: min 6 chars, must contain lowercase, uppercase, number
 * - mobile: must be 10 digits
 */
export const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
});


/**
 * Profile update validation
 * - All fields optional (for partial updates)
 * - profile: nested object for first/last name and bio
 */
export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .optional(),
  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .optional(),
  profile: z.object({
    firstName: z.string().max(50, 'First name cannot exceed 50 characters').optional(),
    lastName: z.string().max(50, 'Last name cannot exceed 50 characters').optional(),
    bio: z.string().max(200, 'Bio cannot exceed 200 characters').optional(),
  }).optional(),
});


// ==================== PRODUCT SCHEMAS ====================
// These schemas validate product data for forms and API responses


/**
 * Product schema for API responses
 * - Matches backend Product model
 * - Used for type safety in frontend
 */
export const productSchema = z.object({
  _id: z.string(),
  pname: z.string(),
  pdesc: z.string(),
  price: z.number(),
  category: z.enum(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Vehicles', 'Other']),
  pimage: z.string(),
  pimage2: z.string(),
  addedBy: z.string(),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']).optional().default('good'),
  status: z.enum(['active', 'sold', 'inactive']).default('active'),
  likesCount: z.number().default(0),
  viewsCount: z.number().default(0),
  pLoc: z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number()).length(2),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});


/**
 * Add product form validation
 * - Validates all fields for new product listing
 * - pimage: must be present (file upload)
 * - plat/plong: latitude/longitude for location
 */
export const addProductSchema = z.object({
  pname: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name cannot exceed 100 characters'),
  pdesc: z
    .string()
    .min(10, 'Product description must be at least 10 characters')
    .max(500, 'Product description cannot exceed 500 characters'),
  price: z
    .number()
    .min(0.01, 'Price must be greater than 0'),
  category: z.enum(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Vehicles', 'Other']),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']).default('good'),
  plat: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude'),
  plong: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude'),
  pimage: z
    .any()
    .refine((files) => files?.length >= 1, 'Primary image is required.'),
  pimage2: z
    .any()
    .optional(), // Optional second image
});


/**
 * Update product form validation
 * - All fields optional (for partial updates)
 * - status: can be changed (active/sold/inactive)
 */
export const updateProductSchema = addProductSchema.partial().extend({
  status: z.enum(['active', 'sold', 'inactive']).optional(),
});


// ==================== USER SCHEMAS ====================
// These schemas validate user data for API responses and frontend state


/**
 * User schema for API responses
 * - Matches backend User model
 * - Used for type safety in frontend
 */
export const userSchema = z.object({
  _id: z.string(),
  username: z.string(),
  email: z.string().email(),
  mobile: z.string(),
  profile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.string().optional(),
    bio: z.string().optional(),
  }).optional(),
  isActive: z.boolean().default(true),
  likedProducts: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});


// ==================== API RESPONSE SCHEMAS ====================
// These schemas validate the structure of API responses from the backend


/**
 * Generic API response schema
 * - Used to validate all backend responses
 */
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  errors: z.array(z.string()).optional(),
});


/**
 * Products list response schema
 * - Used for paginated product lists
 */
export const productsResponseSchema = apiResponseSchema.extend({
  data: z.object({
    products: z.array(productSchema),
    pagination: z.object({
      currentPage: z.number(),
      totalPages: z.number(),
      totalProducts: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }).optional(),
  }),
});


/**
 * Single product response schema
 */
export const productResponseSchema = apiResponseSchema.extend({
  data: z.object({
    product: productSchema,
  }),
});


/**
 * Auth response schema
 * - Used for login/signup responses
 */
export const authResponseSchema = apiResponseSchema.extend({
  data: z.object({
    user: userSchema,
    token: z.string(),
  }),
});


// ==================== SEARCH SCHEMAS ====================
// These schemas validate product search queries


/**
 * Product search query validation
 * - search: text term
 * - loc: latitude,longitude string
 * - category: optional filter
 * - maxDistance: optional filter (km)
 */
export const searchSchema = z.object({
  search: z.string().min(1, 'Search term is required').max(100, 'Search term too long'),
  loc: z.string().regex(/^-?\d+\.?\d*,-?\d+\.?\d*$/, 'Invalid location format'),
  category: z.enum(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Vehicles', 'Other']).optional(),
  maxDistance: z.number().min(1).max(1000).optional(),
});


// ==================== TYPE EXPORTS ====================
// These types are inferred from schemas for use in TypeScript code

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;
export type Product = z.infer<typeof productSchema>;
export type AddProductForm = z.infer<typeof addProductSchema> & {
  pimage: FileList;
  pimage2?: FileList;
};
export type UpdateProductForm = z.infer<typeof updateProductSchema>;
export type User = z.infer<typeof userSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type ProductsResponse = z.infer<typeof productsResponseSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type SearchForm = z.infer<typeof searchSchema>;
