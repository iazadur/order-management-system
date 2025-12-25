# Frontend Application

Next.js frontend for Order Management System with authentication, dashboard, and order management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

Application runs on `http://localhost:3000` by default.

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── dashboard/         # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── auth/              # Authentication forms
│   ├── dashboard/         # Dashboard components
│   ├── orders/            # Order components
│   ├── products/          # Product components
│   ├── promotions/        # Promotion components
│   └── ui/                # shadcn/ui components
├── redux/                 # Redux store & slices
├── lib/                   # Utilities
└── types/                 # TypeScript types
```

## 🔑 Environment Variables

Create a `.env.local` file:

```env
# API Configuration
API_URL=http://localhost:5001

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## 🎨 Features

- ✅ User authentication (Login, Register)
- ✅ Dashboard with analytics
- ✅ Product management
- ✅ Promotion management
- ✅ Order creation and management
- ✅ Real-time discount calculation
- ✅ Responsive design with dark mode
- ✅ Currency: BDT (৳)

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **State Management:** Redux Toolkit
- **Authentication:** NextAuth.js
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

## 📱 Pages

- `/` - Home (redirects to dashboard or login)
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Analytics dashboard
- `/dashboard/products` - Product management
- `/dashboard/promotions` - Promotion management
- `/dashboard/orders` - Order management
- `/dashboard/orders/new` - Create new order
- `/dashboard/orders/:id` - Order details

## 🧪 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run linter
```

## 🎨 UI Components

Uses [shadcn/ui](https://ui.shadcn.com/) components:
- Button, Input, Card, Dialog
- Form, Table, Badge
- Alert, Skeleton, Switch

## 💰 Currency Formatting

All prices are formatted using the `formatCurrency()` utility function which displays amounts in **BDT (৳)**.

Example: `formatCurrency(1999)` → `৳19.99`

## 🔐 Authentication

Uses NextAuth.js with JWT strategy:
- Access tokens stored in session
- Automatic token refresh
- Protected routes with middleware

## 📦 State Management

Redux Toolkit with RTK Query for API calls:
- `authApi` - Authentication
- `productsApi` - Products
- `promotionsApi` - Promotions
- `ordersApi` - Orders
- `analyticsApi` - Dashboard statistics

## 🚀 Deployment

### Build

```bash
npm run build
```

### Docker

```bash
docker build -t frontend .
docker run -p 3000:3000 frontend
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
