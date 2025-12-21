# Backend Setup and Testing Guide

## Prerequisites

1. **Python 3.8+** installed on your system
2. **MongoDB** running locally or MongoDB Atlas connection string
3. **pip** package manager

## Installation Steps

### 1. Install Python Dependencies

```bash
# Navigate to backend directory
cd backend

# Install required packages
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` file:
```env
APP_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=auditbot
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=your-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=24
```

**IMPORTANT**: Generate a secure JWT secret:
```bash
# On Linux/Mac:
openssl rand -hex 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas**
- Update `MONGODB_URI` in `.env` with your Atlas connection string

### 4. Run the Backend Server

```bash
# From backend directory
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Testing Authentication Endpoints

### 1. Health Check

```bash
curl http://localhost:8000/healthz
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### 2. Register a New User (Signup)

```bash
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "provider@example.com",
    "name": "Dr. John Doe",
    "password": "securepassword123",
    "role": "provider",
    "organizationName": "City Medical Group"
  }'
```

Expected response:
```json
{
  "user": {
    "_id": "...",
    "email": "provider@example.com",
    "name": "Dr. John Doe",
    "role": "provider",
    "organizationId": "org_...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "provider@example.com",
    "password": "securepassword123"
  }'
```

### 4. Get Current User Profile

```bash
# Replace YOUR_TOKEN with the token from signup/login response
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Logout

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Integration Testing

### 1. Start Backend Server
```bash
cd backend
python main.py
```

### 2. Start Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```

### 3. Manual Test Steps

1. **Register a new user**:
   - Navigate to http://localhost:3000/register
   - Fill in the registration form
   - Submit and verify redirect to dashboard

2. **Verify authentication**:
   - Check browser DevTools > Application > Local Storage
   - Verify `authToken` is stored

3. **Test protected routes**:
   - Navigate to dashboard
   - Verify user data is displayed correctly

4. **Test logout**:
   - Click logout button
   - Verify redirect to home page
   - Verify token is removed from localStorage

5. **Test login**:
   - Navigate to http://localhost:3000/login
   - Login with registered credentials
   - Verify successful authentication

6. **Test role-based routing**:
   - Register as "manager" role
   - Verify access to management dashboard
   - Register as "provider" role
   - Verify access to provider dashboard

## Troubleshooting

### MongoDB Connection Issues

**Error**: `Failed to connect to MongoDB`

**Solutions**:
1. Verify MongoDB is running: `mongosh` or `mongo`
2. Check `MONGODB_URI` in `.env` file
3. For Atlas, verify network access and credentials

### JWT Token Issues

**Error**: `Invalid or expired token`

**Solutions**:
1. Verify `JWT_SECRET` is set in `.env`
2. Check token expiration (default: 24 hours)
3. Clear localStorage and login again

### CORS Issues

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions**:
1. Verify `CORS_ORIGINS` includes frontend URL in `.env`
2. Restart backend server after changing `.env`

### Import Errors

**Error**: `ModuleNotFoundError: No module named 'argon2'`

**Solution**:
```bash
pip install -r requirements.txt
```

## Database Collections

The authentication system uses the following MongoDB collection:

### `users` Collection

```json
{
  "_id": "uuid-string",
  "email": "user@example.com",
  "name": "User Name",
  "role": "provider" | "manager",
  "organizationId": "org_...",
  "hashedPassword": "argon2$...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastLoginAt": "2024-01-01T00:00:00.000Z"
}
```

## Security Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use strong JWT secrets** in production
3. **Enable HTTPS** in production
4. **Implement rate limiting** for auth endpoints
5. **Add password complexity requirements** as needed
6. **Consider adding email verification** for production

## Next Steps

After Sprint 1 is complete:
- Sprint 2: Implement audit creation and management
- Sprint 3: Add file upload and processing
- Sprint 4: Implement AI-powered analysis