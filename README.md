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

### 4. Build shared package

```bash
npm run build --workspace=shared
```

### 5. (Optional) Seed the database with sample data

```bash
cd packages/server
npm run seed
```

This creates sample users, courses, and lessons for development:
- **Admin**: admin@edusphere.com / Test1234
- **Tutor**: john.tutor@edusphere.com / Test1234
- **Student**: mike.student@edusphere.com / Test1234

### 6. Start development servers

```bash
# Start both frontend and backend
npm run dev

# Or start them separately
npm run dev:server  # Backend on http://localhost:5000
npm run dev:client  # Frontend on http://localhost:5173
```

For detailed setup instructions, see **[SETUP.md](SETUP.md)**

## Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run dev:server` - Start only the backend server
- `npm run dev:client` - Start only the frontend
- `npm run build` - Build all packages for production
- `npm run test` - Run tests in all packages
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier
- `npm run seed` - Seed database with sample data (from packages/server)

## Documentation

Comprehensive guides are available for different aspects of development:

- **[SETUP.md](SETUP.md)** - Detailed setup instructions and troubleshooting
- **[API.md](API.md)** - Complete API endpoint documentation with examples
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines and workflow
- **[QUICKREF.md](QUICKREF.md)** - Quick reference cheatsheet for common commands

**Quick Links:**
- Need help getting started? → [SETUP.md](SETUP.md)
- Want to test the API? → [API.md](API.md)
- Contributing code? → [CONTRIBUTING.md](CONTRIBUTING.md)
- Looking for commands? → [QUICKREF.md](QUICKREF.md)

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

The backend API is available at `http://localhost:5000/api/v1`

**Complete API documentation with request/response examples is available in [API.md](API.md)**

### Quick Overview

**Authentication:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

**Courses:**
- `GET /courses` - List all courses (with filters, search, pagination)
- `GET /courses/:id` - Get course details
- `POST /courses` - Create course (tutor only)
- `PUT /courses/:id` - Update course (owner only)
- `DELETE /courses/:id` - Delete course (owner only)
- `GET /courses/:id/lessons` - Get course lessons
- `POST /courses/:id/lessons` - Add lesson to course

**Enrollments:**
- `POST /enrollments/courses/:id/enroll` - Enroll in course
- `GET /enrollments/me` - Get user's enrollments
- `GET /enrollments/courses/:id/progress` - Get course progress
- `POST /enrollments/courses/:id/lessons/:lessonId/complete` - Mark lesson complete

**Videos:**
- `POST /videos/upload` - Upload video (tutor only)
- `GET /videos/:id` - Get video metadata
- `GET /videos/:id/stream` - Stream video with range support
- `DELETE /videos/:id` - Delete video (owner only)

For detailed examples and request/response formats, see **[API.md](API.md)**

## Team

- Rashmitha K. M - MS26905136
- Bandara K. M. V. T - MS26914428
- De Silva M. S. D. S - MS26907420
- Muthuthanthirige M. D. C - MS26915890
- Gurusinghe B. M. V. B. B - MS26906362

## License

MIT License - See LICENSE file for details

## Contributing

We welcome contributions from team members! Please follow these guidelines:

1. **Check existing documentation**:
   - [SETUP.md](SETUP.md) for environment setup
   - [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution workflow
   - [QUICKREF.md](QUICKREF.md) for quick command reference

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Follow code standards**:
   - Use TypeScript strict mode
   - Follow existing code patterns
   - Run `npm run lint` and `npm run format`
   - Write tests for new features

4. **Commit with conventional format**:
   ```bash
   git commit -m "feat(scope): description"
   ```

5. **Submit a pull request** with clear description

For detailed guidelines, see **[CONTRIBUTING.md](CONTRIBUTING.md)**

This is a university project. Please coordinate with team members before making major changes.
