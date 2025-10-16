# MERN Stack OLX Clone

This is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application designed as an OLX clone, allowing users to buy and sell old items. The project has been upgraded to use modern web development standards, including:

**Frontend (React.js):**
*   **Tailwind CSS:** For a utility-first CSS framework, enabling rapid UI development and consistent styling.
*   **Zustand:** A fast and scalable state-management solution.
*   **React Query:** For efficient data fetching, caching, and synchronization.
*   **Zod:** For robust schema validation, ensuring type safety and data integrity.
*   **React Hook Form:** For performant and flexible form management, integrated with Zod resolvers for validation.
*   **TypeScript:** Enhances code quality, maintainability, and developer experience.
*   **Framer Motion:** For smooth and engaging UI animations.
*   **React Hot Toast:** For elegant and responsive notifications.

**Backend (Node.js & Express.js):**
*   **MongoDB & Mongoose:** For flexible NoSQL database management.
*   **JWT Authentication:** Secure user authentication using JSON Web Tokens.
*   **Multer:** For handling multipart/form-data, primarily for image uploads.
*   **Express Validator:** For robust API input validation.
*   **Security Best Practices:** Implemented with `helmet`, `compression`, and `express-rate-limit`.
*   **Geospatial Search:** Location-based product search capabilities.

## Table of Contents

1.  [Features](#features)
2.  [Technologies Used](#technologies-used)
3.  [Project Structure](#project-structure)
4.  [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Environment Variables](#environment-variables)
    *   [Running the Application](#running-the-application)
5.  [API Reference](#api-reference)
6.  [Deployment to Azure Cloud](#deployment-to-azure-cloud)
7.  [Contributing](#contributing)
8.  [License](#license)

## Features

*   **User Authentication:** Secure signup, login, and profile management.
*   **Product Listings:** Users can add, view, update, and delete their products.
*   **Image Uploads:** Support for multiple product images.
*   **Product Search & Filtering:** Search by keywords, filter by category, **price range**, **sorting options (newest, price low-to-high, price high-to-low)**, and location.
*   **Location-Based Discovery:** Find products near your current location.
*   **Product Details:** Detailed view for each product with owner information.
*   **Like/Unlike Products:** Users can mark products as favorites.
*   **Responsive Design:** Optimized for various screen sizes using Tailwind CSS.
*   **Modern UI/UX:** Enhanced with animations and toast notifications.

## Technologies Used

**Frontend:**
*   React.js
*   TypeScript
*   Tailwind CSS
*   Zustand
*   React Query
*   Zod
*   React Hook Form
*   React Router DOM
*   Framer Motion
*   React Hot Toast
*   Axios

**Backend:**
*   Node.js
*   Express.js
*   MongoDB
*   Mongoose
*   JWT (jsonwebtoken)
*   Bcrypt.js
*   Multer
*   Express Validator
*   Dotenv
*   CORS
*   Helmet
*   Compression
*   Express Rate Limit

## Project Structure

```
.
├── node-app/                 # Backend (Node.js/Express.js)
│   ├── controllers/          # API logic for auth, products, users
│   ├── middleware/           # Authentication and validation middleware
│   ├── models/               # Mongoose schemas for User and Product
│   ├── uploads/              # Directory for uploaded product images
│   ├── .env.example          # Example environment variables for backend
│   ├── index.js              # Main backend application file
│   └── package.json          # Backend dependencies
├── react-app/                # Frontend (React.js/TypeScript)
│   ├── public/               # Public assets
│   ├── src/                  # React source code
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions, API client, Zod schemas, React Query client
│   │   ├── store/            # Zustand stores
│   │   ├── App.tsx           # Main application component and routing
│   │   ├── index.css         # Tailwind CSS imports
│   │   └── ...               # Other core React files
│   ├── .env.example          # Example environment variables for frontend
│   ├── package.json          # Frontend dependencies
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── tsconfig.json         # TypeScript configuration
├── .github/                  # GitHub Actions workflows (e.g., Azure deployment)
├── docker-compose.yml        # Docker Compose configuration for local development
├── .gitignore                # Git ignore rules
├── README.md                 # Project documentation (this file)
└── ...                       # Other configuration files (e.g., deployment scripts)
```

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   Node.js (v18 or higher)
*   npm or pnpm (recommended)
*   MongoDB (local installation or cloud service like MongoDB Atlas)
*   Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/deepak9927/My-first-mern.git
    cd My-first-mern
    ```

2.  **Install backend dependencies:**
    ```bash
    cd node-app
    pnpm install # or npm install
    cd ..
    ```

3.  **Install frontend dependencies:**
    ```bash
    cd react-app
    pnpm install # or npm install
    cd ..
    ```

### Environment Variables

Create `.env` files in both `node-app/` and `react-app/` directories based on their respective `.env.example` files.

**`node-app/.env`:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-marketplace
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**`react-app/.env`:**
```
REACT_APP_API_URL=http://localhost:5000/api
```

**Important:** Replace `your_jwt_secret_key` with a strong, random string for production environments.

### Running the Application

1.  **Start MongoDB:**
    Ensure your MongoDB instance is running. If using a local installation, start it. If using Docker Compose, you can start it with:
    ```bash
    docker-compose up -d mongo
    ```

2.  **Start the Backend (Node.js):**
    ```bash
    cd node-app
    npm install # or pnpm install if you prefer
    npm run dev # or pnpm dev (uses nodemon for auto-restarts)
    ```
    The backend API will be running at `http://localhost:5000`.

3.  **Start the Frontend (React.js):**
    ```bash
    cd react-app
    npm install # or pnpm install if you prefer
    npm start # or pnpm start
    ```
    The frontend application will be running at `http://localhost:3000`.


## Backend Guide for Everyone

If you're new to Node.js, Express, or MongoDB, or just want a quick overview of how the backend works, see:

- [`BACKEND_GUIDE.md`](./BACKEND_GUIDE.md) — Step-by-step onboarding, folder explanations, data flow, error handling, and glossary.

**Quick summary:**
- Controllers: Handle API requests and responses (e.g., signup, login, add product)
- Models: Define data structure and validation for MongoDB (e.g., User, Product)
- Middleware: Add authentication, validation, and permissions before requests reach controllers
- Authentication: Uses JWT tokens, checked by middleware for protected routes
- Adding new endpoints: Create a controller function, add a route, (optionally) add middleware, and test

For more details, see the guide above and code comments in backend files.

---

## API Reference

Detailed API documentation will be provided in `API_REFERENCE.md`. This will include:
*   Authentication Endpoints
*   Product Endpoints
*   User Interaction Endpoints
*   Request/Response examples
*   Error codes

## Deployment to Azure Cloud

This project is configured for deployment to Azure Cloud. A `docker-compose.yml` and `Dockerfile`s for both frontend and backend are provided. Detailed deployment steps will be outlined in `AZURE_DEPLOYMENT.md`.

## Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'feat: Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## License

This project is licensed under the ISC License.
