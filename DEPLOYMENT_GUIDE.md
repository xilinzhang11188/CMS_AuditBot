# AuditBot Deployment Guide

This guide provides instructions for deploying the AuditBot application to production.

## Environment Configuration

### Backend Environment Variables

The backend requires a [`.env`](backend/.env) file in the [`backend/`](backend/) directory with the following variables:

```env
# Application Environment
APP_ENV=production

# Server Port
PORT=8000

# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net
MONGODB_DB_NAME=auditbot

# CORS Origins (comma-separated list)
CORS_ORIGINS=https://your-frontend-domain.com

# JWT Authentication
JWT_SECRET=your-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=24

# OpenAI API
OPENAI_API_KEY=your-openai-api-key-here
```

**Important Configuration Steps:**

1. **MongoDB URI**: Set up a MongoDB Atlas cluster and replace with your connection string
2. **JWT Secret**: Generate a secure secret using: `openssl rand -hex 32`
3. **CORS Origins**: Add your frontend domain(s) (comma-separated for multiple domains)
4. **OpenAI API Key**: Get your API key from https://platform.openai.com/api-keys

### Frontend Environment Variables

The frontend requires environment variables for different environments:

#### Production ([`.env.production`](frontend/.env.production))
```env
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
NEXT_PUBLIC_ENV=production
```

#### Local Development ([`.env.local`](frontend/.env.local))
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENV=development
```

**Configuration Steps:**

1. **Production API URL**: Replace with your deployed backend API URL
2. **Local Development**: Already configured to point to `localhost:8000`

## Deployment Steps

### Backend Deployment

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   - Copy [`.env.example`](backend/.env.example) to [`.env`](backend/.env)
   - Update all values with production credentials

3. **Initialize Database**
   ```bash
   python seed_data.py
   ```

4. **Run Backend**
   ```bash
   python main.py
   ```

   For production, use a process manager like PM2, systemd, or Docker.

### Frontend Deployment

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   - Update [`.env.production`](frontend/.env.production) with your backend API URL

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

   Or deploy to platforms like Vercel, Netlify, or AWS.

## Deployment Platforms

### Recommended Options

#### Backend
- **Railway**: Easy Python deployment with MongoDB support
- **Render**: Free tier available, supports Python
- **AWS EC2**: Full control, requires more setup
- **Google Cloud Run**: Serverless container deployment
- **DigitalOcean App Platform**: Simple deployment with managed databases

#### Frontend
- **Vercel**: Optimized for Next.js (recommended)
- **Netlify**: Easy deployment with CI/CD
- **AWS Amplify**: Full AWS integration
- **Cloudflare Pages**: Fast global CDN

#### Database
- **MongoDB Atlas**: Managed MongoDB service (recommended)
- **AWS DocumentDB**: MongoDB-compatible on AWS
- **Self-hosted MongoDB**: On your own infrastructure

## Security Checklist

- [ ] Generate a strong JWT secret (32+ characters)
- [ ] Use HTTPS for all production URLs
- [ ] Configure CORS to only allow your frontend domain
- [ ] Set `APP_ENV=production` in backend
- [ ] Secure MongoDB with authentication and network restrictions
- [ ] Keep OpenAI API key secure and never commit to version control
- [ ] Enable rate limiting on API endpoints
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for MongoDB
- [ ] Use environment-specific configurations

## Environment Variables Summary

### Backend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `APP_ENV` | Environment mode | `production` |
| `PORT` | Server port | `8000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `MONGODB_DB_NAME` | Database name | `auditbot` |
| `CORS_ORIGINS` | Allowed frontend origins | `https://app.example.com` |
| `JWT_SECRET` | JWT signing secret | `generated-secret-key` |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_EXPIRES_IN` | Token expiry (hours) | `24` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |

### Frontend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.example.com` |
| `NEXT_PUBLIC_ENV` | Environment mode | `production` |

## Troubleshooting

### Backend Issues
- **MongoDB Connection Failed**: Check connection string and network access in MongoDB Atlas
- **CORS Errors**: Verify `CORS_ORIGINS` includes your frontend domain with correct protocol
- **OpenAI API Errors**: Verify API key is valid and has sufficient credits

### Frontend Issues
- **API Connection Failed**: Verify `NEXT_PUBLIC_API_URL` is correct and backend is running
- **Build Errors**: Ensure all dependencies are installed with `npm install`
- **Environment Variables Not Loading**: Restart the development server after changing `.env` files

## Support

For issues or questions:
1. Check the [Backend README](backend/README.md)
2. Review the [Backend Setup Guide](backend/SETUP.md)
3. Check sprint completion documents for feature details