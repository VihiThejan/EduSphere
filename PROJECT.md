# EduSphere — Project Documentation

> A full-stack university e-learning and peer-to-peer marketplace platform built as a TypeScript monorepo.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Monorepo Structure](#monorepo-structure)
4. [Technology Stack](#technology-stack)
5. [Backend — Server](#backend--server)
6. [Frontend — Client](#frontend--client)
7. [Shared Package](#shared-package)
8. [Database Design](#database-design)
9. [Authentication & Authorization](#authentication--authorization)
10. [Payment Integration](#payment-integration)
11. [Media & File Management](#media--file-management)
12. [Email Notifications](#email-notifications)
13. [Live Sessions](#live-sessions)
14. [Role-Based Navigation](#role-based-navigation)
15. [Environment Configuration](#environment-configuration)
16. [Running the Project](#running-the-project)
17. [API Structure](#api-structure)

---

## Project Overview

EduSphere is a multi-role educational marketplace platform designed for university communities. It combines two core products:

- **EduSphere Learning** — A course platform where tutors publish video-based courses, students enroll (free or paid), track progress, earn certificates, and attend live tutoring sessions.
- **EduSphere Marketplace** — A peer-to-peer marketplace where students and sellers list second-hand textbooks, electronics, and study materials for other students to purchase.

Both products share a single authentication system, user base, and payment infrastructure under one monorepo.

---

## Architecture Overview

```
EduSphere/
├── packages/
│   ├── client/         # React 18 SPA (Vite)
│   ├── server/         # Node.js + Express REST API
│   └── shared/         # Shared TypeScript types, Zod validators, constants
├── package.json        # npm workspaces root
└── tsconfig.json       # Root TypeScript config (composite)
```

The project is structured as an **npm workspaces monorepo**. All three packages are developed together, sharing TypeScript types and validation schemas through the `@edusphere/shared` internal package. This ensures the client and server always agree on data shapes without duplication.

```
Browser (React SPA)
        │
        │ HTTPS / JSON  (axios + React Query)
        ▼
Express REST API  ──── MongoDB  (Mongoose)
        │
        ├─── Stripe        (payments)
        ├─── Cloudinary    (video/image storage)
        ├─── Daily.co      (live sessions)
        └─── Nodemailer    (transactional email)
```

---

## Monorepo Structure

```
packages/
├── client/
│   ├── src/
│   │   ├── App.tsx                   # Root router and global providers
│   │   ├── main.tsx                  # React entry point
│   │   ├── config/                   # Client environment config
│   │   ├── store/                    # Zustand auth store
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── services/api/             # Axios API client modules
│   │   ├── components/               # Reusable UI components
│   │   └── pages/                    # Route-level page components
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.cjs
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── bootstrap.ts              # Entry point (sets TLS before all imports)
│   │   ├── server.ts                 # HTTP server + MongoDB connection
│   │   ├── app.ts                    # Express app setup, middleware, routes
│   │   ├── config/                   # Server config (env vars, database)
│   │   ├── modules/                  # Feature modules (15 total)
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── courses/
│   │   │   ├── documents/
│   │   │   ├── enrollments/
│   │   │   ├── live-sessions/
│   │   │   ├── marketplace/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   ├── reviews/
│   │   │   ├── seller-profile/
│   │   │   ├── users/
│   │   │   ├── vendor-billing/
│   │   │   └── videos/
│   │   ├── shared/
│   │   │   ├── middleware/           # auth, validate, errorHandler
│   │   │   └── utils/                # logger, email.service, errors
│   │   └── scripts/
│   │       └── seed.ts               # Database seed script
│   └── package.json
│
└── shared/
    ├── src/
    │   ├── types/                    # TypeScript interfaces
    │   ├── validators/               # Zod schemas
    │   └── constants/                # Shared enums and constants
    └── package.json
```

Each server module follows a consistent **MVC pattern**:
```
modules/<feature>/
├── <feature>.model.ts       # Mongoose schema & model
├── <feature>.service.ts     # Business logic
├── <feature>.controller.ts  # HTTP request handlers
└── <feature>.routes.ts      # Express route definitions
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI framework |
| TypeScript | 5.3.3 | Static typing |
| Vite | 5.1.0 | Build tool and dev server |
| React Router | 6.22.0 | Client-side routing |
| TanStack Query | 5.20.0 | Server state, caching, background refetch |
| Zustand | 4.5.0 | Global auth state management |
| Axios | 1.6.7 | HTTP client |
| React Hook Form | 7.50.0 | Form state management |
| Zod | 3.22.4 | Schema validation (shared with server) |
| TailwindCSS | 3.4.1 | Utility-first CSS styling |
| Stripe.js / React Stripe.js | 8.x / 5.x | Payment UI (PaymentElement) |
| Lucide React | 0.323.0 | Icon library |
| React Player | 2.14.1 | Video playback |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18.0.0 | Runtime |
| TypeScript | 5.3.3 | Static typing |
| Express | 4.18.2 | HTTP framework |
| Mongoose | 8.1.1 | MongoDB ODM |
| MongoDB | — | Primary database |
| JSON Web Tokens | 9.0.2 | Access + refresh token auth |
| bcryptjs | 2.4.3 | Password hashing |
| Stripe Node SDK | 20.4.1 | Payment processing and webhooks |
| Cloudinary Node SDK | 2.9.0 | Video and image storage |
| Multer | 1.4.5 | File upload middleware |
| Nodemailer | 8.0.3 | Transactional email |
| Zod | 3.22.4 | Request body validation |
| Helmet | — | HTTP security headers |
| express-rate-limit | — | API rate limiting |
| Winston | — | Structured logging |
| Jest + Supertest | — | Testing |

### Infrastructure & Third-Party Services

| Service | Purpose |
|---|---|
| MongoDB Atlas / Local | Database hosting |
| Stripe | Course payments, marketplace orders, vendor subscriptions |
| Cloudinary | Video and image CDN storage |
| Daily.co | Real-time live session streaming |
| Nodemailer (Ethereal) | Transactional email in development |
| SMTP | Transactional email in production |

---

## Backend — Server

### Entry Point Flow

The server has a deliberate two-step bootstrap to solve a Windows + Node 20 + MongoDB Atlas TLS compatibility issue:

```
bootstrap.ts
  └── Sets NODE_OPTIONS=--tls-min-v1.2 globally
        └── server.ts
              ├── Imports app.ts (Express setup)
              ├── Connects to MongoDB
              ├── Starts HTTP server on PORT
              └── Handles SIGTERM / SIGINT for graceful shutdown
```

### Express App (`app.ts`)

```
Security layer:     Helmet (HTTP headers), CORS (origin whitelist)
Rate limiting:      100 req / 15 min per IP  (disabled in development)
Logging:            Morgan (HTTP request logs)
Body parsing:       JSON, URL-encoded, raw body for Stripe webhooks
Cookie parsing:     cookie-parser (refresh token cookie)

Routes mounted at /api/v1:
  /auth               Authentication (login, register, refresh, reset)
  /users              User management
  /courses            Course catalog, lessons, analytics, certificates
  /enrollments        Enroll, progress tracking, checkout, streak
  /marketplace        Marketplace listings (CRUD)
  /cart               Shopping cart
  /orders             Purchase orders
  /payments           Stripe webhooks
  /reviews            Course and item reviews
  /documents          Downloadable course materials
  /videos             Video uploads and management
  /live-sessions      Daily.co live sessions
  /seller-profile     Seller profile management
  /vendor-billing     Seller subscription plans
  /admin              Admin operations

Special route:
  POST /api/v1/payments/webhook   Stripe webhook (raw body, signature verified)
  GET  /health                    Health check
```

### Server Modules Detail

| Module | Key Responsibilities |
|---|---|
| **auth** | JWT login, register, refresh tokens (HTTP-only cookie), forgot/reset password, email verification |
| **users** | Profile management, avatar upload, role assignments, tutor request flow |
| **courses** | Course CRUD, lesson management, video uploads, course analytics, completion certificates |
| **enrollments** | Enroll students, track lesson progress, calculate completion %, daily study streak, Stripe checkout for paid courses |
| **marketplace** | Listing CRUD, search + filter, category/condition/campus filters, view count tracking, seller info |
| **cart** | Add/remove/update items, calculate totals |
| **orders** | Create orders from cart, fulfillment status workflow, buyer/seller views |
| **payments** | Stripe webhook handler, PaymentIntent verification, order activation |
| **vendor-billing** | Seller subscription tiers (Starter/Pro/Elite), Stripe Subscription integration, listing quotas |
| **seller-profile** | Seller shop info, bio, verification status, public profile |
| **live-sessions** | Create/join live sessions via Daily.co, Q&A management |
| **reviews** | Marketplace item reviews (rating + comment), course reviews |
| **documents** | Upload and serve downloadable PDFs for courses |
| **videos** | Cloudinary video upload, metadata storage |
| **admin** | User list/edit/roles, seller oversight, platform statistics, tutor request approvals |

### Shared Server Utilities

**Middleware:**
- `auth.ts` — Verifies JWT bearer token; attaches `req.user`; `authorize([roles])` checks role membership
- `validate.ts` — Zod middleware: validates `req.body` against a schema, returns 400 on failure
- `errorHandler.ts` — Global error handler: maps custom error classes to HTTP status codes

**Custom Error Classes (`utils/errors.ts`):**
```
AppError           (base)
├── ValidationError     → 400
├── AuthenticationError → 401
├── AuthorizationError  → 403
├── NotFoundError       → 404
└── ConflictError       → 409
```

**Logger (`utils/logger.ts`):** Winston with timestamps, colored console output in development.

**Email Service (`utils/email.service.ts`):** Nodemailer wrapper. Uses Ethereal (virtual SMTP) in development for zero-config email testing. Supports welcome emails, password reset, listing published, and order confirmation templates.

---

## Frontend — Client

### Application Bootstrap (`main.tsx` → `App.tsx`)

```
main.tsx
  └── <React.StrictMode>
        └── <App />
              ├── QueryClientProvider   (TanStack Query)
              ├── Elements              (Stripe — only when key present)
              └── BrowserRouter
                    └── Routes
```

On app mount, `App.tsx` calls `initAuth()` once. This silently tries to restore the user session from the HTTP-only refresh cookie, so users stay logged in across page reloads without re-entering credentials.

### Page Structure

```
pages/
├── HomePage.tsx             Public landing page
├── DashboardPage.tsx        Student dashboard (enrollments, stats, streak)
├── MyLearningPage.tsx       All enrollments with status filter
├── ProfilePage.tsx          Public/own profile view
│
├── auth/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   └── ResetPasswordPage.tsx
│
├── courses/
│   ├── CoursesPage.tsx      Catalog with search + filter
│   └── CourseDetailPage.tsx Lessons, video player, enroll/checkout
│
├── marketplace/
│   ├── MarketplacePage.tsx        Listing grid with filters
│   └── MarketplaceDetailPage.tsx  Listing detail, reviews, seller panel
│
├── checkout/
│   ├── CheckoutPage.tsx        Cart → shipping → payment
│   └── CheckoutSuccessPage.tsx Order confirmation
│
├── tutor/
│   ├── TutorDashboardPage.tsx    Course overview, hosted sessions
│   ├── TutorUploadPage.tsx       Course and lesson creation
│   └── TutorAnalyticsPage.tsx    Enrollment and revenue charts
│
├── seller/
│   ├── SellerDashboardPage.tsx   Sales overview
│   ├── SellerOnboardingPage.tsx  First-time seller setup
│   ├── SellerBillingPage.tsx     Subscription plan management
│   ├── SellerListingsPage.tsx    Manage active listings
│   ├── SellerCreateListingPage.tsx
│   ├── SellerEditListingPage.tsx
│   ├── SellerOrdersPage.tsx      Fulfillment status management
│   └── SellerProfilePage.tsx     Shop profile editor
│
├── admin/
│   ├── AdminDashboardPage.tsx    Platform KPIs
│   ├── AdminUsersPage.tsx        User list + role management
│   ├── AdminSellersPage.tsx      Seller approvals
│   ├── AdminListingsPage.tsx     All marketplace listings
│   ├── AdminOrdersPage.tsx       All orders
│   └── AdminTutorRequestsPage.tsx Approve/reject tutor applications
│
├── live/
│   └── LiveSessionPage.tsx      Browse and join / create live sessions
│
└── orders/
    └── OrderDetailPage.tsx      Order receipt + tracking
```

### State Management

**Zustand Auth Store (`store/authStore.ts`):**
- Persists `user` object to `localStorage` (not tokens)
- Access token lives only in memory (never persisted)
- Refresh token lives in HTTP-only cookie (set by server)
- `initAuth()` restores session on app load via refresh cookie
- `login()` stores token in memory + user in Zustand
- `logout()` calls server logout, clears memory and Zustand state

**TanStack Query:** All server data is fetched through `useQuery` / `useMutation` hooks. Query keys are scoped per feature. Cache is invalidated explicitly after mutations (e.g., invalidate `['cart']` after adding an item).

### API Client (`services/api/client.ts`)

A singleton Axios instance with:
- Base URL from `VITE_API_URL`
- Request interceptor: attaches `Authorization: Bearer <token>` header
- Response interceptor: on 401, attempts silent token refresh (single-flight — concurrent 401s share one refresh call); on success retries the original request; on failure redirects to `/login`
- All methods unwrap `response.data.data` from the standard `ApiResponse` envelope

### Custom Hooks

| Hook | Purpose |
|---|---|
| `useDebounce(value, delay)` | Delays a value update by `delay` ms — used on search inputs and price sliders to prevent excessive API calls |
| `useSidebarItems()` | Returns role-aware sidebar navigation items based on `user.roles` |
| `useAdminSidebarItems()` | Admin-specific sidebar items |

---

## Shared Package

The `@edusphere/shared` package is the single source of truth for:

### Types (`src/types/`)
TypeScript interfaces used on both client and server:

| File | Exports |
|---|---|
| `user.types.ts` | `User`, `UserProfile`, `UserRole` |
| `course.types.ts` | `Course`, `CourseStatus`, pricing |
| `lesson.types.ts` | `Lesson`, `LessonType` |
| `enrollment.types.ts` | `Enrollment`, `EnrollmentStatus` |
| `marketplace.types.ts` | `IMarketplaceItem`, `IMarketplaceItemInput` |
| `order.types.ts` | `IOrder`, `IOrderItem`, `IShippingAddress` |
| `api.types.ts` | `ApiResponse<T>` envelope |

### Validators (`src/validators/`)
Zod schemas used for request validation on the server and form validation on the client:

- `user.validator.ts` — `userLoginSchema`, `userRegisterSchema`
- `course.validator.ts` — Course creation/update rules
- `marketplace.validator.ts` — `marketplaceItemCreateSchema`, `marketplaceItemUpdateSchema`
- `order.validator.ts` — `shippingAddressSchema`, `orderFulfillmentUpdateSchema`

### Constants (`src/constants/`)
Enums and lookup objects shared between packages:

| File | Exports |
|---|---|
| `roles.ts` | `USER_ROLES` — `admin`, `tutor`, `seller`, `student` |
| `order.ts` | `ORDER_FULFILLMENT_STATUS`, `ORDER_PAYMENT_STATUS`, `PAYMENT_METHODS` |
| `marketplace.ts` | `MARKETPLACE_ITEM_STATUS`, `MARKETPLACE_LISTING_PUBLISH_STATUS`, categories, conditions |
| `status.ts` | `COURSE_STATUS`, `ENROLLMENT_STATUS` |

---

## Database Design

MongoDB is used with Mongoose ODM. All models are defined in `packages/server/src/modules/<module>/<model>.model.ts`.

### Collections (18 total)

| Collection | Purpose | Key Fields |
|---|---|---|
| **users** | User accounts | email, passwordHash, roles[], profile, isMarketplaceSeller |
| **courses** | Course catalog | title, instructorId, pricing, status, stats |
| **lessons** | Course content | courseId, title, videoUrl, duration, order |
| **enrollments** | Student enrollments | userId, courseId, status, progressPercentage, lastAccessedAt |
| **lessonprogresses** | Per-lesson tracking | userId, courseId, lessonId, watchPercentage, completed |
| **marketplaceitems** | Marketplace listings | title, price, category, condition, campus, sellerId, seller{}, images[], stats, publishStatus |
| **carts** | Shopping carts | userId, items[{itemId, title, price, quantity}] |
| **orders** | Purchase orders | orderNumber, buyerId, sellerId, items[], total, paymentStatus, fulfillmentStatus |
| **reviews** | Marketplace reviews | itemId, buyerId, rating, comment |
| **coursereviews** | Course reviews | courseId, userId, rating, comment |
| **sellerprofiles** | Seller shop info | userId, shopName, description, verificationStatus |
| **vendorplans** | Subscription plan definitions | tier, listingQuota, intervalDays, priceAmount |
| **vendorsubscriptions** | Active seller subscriptions | sellerId, planId, status, currentPeriodEnd, usedListings |
| **vendorwebhookevents** | Stripe event deduplication | stripeEventId, processed |
| **livesessions** | Scheduled live classes | tutorId, title, dailyRoomUrl, startTime, status |
| **livequestions** | Live session Q&A | sessionId, userId, question, isAnswered |
| **documents** | Course attachments | courseId, lessonId, filename, url, size |
| **videos** | Video metadata | courseId, lessonId, cloudinaryPublicId, duration, url |

### Relationships

```
User ──< Enrollment >── Course
User ──< LessonProgress >── Lesson
User (seller) ──< MarketplaceItem
User (buyer) ──< Order >── MarketplaceItem
User (seller) ──< SellerProfile
User (seller) ──< VendorSubscription >── VendorPlan
Course ──< Lesson ──< Video
Course ──< Document
Course ──< CourseReview >── User
MarketplaceItem ──< Review >── User
User (tutor) ──< LiveSession ──< LiveQuestion
```

---

## Authentication & Authorization

### Token Strategy

EduSphere uses a **dual-token** strategy:

| Token | Storage | Lifetime | Purpose |
|---|---|---|---|
| Access Token | Memory (Axios instance) | 15 minutes | Authenticate API requests |
| Refresh Token | HTTP-only cookie | 7 days | Obtain new access tokens silently |

- Access tokens are **never** stored in `localStorage` or `sessionStorage` — they live only in the `ApiClient` class instance, preventing XSS token theft.
- Refresh tokens are in HTTP-only cookies, preventing JavaScript access and protecting against XSS.
- On 401 response, the client automatically attempts a silent refresh (single-flight to prevent duplicate requests) and retries the original call.

### Role System

Four roles are defined in `USER_ROLES`:

| Role | Access |
|---|---|
| `student` | Enroll in courses, purchase marketplace items, leave reviews |
| `tutor` | All student permissions + upload courses, manage live sessions, view analytics |
| `seller` | All student permissions + list marketplace items, manage orders, manage seller subscription |
| `admin` | Full platform access including all above + user management, seller approvals, tutor request review |

Users can hold multiple roles simultaneously (e.g., `admin` + `tutor`). Role checks use `Array.includes()`.

### Frontend Route Guards

```
PublicRoute          Redirects authenticated users to their role dashboard
ProtectedRoute       Blocks unauthenticated access, shows loader during session restore
AdminRouteGate       Blocks non-admin users with a redirect to /dashboard
SellerRouteGate      Blocks non-seller users with optional profile requirement
```

**Login redirect priority:**
1. `admin` → `/admin/dashboard`
2. `tutor` → `/tutor/dashboard`
3. `seller` → `/seller/dashboard`
4. `student` → `/dashboard`

---

## Payment Integration

EduSphere has two distinct Stripe integrations:

### 1. Course Payments (Stripe PaymentIntents)

Used when a student enrols in a paid course:

```
Student clicks Enroll
        │
POST /enrollments/courses/:id/checkout
        │ Creates PaymentIntent via stripe.paymentIntents.create()
        │ Returns clientSecret + paymentIntentId
        ▼
Client renders <Elements> + <PaymentElement> (Stripe hosted UI)
        │
stripe.confirmPayment()
        │
        ├── Stripe redirects to return_url  (production)
        │         └── CheckoutSuccessPage reads ?payment_intent= and verifies
        │
        └── redirect: 'if_required'  (development / card payments)
                  └── Client calls POST /enrollments/courses/:id/verify-payment
                            └── Server checks PaymentIntent status, activates enrollment
```

The `verify-payment` endpoint exists because **Stripe webhooks don't fire automatically in local development**. The client manually calls it after `confirmPayment` succeeds to activate the enrollment without needing a webhook forwarder.

The `<PaymentElement>` iframe **must remain mounted** for the entire `confirmPayment` call — unmounting it mid-call throws `IntegrationError`. All loading state changes use CSS `display: none` rather than conditional rendering to keep the iframe alive.

### 2. Vendor Subscriptions (Stripe Subscriptions)

Sellers must subscribe to a plan to publish marketplace listings. Three tiers exist:

| Tier | Listing Quota | Interval |
|---|---|---|
| Starter | 5 listings | 30 days |
| Pro | 20 listings | 30 days |
| Elite | 100 listings | 30 days |

```
Seller selects plan
        │
POST /vendor-billing/subscribe
        │ Creates Stripe Checkout Session
        ▼
Stripe Checkout (hosted page)
        │
        └── Stripe fires webhook → POST /api/v1/payments/webhook
                  └── vendor-billing service activates subscription
                            └── Seller can now publish up to quota
```

Stripe webhook events are deduplicated via `VendorWebhookEvent` collection to prevent double-processing.

---

## Media & File Management

### Videos (Cloudinary)

Course lesson videos are uploaded through the platform and stored on Cloudinary:

```
Tutor uploads video (multipart/form-data)
        │
Multer (memory storage) buffers file
        │
cloudinary.uploader.upload_stream()
        │
Cloudinary returns publicId + secure_url
        │
Video document saved to MongoDB
        │
Lesson updated with videoUrl
```

- Max upload size: 500 MB (configurable)
- Cloudinary folder: `edusphere/videos/`
- Student video playback uses `react-player` pointed at Cloudinary URLs

### Documents (Course Materials)

PDF attachments for lessons follow the same Multer + Cloudinary pattern but are stored in `edusphere/documents/`. The `documents` module serves download links to enrolled students.

### Marketplace Images

Seller listing photos are uploaded via Cloudinary during listing creation/editing. Multiple images are supported, sorted by `order` field.

---

## Email Notifications

The email service (`utils/email.service.ts`) is built on Nodemailer. It uses **Ethereal** in development (a free virtual SMTP service — no real emails are sent; preview URLs are logged to the console) and a real SMTP provider in production.

Transactional emails sent by the platform:

| Trigger | Template |
|---|---|
| User registration | Welcome email with account details |
| Forgot password | Password reset link (1-hour expiry) |
| Email verification | Verification link |
| Marketplace listing published | Confirmation for seller |
| Order placed | Receipt for buyer |

---

## Live Sessions

Live tutoring sessions are powered by **Daily.co** (WebRTC). The server creates Daily rooms via the Daily REST API; clients join with a generated meeting token.

```
Tutor creates session
        │
POST /live-sessions/
        │ daily.rooms.create({ privacy: 'private' })
        │ Stores room name + URL in LiveSession document
        ▼
Students list sessions → GET /live-sessions/
        │
Student joins → GET /live-sessions/:id/token
        │ daily.meetingTokens.create({ roomName, userId })
        ▼
Client joins Daily room with token (iframe or Daily Prebuilt)
```

During sessions, students can submit questions via the `live-questions` sub-module. Tutors see and answer them in real time.

---

## Role-Based Navigation

The sidebar (`useSidebarItems` hook) dynamically builds navigation based on the authenticated user's roles. Items are only included when the relevant role is present:

```
All authenticated users:
  Dashboard, Courses, My Learning, Marketplace, Live Sessions

+ tutor role:
  Tutor Hub (/tutor/dashboard)
  Upload Course (/tutor/upload)
  Analytics → /tutor/analytics

+ seller role:
  Seller Dashboard (/seller/dashboard)
  My Listings (/seller/listings)
  Seller Orders (/seller/orders)
  Seller Billing (/seller/billing)
  Shop Profile (/seller/profile)

+ admin role:
  Tutor Requests (/admin/tutor-requests)
  (Admin dashboard uses its own sidebar via useAdminSidebarItems)
```

---

## Environment Configuration

### Server (`packages/server/.env`)

```env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/edusphere

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Client URL (for CORS + email links)
CLIENT_URL=http://localhost:5173

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe vendor plan price IDs
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ELITE=price_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Daily.co
DAILY_API_KEY=...

# Email (Ethereal auto-created in dev if omitted)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=noreply@edusphere.com
```

### Client (`packages/client/.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=EduSphere
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Running the Project

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- MongoDB (local or Atlas URI)
- Stripe account (test keys sufficient)
- Cloudinary account (free tier is fine)

### Install

```bash
# From repo root
npm install
```

### Configure

```bash
# Copy and fill in environment files
cp packages/server/.env.example packages/server/.env
cp packages/client/.env.example packages/client/.env
```

### Seed Database

Creates all demo users, courses, marketplace listings, and subscriptions:

```bash
cd packages/server
npm run seed
```

### Run (development)

```bash
# Root — starts both server and client concurrently
npm run dev

# Or individually:
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

### Build (production)

```bash
npm run build
# Server: packages/server/dist/
# Client: packages/client/dist/
```

### Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@edusphere.com | Test1234 |
| Tutor | john.tutor@edusphere.com | Test1234 |
| Tutor | sarah.tutor@edusphere.com | Test1234 |
| Student | mike.student@edusphere.com | Test1234 |
| Student | emma.student@edusphere.com | Test1234 |
| Seller | vendor@edusphere.com | Test1234 |

See [SAMPLE_USERS.md](SAMPLE_USERS.md) for the full list including enrolled courses and subscription details.

---

## API Structure

All endpoints are prefixed with `/api/v1`. Authentication uses `Authorization: Bearer <token>` except for the Stripe webhook which uses signature verification.

Standard response envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error response:
```json
{
  "success": false,
  "error": {
    "message": "Human-readable error",
    "code": "ERROR_CODE"
  }
}
```

See [API.md](API.md) for the full endpoint reference.
