# SalonHub Platform 💇‍♀️

A modern salon management platform built with Next.js, MongoDB, and TypeScript. Book appointments, manage services, and grow your salon business. + Admin panel

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/salonbooking.lk.git
cd salonbooking.lk

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ✨ Features

### 👥 For Customers
- Browse and search salons
- Book appointments online
- Manage bookings and history
- Rate and review services
- Secure payments with Stripe

### 💼 For Salon Owners
- Manage services and pricing
- Handle appointments and staff
- View analytics and reports
- Upload service photos
- Manage business profile

### 🔧 For Administrators
- Oversee all salons and users
- Handle complaints and disputes
- Generate system reports
- Send notifications
- Manage platform settings

## 📁 Project Structure

```
salonbooking.lk/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin dashboard pages
│   │   ├── appointments/         # Appointment management
│   │   ├── clients/             # Client management
│   │   ├── complaints/          # Complaint handling
│   │   ├── reports/             # Analytics and reports
│   │   └── service-cards/       # Service management
│   ├── salon-owner/             # Salon owner dashboard
│   │   ├── appointments/        # Booking management
│   │   ├── create-profile/      # Initial setup
│   │   ├── profile/             # Business profile
│   │   ├── reports/             # Business analytics
│   │   ├── services/            # Service management
│   │   ├── settings/            # Account settings
│   │   └── staff/               # Staff management
│   ├── user/                    # Customer pages
│   │   ├── appointments/        # Booking history
│   │   ├── favorites/           # Saved salons
│   │   ├── notifications/       # User notifications
│   │   ├── payments/            # Payment history
│   │   └── profile/             # User profile
│   ├── api/                     # API routes
│   │   ├── admin/               # Admin API endpoints
│   │   ├── ai-agent/            # AI-powered features
│   │   ├── appointments/        # Booking API
│   │   ├── auth/                # Authentication
│   │   ├── ratings/             # Review system
│   │   ├── salon-owner/         # Salon owner API
│   │   ├── salons/              # Salon data API
│   │   ├── services/            # Service API
│   │   ├── user/                # User API
│   │   └── webhooks/            # External webhooks
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Homepage
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components (buttons, inputs, etc.)
│   ├── navigation/              # Navigation components
│   ├── forms/                   # Form components
│   └── [feature-components]     # Feature-specific components
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts              # Authentication hook
│   ├── useBooking.ts           # Booking management
│   └── [other-hooks]           # Feature-specific hooks
├── lib/                         # Core utilities and configurations
│   ├── mongodb.ts              # Database connection
│   ├── redis.ts                # Redis cache setup
│   ├── stripe.ts               # Payment processing
│   ├── auth.ts                 # Authentication config
│   └── utils.ts                # Helper functions
├── models/                      # MongoDB/Mongoose schemas
│   ├── Appointment.ts          # Appointment data model
│   ├── Salon.ts                # Salon business model
│   ├── Service.ts              # Service data model
│   ├── User.ts                 # User account model
│   └── [other-models]          # Additional data models
├── store/                       # State management (Zustand)
│   ├── authStore.ts            # Authentication state
│   ├── bookingStore.ts         # Booking state
│   └── [other-stores]          # Feature-specific stores
├── utils/                       # Utility functions
│   ├── sendEmail.ts            # Email notifications
│   ├── dateHelpers.ts          # Date formatting
│   └── [other-utils]           # Helper functions
├── public/                      # Static assets
│   ├── images/                 # Image assets
│   └── icons/                  # Icon files
├── documentation/               # Project documentation
├── .env.example                # Environment variables template
├── next.config.mjs             # Next.js configuration
├── tailwind.config.js          # Tailwind CSS config
└── package.json                # Dependencies and scripts
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: MongoDB with Mongoose
- **Cache**: Redis (Upstash)
- **Authentication**: Clerk
- **Payments**: Stripe
- **Maps**: Google Maps API
- **Email**: Nodemailer
- **State Management**: Zustand
- **File Upload**: UploadThing

## ⚙️ Environment Setup

Create a `.env.local` file with these variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Redis Cache (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Maps (Google)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Settings
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### Required Services

1. **MongoDB Atlas** - Database hosting
2. **Clerk** - User authentication
3. **Upstash Redis** - Caching and sessions
4. **Stripe** - Payment processing
5. **Google Cloud** - Maps API
6. **Email Provider** - SMTP for notifications

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📖 API Documentation

### Authentication
All API routes are protected and require authentication via Clerk.

### Key Endpoints
- `GET /api/salons` - List all salons
- `POST /api/appointments` - Create booking
- `GET /api/user/appointments` - User's bookings
- `POST /api/ratings` - Submit review
- `GET /api/salon-owner/services` - Salon services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


---

Made with ❤️ for the salon industry