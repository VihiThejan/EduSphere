# Changelog

All notable changes to EduSphere are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.1.0] - 2026-04-01

### Added
- Monorepo structure with `packages/client`, `packages/server`, `packages/shared`
- TypeScript, ESLint, and Prettier configured across all packages
- Vite + React 18 frontend with Tailwind CSS
- JWT authentication: 15-min access tokens with 7-day HTTP-only refresh token rotation
- Theft detection via refresh token families
- Account lockout after 5 failed login attempts
- Email verification with Nodemailer and secure token expiry
- Forgot password and reset password flows
- Zustand auth store with persist middleware on the client

## [0.2.0] - 2026-04-08

### Added
- Course catalog with filters: category, level, price range, search
- Course detail page with full lesson tree and instructor info
- Paginated course listing with React Query
- Video player with watch-progress tracking (saves every 10 s)
- Auto-complete lesson at 90% watch threshold
- PDF and Word document download from lessons
- Cloudinary signed-URL direct upload for tutor video lessons
- 3-step course creation wizard with live preview
- Drag-and-drop lesson reordering in the wizard
- Enrollment system: enroll, drop, and re-enroll in courses
- Per-lesson and per-course progress persistence in MongoDB
- My Learning page listing enrolled courses with progress bars
- Stripe, Cloudinary, and Jitsi Meet added as core third-party integrations
- Nodemailer configured for transactional email delivery
- bcryptjs for password hashing, Mongoose for ODM layer
- Marketplace listing browse with type, price, campus, condition filters
- Item detail page with image gallery and Google Maps pickup pin
- Similar listings carousel on item detail page
- Seller onboarding flow with shop profile creation
- Seller listings CRUD: create, edit, publish, unpublish, delete
- Publish gated by active vendor subscription and listing quota

## [0.3.0] - 2026-04-15

### Added
- Shopping cart: add, update, remove, clear, and validate items
- Stripe Elements checkout page with payment intent creation
- Order confirmation page and order detail view
- Jitsi Meet live sessions with iframe embed (no API key required)
- Tutors can create and end sessions; students can view and join
- In-session Q&A: ask, answer, and upvote questions
- Student dashboard: active courses, completed lessons, and avg progress stats
- Continue-learning widget showing last-accessed course
- Recommended courses section and live sessions widget
- Study streak tracker with daily activity detection

### Fixed
- `getMyOrders` and `getSellerOrders` now wrap results in the `ApiResponse` envelope
- Resolved `Cannot read properties of undefined (reading .pages)` crash in SellerOrdersPage
- Admin service: getPlatformStats, getUsers, updateUserRoles, toggleUserSuspension
- Admin endpoints for sellers verification and listings removal
- All admin routes guarded by authorize([ADMIN]) middleware
- Admin dashboard with platform-wide KPIs (users, revenue, listings, orders)
- Users page with inline role editor and suspend/unsuspend controls
- Sellers page with verification status management
- Listings page with removal confirmation dialog
- Orders page with fulfilment status overview

## [0.4.0] - 2026-04-22

### Added
- Tiered vendor subscription plans: Starter (5 listings), Pro (20), Elite (100)
- VendorPlan and VendorSubscription Mongoose models
- Vendor billing service with subscription status checks and quota enforcement
- Stripe Checkout session creation for vendor plan upgrades
- checkout.session.completed webhook activates 30-day subscription window
- SellerBillingPage with plan cards and current subscription status display

### Fixed
- Switched vendor billing from subscription mode (requires pre-created Price IDs) to payment mode with inline price_data
- LKR amount now correctly multiplied by 100 for Stripe minor currency units
- Added error banner to SellerBillingPage when checkout session creation fails
- POST /vendor-billing/verify-checkout retrieves the Stripe session and activates the subscription if payment_status is paid
- Enables local development without running the Stripe CLI webhook daemon
- Frontend stores checkoutSessionId in localStorage before redirect and calls verify on return
- My Learning page lists all enrolled courses with thumbnail, status badge, and progress bar
- Filter buttons: All, Active, Completed, Dropped
- Stats bar showing enrolled count, active, completed, and average progress percentage
