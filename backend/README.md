# Backend API

RESTful API for Order Management System built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

Server runs on `http://localhost:5001` by default.

## 📁 Project Structure

```
backend/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication
│   │   ├── products/     # Product management
│   │   ├── promotions/    # Promotion system
│   │   ├── orders/       # Order management
│   │   └── analytics/     # Dashboard analytics
│   ├── config/           # Configuration
│   ├── middlewares/      # Express middlewares
│   └── utils/            # Utility functions
├── prisma/               # Database schema & migrations
└── postman/              # Postman collection
```

## 🔑 Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT Secrets
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=5001
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3000"
```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/logout-all` - Logout all devices

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (auth required)
- `PUT /api/products/:id` - Update product (auth required)
- `PATCH /api/products/:id/toggle` - Toggle product status (auth required)

### Promotions

- `GET /api/promotions/active` - Get active promotions
- `GET /api/promotions` - Get all promotions (auth required)
- `GET /api/promotions/:id` - Get promotion by ID (auth required)
- `POST /api/promotions` - Create promotion (auth required)
- `PUT /api/promotions/:id` - Update promotion (auth required)
- `PATCH /api/promotions/:id/toggle` - Toggle promotion (auth required)

### Orders

- `POST /api/orders` - Create order (auth required)
- `GET /api/orders/my` - Get user's orders (auth required)
- `GET /api/orders` - Get all orders (auth required)
- `GET /api/orders/:id` - Get order by ID (auth required)
- `GET /api/orders/stats` - Get order statistics (auth required)

### Analytics

- `GET /api/analytics/dashboard` - Get dashboard statistics (auth required)

### Health

- `GET /health` - Health check

## 💾 Database

### Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Seed Data

```bash
npx prisma db seed
```

## 🧪 Testing

Postman collection: `postman/oms_system.postman_collection.json`

Import the collection to test all endpoints.

## 🛠️ Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run linter
```

## 🔒 Security Features

- JWT access tokens (15 minutes)
- Rotating refresh tokens (7 days)
- HttpOnly cookies
- Rate limiting
- Input validation with Zod
- Argon2 password hashing
- Helmet.js security headers

## 💰 Currency

All prices and amounts are stored directly in **BDT (Bangladeshi Taka)**.

## 📚 Documentation

See `postman/README.md` for detailed API documentation.
