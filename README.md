# MecBill Tech Salon

Premium full-stack salon website and e-commerce platform built with Next.js 16, TypeScript, Tailwind CSS, PostgreSQL, Prisma, NextAuth, Cloudinary, Paystack, Stripe, and Brevo.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma 6
- **Auth:** NextAuth v4 (JWT strategy)
- **Payments:** Stripe + Paystack
- **Email:** Brevo
- **Storage:** Cloudinary
- **UI:** Shadcn (base-nova), Tailwind CSS 4, Recharts
- **State:** Zustand + Tanstack React Query
- **Testing:** Vitest (unit) + Playwright (E2E)

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Cloudinary account
- Stripe account
- Paystack account
- Brevo account

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd salon

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | NextAuth JWT secret |
| `NEXTAUTH_URL` | Your app URL (e.g., `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `PAYSTACK_SECRET_KEY` | Paystack secret key |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key |
| `PAYSTACK_WEBHOOK_SECRET` | Paystack webhook secret |
| `BREVO_API_KEY` | Brevo API key |
| `BREVO_SENDER_EMAIL` | Brevo sender email |
| `BREVO_SENDER_NAME` | Brevo sender name |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CRON_SECRET` | Secret for cron job authentication |

See `.env.example` for the full list including optional variables.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run unit tests (Vitest)
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run E2E tests (Playwright)
npm run test:e2e:ui  # Open Playwright UI
npm run db:seed      # Seed database
npm run db:reset     # Reset database
```

## Project Structure

```
salon/
├── app/
│   ├── (main)/          # Public-facing pages (shop, blog, booking)
│   ├── admin/           # Admin dashboard
│   ├── api/             # API routes (58+ endpoints)
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Customer dashboard
│   ├── global-error.tsx # Global error boundary
│   ├── not-found.tsx    # Custom 404 page
│   ├── robots.ts        # Robots.txt generation
│   └── sitemap.ts       # Sitemap generation (dynamic)
├── components/          # Shared React components
├── e2e/                 # Playwright E2E tests
├── hooks/               # Custom React hooks + Tanstack Query
├── lib/                 # Utilities, auth, notifications, payments
├── prisma/              # Database schema and seed
├── public/              # Static assets
├── store/               # Zustand stores
├── tests/               # Vitest unit tests
└── types/               # TypeScript type definitions
```

## Features

### Customer-Facing
- Product catalog with search, filtering, and categories
- Service booking with stylist selection and scheduling
- Shopping cart with coupon codes and loyalty points
- Checkout with Stripe (card) or Paystack (bank transfer)
- Order tracking with visual timeline
- User dashboard with order history, hair profile, wishlist, loyalty
- Blog with comments and sharing
- Appointment management (book, reschedule, cancel)

### Admin
- Dashboard with analytics charts (Recharts)
- Order management with bulk updates and CSV export
- Inventory management with stock movements and low-stock alerts
- Appointment scheduling with stylist availability management
- Coupon and loyalty points management
- Blog management
- Customer management
- Audit log

### Technical
- SEO-optimized with dynamic sitemap, JSON-LD structured data, OpenGraph
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- Rate limiting on API routes
- Input sanitization
- Inventory reservation system with TTL expiry
- Webhook handling for Stripe and Paystack
- Email notifications (Brevo)
- Push notifications (Web Push/VAPID)
- In-app notification system

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com/new)
3. Set environment variables
4. Deploy

### Docker (Standalone)

```bash
# Build
npm run build

# The standalone output is in .next/standalone/
docker build -t salon .
docker run -p 3000:3000 salon
```

### CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs:
- ESLint
- TypeScript type check
- Unit tests
- Build verification

## Testing

### Unit Tests (Vitest)

```bash
npm test
```

133 tests covering: helpers, coupons, orders, payments, inventory, audit, sanitization, rate limiting, expiry.

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

Tests for: homepage, shop, auth, navigation, SEO, security headers.

## License

Private. All rights reserved.
