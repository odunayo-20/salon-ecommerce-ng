# MecBill Tech Salon — Developer Manual

> Comprehensive technical documentation for developers working on this codebase.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Getting Started](#4-getting-started)
5. [Authentication System](#5-authentication-system)
6. [Database & ORM](#6-database--orm)
7. [API Layer](#7-api-layer)
8. [Payment System](#8-payment-system)
9. [Notification System](#9-notification-system)
10. [Inventory Management](#10-inventory-management)
11. [State Management](#11-state-management)
12. [UI & Design System](#12-ui--design-system)
13. [Testing](#13-testing)
14. [Deployment](#14-deployment)
15. [Coding Conventions](#15-coding-conventions)
16. [Common Patterns](#16-common-patterns)

---

## 1. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                 │
├─────────────┬──────────────┬──────────────┬─────────────┤
│  (main)/    │  dashboard/  │    admin/    │    auth/     │
│  Public     │  Customer    │   Admin      │  Auth        │
│  Pages      │  Portal      │   Panel      │  Pages       │
├─────────────┴──────────────┴──────────────┴─────────────┤
│                      API Layer (58+ routes)              │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ Payments │  Orders  │ Products │ bookings │  Webhooks   │
│ Stripe   │          │          │          │  Paystack   │
│ Paystack │          │          │          │  Stripe     │
├──────────┴──────────┴──────────┴──────────┴─────────────┤
│                   Core Services (lib/)                   │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ Auth     │Notif.    │Inventory │ Audit    │  Logger     │
│ NextAuth │ Brevo    │ Stock    │ Changes  │  Structured │
│ JWT      │ Push     │ Reserve  │          │             │
├──────────┴──────────┴──────────┴──────────┴─────────────┤
│               PostgreSQL (Prisma 6 ORM)                  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Client** → Zustand store (cart/wishlist/UI state) + Tanstack React Query (server state)
2. **API Routes** → Prisma → PostgreSQL
3. **Webhooks** → Payment verification → Atomic DB transactions → Notifications
4. **Notifications** → Event-driven → EMAIL (Brevo) + PUSH (Web Push) + IN_APP (DB)

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 16.2.10 | App Router, SSR, API routes |
| Language | TypeScript | 5.x | Type safety |
| UI | Tailwind CSS | 4.x | Styling |
| Components | Shadcn (base-nova) | — | UI primitives |
| Database | PostgreSQL | — | Primary datastore |
| ORM | Prisma | 6.x | Database access |
| Auth | NextAuth | 4.x | Authentication |
| Payments | Stripe | 22.x | Card payments |
| Payments | Paystack | — | Bank transfers |
| Email | Brevo | 6.x | Transactional email |
| Push | web-push | 3.x | Browser push notifications |
| Storage | Cloudinary | 2.x | Image hosting |
| State | Zustand | 5.x | Client state (cart/wishlist) |
| Data Fetching | Tanstack React Query | 5.x | Server state caching |
| Charts | Recharts | 3.x | Admin analytics |
| Testing | Vitest | 4.x | Unit tests |
| Testing | Playwright | 1.x | E2E tests |

---

## 3. Project Structure

```
salon/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Public route group (wraps in LayoutShell)
│   │   ├── page.tsx              # Homepage
│   │   ├── about/                # About page
│   │   ├── blog/                 # Blog listing + [slug] detail
│   │   ├── book/                 # Booking wizard + [category]/[slug]
│   │   ├── shop/                 # Product catalog + [slug] detail
│   │   │   ├── cart/             # Cart page
│   │   │   ├── checkout/         # Checkout (Stripe + Paystack)
│   │   │   ├── payment/          # Payment callbacks
│   │   │   └── order/success/    # Order confirmation
│   │   ├── careers/              # Careers page
│   │   ├── consultation/         # Consultation form
│   │   ├── contact/              # Contact page
│   │   ├── faq/                  # FAQ page
│   │   ├── locations/            # Locations page
│   │   ├── privacy/              # Privacy policy
│   │   ├── returns/              # Returns policy
│   │   ├── shipping/             # Shipping info
│   │   ├── stylists/             # Stylists listing
│   │   ├── support/              # Support page
│   │   ├── terms/                # Terms of service
│   │   ├── error.tsx             # Error boundary for public pages
│   │   └── loading.tsx           # Loading state for public pages
│   ├── admin/                    # Admin dashboard
│   │   ├── page.tsx              # Admin overview
│   │   ├── analytics/            # Analytics charts (Recharts)
│   │   ├── appointments/         # Appointment management
│   │   ├── audit-log/            # Audit log viewer
│   │   ├── blog/                 # Blog management
│   │   ├── categories/           # Category management
│   │   ├── consultations/        # Consultation management
│   │   ├── coupons/              # Coupon management
│   │   ├── customers/            # Customer management
│   │   ├── inventory/            # Inventory management
│   │   ├── orders/               # Order management
│   │   ├── products/             # Product management
│   │   ├── reviews/              # Review moderation
│   │   ├── schedules/            # Stylist scheduling
│   │   ├── services/             # Service management
│   │   ├── stylists/             # Stylist management
│   │   ├── error.tsx             # Error boundary for admin
│   │   └── loading.tsx           # Loading state for admin
│   ├── api/                      # API routes (58+ endpoints)
│   │   ├── admin/                # Admin-only API routes
│   │   ├── auth/                 # NextAuth API routes
│   │   ├── blog/                 # Blog CRUD
│   │   ├── bookings/             # Appointment booking
│   │   ├── cron/                 # Cron jobs (reminders, expiry)
│   │   ├── notifications/        # Notification management
│   │   ├── orders/               # Order management
│   │   ├── payments/             # Payment initiation
│   │   ├── products/             # Product CRUD
│   │   ├── reviews/              # Review system
│   │   ├── services/             # Service CRUD
│   │   ├── upload/               # Cloudinary upload
│   │   └── webhook/              # Payment webhooks
│   ├── auth/                     # Auth pages (signin, signup, etc.)
│   ├── dashboard/                # Customer dashboard
│   │   ├── page.tsx              # Dashboard overview
│   │   ├── hair-profile/         # Hair profile management
│   │   ├── loyalty/              # Loyalty points
│   │   ├── orders/               # Order history + [id] detail
│   │   └── wishlist/             # Wishlist
│   ├── global-error.tsx          # Root error boundary
│   ├── not-found.tsx             # Custom 404 page
│   ├── layout.tsx                # Root layout (fonts, metadata, JSON-LD)
│   ├── robots.ts                 # robots.txt generation
│   ├── sitemap.ts                # sitemap.xml generation (dynamic)
│   └── globals.css               # Global styles + Tailwind
├── components/                   # Shared React components
│   ├── admin/                    # Admin-specific components
│   ├── cart/                     # Cart drawer
│   ├── layout/                   # Layout shell, navbar, footer
│   ├── seo/                      # Structured data (JSON-LD)
│   └── ui/                       # Shadcn UI primitives
├── e2e/                          # Playwright E2E tests
├── hooks/                        # Custom React hooks
│   ├── queries.ts                # Tanstack Query hooks + interfaces
│   └── use-push-registration.ts  # Push notification registration
├── lib/                          # Core utilities
│   ├── auth.ts                   # NextAuth configuration
│   ├── audit.ts                  # Audit logging
│   ├── inventory.ts              # Inventory helpers
│   ├── logger.ts                 # Structured logger
│   ├── notifications/            # Notification system
│   │   ├── types.ts              # Event types
│   │   ├── templates.ts          # Event templates
│   │   ├── index.ts              # notify() + notifyAdmins()
│   │   └── channels/             # EMAIL, PUSH, IN_APP handlers
│   ├── paystack.ts               # Paystack integration
│   ├── prisma.ts                 # Prisma client singleton
│   ├── rate-limit.ts             # In-memory rate limiting
│   ├── resend.ts                 # Brevo email templates
│   ├── sanitize.ts               # Input sanitization
│   └── stripe.ts                 # Stripe integration
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema (25+ models)
│   └── seed.ts                   # Database seeder
├── public/                       # Static assets
├── store/                        # Zustand stores
│   └── index.ts                  # Cart, Wishlist, UI stores
├── tests/                        # Vitest unit tests (133 tests)
├── types/                        # TypeScript type definitions
│   └── next-auth.d.ts            # NextAuth session extensions
├── .env.example                  # Environment variable template
├── next.config.ts                # Next.js configuration
├── playwright.config.ts          # Playwright E2E config
├── vitest.config.ts              # Vitest unit test config
└── package.json                  # Dependencies and scripts
```

---

## 4. Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Cloudinary account (for image uploads)
- Stripe account (for card payments)
- Paystack account (for bank transfers)
- Brevo account (for transactional email)

### Environment Setup

```bash
cp .env.example .env
```

Fill in the required environment variables (see `.env.example` for the full list).

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database
npm run db:seed
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `npm run dev` | Start development server |
| Build | `npm run build` | Production build |
| Start | `npm run start` | Start production server |
| Lint | `npm run lint` | Run ESLint |
| Test | `npm test` | Run unit tests (Vitest) |
| Test Watch | `npm run test:watch` | Run tests in watch mode |
| E2E | `npm run test:e2e` | Run Playwright E2E tests |
| E2E UI | `npm run test:e2e:ui` | Open Playwright UI |
| DB Seed | `npm run db:seed` | Seed database |
| DB Reset | `npm run db:reset` | Reset database |

---

## 5. Authentication System

### Configuration

**File:** `lib/auth.ts`

- **Strategy:** JWT (not database sessions)
- **Providers:** Credentials (email/password) + Google OAuth
- **Adapter:** Prisma (for user storage)
- **Custom pages:** `/auth/signin`

### Session Extension

The session object is extended with `id` and `role` fields:

```typescript
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      // ...default fields
    };
  }
}
```

### Using Auth in Components

```typescript
// Client component
import { useSession } from "next-auth/react";
const { data: session } = useSession();

// Server component / API route
import { auth } from "@/lib/auth";
const session = await auth();

// Check role
if (session?.user?.role === "ADMIN") { ... }
```

### Auth Flow

1. User submits credentials → `authorize()` in `lib/auth.ts`
2. Password verified with `bcrypt.compare()`
3. JWT token created with `id` and `role` claims
4. Session available via `useSession()` (client) or `auth()` (server)
5. API routes check `auth()` and return 401 if unauthorized

---

## 6. Database & ORM

### Prisma Client

**File:** `lib/prisma.ts`

Singleton pattern to avoid multiple connections in development:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Key Models

| Model | Purpose |
|-------|---------|
| `User` | User accounts (customers, admins) |
| `CustomerProfile` | Customer-specific data (linked to User) |
| `Product` | Shop products with stock tracking |
| `ProductVariant` | Product variants (size, color) |
| `Service` | Salon services |
| `ServiceCategory` | Service categories |
| `Stylist` | Stylist profiles |
| `Availability` | Stylist working hours |
| `BlockedTime` | Stylist blocked dates |
| `Appointment` | Booked appointments |
| `Order` | Customer orders |
| `OrderItem` | Items in an order |
| `Payment` | Payment records |
| `Coupon` | Discount coupons |
| `LoyaltyPoint` | Loyalty point transactions |
| `BlogPost` | Blog articles |
| `Review` | Product/service reviews |
| `Notification` | In-app notifications |
| `NotificationLog` | Delivery log for all channels |
| `StockMovement` | Inventory audit trail |
| `AuditLog` | Change audit trail |
| `HairProfile` | Customer hair profiles |
| `Wishlist` | Customer wishlists |

### Common Queries

```typescript
// Find with relations
const order = await prisma.order.findUnique({
  where: { id },
  include: {
    items: true,
    payments: { where: { status: "PAID" } },
    customerProfile: { include: { user: true } },
  },
});

// Transaction
await prisma.$transaction(async (tx) => {
  const product = await tx.product.findUnique({ where: { id }, select: { stock: true } });
  await tx.product.update({ where: { id }, data: { stock: product.stock - quantity } });
  await tx.stockMovement.create({ data: { ... } });
});

// Raw query (for row-level locking)
const rows = await prisma.$queryRaw`
  SELECT id, stock FROM "Product"
  WHERE id = ${productId}
  FOR UPDATE
`;
```

---

## 7. API Layer

### Route Convention

All API routes follow Next.js App Router conventions:

```
app/api/[resource]/route.ts          # GET (list), POST (create)
app/api/[resource]/[id]/route.ts     # GET (detail), PATCH (update), DELETE
app/api/[resource]/[id]/[action]/route.ts  # Custom actions
```

### Authentication Pattern

Every protected API route follows this pattern:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin-only check
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    // ... business logic
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### Rate Limiting

**File:** `lib/rate-limit.ts`

Pre-configured limiters:

| Limiter | Limit | Window |
|---------|-------|--------|
| `authLimiter` | 10 requests | 15 minutes |
| `registerLimiter` | 5 requests | 1 hour |
| `passwordResetLimiter` | 5 requests | 15 minutes |
| `uploadLimiter` | 50 requests | 1 hour |
| `paymentLimiter` | 20 requests | 1 hour |
| `orderLimiter` | 30 requests | 1 hour |
| `generalLimiter` | 60 requests | 1 minute |

Usage:

```typescript
import { orderLimiter } from "@/lib/rate-limit";

const rl = await orderLimiter(request);
if (!rl.success) return rl.response;
```

### Input Validation

**File:** `lib/sanitize.ts`

```typescript
import { sanitizeString, sanitizeObject, isValidEmail, clampLength } from "@/lib/sanitize";

const clean = sanitizeString(userInput);           // Strip HTML
const cleanObj = sanitizeObject({ name, email });  // Sanitize all string fields
const valid = isValidEmail(email);                  // Email validation
const safe = clampLength(text, 500);                // Truncate to max length
```

### API Endpoints Overview

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/auth/*` | GET/POST | NextAuth endpoints |
| `/api/products` | GET/POST | Product CRUD |
| `/api/services` | GET/POST | Service CRUD |
| `/api/orders` | GET/POST | Order management |
| `/api/orders/[id]/cancel` | POST | Customer order cancellation |
| `/api/bookings` | GET/POST | Appointment booking |
| `/api/bookings/[id]` | PATCH/POST | Reschedule/Cancel |
| `/api/payments/initiate` | POST | Start payment (Stripe/Paystack) |
| `/api/payments/verify` | POST | Verify payment + confirm order |
| `/api/webhook/stripe` | POST | Stripe webhook handler |
| `/api/webhook/paystack` | POST | Paystack webhook handler |
| `/api/reviews` | GET/POST | Review system |
| `/api/reviews/eligibility` | GET | Check purchase eligibility |
| `/api/upload` | POST/DELETE | Cloudinary image upload |
| `/api/notifications` | GET/PATCH | Notification management |
| `/api/newsletter` | POST | Newsletter subscription |
| `/api/blog` | GET/POST | Blog CRUD |
| `/api/admin/*` | Various | Admin-only endpoints |
| `/api/cron/*` | GET | Cron jobs (reminder, expiry) |

---

## 8. Payment System

### Overview

The system supports two payment providers:
- **Stripe** — Card payments (PaymentIntent flow)
- **Paystack** — Bank transfers (redirect flow)
- **Cash on Delivery** — Manual confirmation

### Payment Initiation Flow

**File:** `app/api/payments/initiate/route.ts`

```
1. Client selects payment method (card/bank_transfer/pay_on_delivery)
2. POST /api/payments/initiate with order details
3. API creates order (if not exists) or resumes pending order
4. Branch on payment method:
   - STRIPE: Create PaymentIntent → return clientSecret
   - PAYSTACK: Initialize transaction → return checkoutUrl
   - CASH: Create payment record with PENDING status
5. Client proceeds to payment
```

### Payment Confirmation Flow

**File:** `app/api/payments/verify/route.ts`

```
1. Payment verified with provider (Paystack verify / Stripe confirm)
2. Atomic transaction:
   a. Update payment status to PAID
   b. Update order status to PROCESSING
   c. Convert RESERVATION stock movements to SALE
   d. Consume coupon (if any)
   e. Consume loyalty points (if any)
   f. Calculate and award loyalty points
   g. Create in-app notification
3. Send confirmation email
4. Return receipt data
```

### Webhook Handlers

**Stripe:** `app/api/webhook/stripe/route.ts`
**Paystack:** `app/api/webhook/paystack/route.ts`

Both follow the same atomic transaction pattern as the verify endpoint.

### Key Files

| File | Purpose |
|------|---------|
| `lib/stripe.ts` | Stripe SDK wrapper (lazy singleton) |
| `lib/paystack.ts` | Paystack API calls |
| `app/api/payments/initiate/route.ts` | Payment initiation |
| `app/api/payments/verify/route.ts` | Payment verification |
| `app/api/webhook/stripe/route.ts` | Stripe webhook |
| `app/api/webhook/paystack/route.ts` | Paystack webhook |

---

## 9. Notification System

### Architecture

Event-driven system supporting 3 channels:
- **EMAIL** — Brevo API
- **PUSH** — Web Push (VAPID)
- **IN_APP** — Database notifications

### Event Types

**File:** `lib/notifications/types.ts`

```typescript
type NotificationEventType =
  | "appointment.created" | "appointment.confirmed" | "appointment.completed"
  | "appointment.cancelled" | "appointment.rescheduled" | "appointment.no_show"
  | "appointment.reminder.24h" | "appointment.reminder.1h"
  | "order.placed" | "order.processing" | "order.shipped"
  | "order.delivered" | "order.cancelled"
  | "payment.received" | "review.created" | "account.created"
  | "inventory.low_stock";
```

### Usage

```typescript
import { notify, notifyAdmins } from "@/lib/notifications";

// Notify a specific user
await notify({
  userId: user.id,
  event: "order.shipped",
  data: {
    customerName: "Jane",
    orderNumber: "MB-12345",
    trackingNumber: "TRK-67890",
  },
});

// Notify all admins
await notifyAdmins("order.placed", {
  customerName: "Jane",
  orderNumber: "MB-12345",
  total: 15000,
});
```

### Channel Configuration

Each event has a template per channel:

```typescript
// lib/notifications/templates.ts
"order.shipped": {
  channels: ["IN_APP", "EMAIL", "PUSH"],
  template: {
    inApp: (d) => ({ title: "Order Shipped", message: `...` }),
    email: (d) => ({ subject: "Order Shipped", html: "..." }),
    push: (d) => ({ title: "Order Shipped", body: "..." }),
  },
}
```

### Email Templates

**File:** `lib/resend.ts`

All emails use Brevo API. Templates: `orderPlacedEmail`, `orderShippedEmail`, `orderDeliveredEmail`, `orderCancelledEmail`, `appointmentPlacedEmail`, `appointmentConfirmedEmail`, `appointmentCancelledEmail`, `appointmentReminderEmail`, `lowStockAlertEmail`.

---

## 10. Inventory Management

### Stock Reservation System

**File:** `lib/inventory.ts`

When an order is placed:
1. Products are locked with `SELECT ... FOR UPDATE`
2. Stock is decremented
3. A `RESERVATION` stock movement is created
4. Order has a 30-minute TTL (`expiresAt`)

### Stock Movement Types

| Type | When | Quantity |
|------|------|----------|
| `RESERVATION` | Order placed | Negative (stock reserved) |
| `RELEASE` | Reservation expires | Positive (stock restored) |
| `SALE` | Payment confirmed | (Conversion from RESERVATION) |
| `RETURN` | Order cancelled (post-payment) | Positive (stock restored) |
| `ADJUSTMENT` | Manual adjustment | ±varies |
| `RESTOCK` | New inventory | Positive |
| `DAMAGE` | Damaged goods | Negative |
| `TRANSFER` | Between locations | ±varies |

### Low Stock Alerts

```typescript
import { checkAndNotifyLowStock } from "@/lib/inventory";

// After stock change
const product = await prisma.product.findUnique({ where: { id } });
if (product.stock <= product.lowStock) {
  await checkAndNotifyLowStock(product.id, product.stock);
}
```

### Order Expiry

**File:** `app/api/cron/expire-orders/route.ts`

Cron job runs every 5 minutes. Finds PENDING orders past their `expiresAt` and:
1. Restores stock with `RELEASE` movements
2. Marks order as `CANCELLED`
3. Voids pending payments

---

## 11. State Management

### Zustand Stores

**File:** `store/index.ts`

Three stores, all client-side:

| Store | Persistence | Purpose |
|-------|-------------|---------|
| `useCartStore` | localStorage (`salon-cart`) | Shopping cart items, coupon |
| `useWishlistStore` | localStorage (`salon-wishlist`) | Wishlist product IDs |
| `useUIStore` | None | Mobile menu, cart drawer state |

```typescript
import { useCartStore } from "@/store";

// Add item
useCartStore.getState().addItem({ productId, name, price, quantity, maxStock });

// Get total
const total = useCartStore.getState().getTotal();

// Apply coupon
useCartStore.getState().applyCoupon({ code, type: "PERCENTAGE", value: 10, discountAmount: 500, description: "..." });
```

### Hydration Guard Pattern

Zustand-persisted stores cause hydration mismatches. Always guard:

```typescript
"use client";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store";

export function CartBadge() {
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="h-5 w-5 bg-cream rounded-full" />;

  return <span>{itemCount}</span>;
}
```

### Tanstack React Query

**File:** `hooks/queries.ts`

All server state is managed through React Query hooks:

```typescript
import { useDashboardOrders, useCancelOrder } from "@/hooks/queries";

// Fetch with auto-polling
const { data, isLoading } = useDashboardOrders(60_000); // Poll every 60s

// Mutation with cache invalidation
const cancelOrder = useCancelOrder();
await cancelOrder.mutateAsync(orderId);
```

---

## 12. UI & Design System

### Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `text-charcoal` | Dark gray | Primary text |
| `text-gold` | Gold (#c9a96e) | Accent, CTAs |
| `bg-cream` | Off-white (#faf9f6) | Backgrounds |
| `text-muted-foreground` | Gray | Secondary text |
| `font-heading` | Playfair Display | Headings |
| `font-sans` | Inter | Body text |
| `font-serif` | Cormorant Garamond | Decorative |

### Layout Structure

```
RootLayout
├── Providers (SessionProvider + QueryClientProvider)
│   └── (main)/LayoutShell
│       ├── Navbar
│       ├── main (content)
│       ├── Footer
│       ├── MobileBottomNav
│       ├── StickyBookingButton
│       └── CartDrawer
```

### Component Conventions

- All Shadcn components use `base-nova` style (Base UI, not Radix)
- `SheetTrigger` uses `render` prop, NOT `asChild`
- Always guard `<Image src={value}>` with `value &&`
- Use `cn()` utility for conditional classes: `cn("base", condition && "modifier")`

### Mobile-First Responsive

- Base styles: Mobile
- `sm:` — Tablet (640px+)
- `md:` — Small desktop (768px+)
- `lg:` — Desktop (1024px+)
- Touch targets: minimum 44x44px (`min-h-[44px] min-w-[44px]`)

---

## 13. Testing

### Unit Tests (Vitest)

**Config:** `vitest.config.ts`

```bash
npm test              # Single run
npm run test:watch    # Watch mode
```

**133 tests** across 10 files:

| File | Tests | Coverage |
|------|-------|----------|
| `helpers.test.ts` | 34 | Utility functions |
| `sanitize.test.ts` | 27 | Input sanitization |
| `orders.test.ts` | 12 | Order creation |
| `expire-orders.test.ts` | 12 | Cron job expiry |
| `audit.test.ts` | 11 | Audit logging |
| `payments-verify.test.ts` | 9 | Payment verification |
| `coupons.test.ts` | 9 | Coupon system |
| `paystack.test.ts` | 6 | Paystack integration |
| `inventory.test.ts` | 5 | Inventory management |
| `rate-limit.test.ts` | 8 | Rate limiting |

### E2E Tests (Playwright)

**Config:** `playwright.config.ts`

```bash
npm run test:e2e      # Run all tests
npm run test:e2e:ui   # Open Playwright UI
```

**5 test files** in `e2e/`:

| File | Tests |
|------|-------|
| `homepage.spec.ts` | Homepage load, navigation links |
| `shop.spec.ts` | Product listing, search, add to cart |
| `auth.spec.ts` | Signin/signup pages, form validation |
| `navigation.spec.ts` | Booking, blog, public policy pages |
| `seo.spec.ts` | Sitemap, robots.txt, JSON-LD, security headers |

---

## 14. Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Set all environment variables from `.env.example`
4. Deploy

Vercel config: `vercel.json`

### Docker (Standalone)

```bash
npm run build
# Output: .next/standalone/
docker build -t salon .
docker run -p 3000:3000 salon
```

### CI/CD

**File:** `.github/workflows/ci.yml`

Runs on push/PR to `main`:
1. ESLint
2. TypeScript type check
3. Unit tests
4. Build verification

### Cron Jobs

Configured in `vercel.json`:
- `/api/cron/appointment-reminders` — Daily at 8:00 AM
- `/api/cron/expire-orders` — Every 5 minutes

Protected by `CRON_SECRET` header.

---

## 15. Coding Conventions

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Pages | `page.tsx` | `app/shop/page.tsx` |
| Layouts | `layout.tsx` | `app/(main)/layout.tsx` |
| API Routes | `route.ts` | `app/api/orders/route.ts` |
| Components | `kebab-case.tsx` | `components/cart/cart-drawer.tsx` |
| Utilities | `kebab-case.ts` | `lib/rate-limit.ts` |
| Hooks | `use-*.ts` or `queries.ts` | `hooks/queries.ts` |
| Tests | `*.test.ts` | `tests/orders.test.ts` |

### TypeScript

- Strict mode enabled
- Use `interface` for object shapes
- Use `type` for unions/intersections
- Export interfaces from `hooks/queries.ts` for shared types
- Use `Promise<{ id: string }>` for params in App Router

### React

- Server components by default (no `"use client"`)
- Client components only when: state, effects, browser APIs, event handlers
- Always add hydration guard for Zustand-persisted stores
- Use `use()` from React for unwrapping promises in client components

### API Routes

- Always validate with `auth()` first
- Use Zod for request body validation
- Return consistent error format: `{ error: string }`
- Use `NextResponse.json(data, { status })` for responses
- Log errors with `console.error()` (structured via `lib/logger.ts`)

### Styling

- Tailwind CSS utility classes
- Use `cn()` for conditional classes
- Follow mobile-first responsive design
- Min touch target: 44x44px
- Use design tokens (text-charcoal, text-gold, bg-cream)

---

## 16. Common Patterns

### Creating a New API Route

```typescript
// app/api/my-resource/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ name: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const resource = await prisma.myResource.create({ data: result.data });
    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error("Create resource error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### Creating a New Dashboard Page

```typescript
// app/dashboard/my-page/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";

function fetchMyData() {
  return fetch("/api/my-data").then((r) => r.json());
}

export default function MyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-data"],
    queryFn: fetchMyData,
  });

  if (isLoading) return <div>Loading...</div>;

  return <div>{/* content */}</div>;
}
```

### Creating a New Admin Page

Follow the pattern in `app/admin/orders/page.tsx`:
1. State for search, filters, pagination
2. Tanstack Query hook for data fetching
3. Responsive layout (mobile cards + desktop table)
4. Detail modal for individual items
5. Success/error feedback with auto-dismiss

### Adding a New Notification Event

1. Add event type to `lib/notifications/types.ts`
2. Add templates to `lib/notifications/templates.ts`
3. Add admin in-app template to `lib/notifications/index.ts`
4. Call `notify()` or `notifyAdmins()` from business logic

### Adding a New Database Model

1. Add model to `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_model_name`
3. Run `npx prisma generate`
4. Add API routes as needed
5. Add hooks to `hooks/queries.ts`
6. Create admin page in `app/admin/`

---

*Last updated: July 2026*
