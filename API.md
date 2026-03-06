# EduSphere API Reference

Base URL: `http://localhost:5000/api/v1`

## Authentication

All authenticated endpoints require the `Authorization` header:
```
Authorization: Bearer <access_token>
```

### Register

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["student"]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "65abc123...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["student"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### Login

**POST** `/auth/login`

Authenticate and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:** `200 OK` (same structure as register)

### Refresh Token

**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request:** Refresh token must be in httpOnly cookie

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Logout

**POST** `/auth/logout`

Log out and invalidate refresh token.

**Headers:** Requires `Authorization: Bearer <token>`

**Response:** `200 OK`

### Get Current User

**GET** `/auth/me`

Get the authenticated user's profile.

**Headers:** Requires `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["student"],
    "createdAt": "2024-03-07T...",
    "bio": "User bio"
  }
}
```

---

## Courses

### List Courses

**GET** `/courses`

Get all published courses with optional filters.

**Query Parameters:**
- `search` - Search in title and description
- `category` - Filter by category
- `level` - Filter by level (beginner, intermediate, advanced)
- `instructor` - Filter by instructor ID
- `tags` - Filter by tags (comma-separated)
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - asc or desc (default: desc)

**Example:**
```
GET /courses?category=programming&level=beginner&page=1&limit=10
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "_id": "65abc456...",
        "title": "Introduction to Python",
        "description": "Learn Python from scratch",
        "instructorName": "Sarah Johnson",
        "category": "programming",
        "level": "beginner",
        "thumbnail": "https://...",
        "pricing": {
          "type": "free"
        },
        "stats": {
          "totalStudents": 250,
          "totalLessons": 15,
          "totalDuration": 3600
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

### Get Course Details

**GET** `/courses/:id`

Get detailed information about a specific course.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "65abc456...",
    "title": "Introduction to Python",
    "description": "Learn Python from scratch",
    "instructorId": "65abc123...",
    "instructorName": "Sarah Johnson",
    "category": "programming",
    "level": "beginner",
    "status": "published",
    "thumbnail": "https://...",
    "tags": ["python", "programming", "beginner"],
    "pricing": {
      "type": "paid",
      "amount": 49.99,
      "currency": "USD"
    },
    "stats": {
      "totalStudents": 250,
      "totalLessons": 15,
      "totalDuration": 3600,
      "averageRating": 4.7
    },
    "createdAt": "2024-03-07T..."
  }
}
```

### Create Course

**POST** `/courses`

Create a new course (Tutor only).

**Headers:** Requires `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Advanced React Patterns",
  "description": "Master advanced React concepts",
  "category": "programming",
  "level": "advanced",
  "thumbnail": "https://...",
  "tags": ["react", "javascript", "advanced"],
  "pricing": {
    "type": "paid",
    "amount": 79.99,
    "currency": "USD"
  }
}
```

**Response:** `201 Created`

### Update Course

**PUT** `/courses/:id`

Update course details (Owner only).

**Headers:** Requires `Authorization: Bearer <token>`

**Request Body:** Same as create (all fields optional)

**Response:** `200 OK`

### Delete Course

**DELETE** `/courses/:id`

Delete a course (Owner only).

**Headers:** Requires `Authorization: Bearer <token>`

**Response:** `200 OK`

### Get Course Lessons

**GET** `/courses/:id/lessons`

Get all lessons for a course.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "65def123...",
      "courseId": "65abc456...",
      "title": "Introduction to Python",
      "description": "Getting started with Python",
      "order": 1,
      "duration": 900,
      "videoId": "65xyz789..."
    }
  ]
}
```

### Add Lesson to Course

**POST** `/courses/:id/lessons`

Add a new lesson to a course (Owner only).

**Headers:** Requires `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Variables and Data Types",
  "description": "Learn about Python data types",
  "order": 2,
  "duration": 1200,
  "videoId": "65xyz789..."
}
```

**Response:** `201 Created`

---

## Enrollments

### Enroll in Course

**POST** `/enrollments/courses/:id/enroll`

Enroll in a course (Student only).

**Headers:** Requires `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Successfully enrolled in course",
  "data": {
    "_id": "65enr123...",
    "userId": "65abc123...",
    "courseId": "65abc456...",
    "status": "active",
    "progress": 0,
    "completedLessons": [],
    "enrolledAt": "2024-03-07T..."
  }
}
```

### Get My Enrollments

**GET** `/enrollments/me`

Get all enrollments for the authenticated user.

**Headers:** Requires `Authorization: Bearer <token>`

**Query Parameters:**
- `status` - Filter by status (active, completed, dropped)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "65enr123...",
      "courseId": "65abc456...",
      "course": {
        "title": "Introduction to Python",
        "thumbnail": "https://...",
        "instructorName": "Sarah Johnson"
      },
      "status": "active",
      "progress": 35.5,
      "completedLessons": ["65def123...", "65def124..."],
      "enrolledAt": "2024-03-07T..."
    }
  ]
}
```

### Get Course Progress

**GET** `/enrollments/courses/:id/progress`

Get progress for a specific enrolled course.

**Headers:** Requires `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "65enr123...",
    "progress": 35.5,
    "completedLessons": ["65def123...", "65def124..."],
    "lastAccessedAt": "2024-03-07T..."
  }
}
```

### Mark Lesson Complete

**POST** `/enrollments/courses/:id/lessons/:lessonId/complete`

Mark a lesson as completed.

**Headers:** Requires `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Lesson marked as complete",
  "data": {
    "progress": 42.8,
    "completedLessons": ["65def123...", "65def124...", "65def125..."],
    "courseCompleted": false
  }
}
```

---

## Videos

### Upload Video

**POST** `/videos/upload`

Upload a video file (Tutor only).

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `video` - Video file (max 500MB)
- `title` - Video title
- `description` - Video description (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "data": {
    "_id": "65vid123...",
    "title": "Introduction Video",
    "filename": "video-1234567890.mp4",
    "mimeType": "video/mp4",
    "size": 45678901,
    "duration": 900,
    "status": "processed",
    "uploadedBy": "65abc123..."
  }
}
```

### Get Video Metadata

**GET** `/videos/:id`

Get video metadata.

**Headers:** Requires `Authorization: Bearer <token>`

**Response:** `200 OK`

### Stream Video

**GET** `/videos/:id/stream`

Stream video content with range support.

**Headers:** 
- `Authorization: Bearer <token>`
- `Range: bytes=0-1023` (optional)

**Response:** `206 Partial Content` or `200 OK`

Video stream with appropriate Content-Type and Content-Range headers.

### Delete Video

**DELETE** `/videos/:id`

Delete a video (Owner only).

**Headers:** Requires `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `413` - Payload Too Large (file too large)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Testing with cURL

### Register and Login

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User",
    "roles": ["student"]
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

### Using Authentication Token

```bash
# Save token from login response
TOKEN="your_access_token_here"

# Get current user
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# List courses
curl -X GET "http://localhost:5000/api/v1/courses?category=programming&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# Enroll in course
curl -X POST http://localhost:5000/api/v1/enrollments/courses/COURSE_ID/enroll \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing with Postman

1. Import the API collection (if available)
2. Set environment variable `baseUrl` = `http://localhost:5000/api/v1`
3. After login, set `accessToken` variable
4. Use `{{baseUrl}}` and `{{accessToken}}` in requests

---

## Rate Limiting

API endpoints are rate-limited:
- **General endpoints**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **Upload endpoints**: 10 requests per hour per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1709823600
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response includes:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

## Search and Filtering

Most list endpoints support:
- **Text search**: `?search=keyword`
- **Exact match**: `?field=value`
- **Range**: `?minPrice=10&maxPrice=50`
- **Array match**: `?tags=react,javascript`
- **Sorting**: `?sortBy=createdAt&sortOrder=desc`
