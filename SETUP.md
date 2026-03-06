# EduSphere - Setup Guide

This guide will help you set up the EduSphere project for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** >= 6.0 (local or MongoDB Atlas account)
- **Git**

## Project Structure

```
EduSphere/
├── packages/
│   ├── client/              # React frontend (Vite + TypeScript)
│   ├── server/              # Node.js backend (Express + TypeScript)
│   └── shared/              # Shared types and validators
├── package.json             # Root workspace config
├── tsconfig.json            # Base TypeScript config
└── README.md               # Project documentation
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/VihiThejan/EduSphere.git
cd EduSphere
```

### 2. Install Dependencies

Install all dependencies for the monorepo:

```bash
npm install
```

This will install dependencies for:
- Root workspace
- Backend (`packages/server`)
- Frontend (`packages/client`)
- Shared (`packages/shared`)

### 3. Set Up MongoDB

**Option A: Local MongoDB**

1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

**Option B: MongoDB Atlas (Cloud)**

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string (looks like: `mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>`)

### 4. Configure Environment Variables

#### Backend Configuration

1. Navigate to the server package:
   ```bash
   cd packages/server
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file with your settings:
   ```env
   NODE_ENV=development
   PORT=5000
   API_VERSION=v1

   # Update with your MongoDB connection string
   MONGODB_URI=mongodb://localhost:27017/edusphere

   # Generate secure secrets (you can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d

   CLIENT_URL=http://localhost:5173

   MAX_FILE_SIZE=524288000
   UPLOAD_DIR=uploads
   ```

#### Frontend Configuration

1. Navigate to the client package:
   ```bash
   cd packages/client
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file (usually defaults are fine for development):
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_APP_NAME=EduSphere
   ```

### 5. Build Shared Package

The shared package needs to be built before running the applications:

```bash
cd packages/shared
npm run build
```

Or from the root:
```bash
npm run build --workspace=shared
```

## Running the Application

### Development Mode

From the **root directory**, you can start both frontend and backend together:

```bash
npm run dev
```

This starts:
- **Backend** on http://localhost:5000
- **Frontend** on http://localhost:5173

Or start them separately:

```bash
# Terminal 1 - Backend only
npm run dev:server

# Terminal 2 - Frontend only
npm run dev:client
```

### Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1
- **Health Check**: http://localhost:5000/health

## Testing the Setup

### 1. Check Backend Health

Open your browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-03-07T..."
}
```

### 2. Test User Registration

Using curl:
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User",
    "roles": ["student"]
  }'
```

Or use the frontend at http://localhost:5173/register

### 3. Test MongoDB Connection

Check the server console logs. You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000 in development mode
```

## Common Issues and Solutions

### Issue: "Cannot find module '@edusphere/shared'"

**Solution**: Build the shared package first:
```bash
cd packages/shared
npm run build
```

### Issue: "MongoDB connection failed"

**Solutions**:
1. Check if MongoDB is running: `mongosh` (should connect)
2. Verify MONGODB_URI in `.env`
3. Check firewall settings
4. If using Atlas, ensure your IP is whitelisted

### Issue: "Port 5000 already in use"

**Solution**: Change the PORT in `packages/server/.env` to another port (e.g., 5001)

### Issue: CORS errors in browser

**Solution**: Verify CLIENT_URL in backend `.env` matches your frontend URL

### Issue: "Module not found" errors in frontend

**Solution**: Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

### 1. Working on Backend

```bash
cd packages/server
npm run dev
```

Files will auto-reload on changes using `tsx watch`.

### 2. Working on Frontend

```bash
cd packages/client
npm run dev
```

Vite provides fast HMR (Hot Module Replacement).

### 3. Updating Shared Types

After modifying types in `packages/shared/src`:

```bash
cd packages/shared
npm run build
```

Both frontend and backend will automatically use the updated types.

## Available Scripts

### Root Level

- `npm run dev` - Start both client and server
- `npm run dev:server` - Start backend only
- `npm run dev:client` - Start frontend only
- `npm run build` - Build all packages
- `npm run test` - Run tests in all packages
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier

### Backend (packages/server)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm test` - Run tests

### Frontend (packages/client)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Features Implemented

### Phase 1 - Core E-Learning ✅

- [x] User authentication (JWT-based)
- [x] Course creation and management
- [x] Video upload and streaming
- [x] Course enrollment system
- [x] Progress tracking
- [x] Role-based access control (Student, Tutor, Admin)

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

#### Courses
- `GET /api/v1/courses` - List published courses (with filters, search, pagination)
- `GET /api/v1/courses/:id` - Get course details
- `POST /api/v1/courses` - Create course (tutor only)
- `PUT /api/v1/courses/:id` - Update course (owner only)
- `DELETE /api/v1/courses/:id` - Delete course (owner only)
- `GET /api/v1/courses/:id/lessons` - Get course lessons
- `POST /api/v1/courses/:id/lessons` - Add lesson to course

#### Enrollments
- `POST /api/v1/enrollments/courses/:id/enroll` - Enroll in course
- `GET /api/v1/enrollments/me` - Get user's enrollments
- `GET /api/v1/enrollments/courses/:id/progress` - Get course progress
- `POST /api/v1/enrollments/courses/:id/lessons/:lessonId/complete` - Mark lesson completed

#### Videos
- `POST /api/v1/videos/upload` - Upload video (tutor only)
- `GET /api/v1/videos/:id` - Get video metadata
- `GET /api/v1/videos/:id/stream` - Stream video with range support
- `DELETE /api/v1/videos/:id` - Delete video (owner only)

## Next Steps

1. **Explore the codebase**:
   - Backend API structure: `packages/server/src/modules/`
   - Frontend pages: `packages/client/src/pages/`
   - Shared types: `packages/shared/src/types/`

2. **Try the features**:
   - Register a new user
   - Create a course (as tutor)
   - Upload a video
   - Enroll in a course
   - Track progress

3. **Implement additional features**:
   - Course reviews and ratings
   - Search improvements
   - User profiles
   - Email notifications
   - Payment integration (Phase 2)
   - Marketplace (Phase 3)

## Team Collaboration

When working on the project:

1. **Pull latest changes before starting work**:
   ```bash
   git pull origin main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes and commit**:
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```

4. **Push and create a pull request**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Support

If you encounter issues:
1. Check this guide's "Common Issues" section
2. Review the main README.md
3. Check the console logs for errors
4. Contact team members

## Resources

- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [TypeScript Handbook](https://www.typescriptlang .org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

Happy coding! 🚀
