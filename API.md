# 🔌 API Documentation

## Base URL
- **Local Development**: `http://localhost:4000`
- **Production**: `https://your-backend.vercel.app`

## Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "cutiefrootiedev@gmail.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "cutiefrootiedev@gmail.com",
    "role": "admin"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "email": "cutiefrootiedev@gmail.com",
    "role": "admin",
    "loginTime": "2024-01-15T10:00:00.000Z"
  }
}
```

## Public Endpoints

### Health Check
```http
GET /api/health
```

### Showcase Projects
```http
GET /api/showcase-projects
```

### Tutorial Videos
```http
GET /api/tutorial-videos
```

### Blog Posts
```http
GET /api/blog/posts?featured=true&tag=css&limit=10
GET /api/blog/posts/building-magical-websites-my-journey
GET /api/blog/tags
```

### Contact Form
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello! I'd love to work with you on a magical website."
}
```

## Admin Endpoints (Require Authentication)

All admin endpoints require `Authorization: Bearer <token>` header.

### Dashboard Stats
```http
GET /api/admin/stats
```

**Response:**
```json
{
  "stats": {
    "totalContacts": 25,
    "pendingContacts": 5,
    "totalProjects": 8,
    "totalBlogPosts": 12
  },
  "recentContacts": [...]
}
```

### Contact Management
```http
GET /api/admin/contacts?status=pending&limit=20&skip=0
PATCH /api/admin/contacts/:id
Content-Type: application/json

{
  "status": "responded"
}
```

### Project Management
```http
GET /api/admin/projects?limit=20&skip=0
POST /api/admin/projects
PUT /api/admin/projects/:id
DELETE /api/admin/projects/:id

Content-Type: application/json
{
  "title": "Amazing Birthday Site",
  "description": "A magical birthday website with animations",
  "imageUrl": "https://example.com/image.jpg",
  "liveUrl": "https://example.com",
  "githubUrl": "https://github.com/user/repo",
  "tags": ["Birthday", "Playful"],
  "featured": true
}
```

### Blog Management
```http
GET /api/admin/blog/posts?limit=20&skip=0
POST /api/admin/blog/posts
PUT /api/admin/blog/posts/:id
DELETE /api/admin/blog/posts/:id

Content-Type: application/json
{
  "title": "My New Blog Post",
  "slug": "my-new-blog-post",
  "excerpt": "A short description of the post",
  "content": "<p>Full HTML content of the post</p>",
  "tags": ["tutorial", "css"],
  "featured": false,
  "publishedAt": "2024-01-15T10:00:00.000Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "errors": [
    {
      "msg": "Name must be 2-100 characters",
      "param": "name",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Not Found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many contact form submissions. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

## Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Contact Form**: 5 submissions per 15 minutes per IP
- **Admin endpoints**: Protected by authentication, no additional rate limiting

## Authentication Flow

1. **Login**: POST to `/api/auth/login` with email/password
2. **Store Token**: Save the JWT token from response
3. **Use Token**: Include `Authorization: Bearer <token>` header in requests
4. **Token Expiry**: Tokens expire in 7 days (configurable)
5. **Refresh**: Login again when token expires

## Example Usage

### JavaScript/Fetch
```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'cutiefrootiedev@gmail.com',
    password: 'your-password'
  })
});
const { token } = await loginResponse.json();

// Use token for admin requests
const statsResponse = await fetch('/api/admin/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const stats = await statsResponse.json();
```

### cURL
```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cutiefrootiedev@gmail.com","password":"your-password"}'

# Use token
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/admin/stats
```

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Required for authentication
JWT_SECRET=your-super-secret-jwt-key
ADMIN_EMAIL=cutiefrootiedev@gmail.com
ADMIN_PASSWORD_HASH=<generated-hash>

# Optional but recommended
MONGODB_URI=mongodb+srv://...
SMTP_HOST=smtp.gmail.com
SMTP_USER=cutiefrootiedev@gmail.com
SMTP_PASS=your-app-password
```

### 2. Generate Password Hash
```bash
node generate-password.js your-secure-password
```

### 3. Start Server
```bash
npm run dev  # Development
npm start    # Production
```

## Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Request logging
- ✅ Error handling
- ✅ SQL injection protection (MongoDB)
- ✅ XSS protection (input sanitization)