# 🚀 Deployment Guide

## MongoDB Setup (Required for Production)

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign up for a free account
3. Create a new cluster (free tier is fine)
4. Create a database user with read/write permissions
5. Add your IP address to the IP whitelist (or use 0.0.0.0/0 for all IPs)
6. Get your connection string

### 2. Configure MongoDB Connection
Your connection string will look like:
```
mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
```

## Backend Deployment on Vercel

### 1. Prepare Backend for Deployment
```bash
cd backend
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Set Environment Variables in Vercel
In your Vercel dashboard, go to your project settings and add these environment variables:

**Required:**
- `NODE_ENV` = `production`
- `CORS_ORIGIN` = `https://your-frontend-domain.vercel.app`

**Optional (but recommended):**
- `MONGODB_URI` = `your-mongodb-connection-string`
- `SMTP_HOST` = `smtp.gmail.com`
- `SMTP_PORT` = `587`
- `SMTP_USER` = `your-email@gmail.com`
- `SMTP_PASS` = `your-16-digit-app-password`
- `CONTACT_TO` = `your-email@gmail.com`

## Frontend Deployment on Vercel

### 1. Build Frontend
```bash
# From project root
npm run build
```

### 2. Deploy Frontend
```bash
vercel --prod
```

### 3. Set Frontend Environment Variables
In your frontend Vercel project settings:
- `VITE_API_BASE_URL` = `https://your-backend-domain.vercel.app`

## Alternative: Deploy Both Together

### Option 1: Backend serves Frontend
1. Build the frontend: `npm run build`
2. Set `SERVE_STATIC=true` in backend environment variables
3. Deploy only the backend - it will serve the frontend too

### Option 2: Separate Deployments (Recommended)
1. Deploy backend to Vercel
2. Deploy frontend to Vercel (or Netlify)
3. Configure CORS and API URLs properly

## Email Configuration (Gmail)

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-factor authentication

### 2. Generate App Password
- Go to Google Account > Security > App passwords
- Generate a 16-character app password
- Use this as `SMTP_PASS` (not your regular Gmail password)

## Testing Deployment

### Backend Health Check
```bash
curl https://your-backend-domain.vercel.app/api/health
```

### Test API Endpoints
```bash
# Showcase projects
curl https://your-backend-domain.vercel.app/api/showcase-projects

# Blog posts
curl https://your-backend-domain.vercel.app/api/blog/posts

# Contact form
curl -X POST https://your-backend-domain.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `CORS_ORIGIN` includes your frontend domain
2. **MongoDB Connection**: Check your connection string and IP whitelist
3. **Email Not Sending**: Verify Gmail app password and SMTP settings
4. **Build Errors**: Ensure all dependencies are in `package.json`

### Logs:
- Check Vercel function logs in your dashboard
- Use `console.log` statements for debugging

## Local Development

```bash
# Backend
cd backend
npm run dev

# Frontend (separate terminal)
npm run dev
```

## Production URLs
After deployment, update these in your documentation:
- Backend API: `https://your-backend.vercel.app`
- Frontend: `https://your-frontend.vercel.app`