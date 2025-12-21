
### Tasks

#### Task 1: Create audit comparison endpoint
- Create `GET /api/v1/audits/compare` in `app/routers/audits.py`
- Accept query param: `ids` (comma-separated audit IDs)
- Validate max 3 audits
- Verify user owns all audits
- Return array of audit objects
- **Manual Test Step:** Select 2 audits in history, click Compare → see side-by-side view
- **User Test Prompt:** "In /history, select 2-3 audits using checkboxes, click Compare, and verify you see them side-by-side."

#### Task 2: Update frontend to call comparison API
- Replace localStorage comparison with API call
- Pass selected audit IDs as query params
- Display results in comparison view
- **Manual Test Step:** Compare audits → see risk scores, conditions, missing requirements for each
- **User Test Prompt:** "Compare multiple audits and verify all details (risk scores, conditions, missing requirements) are displayed correctly."

### Definition of Done
- Users can compare 2-3 audits
- Comparison shows all relevant details side-by-side
- Frontend fetches comparison data from backend

### Post-Sprint
- Commit all changes
- Push to `main` branch

---

## 🧱 S7 – MANAGEMENT DASHBOARD (ORGANIZATION-WIDE AUDITS)

### Objectives
- Managers can view all providers in their organization
- Managers can view all audits across organization
- Managers can filter by provider, risk level, date range
- Managers can view individual provider details

### User Stories
- As a manager, I can see all providers in my organization
- As a manager, I can view all audits across all providers
- As a manager, I can filter audits by provider and risk level
- As a manager, I can view a specific provider's audit history

### Endpoints
- `GET /api/v1/management/providers`
- `GET /api/v1/management/audits`
- `GET /api/v1/management/provider/:id`

### Tasks

#### Task 1: Create role-based middleware
- Create `app/middleware/role_check.py`
- Decorator to check if user has manager role
- Return 403 if user is not a manager
- **Manual Test Step:** Provider tries to access management endpoint → 403 error
- **User Test Prompt:** "Log in as a provider and try to access /management. Verify you're blocked or redirected."

#### Task 2: Create providers list endpoint
- Create `GET /api/v1/management/providers` in `app/routers/management.py`
- Fetch all users with same `organizationId` as current manager
- Calculate stats for each provider (audit count, avg risk score, high risk count)
- Require manager role
- **Manual Test Step:** Manager views dashboard → sees list of providers with stats
- **User Test Prompt:** "Log in as a manager and verify you see all providers in your organization with their statistics."

#### Task 3: Create organization-wide audits endpoint
- Create `GET /api/v1/management/audits`
- Fetch all audits for users in same organization
- Support filters: `providerId`, `riskLevel`, `startDate`, `endDate`, `page`, `limit`
- Include provider name in each audit
- Require manager role
- **Manual Test Step:** Manager clicks "All Audits" → sees audits from all providers
- **User Test Prompt:** "As a manager, click 'All Audit History' and verify you see audits from all providers in your organization."

#### Task 4: Create provider detail endpoint
- Create `GET /api/v1/management/provider/:id`
- Fetch provider details and their audits
- Calculate provider stats (total audits, avg score, high risk count)
- Verify provider is in same organization
- Require manager role
- **Manual Test Step:** Manager clicks provider name → sees provider's audit history
- **User Test Prompt:** "Click on a provider's name and verify you see their detailed audit history and statistics."

#### Task 5: Update frontend management pages
- Replace mock data with API calls
- Fetch providers on dashboard load
- Fetch audits with filters on all-audits page
- Fetch provider details on provider page
- **Manual Test Step:** All management pages show real data from backend
- **User Test Prompt:** "Navigate through all management pages and verify all data is loaded from the backend (check Network tab)."

### Definition of Done
- Managers can view all providers in organization
- Managers can view all audits with filters
- Managers can view individual provider details
- Role-based access control enforced

### Post-Sprint
- Commit all changes
- Push to `main` branch

---

## 🧱 S8 – USER SETTINGS & PROFILE MANAGEMENT

### Objectives
- Users can view their profile
- Users can update name and email
- Users can change password
- Users can see audit quota usage

### User Stories
- As a user, I can view my profile information
- As a user, I can update my name and email
- As a user, I can change my password
- As a user, I can see my audit quota usage

### Endpoints
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `PATCH /api/v1/users/me/password`

### Tasks

#### Task 1: Create user profile endpoint
- Create `GET /api/v1/users/me` in `app/routers/users.py`
- Return current user's profile (exclude password)
- Include audit quota usage
- **Manual Test Step:** Navigate to /settings → see profile information
- **User Test Prompt:** "Go to /settings and verify your profile information is displayed correctly."

#### Task 2: Create profile update endpoint
- Create `PATCH /api/v1/users/me`
- Accept: `{ "name": str, "email": str }`
- Validate email uniqueness if changed
- Update user in MongoDB
- Return updated user object
- **Manual Test Step:** Update name → success message, name updated
- **User Test Prompt:** "Update your name in settings and verify the change is saved (refresh the page to confirm)."

#### Task 3: Create password change endpoint
- Create `PATCH /api/v1/users/me/password`
- Accept: `{ "currentPassword": str, "newPassword": str }`
- Verify current password matches
- Hash new password with Argon2
- Update password in MongoDB
- **Manual Test Step:** Change password → success message, can log in with new password
- **User Test Prompt:** "Change your password, log out, and verify you can log in with the new password."

#### Task 4: Update frontend settings page
- Replace mock data with API calls
- Fetch user profile on page load
- Implement profile update form
- Implement password change form
- Show audit quota usage
- **Manual Test Step:** All settings features work with real backend
- **User Test Prompt:** "Test all settings features: view profile, update name, change password. Verify all changes are persisted."

### Definition of Done
- Users can view their profile
- Users can update name and email
- Users can change password
- Audit quota displayed correctly

### Post-Sprint
- Commit all changes
- Push to `main` branch

---

## ✅ FINAL CHECKLIST

### Backend Completeness
- [ ] All endpoints implemented and tested
- [ ] MongoDB Atlas connected and collections created
- [ ] JWT authentication working
- [ ] OpenAI integration functional
- [ ] PHI stripping working correctly
- [ ] Role-based access control enforced
- [ ] File upload and text extraction working
- [ ] Audit quota tracking functional
- [ ] Error handling implemented
- [ ] CORS configured correctly

### Frontend Integration
- [ ] All API calls updated to use backend
- [ ] Authentication flow working end-to-end
- [ ] File upload working
- [ ] Audit analysis working
- [ ] Audit history working
- [ ] Audit comparison working
- [ ] Management dashboard working (for managers)
- [ ] Settings page working
- [ ] No CORS errors
- [ ] No console errors

### Testing & Quality
- [ ] All manual tests passed
- [ ] No critical bugs
- [ ] Performance acceptable (analysis < 30s)
- [ ] PHI properly stripped
- [ ] Quota limits enforced
- [ ] Role-based routing working

### Deployment Readiness
- [ ] `.env.example` documented
- [ ] `.gitignore` configured
- [ ] All code committed to `main`
- [ ] README with setup instructions
- [ ] MongoDB Atlas connection string configured
- [ ] OpenAI API key configured

---

## 📋 APPENDIX: QUICK REFERENCE

### Project Structure
```
backend/
├── main.py                 # FastAPI entry point
├── .env                    # Environment variables (not committed)
├── .env.example            # Example env vars
├── .gitignore              # Git ignore rules
├── requirements.txt        # Python dependencies
├── app/
│   ├── __init__.py
│   ├── config.py           # Configuration management
│   ├── database.py         # MongoDB connection
│   ├── models/
│   │   ├── user.py         # User Pydantic model
│   │   ├── ccm_code.py     # CCM Code model
│   │   ├── audit.py        # Audit model
│   │   └── clinical_note.py # Clinical Note model
│   ├── routers/
│   │   ├── auth.py         # Authentication routes
│   │   ├── ccm_codes.py    # CCM codes routes
│   │   ├── notes.py        # File upload routes
│   │   ├── audits.py       # Audit routes
│   │   ├── management.py   # Management routes
│   │   └── users.py        # User settings routes
│   ├── services/
│   │   ├── openai_service.py    # OpenAI integration
│   │   ├── phi_stripper.py      # PHI removal
│   │   └── text_extractor.py    # File text extraction
│   ├── middleware/
│   │   ├── auth.py         # JWT verification
│   │   └── role_check.py   # Role-based access
│   └── seed_data.py        # Database seeding script
```

### Key Dependencies
```txt
fastapi==0.109.0
uvicorn==0.27.0
motor==3.3.2              # Async MongoDB driver
pydantic==2.5.3
pydantic-settings==2.1.0
python-jose[cryptography]  # JWT
argon2-cffi               # Password hashing
python-multipart          # File uploads
python-docx               # Word extraction
PyPDF2                    # PDF extraction
openai==1.10.0
python-dotenv
```

### MongoDB Collections Summary
- **users:** User accounts with auth and quota
- **ccm_codes:** Reference data (6 codes)
- **clinical_notes:** Temporary file storage (auto-deleted)
- **audits:** Audit results with PHI-stripped data

### API Base Path
- All endpoints: `/api/v1/*`
- Health check: `/healthz`

### Authentication Flow
1. User registers/logs in → receives JWT token
2. Frontend stores token in localStorage
3. All API requests include: `Authorization: Bearer <token>`
4. Backend verifies token and attaches user to request
5. Protected routes check for valid user

### Testing Workflow
1. Start backend: `python main.py`
2. Start frontend: `cd frontend && npm run dev`
3. Execute test prompt in browser
4. Verify expected result
5. Fix any issues immediately
6. Commit and push after all tests pass

---

**END OF BACKEND DEVELOPMENT PLAN**