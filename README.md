# Order Management System

A full-stack order management system with authentication, product management, promotions (percentage, fixed, and weighted), and order processing. Built with Next.js, Express, TypeScript, and PostgreSQL.

## 🎯 Project Overview

This system provides a complete solution for managing products, promotions, and orders with sophisticated discount calculation capabilities. It supports three types of promotions:

- **Percentage Discounts**: Apply a percentage off the product price
- **Fixed Discounts**: Apply a fixed amount discount
- **Weighted Discounts**: Calculate discounts based on product weight and quantity using configurable slabs

## 🏗️ Project Structure

```
.
├── backend/          # Node.js + Express + TypeScript API
│   ├── src/         # Source code
│   │   ├── modules/ # Feature modules (auth, products, promotions, orders, analytics)
│   │   ├── config/  # Configuration files
│   │   └── utils/   # Utility functions
│   ├── prisma/      # Database schema and migrations
│   ├── db/          # Seed data
│   └── postman/     # API documentation
├── frontend/         # Next.js + React + TypeScript Frontend
│   ├── app/         # Next.js App Router pages
│   ├── components/  # React components
│   ├── redux/       # State management
│   └── lib/         # Utilities
├── compose.yml      # Docker Compose configuration
└── README.md        # This file
```

## ✨ Features

### Authentication

- ✅ JWT-based authentication with access and refresh tokens
- ✅ Secure password hashing with Argon2
- ✅ HttpOnly cookies for token storage
- ✅ Token rotation and revocation
- ✅ Sign-in page with email/password

### Product Management

- ✅ List view with filtering (active/inactive products)
- ✅ Create product (name, description, price, **weight**, currency)
- ✅ Edit product (all fields editable)
- ✅ Enable/disable products
- ✅ Disabled products hidden from order page

### Promotion Management

- ✅ List/Table view of all promotions
- ✅ Create promotions with start/end dates
- ✅ Enable/disable promotions
- ✅ Edit promotions (title and dates only)
- ✅ Disabled/expired promotions hidden from order page
- ✅ Three promotion types:
  - **Percentage**: Discount based on percentage of price
  - **Fixed**: Fixed amount discount
  - **Weighted**: Discount based on product weight and quantity using slabs

### Order Management

- ✅ List/Table view of orders
- ✅ Create order with:
  - Product selection
  - Customer information
  - Automatic discount calculation
  - Individual product discounts display
  - Subtotal, total discount, and grand total
- ✅ Order details view
- ✅ Order statistics and analytics

### Additional Features

- ✅ Analytics dashboard with revenue and order statistics
- ✅ Responsive UI with dark mode support
- ✅ Real-time discount calculation
- ✅ Currency: BDT (Bangladeshi Taka)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for containerized setup)
- PostgreSQL 16+ (if not using Docker)

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/iazadur/order-management-system.git
   cd order-management-system
   ```

2. **Start all services**

   ```bash
   docker-compose up -d
   ```

3. **Run database migrations and seed data**

   ```bash
   docker-compose exec backend npx prisma migrate deploy
   docker-compose exec backend npx prisma db seed
   ```

4. **Access the application**

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Health Check: http://localhost:5001/health

5. **View logs**

   ```bash
   docker-compose logs -f
   ```

6. **Stop services**
   ```bash
   docker-compose down
   ```

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

   Required environment variables:

   ```env
   NODE_ENV=development
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=order_manager
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/order_manager?schema=public
   JWT_ACCESS_SECRET=a56cfd4560f03c99cbea60c69a7f68b9e8c44a755e9ba2cf5b362e5f81f3d53d
   JWT_REFRESH_SECRET=27e17b68eb33b69c75c4b6f0b30c56b089aede89cac1a3edf9180d109817fe2f
   JWT_ACCESS_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="7d"
   PORT=5001
   CORS_ORIGIN=http://localhost:3000, http://localhost:5001
   ```

4. **Run database migrations**

   ```bash
   npx prisma migrate dev
   ```

5. **Seed database (optional)**

   ```bash
   npx prisma db seed
   ```

6. **Start development server**

   ```bash
   npm run dev
   ```

   Backend will run on `http://localhost:5001`

#### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

   Required environment variables:

   ```env
   API_URL=http://localhost:5001
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:3000`

## 📚 API Documentation

A complete Postman collection is available at `backend/postman/oms_system.postman_collection.json`

### Import the Collection

1. Open Postman
2. Click "Import"
3. Select `backend/postman/oms_system.postman_collection.json`
4. Import the environment file: `backend/postman/Environment.postman_environment.json`

### Key Endpoints

#### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

#### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (auth required)
- `PUT /api/products/:id` - Update product (auth required)
- `PATCH /api/products/:id/toggle` - Toggle product status (auth required)

#### Promotions

- `GET /api/promotions/active` - Get active promotions
- `GET /api/promotions` - Get all promotions (auth required)
- `GET /api/promotions/:id` - Get promotion by ID (auth required)
- `POST /api/promotions` - Create promotion (auth required)
- `PUT /api/promotions/:id` - Update promotion (auth required)
- `PATCH /api/promotions/:id/toggle` - Toggle promotion (auth required)

#### Orders

- `POST /api/orders` - Create order (auth required)
- `GET /api/orders/my` - Get user's orders (auth required)
- `GET /api/orders` - Get all orders (auth required)
- `GET /api/orders/:id` - Get order by ID (auth required)
- `GET /api/orders/stats` - Get order statistics (auth required)

#### Analytics

- `GET /api/analytics/dashboard` - Get dashboard statistics (auth required)

## 🧪 Testing

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:3000 in browser
```

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with refresh tokens
- **Password Hashing**: Argon2
- **Validation**: Zod
- **Security**: Helmet.js, Rate limiting

### Frontend

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: Redux Toolkit
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## 📝 Database Schema

### Key Models

- **User**: User accounts with authentication
- **Product**: Products with name, price, weight, description
- **Promotion**: Promotions with dates, type, and slabs
- **PromotionSlab**: Slabs for weighted promotions (min/max weight, discount)
- **Order**: Orders with customer info, totals, and status
- **OrderItem**: Individual items in an order

## 🎨 UI/UX Features

- Modern, responsive design
- Dark mode support
- Loading states and skeletons
- Error handling with toast notifications
- Form validation with real-time feedback
- Accessible components (ARIA labels)
- Smooth animations and transitions

## 🔒 Security Features

- JWT access tokens (15 minutes expiry)
- Rotating refresh tokens (7 days expiry)
- HttpOnly, Secure, SameSite cookies
- Argon2 password hashing
- Rate limiting on authentication endpoints
- Input validation with Zod
- SQL injection protection (Prisma)
- XSS protection
- Helmet.js security headers

## 📦 Docker

### Build Images

```bash
docker-compose build
```

### Run Services

```bash
docker-compose up -d
```

### View Logs

```bash
docker-compose logs -f [service-name]
```

### Stop Services

```bash
docker-compose down
```

### Remove Volumes

```bash
docker-compose down -v
```

## 🚢 Deployment

### Backend

1. Set production environment variables
2. Run `npm run build`
3. Start with `npm start`
4. Run migrations: `npx prisma migrate deploy`

### Frontend

1. Set production environment variables
2. Run `npm run build`
3. Start with `npm start`

## 📄 License

MIT

## 👤 Author

**MD Azadur Rahman**

- 🌐 Portfolio: [azadur.com.bd](https://azadur.com.bd/)
- 📧 Email: [iamazadur@gmail.com](mailto:iamazadur@gmail.com)
- 💼 Full Stack Developer | Transforming Ideas into Web Wonders

Built with ❤️ by [MD Azadur Rahman](https://azadur.com.bd/)

## 📧 Support

For questions, issues, or collaboration opportunities, please contact:

- 📧 Email: [iamazadur@gmail.com](mailto:iamazadur@gmail.com)
- 🌐 Website: [azadur.com.bd](https://azadur.com.bd/)
