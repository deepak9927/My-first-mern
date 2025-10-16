# Backend Guide for Non-MERN Developers

This guide explains the backend structure, concepts, and workflows for the OLX Clone MERN app. It is designed for developers who may be new to Node.js, Express, or MongoDB.

---

## Folder Overview

- **controllers/**: Contains logic for handling API requests (e.g., authentication, products, users).
- **models/**: Defines data schemas and methods for MongoDB collections (e.g., User, Product).
- **middleware/**: Functions that run before controllers, handling authentication, validation, and permissions.
- **uploads/**: Stores product images uploaded by users.
- **index.js**: Main entry point for the backend server.

---

## Key Concepts

### 1. Controllers
- Receive HTTP requests, process data, and send responses.
- Example: `authController.js` handles signup, login, and profile endpoints.

### 2. Models
- Define the structure of data stored in MongoDB.
- Example: `User.js` describes user fields, validation, and password hashing.

### 3. Middleware
- Functions that intercept requests for tasks like authentication (JWT), validation, and access control.
- Example: `auth.js` checks if a user is logged in before allowing access to protected routes.

### 4. Authentication Flow
- User signs up or logs in → receives JWT token.
- Token is sent in the `Authorization` header for protected requests.
- Middleware verifies token and attaches user info to the request.

### 5. Adding a New Endpoint (Step-by-Step)
1. Create a new controller function in `controllers/`.
2. Add a route in your router (usually in `index.js` or a separate `routes/` file).
3. (Optional) Add middleware for authentication or validation.
4. Test with Postman or frontend code.

---

## Data Flow Example
1. **Frontend** sends a POST request to `/api/products` with product data and images.
2. **Middleware** checks authentication and validates input.
3. **Controller** processes the request, saves data using the **Model**.
4. **Model** interacts with MongoDB, stores product info and images.
5. **Controller** sends a response back to the frontend.

---

## Common Error Handling
- Validation errors: Return 400 with details.
- Authentication errors: Return 401 if token is missing/invalid.
- Permission errors: Return 403 if user is not allowed to access resource.
- Not found: Return 404 if resource does not exist.

---

## Glossary
- **JWT**: JSON Web Token, used for stateless authentication.
- **Middleware**: Functions that run before controllers to process requests.
- **Mongoose**: Library for MongoDB object modeling in Node.js.
- **Schema**: Blueprint for data structure in MongoDB.
- **Controller**: Handles API logic and responses.

---

## How to Test Endpoints
- Use [Postman](https://www.postman.com/) or [curl](https://curl.se/) to send requests.
- Example (signup):
  ```bash
  curl -X POST http://localhost:5000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","email":"test@example.com","password":"Test1234","mobile":"1234567890"}'
  ```
- Example (login):
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"identifier":"testuser","password":"Test1234"}'
  ```

---

For more details, see `API_REFERENCE.md` and code comments in each backend file.
