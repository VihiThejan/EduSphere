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
