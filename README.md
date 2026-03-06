# EduSphere

A Scalable Video-Based E-Learning and Skill Marketplace Platform

## Project Overview

EduSphere is a comprehensive web-based platform that enables peer-to-peer learning and academic resource exchange within university communities. The system supports video-based kuppi sessions, course management, enrollment tracking, and a marketplace for academic items.

## Technology Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (Access + Refresh Tokens)
- **State Management:** React Query + Zustand
- **Video Storage:** Local storage (with migration path to cloud)

## Project Structure

```
EduSphere/
├── packages/
│   ├── client/          # React frontend application
│   ├── server/          # Node.js/Express backend API
│   └── shared/          # Shared TypeScript types and utilities
├── package.json         # Root workspace configuration
└── tsconfig.json        # Base TypeScript configuration
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB >= 6.0 (local or MongoDB Atlas)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/VihiThejan/EduSphere.git
cd EduSphere
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create `.env` files in both server and client packages:

**Backend (`packages/server/.env`):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edusphere
JWT_SECRET=your-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-change-this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=http://localhost:5173
```

**Frontend (`packages/client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=EduSphere
```

### 4. Start development servers

```bash
# Start both frontend and backend
npm run dev

# Or start them separately
npm run dev:server  # Backend on http://localhost:5000
npm run dev:client  # Frontend on http://localhost:5173
```

## Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run dev:server` - Start only the backend server
- `npm run dev:client` - Start only the frontend
- `npm run build` - Build all packages for production
- `npm run test` - Run tests in all packages
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier

## Development Phases

### Phase 1 - Core E-Learning (Current)
- ✅ Student/tutor registration and login
- ✅ Course upload and management
- ✅ Video hosting and playback
- ✅ Course search and enrollment
- ✅ Basic progress tracking

### Phase 2 - Advanced Features (Planned)
- Course analytics and insights
- Automated tutor approval workflow
- Payment integration
- Enhanced dashboards

### Phase 3 - Marketplace (Planned)
- Product listing and management
- Search and filtering
- User-to-user transactions
- Store management

## API Documentation

API endpoints are available at `http://localhost:5000/api/v1`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### Courses
- `GET /courses` - List all courses
- `GET /courses/:id` - Get course details
- `POST /courses` - Create course (tutor only)
- `PUT /courses/:id` - Update course (owner only)
- `DELETE /courses/:id` - Delete course (owner only)

### Enrollments
- `POST /courses/:id/enroll` - Enroll in course
- `GET /enrollments/me` - Get user's enrollments
- `GET /courses/:id/progress` - Get course progress

## Team

- Rashmitha K. M - MS26905136
- Bandara K. M. V. T - MS26914428
- De Silva M. S. D. S - MS26907420
- Muthuthanthirige M. D. C - MS26915890
- Gurusinghe B. M. V. B. B - MS26906362

## License

MIT License - See LICENSE file for details

## Contributing

This is a university project. Please coordinate with team members before making changes.
