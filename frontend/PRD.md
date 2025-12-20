# PRODUCT REQUIREMENTS DOCUMENT

## EXECUTIVE SUMMARY

**Product Name:** CMS Auto-Auditor

**Product Vision:** A web-based clinical documentation audit tool that helps healthcare providers identify missing CMS requirements in their chronic care management documentation before official audits occur, reducing the risk of costly clawbacks.

**Core Purpose:** Healthcare organizations lose significant revenue to CMS clawbacks when clinical documentation lacks required "medical necessity" keywords and elements. Providers often scramble to prepare documentation only when audits are announced, discovering gaps too late. This tool proactively analyzes clinical notes against CMS Local Coverage Determination (LCD) requirements, flagging high-risk documentation before submission.

**Target Users:** Healthcare providers, clinical documentation specialists, billing compliance officers, and practice managers who handle chronic care management (CCM) billing and need to ensure documentation meets CMS audit standards.

**Key MVP Features:**
- Clinical Note Upload & Analysis - User-Generated Content
- CCM Code Selection & Validation - Configuration
- Audit Risk Assessment - System Data
- Missing Requirements Detection - System Data
- Audit History & Comparison - User-Generated Content (PHI-stripped)

**Platform:** Web application (responsive, accessible via browser on desktop, tablet, and mobile devices)

**Complexity Assessment:** Simple
- State Management: Backend with localStorage cache for session data
- External Integrations: OpenAI API for natural language processing and requirement extraction (simple HTTP calls)
- Business Logic: Simple - rule-based matching against predefined CMS LCD requirements for six CCM codes

**MVP Success Criteria:**
- Users upload clinical notes and receive audit risk assessment within 30 seconds
- System accurately identifies missing CMS requirements for all six CCM codes
- Users can review audit history and compare past assessments
- All PHI is stripped from stored audit records
- Responsive interface works on desktop and tablet devices

---

## 1. USERS & PERSONAS

**Primary Persona:**
- **Name:** "Dr. Sarah Chen, Primary Care Physician"
- **Context:** Manages 150+ patients with chronic conditions, bills CCM codes monthly, recently experienced a $45,000 clawback due to insufficient documentation of medical necessity. Spends 2-3 hours weekly reviewing documentation before billing submission.
- **Goals:** Ensure all CCM documentation meets CMS requirements before billing, reduce clawback risk, streamline documentation review process, maintain compliance without hiring additional staff.
- **Pain Points:** Unclear which specific keywords/elements CMS auditors look for, time-consuming manual review of notes, discovering documentation gaps after billing submission, fear of future audits, lack of real-time feedback during documentation.

**Secondary Persona:**
- **Name:** "Maria Rodriguez, Billing Compliance Manager"
- **Context:** Oversees billing compliance for a 12-provider practice, responsible for audit preparation and response. Reviews 200+ clinical notes monthly before claim submission.
- **Goals:** Standardize documentation quality across providers, create audit trail of compliance checks, reduce claim denials and clawbacks.
- **Pain Points:** Inconsistent documentation quality between providers, manual tracking of which notes have been reviewed, no systematic way to identify high-risk documentation patterns.

---

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 Core MVP Features (Priority 0)

**FR-001: Clinical Note Upload & Processing**
- **Description:** Users upload clinical notes in text, Word (.doc/.docx), or PDF format for automated analysis
- **Entity Type:** User-Generated Content
- **Operations:** Create (upload), View (uploaded note content), Delete (remove note), List (see all uploaded notes), Export (download original file)
- **Key Rules:** Max file size 10MB, text extraction from Word/PDF, uploaded notes stored temporarily during analysis session
- **Acceptance:** Users upload a clinical note file, system extracts text content, displays extracted text for review, and stores note for analysis

**FR-002: CCM Code Selection**
- **Description:** Users select which CCM billing code they intend to use for the clinical note being analyzed
- **Entity Type:** Configuration
- **Operations:** View (available codes with descriptions), Select (choose one code per analysis)
- **Key Rules:** Must select from six supported codes (99490, 99439, 99491, 99437, 99487, 99489), one code per audit analysis
- **Acceptance:** Users see list of six CCM codes with time requirements, select appropriate code, system associates code with uploaded note for analysis

**FR-003: Audit Risk Assessment**
- **Description:** AI analyzes clinical note against CMS LCD requirements for selected CCM code and generates risk score
- **Entity Type:** System Data
- **Operations:** Create (generate assessment), View (see risk score and analysis), Export (download assessment report)
- **Key Rules:** Risk levels: High (missing 3+ requirements), Medium (missing 1-2), Low (all requirements met), analysis completes within 30 seconds
- **Acceptance:** Users receive audit risk level (High/Medium/Low), see percentage of requirements met, view detailed breakdown of findings

**FR-004: Missing Requirements Detection**
- **Description:** System identifies and highlights specific CMS requirements missing from clinical note with explanatory guidance
- **Entity Type:** System Data
- **Operations:** View (see missing requirements list), View (see requirement explanations), Export (download findings)
- **Key Rules:** Each missing requirement shows: requirement name, why it's needed for selected code, example compliant language, location in note where it should appear
- **Acceptance:** Users see clear list of missing requirements, understand what each requirement means, receive actionable guidance on how to address gaps

**FR-005: Audit History & Comparison**
- **Description:** System stores PHI-stripped audit records for future review and pattern analysis
- **Entity Type:** User-Generated Content (PHI-stripped)
- **Operations:** Create (save audit record), View (see past audits), List (browse audit history), Search (find specific audits), Delete (remove audit record), Export (download history)
- **Key Rules:** All PHI automatically stripped before storage, retain clinical condition/diagnosis info, store: date, CCM code, risk level, missing requirements, no patient identifiers
- **Acceptance:** Users access history of past audits, compare risk scores over time, identify recurring documentation gaps, filter by date/code/risk level

**FR-006: User Authentication & Account Management**
- **Description:** Secure user registration, login, profile management, and session handling
- **Entity Type:** System/Configuration
- **Operations:** Register (create account), Login (authenticate), View (see profile), Edit (update profile/password), Logout (end session)
- **Key Rules:** Email-based authentication, secure password storage, session persistence across browser tabs, automatic logout after 60 minutes inactivity
- **Acceptance:** Users create account with email/password, login securely, manage profile settings, maintain session while actively using application

---

## 3. USER WORKFLOWS

### 3.1 Primary Workflow: Clinical Note Audit Analysis

**Trigger:** User needs to verify clinical note meets CMS requirements before billing submission
**Outcome:** User receives detailed audit risk assessment with specific missing requirements and actionable guidance

**Steps:**
1. User logs into application and navigates to "New Audit" page
2. User uploads clinical note file (text/Word/PDF) and system extracts text content for review
3. User selects appropriate CCM billing code (e.g., 99490) from dropdown list
4. User clicks "Analyze Note" and system sends note text + selected code to AI for processing
5. System displays audit risk level (High/Medium/Low), percentage score, and detailed list of missing requirements with explanations
6. User reviews findings, exports assessment report, and system saves PHI-stripped audit record to history
7. User either uploads another note for analysis or navigates to audit history to review past assessments

### 3.2 Key Supporting Workflows

**Upload Clinical Note:** User clicks "Upload Note" → selects file from device → system extracts text → displays extracted content for confirmation → user proceeds to code selection

**Select CCM Code:** User views list of six CCM codes with time/complexity descriptions → clicks appropriate code → system highlights associated CMS requirements → user proceeds to analysis

**View Audit History:** User navigates to "History" page → sees list of past audits with date/code/risk level → clicks audit to view full details → can export or delete individual records

**Export Assessment Report:** User clicks "Export" on completed audit → system generates PDF with risk score, missing requirements, and recommendations → downloads to user's device

**Compare Audits:** User selects 2-3 past audits from history → clicks "Compare" → system displays side-by-side view of risk scores and requirement gaps → identifies improvement trends

---

## 4. BUSINESS RULES

### 4.1 Entity Lifecycle Rules

| Entity | Type | Who Creates | Who Edits | Who Deletes | Delete Action |
|--------|------|-------------|-----------|-------------|---------------|
| Clinical Note Upload | User-Generated | All users | None | Owner | Hard delete after analysis |
| Audit Assessment | System Data | System (AI) | None | None | Not allowed |
| Audit History Record | User-Generated (PHI-stripped) | System | None | Owner | Soft delete (30-day retention) |
| CCM Code Selection | Configuration | User | User | System | Cleared after analysis |
| User Account | System | User | Owner | Owner | Hard delete with 30-day warning |

### 4.2 Data Validation Rules

| Entity | Required Fields | Key Constraints |
|--------|-----------------|-----------------|
| Clinical Note Upload | file, uploadedBy, uploadDate | Max 10MB, formats: .txt/.doc/.docx/.pdf, text extractable |
| CCM Code Selection | codeId, userId, noteId | Must be one of six supported codes, one per analysis |
| Audit Assessment | noteId, codeId, riskLevel, missingRequirements | Risk level: High/Medium/Low, analysis time <30s |
| Audit History Record | auditDate, codeId, riskLevel, clinicalConditions | No PHI fields, clinical conditions only, userId required |
| User Account | email, password, name | Valid email format, password min 8 chars, unique email |

### 4.3 Access & Process Rules
- Users can only view/edit/delete their own clinical notes and audit records
- Uploaded clinical notes are automatically deleted after audit analysis completes (not stored long-term)
- PHI stripping is automatic and mandatory before saving to audit history - no user override
- Audit assessments are immutable once generated - users cannot edit AI findings
- Free tier users limited to 20 audits per month, 50 audit history records stored
- System retains soft-deleted audit records for 30 days before permanent deletion
- Users must select CCM code before analysis can proceed - no default code assumption

---

## 5. DATA REQUIREMENTS

### 5.1 Core Entities

**User**
- **Type:** System/Configuration | **Storage:** Backend database
- **Key Fields:** id, email, passwordHash, name, organizationName, role, createdAt, lastLoginAt, auditQuotaUsed, auditQuotaLimit
- **Relationships:** has many ClinicalNoteUploads, has many AuditHistoryRecords
- **Lifecycle:** Full CRUD with account export and deletion (30-day warning period)

**ClinicalNoteUpload**
- **Type:** User-Generated Content | **Storage:** Backend (temporary) + file storage
- **Key Fields:** id, userId, fileName, fileType, fileSize, uploadedAt, extractedText, status (processing/completed/failed)
- **Relationships:** belongs to User, has one AuditAssessment
- **Lifecycle:** Create (upload), View (see content), Delete (remove) - automatically deleted after analysis completes

**CCMCode**
- **Type:** Configuration | **Storage:** Backend database (static reference data)
- **Key Fields:** id, codeNumber (e.g., "99490"), description, timeRequirement, complexityLevel, cmsRequirements (JSON array)
- **Relationships:** has many AuditAssessments
- **Lifecycle:** View only (system-managed, no user modifications)

**AuditAssessment**
- **Type:** System Data | **Storage:** Backend database
- **Key Fields:** id, noteId, userId, codeId, riskLevel, riskScore, missingRequirements (JSON array), metRequirements (JSON array), analysisCompletedAt, aiModelVersion
- **Relationships:** belongs to User, belongs to ClinicalNoteUpload, belongs to CCMCode
- **Lifecycle:** Create (AI generates), View (see results), Export (download report) - immutable after creation

**AuditHistoryRecord**
- **Type:** User-Generated Content (PHI-stripped) | **Storage:** Backend database
- **Key Fields:** id, userId, auditDate, codeId, riskLevel, riskScore, clinicalConditions (array), missingRequirementsSummary, deletedAt (soft delete)
- **Relationships:** belongs to User, references CCMCode
- **Lifecycle:** Create (auto-saved after analysis), View, List, Search, Delete (soft delete with 30-day retention), Export

**MissingRequirement**
- **Type:** System Data | **Storage:** Embedded in AuditAssessment JSON
- **Key Fields:** requirementId, requirementName, requirementDescription, exampleLanguage, severity (critical/important/recommended)
- **Relationships:** part of AuditAssessment
- **Lifecycle:** View only (generated by AI, immutable)

### 5.2 Data Storage Strategy
- **Primary Storage:** Backend PostgreSQL database for all persistent data
- **File Storage:** AWS S3 or similar for uploaded clinical note files (temporary, auto-deleted post-analysis)
- **Cache:** localStorage for active session data (current upload, selected code, in-progress analysis)
- **Capacity:** Backend handles unlimited users, file storage limited to 10MB per upload, localStorage ~5MB for session cache
- **Persistence:** User accounts, audit history, and CCM code reference data persist indefinitely; clinical note uploads deleted after analysis
- **Audit Fields:** All entities include createdAt, updatedAt, createdBy, updatedBy for compliance tracking

---

## 6. INTEGRATION REQUIREMENTS

**OpenAI API (GPT-4 or similar):**
- **Purpose:** Natural language processing to extract clinical information and match against CMS LCD requirements
- **Type:** Frontend-initiated backend API calls
- **Data Exchange:** Sends extracted note text + selected CCM code requirements, Receives structured JSON with risk assessment, missing requirements list, met requirements list
- **Trigger:** When user clicks "Analyze Note" after uploading file and selecting code
- **Error Handling:** If API fails, display user-friendly error message, allow retry, log failure for admin review, do not save incomplete assessment

**File Processing Service (Backend):**
- **Purpose:** Extract text content from uploaded Word and PDF files
- **Type:** Backend service (e.g., Apache Tika, pdf.js, mammoth.js)
- **Data Exchange:** Receives uploaded file binary, Returns plain text content
- **Trigger:** Immediately after file upload
- **Error Handling:** If extraction fails, notify user file format unsupported, suggest converting to plain text, allow re-upload

---

## 7. VIEWS & NAVIGATION

### 7.1 Primary Views

**Dashboard** (`/`) - Quick stats (audits this month, average risk score, quota remaining), recent audit history (last 5), "New Audit" call-to-action button, risk trend chart

**New Audit** (`/audit/new`) - File upload dropzone with format instructions, extracted text preview area, CCM code selector with descriptions, "Analyze Note" button, real-time analysis progress indicator

**Audit Results** (`/audit/:id`) - Risk level badge (High/Medium/Low) with color coding, percentage score, selected CCM code details, missing requirements list with explanations and examples, met requirements checklist, export and save-to-history buttons

**Audit History** (`/history`) - Searchable/filterable table of past audits (date, code, risk level, conditions), sort by date/risk/code, pagination, bulk export option, compare checkbox selection

**Audit Comparison** (`/history/compare`) - Side-by-side view of 2-3 selected audits, risk score trend visualization, common missing requirements across audits, improvement suggestions

**Settings** (`/settings`) - User profile (name, email, organization), password change, audit quota display, data export (download all audit history), account deletion

### 7.2 Navigation Structure

**Main Nav:** Dashboard | New Audit | History | Settings | User Menu (profile, logout)
**Default Landing:** Dashboard (after login) or Marketing page (logged out)
**Mobile:** Hamburger menu with collapsible navigation, responsive tables with horizontal scroll, touch-friendly file upload

---

## 8. MVP SCOPE & CONSTRAINTS

### 8.1 MVP Success Definition

The MVP is successful when:
- ✅ Users upload clinical notes (text/Word/PDF) and receive audit risk assessment within 30 seconds
- ✅ System accurately identifies missing CMS requirements for all six CCM codes (99490, 99439, 99491, 99437, 99487, 99489)
- ✅ Audit history stores PHI-stripped records for future review and comparison
- ✅ All CRUD operations for clinical notes and audit records function correctly
- ✅ Responsive design works on desktop and tablet devices
- ✅ User authentication and session management secure and reliable
- ✅ OpenAI integration processes notes and returns structured findings

### 8.2 In Scope for MVP

Core features included:
- FR-001: Clinical Note Upload & Processing (text, Word, PDF)
- FR-002: CCM Code Selection (six supported codes)
- FR-003: Audit Risk Assessment (High/Medium/Low with percentage score)
- FR-004: Missing Requirements Detection (detailed findings with examples)
- FR-005: Audit History & Comparison (PHI-stripped storage, search, compare)
- FR-006: User Authentication & Account Management

Technical capabilities:
- File upload and text extraction from Word/PDF
- OpenAI API integration for requirement analysis
- PHI stripping algorithm before history storage
- Audit comparison for 2-3 records side-by-side
- Export audit reports as PDF
- Responsive web interface (desktop/tablet)

### 8.3 Technical Constraints

- **Data Storage:** Backend PostgreSQL database for persistent data, AWS S3 for temporary file storage, localStorage for session cache
- **Concurrent Users:** Expected 50-100 concurrent users during peak hours
- **Performance:** File upload <5s for 10MB files, text extraction <10s, AI analysis <30s, page loads <2s
- **Browser Support:** Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile:** Responsive design for tablet (iPad and larger), phone support deferred to V2
- **Offline:** Not supported - requires internet connection for AI analysis
- **File Size Limit:** 10MB maximum per clinical note upload
- **Audit Quota:** Free tier limited to 20 audits per month per user

### 8.4 Known Limitations

**For MVP:**
- Only six CCM codes supported (99490, 99439, 99491, 99437, 99487, 99489) - other billing codes deferred to V2
- No EMR integration - manual file upload only
- PHI stripping is rule-based (removes names, dates, IDs) - may not catch all edge cases
- Audit comparison limited to 2-3 records at a time
- No real-time collaboration - single user per audit analysis
- No mobile phone optimization - tablet and desktop only
- English language clinical notes only
- No batch upload - one note at a time

**Future Enhancements:**
- V2 will add EMR integrations (Epic, Cerner, Athenahealth) for direct note import
- Expand to additional CPT codes beyond CCM (E&M codes, telehealth codes)
- Advanced PHI detection using AI/ML models
- Batch upload and analysis of multiple notes
- Team collaboration features (shared audit history, comments)
- Mobile phone responsive design
- Multi-language support
- Customizable requirement templates for different payers

---

## 9. ASSUMPTIONS & DECISIONS

### 9.1 Platform Decisions
- **Type:** Full-stack web application (React frontend + Node.js backend)
- **Storage:** Backend PostgreSQL database for persistent data, AWS S3 for temporary file storage, localStorage for session cache
- **Auth:** Backend email/password authentication with JWT tokens, session persistence via secure cookies

### 9.2 Entity Lifecycle Decisions

**ClinicalNoteUpload:** Create, View, Delete (auto-deleted after analysis)
- **Reason:** Clinical notes contain PHI and should not be stored long-term for HIPAA compliance; temporary storage only during active analysis session

**AuditAssessment:** Create (AI-generated), View, Export only
- **Reason:** Audit findings are system-generated and immutable to maintain integrity of compliance records; users cannot modify AI analysis results

**AuditHistoryRecord:** Full CRUD + soft delete with 30-day retention
- **Reason:** PHI-stripped records are safe to store long-term for trend analysis; users need ability to review and compare past audits; soft delete allows recovery if accidentally removed

**CCMCode:** View only (system-managed)
- **Reason:** CMS billing codes and requirements are regulatory reference data that should not be user-editable to ensure accuracy

**User:** Full CRUD with 30-day account deletion warning
- **Reason:** Standard user account management with safety period before permanent deletion

### 9.3 Key Assumptions

1. **Users have clinical notes in digital format (text/Word/PDF)**
   - Reasoning: Product idea specified "upload a synthetic clinical note" and mentioned text/Word/PDF formats in clarification; assumes providers already document electronically

2. **Six CCM codes cover majority of chronic care management billing scenarios**
   - Reasoning: User specified these six codes (99490, 99439, 99491, 99437, 99487, 99489) as focus for MVP; assumes these represent most common CCM billing situations for target users

3. **PHI stripping can be rule-based for MVP (names, dates, IDs removed)**
   - Reasoning: User requested "not including the PHI information, only clinical condition etc" for audit history; assumes basic rule-based stripping sufficient for MVP, with AI-enhanced detection in V2

4. **30-second analysis time is acceptable to users**
   - Reasoning: Audit preparation is not time-critical (done before billing submission, not during patient care); users prioritize accuracy over speed; 30s allows thorough AI analysis

5. **Desktop and tablet devices are primary use cases**
   - Reasoning: Clinical documentation review typically happens at workstations or during administrative time, not on mobile phones; defers phone optimization to V2

6. **Users will manually upload notes rather than EMR integration for MVP**
   - Reasoning: User mentioned "for future use, maybe integrate with EMRs" indicating EMR integration is V2 feature; manual upload sufficient to validate core audit functionality

### 9.4 Clarification Q&A Summary

**Q:** How should users input the clinical note for analysis?
**A:** "mostly would be text/word/PDF document uploads, for future use, maybe integrate with EMRs etc"
**Decision:** MVP supports text, Word (.doc/.docx), and PDF file uploads with text extraction; EMR integration deferred to V2

**Q:** Are there specific CPT codes you want to target for this MVP?
**A:** "these are the ones i think we can focus for now 99490, 99439, 99491, 99437, 99487, 99489" [with detailed descriptions]
**Decision:** MVP scope limited to these six CCM codes; system stores code requirements as reference data and matches uploaded notes against selected code's CMS LCD requirements

**Q:** How would you like the "missing requirements" to be displayed?
**A:** "something to highlight, you pick code xxxx which usually require yyyy type of requirements, your note was missing that"
**Decision:** Audit results page displays selected CCM code, lists all required elements for that code, highlights missing requirements with explanations and example compliant language

**Q:** Should the system save a history of past audits?
**A:** "i think it should probably remember the note for future review and compare but not including the PHI information, only clinical condition etc"
**Decision:** System saves PHI-stripped audit history records (clinical conditions, risk scores, missing requirements) for future review and comparison; original clinical notes with PHI are deleted after analysis completes

---

**PRD Complete - Ready for Development**