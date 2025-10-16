const { z } = require('zod');

// ==================== AUTH SCHEMAS ====================

const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Email or username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const signupSchema = z.object({
  body: z.object({
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
  }),
});

const profileUpdateSchema = z.object({
  body: z.object({
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
  }),
});

const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
});

// ==================== PRODUCT SCHEMAS ====================

const addProductSchema = z.object({
  body: z.object({
    pname: z
      .string()
      .min(3, 'Product name must be at least 3 characters')
      .max(100, 'Product name cannot exceed 100 characters'),
    pdesc: z
      .string()
      .min(10, 'Product description must be at least 10 characters')
      .max(500, 'Product description cannot exceed 500 characters'),
    price: z
      .string()
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: "Price must be a number greater than 0",
      }),
    category: z.enum(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Vehicles', 'Other']),
    condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']).default('good'),
    plat: z
      .string()
      .refine((val) => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 90, {
        message: "Invalid latitude",
      }),
    plong: z
      .string()
      .refine((val) => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 180, {
        message: "Invalid longitude",
      }),
  }),
});

const updateProductSchema = z.object({
  body: addProductSchema.shape.body.partial().extend({
    status: z.enum(['active', 'sold', 'inactive']).optional(),
  }),
  params: z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  }),
});

const searchSchema = z.object({
  query: z.object({
    search: z.string().min(1, 'Search term is required').max(100, 'Search term too long'),
    loc: z.string().regex(/^-?\d+\.?\d*,-?\d+\.?\d*$/, 'Invalid location format'),
    category: z.enum(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Vehicles', 'Other']).optional(),
    maxDistance: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0 && parseInt(val) <= 1000, {
      message: "Max distance must be a number between 1 and 1000",
    }).optional(),
  }),
});

module.exports = {
  loginSchema,
  signupSchema,
  addProductSchema,
  updateProductSchema,
  searchSchema,
};