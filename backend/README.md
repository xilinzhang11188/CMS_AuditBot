# Auditbot Backend API

FastAPI backend for the Auditbot healthcare audit management system.

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
└── app/
    ├── __init__.py        # Package initialization
    ├── config.py          # Configuration management
    └── database.py        # MongoDB connection manager
```

## Setup Instructions

### Prerequisites

- Python 3.13+
- MongoDB (local installation or MongoDB Atlas)

### Installation Steps

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv .venv
   ```

3. **Activate the virtual environment:**
   - Windows:
     ```bash
     .venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source .venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the values as needed:
   - `MONGODB_URI`: Your MongoDB connection string
   - `CORS_ORIGINS`: Frontend URL (default: http://localhost:3000)
   - `PORT`: Backend server port (default: 8000)

6. **Ensure MongoDB is running:**
   - For local MongoDB: Start the MongoDB service
   - For MongoDB Atlas: Ensure your connection string is correct in `.env`

## Database Seeding

Before running the application for the first time, you need to seed the database with CCM codes reference data:

```bash
python -m app.seed_data
```

This script will:
- Connect to your MongoDB database
- Insert 6 CCM billing codes (99490, 99439, 99491, 99437, 99487, 99489)
- Skip codes that already exist (idempotent operation)
- Verify all codes were inserted successfully

**Note:** The seed script is idempotent, so you can run it multiple times safely. It will only insert codes that don't already exist.

## Running the Application

### Development Mode (with auto-reload):
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

## Testing the Setup

### 1. Test Root Endpoint
```bash
curl http://localhost:8000/
```

Expected response:
```json
{
  "message": "Auditbot API",
  "version": "1.0.0",
  "environment": "development"
}
```

### 2. Test Health Check Endpoint
```bash
curl http://localhost:8000/healthz
```

Expected response (when MongoDB is connected):
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-12-21T19:30:00.000Z",
  "environment": "development"
}
```

Expected response (when MongoDB is disconnected):
```json
{
  "status": "error",
  "database": "disconnected",
  "timestamp": "2025-12-21T19:30:00.000Z",
  "error": "connection error details"
}
```

### 3. View API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Features Implemented

### Sprint 0: Project Setup
✅ FastAPI project structure with modular organization
✅ MongoDB connection using Motor (async driver)
✅ Environment-based configuration with Pydantic Settings
✅ CORS middleware configured for frontend integration
✅ `/healthz` endpoint with database connectivity check
✅ Automatic API documentation (Swagger/ReDoc)
✅ Python 3.13 compatible
✅ Pydantic v2 support

### Sprint 1: Authentication & User Management
✅ User registration endpoint (`POST /api/v1/auth/signup`)
✅ User login endpoint (`POST /api/v1/auth/login`)
✅ JWT token authentication with Argon2 password hashing
✅ User profile endpoint (`GET /api/v1/auth/me`)
✅ User models with Pydantic v2
✅ Organization-based user management

### Sprint 2: CCM Codes Reference Data
✅ CCM Code Pydantic model
✅ Database seed script for 6 CCM billing codes
✅ GET endpoint for CCM codes (`GET /api/v1/ccm-codes`)
✅ Authentication-protected CCM codes endpoint
✅ Frontend integration to fetch codes from backend

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user profile

### CCM Codes
- `GET /api/v1/ccm-codes` - Get all CCM billing codes (requires authentication)

## Next Steps

Proceed to Sprint 3: File Upload & Text Extraction
1. Implement file upload endpoint
2. Add text extraction for PDF and DOCX files
3. Store clinical notes temporarily in MongoDB

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running: `mongosh` or check MongoDB service status
- Check `MONGODB_URI` in `.env` file
- For MongoDB Atlas: Ensure IP whitelist includes your IP address

### Port Already in Use
- Change the `PORT` value in `.env` file
- Or kill the process using port 8000

### Import Errors
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`