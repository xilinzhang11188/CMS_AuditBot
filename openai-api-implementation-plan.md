# OpenAI API Implementation Plan

## Current Issue
The analyze feature at http://localhost:3000/audit/new is failing because the OpenAI API key is not properly configured in the backend environment.

## Error Analysis
From the terminal logs, we can see:
```
Unexpected error in OpenAI service: OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.
OpenAI analysis failed: OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.
INFO:     127.0.0.1:56942 - "POST /api/v1/audits/analyze HTTP/1.1" 500 Internal Server Error
```

## Current Environment Configuration
- File: `backend/.env`
- Current value: `OPENAI_API_KEY=your-openai-api-key-here`
- Required value: `OPENAI_API_KEY=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`

## Implementation Steps

### 1. Update Environment Configuration
- **File**: `backend/.env`
- **Action**: Replace the placeholder API key with the actual OpenAI API key
- **Line**: 26
- **Change**: `OPENAI_API_KEY=your-openai-api-key-here` → `OPENAI_API_KEY=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`

### 2. Verify OpenAI Service Configuration
- **File**: `backend/app/services/openai_service.py`
- **Current Logic**: The service checks if the API key equals "your-openai-api-key-here" and raises an error
- **Expected Behavior**: With the real API key, this check should pass and the OpenAI client should initialize properly

### 3. Test Backend Server Restart
- The backend server is running with auto-reload (uvicorn with --reload)
- The server should automatically pick up the new environment variable
- If not, manual restart may be required

### 4. Test Frontend Workflow
- **URL**: http://localhost:3000/audit/new
- **Steps**:
  1. Upload a clinical note or paste text
  2. Select a CCM code (e.g., 99490, 99491, etc.)
  3. Click "Analyze Note"
  4. Verify the analysis completes successfully
  5. Check that the user is redirected to the audit detail page

### 5. Validation Points
- Backend logs should show successful OpenAI API calls
- No more "OpenAI API key not configured" errors
- Analysis results should include:
  - Risk level (low/medium/high)
  - Risk score (0-100)
  - Missing requirements
  - Met requirements
  - Clinical conditions identified

## Technical Details

### OpenAI Service Flow
1. **Input**: Clinical note text, CCM code, requirements
2. **Processing**: 
   - PHI stripping for storage
   - OpenAI API call with original text for better analysis
   - Response validation
   - Risk level calculation
3. **Output**: Structured analysis results

### API Endpoints Involved
- `POST /api/v1/audits/analyze` - Main analysis endpoint
- `POST /api/v1/notes/upload` - File upload for text extraction
- `GET /api/v1/ccm-codes` - CCM code requirements

### Frontend Components
- `frontend/app/audit/new/page.tsx` - Main audit creation page
- `frontend/lib/api.ts` - API client functions
- `frontend/components/file-upload.tsx` - File upload component

## Expected Results
After implementation:
1. ✅ OpenAI API key properly configured
2. ✅ Backend server recognizes the new API key
3. ✅ Analysis requests complete successfully
4. ✅ Users can create audits through the frontend
5. ✅ Audit results are properly stored and displayed

## Risk Mitigation
- Keep the original .env.example file unchanged for future reference
- Ensure the API key is not committed to version control (already in .gitignore)
- Test with a sample clinical note to verify full workflow