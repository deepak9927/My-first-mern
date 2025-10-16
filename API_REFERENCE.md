# API Reference

This document provides a detailed reference for all API endpoints available in the MERN Stack OLX Clone backend.

**Base URL:** `http://localhost:5000/api` (or your deployed backend URL)

## Table of Contents

1.  [Authentication Endpoints](#authentication-endpoints)
    *   [POST /api/auth/signup](#post-apiauthsignup)
    *   [POST /api/auth/login](#post-apiauthlogin)
    *   [GET /api/auth/profile](#get-apiauthprofile)
    *   [PUT /api/auth/profile](#put-apiauthprofile)
    *   [GET /api/auth/user/:userId](#get-apiauthuseruserid)
2.  [Product Endpoints](#product-endpoints)
    *   [POST /api/products](#post-apiproducts)
    *   [GET /api/products](#get-apiproducts)
    *   [GET /api/products/search](#get-apiproductssearch)
    *   [GET /api/products/category/:category](#get-apiproductscategorycategory)
    *   [GET /api/products/:productId](#get-apiproductsproductid)
    *   [PUT /api/products/:productId](#put-apiproductsproductid)
    *   [DELETE /api/products/:productId](#delete-apiproductsproductid)
    *   [POST /api/products/my-products](#post-apiproductsmy-products)
3.  [User Interaction Endpoints](#user-interaction-endpoints)
    *   [POST /api/like-product](#post-apilike-product)
    *   [POST /api/liked-products](#post-apiliked-products)
4.  [Error Responses](#error-responses)

---

## Authentication Endpoints

### POST /api/auth/signup

Registers a new user.

*   **URL:** `/api/auth/signup`
*   **Method:** `POST`
*   **Authentication:** None
*   **Request Body (JSON):**
    ```json
    {
      "username": "newuser",
      "email": "newuser@example.com",
      "password": "StrongPassword123",
      "mobile": "1234567890"
    }
    ```
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "data": {
        "user": {
          "_id": "654c...",
          "username": "newuser",
          "email": "newuser@example.com",
          "mobile": "1234567890",
          "isActive": true,
          "likedProducts": [],
          "createdAt": "2023-10-26T10:00:00.000Z",
          "updatedAt": "2023-10-26T10:00:00.000Z"
        },
        "token": "eyJhbGciOiJIUzI1Ni..."
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Validation failed (e.g., invalid email, weak password).
    *   `409 Conflict`: User already exists with this email or username.

### POST /api/auth/login

Authenticates a user and returns a JWT token.

*   **URL:** `/api/auth/login`
*   **Method:** `POST`
*   **Authentication:** None
*   **Request Body (JSON):**
    ```json
    {
      "identifier": "newuser@example.com", // Can be email or username
      "password": "StrongPassword123"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "user": {
          "_id": "654c...",
          "username": "newuser",
          "email": "newuser@example.com",
          "mobile": "1234567890",
          "isActive": true,
          "likedProducts": [],
          "createdAt": "2023-10-26T10:00:00.000Z",
          "updatedAt": "2023-10-26T10:00:00.000Z"
        },
        "token": "eyJhbGciOiJIUzI1Ni..."
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Missing identifier or password.
    *   `401 Unauthorized`: Invalid credentials or account deactivated.

### GET /api/auth/profile

Retrieves the authenticated user's profile.

*   **URL:** `/api/auth/profile`
*   **Method:** `GET`
*   **Authentication:** Required (JWT in `Authorization` header: `Bearer <token>`)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Profile retrieved successfully",
      "data": {
        "user": {
          "_id": "654c...",
          "username": "newuser",
          "email": "newuser@example.com",
          "mobile": "1234567890",
          "isActive": true,
          "likedProducts": [],
          "createdAt": "2023-10-26T10:00:00.000Z",
          "updatedAt": "2023-10-26T10:00:00.000Z"
        }
      }
    }
    ```
*   **Error Responses:**
    *   `401 Unauthorized`: Invalid or missing token.
    *   `404 Not Found`: User not found.

### PUT /api/auth/profile

Updates the authenticated user's profile.

*   **URL:** `/api/auth/profile`
*   **Method:** `PUT`
*   **Authentication:** Required (JWT in `Authorization` header: `Bearer <token>`)
*   **Request Body (JSON):**
    ```json
    {
      "username": "updateduser",
      "mobile": "9876543210",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "bio": "A passionate seller."
      }
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Profile updated successfully",
      "data": {
        "user": {
          "_id": "654c...",
          "username": "updateduser",
          "email": "newuser@example.com",
          "mobile": "9876543210",
          "profile": {
            "firstName": "John",
            "lastName": "Doe",
            "bio": "A passionate seller."
          },
          "isActive": true,
          "likedProducts": [],
          "createdAt": "2023-10-26T10:00:00.000Z",
          "updatedAt": "2023-10-26T10:05:00.000Z"
        }
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Validation failed.
    *   `401 Unauthorized`: Invalid or missing token.
    *   `404 Not Found`: User not found.

### GET /api/auth/user/:userId

Retrieves public information for a specific user by ID.

*   **URL:** `/api/auth/user/:userId`
*   **Method:** `GET`
*   **Authentication:** None (public endpoint)
*   **Path Parameters:**
    *   `userId` (string, required): The ID of the user.
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "User retrieved successfully",
      "data": {
        "user": {
          "_id": "654c...",
          "username": "publicuser",
          "email": "publicuser@example.com",
          "mobile": "1112223333",
          "profile": {
            "firstName": "Jane",
            "lastName": "Smith"
          },
          "isActive": true,
          "createdAt": "2023-10-25T09:00:00.000Z",
          "updatedAt": "2023-10-25T09:00:00.000Z"
        }
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid `userId` format.
    *   `404 Not Found`: User not found.

---

## Product Endpoints

### POST /api/products

Adds a new product listing.

*   **URL:** `/api/products`
*   **Method:** `POST`
*   **Authentication:** Required (JWT)
*   **Request Body (multipart/form-data):**
    *   `pname` (string, required): Product name.
    *   `pdesc` (string, required): Product description.
    *   `price` (number, required): Product price.
    *   `category` (string, required): Product category (e.g., 'Electronics', 'Clothing').
    *   `plat` (number, required): Product latitude.
    *   `plong` (number, required): Product longitude.
    *   `condition` (string, optional, default: 'good'): Product condition ('new', 'like-new', 'good', 'fair', 'poor').
    *   `pimage` (file, required): Primary product image.
    *   `pimage2` (file, optional): Second product image.
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Product added successfully",
      "data": {
        "product": {
          "_id": "654d...",
          "pname": "Vintage Camera",
          "pdesc": "A classic camera in great condition.",
          "price": 150.00,
          "category": "Electronics",
          "pimage": "uploads/pimage-16789...",
          "pimage2": "uploads/pimage2-16789...",
          "addedBy": {
            "_id": "654c...",
            "username": "newuser",
            "email": "newuser@example.com"
          },
          "condition": "good",
          "pLoc": {
            "type": "Point",
            "coordinates": [77.2090, 28.6139]
          },
          "status": "active",
          "likesCount": 0,
          "viewsCount": 0,
          "createdAt": "2023-10-26T10:30:00.000Z",
          "updatedAt": "2023-10-26T10:30:00.000Z"
        }
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Validation failed (e.g., missing required fields, invalid price, invalid category, missing primary image).
    *   `401 Unauthorized`: Invalid or missing token.

### GET /api/products

Retrieves a list of products. Supports filtering, sorting, and pagination.

*   **URL:** `/api/products`
*   **Method:** `GET`
*   **Authentication:** None
*   **Query Parameters (Optional):**
    *   `catName` (string): Filter by category name.
    *   `page` (number, default: 1): Page number for pagination.
    *   `limit` (number, default: 20): Number of products per page (max 100).
    *   `status` (string, default: 'active'): Filter by product status ('active', 'sold', 'inactive').
    *   `minPrice` (number): Filter by minimum price.
    *   `maxPrice` (number): Filter by maximum price.
    *   `sortBy` (string): Sort order ('createdAt', 'price-asc', 'price-desc').
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Products retrieved successfully",
      "data": {
        "products": [
          {
            "_id": "654d...",
            "pname": "Vintage Camera",
            "price": 150,
            "category": "Electronics",
            "addedBy": { "_id": "654c...", "username": "newuser" }
            // ... other product fields
          }
        ],
        "pagination": {
          "currentPage": 1,
          "totalPages": 5,
          "totalProducts": 98,
          "hasNext": true,
          "hasPrev": false
        }
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid query parameters (e.g., invalid page/limit, invalid price range).

### GET /api/products/search

Searches for products by text and location.

*   **URL:** `/api/products/search`
*   **Method:** `GET`
*   **Authentication:** None
*   **Query Parameters (Required):**
    *   `search` (string, required): Search term (e.g., "phone", "book").
    *   `loc` (string, required): User's current location (format: `latitude,longitude`, e.g., `28.6139,77.2090`).
*   **Query Parameters (Optional):**
    *   `category` (string): Filter search results by category.
    *   `maxDistance` (number, default: 50): Maximum distance in kilometers to search from the given location.
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Search completed successfully",
      "data": {
        "products": [
          {
            "_id": "654d...",
            "pname": "Old Smartphone",
            "pdesc": "Working condition, minor scratches.",
            "price": 5000,
            "category": "Electronics",
            "addedBy": { "_id": "654c...", "username": "user1" },
            "pLoc": { "type": "Point", "coordinates": [77.2100, 28.6140] }
            // ... other product fields
          }
        ],
        "searchTerm": "phone",
        "location": { "latitude": 28.6139, "longitude": 77.2090 },
        "resultsCount": 10
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Missing `search` term or `loc` parameter, invalid `loc` format, invalid `maxDistance`.

### GET /api/products/category/:category

Retrieves products belonging to a specific category.

*   **URL:** `/api/products/category/:category`
*   **Method:** `GET`
*   **Authentication:** None
*   **Path Parameters:**
    *   `category` (string, required): The name of the category (e.g., 'Electronics').
*   **Query Parameters (Optional):**
    *   `page` (number, default: 1): Page number for pagination.
    *   `limit` (number, default: 20): Number of products per page (max 100).
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Products in Electronics category retrieved successfully",
      "data": {
        "products": [
          {
            "_id": "654d...",
            "pname": "Laptop",
            "price": 25000,
            "category": "Electronics",
            "addedBy": { "_id": "654c...", "username": "user2" }
            // ... other product fields
          }
        ],
        "category": "Electronics",
        "pagination": {
          "currentPage": 1,
          "totalPages": 3,
          "totalProducts": 55
        }
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid page/limit.

### GET /api/products/:productId

Retrieves a single product by its ID. Increments the product's view count.

*   **URL:** `/api/products/:productId`
*   **Method:** `GET`
*   **Authentication:** None
*   **Path Parameters:**
    *   `productId` (string, required): The ID of the product.
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Product retrieved successfully",
      "data": {
        "product": {
          "_id": "654d...",
          "pname": "Vintage Camera",
          "pdesc": "A classic camera in great condition.",
          "price": 150.00,
          "category": "Electronics",
          "pimage": "uploads/pimage-16789...",
          "pimage2": "uploads/pimage2-16789...",
          "addedBy": {
            "_id": "654c...",
            "username": "newuser",
            "email": "newuser@example.com",
            "mobile": "1234567890"
          },
          "condition": "good",
          "pLoc": {
            "type": "Point",
            "coordinates": [77.2090, 28.6139]
          },
          "status": "active",
          "likesCount": 5,
          "viewsCount": 101, // Incremented
          "createdAt": "2023-10-26T10:30:00.000Z",
          "updatedAt": "2023-10-26T10:30:00.000Z"
        }
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid `productId` format.
    *   `404 Not Found`: Product not found.

### PUT /api/products/:productId

Updates an existing product. Only the product owner can update their product.

*   **URL:** `/api/products/:productId`
*   **Method:** `PUT`
*   **Authentication:** Required (JWT)
*   **Path Parameters:**
    *   `productId` (string, required): The ID of the product to update.
*   **Request Body (JSON):**
    ```json
    {
      "pname": "Updated Camera Name",
      "price": 120.00,
      "condition": "like-new",
      "status": "sold"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Product updated successfully",
      "data": {
        "product": {
          "_id": "654d...",
          "pname": "Updated Camera Name",
          "price": 120.00,
          "condition": "like-new",
          "status": "sold"
          // ... other updated product fields
        }
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Validation failed.
    *   `401 Unauthorized`: Invalid or missing token.
    *   `403 Forbidden`: User is not the owner of the product.
    *   `404 Not Found`: Product not found.

### DELETE /api/products/:productId

Deletes a product. Only the product owner can delete their product.

*   **URL:** `/api/products/:productId`
*   **Method:** `DELETE`
*   **Authentication:** Required (JWT)
*   **Path Parameters:**
    *   `productId` (string, required): The ID of the product to delete.
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Product deleted successfully"
    }
    ```
*   **Error Responses:**
    *   `401 Unauthorized`: Invalid or missing token.
    *   `403 Forbidden`: User is not the owner of the product.
    *   `404 Not Found`: Product not found.

### POST /api/products/my-products

Retrieves all products added by the authenticated user.

*   **URL:** `/api/products/my-products`
*   **Method:** `POST`
*   **Authentication:** Required (JWT)
*   **Request Body:** None (user ID is taken from JWT)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "User products retrieved successfully",
      "data": {
        "products": [
          {
            "_id": "654d...",
            "pname": "My First Product",
            // ... other product fields
          },
          {
            "_id": "654e...",
            "pname": "My Second Product",
            // ... other product fields
          }
        ]
      }
    }
    ```
*   **Error Responses:**
    *   `401 Unauthorized`: Invalid or missing token.
    *   `404 Not Found`: User not found (though unlikely if token is valid).

---

## User Interaction Endpoints

### POST /api/like-product

Toggles the like status of a product for the authenticated user.

*   **URL:** `/api/like-product`
*   **Method:** `POST`
*   **Authentication:** Required (JWT)
*   **Request Body (JSON):**
    ```json
    {
      "productId": "654d..." // The ID of the product to like/unlike
    }
    ```
*   **Success Response (200 OK):**
    ```json
    // If product was liked
    {
      "success": true,
      "message": "Product liked successfully",
      "data": { "isLiked": true }
    }
    // If product was unliked
    {
      "success": true,
      "message": "Product unliked successfully",
      "data": { "isLiked": false }
    }
    ```
*   **Error Responses:**
    *   `401 Unauthorized`: Invalid or missing token.
    *   `404 Not Found`: User or Product not found.
    *   `400 Bad Request`: Missing `productId`.

### POST /api/liked-products

Retrieves all products liked by the authenticated user.

*   **URL:** `/api/liked-products`
*   **Method:** `POST`
*   **Authentication:** Required (JWT)
*   **Request Body:** None (user ID is taken from JWT)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Liked products retrieved successfully",
      "data": {
        "products": [
          {
            "_id": "654d...",
            "pname": "Liked Product 1",
            // ... other product fields
          },
          {
            "_id": "654e...",
            "pname": "Liked Product 2",
            // ... other product fields
          }
        ]
      }
    }
    ```
*   **Error Responses:**
    *   `401 Unauthorized`: Invalid or missing token.
    *   `404 Not Found`: User not found.

---

## Error Responses

All error responses follow a consistent JSON structure:

```json
{
  "success": false,
  "message": "A descriptive error message",
  "errors": [ // Optional: for validation errors
    {
      "field": "fieldName",
      "message": "Specific validation error message",
      "value": "invalidValue" // Optional: the value that caused the error
    }
  ],
  "error": "Detailed error for development environment" // Optional: only in development
}
```

**Common HTTP Status Codes for Errors:**

*   `400 Bad Request`: Client-side input validation failed, or missing required parameters.
*   `401 Unauthorized`: Authentication failed (e.g., invalid or missing JWT token).
*   `403 Forbidden`: User is authenticated but does not have permission to perform the action.
*   `404 Not Found`: The requested resource does not exist.
*   `409 Conflict`: Resource already exists (e.g., user signup with existing email).
*   `500 Internal Server Error`: An unexpected error occurred on the server.
