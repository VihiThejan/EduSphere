# Quick Reference - EduSphere Developer Cheatsheet

## Initial Setup

```bash
# Clone and install
git clone https://github.com/VihiThejan/EduSphere.git
cd EduSphere
npm install

# Set up environment
cp packages/server/.env.example packages/server/.env
cp packages/client/.env.example packages/client/.env
# Edit .env files with your settings

# Build shared package
npm run build --workspace=shared
```

## Running the App

```bash
# Start both frontend & backend
npm run dev

# Start separately
npm run dev:server    # Backend only (port 5000)
npm run dev:client    # Frontend only (port 5173)

# Build for production
npm run build

# Run production build
npm start
```

## Database Operations

```bash
# Seed database with sample data
cd packages/server
npm run seed

# Sample credentials after seeding:
# Student: mike.student@edusphere.com / Test1234
# Tutor:   john.tutor@edusphere.com / Test1234
# Admin:   admin@edusphere.com / Test1234
```

## Development Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes, then...
npm run lint          # Check code quality
npm run format        # Format code
npm test              # Run tests

# Commit with conventional format
git commit -m "feat(scope): description"

# Push and create PR
git push origin feature/my-feature
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# Test specific package
npm test --workspace=@edusphere/server
npm test --workspace=@edusphere/client
```

## Code Quality

```bash
# Lint everything
npm run lint

# Lint specific package
npm run lint --workspace=@edusphere/server
npm run lint --workspace=@edusphere/client

# Auto-fix lint issues
npm run lint -- --fix

# Format all code
npm run format

# Check formatting
npm run format:check
```

## Working with Packages

```bash
# Install package in specific workspace
npm install package-name --workspace=@edusphere/server
npm install package-name --workspace=@edusphere/client

# Run script in specific workspace
npm run dev --workspace=@edusphere/server
npm run build --workspace=@edusphere/shared

# List all workspaces
npm workspaces list
```

## API Testing

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","firstName":"Test","lastName":"User","roles":["student"]}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Use token
TOKEN="your_token_here"
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# List courses
curl http://localhost:5000/api/v1/courses?limit=5
```

## MongoDB Operations

```bash
# Connect to local MongoDB
mongosh

# Show databases
show dbs

# Switch to EduSphere database
use edusphere

# Show collections
show collections

# Find users
db.users.find().pretty()

# Count documents
db.courses.countDocuments()

# Find one course
db.courses.findOne()

# Clear a collection
db.enrollments.deleteMany({})

# Drop database (careful!)
db.dropDatabase()
```

## Git Commands

```bash
# Sync with main
git fetch upstream
git checkout main
git merge upstream/main

# Rebase feature branch
git checkout feature/my-feature
git rebase main

# Squash commits
git rebase -i HEAD~3

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Stash changes
git stash
git stash pop

# View git log
git log --oneline --graph
```

## TypeScript

```bash
# Type check (no build)
npx tsc --noEmit

# Build specific package
cd packages/server
npm run build

# Watch mode
npx tsc --watch
```

## Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edusphere
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=EduSphere
```

## Useful URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1
- **Health Check**: http://localhost:5000/health
- **API Docs**: See API.md

## Common Issues & Fixes

```bash
# Module not found errors
rm -rf node_modules package-lock.json
npm install

# Shared package types not found
cd packages/shared
npm run build

# Port already in use
# Change PORT in packages/server/.env

# MongoDB connection failed
# Start MongoDB: net start MongoDB (Windows)
# Or check MONGODB_URI in .env

# CORS errors
# Verify CLIENT_URL in server .env matches frontend URL
```

## Project Structure

```
EduSphere/
├── packages/
│   ├── client/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/     # Reusable components
│   │   │   ├── pages/          # Page components
│   │   │   ├── services/       # API services
│   │   │   └── store/          # State management
│   │   └── package.json
│   ├── server/                 # Express backend
│   │   ├── src/
│   │   │   ├── config/         # Configuration
│   │   │   ├── modules/        # Feature modules
│   │   │   ├── shared/         # Middleware & utils
│   │   │   └── app.ts
│   │   └── package.json
│   └── shared/                 # Shared types
│       ├── src/
│       │   ├── constants/
│       │   ├── types/
│       │   └── validators/
│       └── package.json
├── .gitignore
├── package.json                # Root workspace config
├── README.md
├── SETUP.md
├── API.md
└── CONTRIBUTING.md
```

## Important npm Scripts

### Root Level
- `npm run dev` - Start both client & server
- `npm run build` - Build all packages
- `npm test` - Run all tests
- `npm run lint` - Lint all packages
- `npm run format` - Format all code

### Server Package
- `npm run dev` - Start dev server
- `npm run seed` - Seed database
- `npm test` - Run tests

### Client Package
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Endpoints Quick Reference

### Auth
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Current user

### Courses
- `GET /api/v1/courses` - List courses
- `GET /api/v1/courses/:id` - Get course
- `POST /api/v1/courses` - Create (tutor)
- `PUT /api/v1/courses/:id` - Update (owner)
- `DELETE /api/v1/courses/:id` - Delete (owner)
- `GET /api/v1/courses/:id/lessons` - Get lessons
- `POST /api/v1/courses/:id/lessons` - Add lesson

### Enrollments
- `POST /api/v1/enrollments/courses/:id/enroll` - Enroll
- `GET /api/v1/enrollments/me` - My enrollments
- `GET /api/v1/enrollments/courses/:id/progress` - Progress
- `POST /api/v1/enrollments/courses/:id/lessons/:lessonId/complete` - Complete lesson

### Videos
- `POST /api/v1/videos/upload` - Upload
- `GET /api/v1/videos/:id` - Get metadata
- `GET /api/v1/videos/:id/stream` - Stream video
- `DELETE /api/v1/videos/:id` - Delete

## Commit Message Format

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Scopes: auth, courses, videos, enrollments, ui, api, db

Examples:
feat(courses): add search functionality
fix(auth): resolve token refresh issue
docs(api): update endpoint documentation
```

## TypeScript Types Location

```typescript
// Import from shared package
import { User, Course, Enrollment } from '@edusphere/shared';
import { UserCreateSchema } from '@edusphere/shared';
import { USER_ROLES, COURSE_STATUS } from '@edusphere/shared';
```

## Debugging

```bash
# Backend logs (Winston)
# Located in: logs/

# View real-time logs
tail -f logs/error.log
tail -f logs/combined.log

# Frontend console
# Open browser DevTools (F12)

# Network requests
# Browser DevTools → Network tab

# MongoDB queries
# Add mongoose debug mode in code:
mongoose.set('debug', true);
```

## Performance Tips

- Use React.memo() for expensive components
- Implement pagination for large lists
- Use React Query for data caching
- Index frequently queried MongoDB fields
- Optimize images and videos
- Use code splitting with React.lazy()

## Security Checklist

- [ ] Never commit .env files
- [ ] Use strong JWT secrets
- [ ] Validate all user inputs
- [ ] Sanitize data before DB operations
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Hash passwords with bcrypt
- [ ] Use httpOnly cookies for refresh tokens

---

**Need more help?** Check SETUP.md, API.md, or CONTRIBUTING.md
