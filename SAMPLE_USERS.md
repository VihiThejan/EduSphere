# EduSphere — Sample User Accounts

All accounts are created by running `npm run seed` from `packages/server`.  
**Universal password:** `Test1234`

---

## Admin

| Email | Password | Roles |
|-------|----------|-------|
| admin@edusphere.com | Test1234 | admin, tutor |

**Access:** Full platform access — admin dashboard (`/admin/dashboard`), tutor hub, course upload, and marketplace selling.  
**Vendor plan:** Elite (100 listings / 30 days) — pre-activated, no Stripe required.  
**Shop:** EduSphere Official Store

---

## Tutors

| Email | Password | Name | Vendor Plan |
|-------|----------|------|-------------|
| john.tutor@edusphere.com | Test1234 | John Smith | Pro (20 listings) |
| sarah.tutor@edusphere.com | Test1234 | Sarah Johnson | Pro (20 listings) |
| priya.tutor@edusphere.com | Test1234 | Priya Nair | Starter (5 listings) |

**Access:** Tutor hub (`/tutor/dashboard`), course creation (`/tutor/upload`), live sessions, and marketplace selling.  
All tutors have an active vendor subscription — marketplace publishing works immediately after login.

### Seeded Courses

| Tutor | Courses |
|-------|---------|
| John Smith | Full-Stack Web Dev (MERN), React Advanced Patterns, Microeconomics |
| Sarah Johnson | Python Programming (free), Machine Learning Fundamentals, UI/UX Design (free) |
| Priya Nair | Calculus for Engineers, Linear Algebra, Classical Mechanics |

---

## Students

| Email | Password | Name | Enrolled Courses |
|-------|----------|------|------------------|
| mike.student@edusphere.com | Test1234 | Mike Davis | MERN Stack (67%), Python (100% ✓), ML (20%) |
| emma.student@edusphere.com | Test1234 | Emma Wilson | Microeconomics (50%), UI/UX (86%), Linear Algebra (33%) |
| alex.student@edusphere.com | Test1234 | Alex Brown | Calculus (57%), Classical Mechanics (33%), React Advanced (71%), Python (100% ✓) |

**Access:** Student dashboard, enrolled courses, marketplace browsing and purchasing.

---

## Seller (Marketplace only)

| Email | Password | Name | Vendor Plan |
|-------|----------|------|-------------|
| vendor@edusphere.com | Test1234 | Vendor Demo | Pro (20 listings) |

**Access:** Marketplace selling (`/seller/listings`, `/seller/dashboard`, `/seller/billing`, `/seller/orders`).  
Use this account to demo the full seller workflow — subscription is pre-activated, listings can be published immediately.  
**Shop:** Vendor Demo Shop

---

## Login Redirects

| Role | Redirects to |
|------|-------------|
| admin | `/admin/dashboard` |
| tutor (no admin) | `/dashboard` |
| student | `/dashboard` |
| seller | `/dashboard` |

---

## Re-seeding

```bash
cd packages/server
npm run seed
```

This clears all collections (users, courses, lessons, enrollments, marketplace listings, vendor subscriptions, seller profiles) and recreates everything from scratch.
