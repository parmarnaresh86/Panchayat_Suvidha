# Panchayat Suvidha Project - GI Studio Implementation Prompt

## Project Overview
Create a full-stack web application for Panchayat Suvidha (Villages Facilities) that provides information about villages, government services, education, employment, facilities, and includes a page builder and contact system.

## Phase 1: Project Setup & Database Design

### 1.1 Environment Setup
- Initialize full-stack project with:
  - Backend: Node.js with Express.js
  - Frontend: React.js with Vite
  - Database: SQLITE
   Configure environment variables for:
  
  - Database connection (DB_USER, DB_PASSWORD, DB_SERVER, DB_NAME, DB_PORT)
  - JWT_SECRET
  - Admin credentials (ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_REGISTRATION_SECRET)
  - NODE_ENV

### 1.2 Database Schema
Create the following tables:

#### Villages
- id (INT, PK, Auto-increment)
- name (VARCHAR)
- taluka (VARCHAR, nullable)
- district (VARCHAR, nullable)
- state (VARCHAR, nullable)
- area (VARCHAR, nullable)
- total_households (VARCHAR, nullable)
- description (TEXT, nullable)
- history_en (TEXT, nullable)
- history_gu (TEXT, nullable)
- created_at, updated_at (TIMESTAMP)

#### VillageImages
- id (INT, PK, Auto-increment)
- village_id (INT, FK to Villages.id)
- image_url (TEXT)
- created_at, updated_at (TIMESTAMP)

#### Services
- id (VARCHAR(100), PK)
- title (VARCHAR)
- gu_title (VARCHAR, nullable)
- card_to (VARCHAR(500), nullable)
- display_order (INT, default: 0)
- created_at, updated_at (TIMESTAMP)

#### ServiceItems
- id (VARCHAR(100), PK)
- service_id (VARCHAR(100), FK to Services.id)
- label (VARCHAR(500), nullable)
- to_path (VARCHAR(500), nullable)
- department (VARCHAR(500), nullable)
- eligibility (TEXT, nullable)
- description (TEXT, nullable)
- documents (JSON, nullable)
- procedure (TEXT, nullable)
- fees (VARCHAR(500), nullable)
- contact (VARCHAR(500), nullable)
- helpline (VARCHAR(500), nullable)
- official_link (VARCHAR(500), nullable)
- display_order (INT, default: 0)
- created_at, updated_at (TIMESTAMP)

#### EducationModules
- module_id (VARCHAR(100), PK)
- basic_info (JSON)
- map_info (JSON)
- created_at, updated_at (TIMESTAMP)

#### EducationRecords
- id (VARCHAR(100), PK)
- module_id (VARCHAR(100), FK to EducationModules.module_id)
- record_data (JSON)
- created_at, updated_at (TIMESTAMP)

#### EducationAnnouncements
- id (VARCHAR(100), PK)
- module_id (VARCHAR(100), FK to EducationModules.module_id)
- type (VARCHAR(100))
- date (VARCHAR(50))
- message (TEXT)
- created_at, updated_at (TIMESTAMP)

#### EmploymentModules
- module_id (VARCHAR(100), PK)
- basic_info (JSON)
- created_at, updated_at (TIMESTAMP)

#### EmploymentRecords
- id (VARCHAR(100), PK)
- module_id (VARCHAR(100), FK to EmploymentModules.module_id)
- record_type (VARCHAR(100))
- record_data (JSON)
- created_at, updated_at (TIMESTAMP)

#### FacilitiesModules
- module_id (VARCHAR(100), PK)
- basic_info (JSON)
- created_at, updated_at (TIMESTAMP)

#### FacilitiesRecords
- id (VARCHAR(100), PK)
- module_id (VARCHAR(100), FK to FacilitiesModules.module_id)
- record_type (VARCHAR(100))
- record_data (JSON)
- created_at, updated_at (TIMESTAMP)

#### Pages
- id (INT, PK, Auto-increment)
- title (VARCHAR)
- slug (VARCHAR)
- content_json (JSON)
- status (VARCHAR, default: 'draft')
- created_at, updated_at (TIMESTAMP)

#### PageContent
- id (INT, PK, Auto-increment)
- page_name (VARCHAR(100), Unique)
- content_json (JSON)
- updated_at (TIMESTAMP)

#### ContactMessages
- id (INT, PK, Auto-increment)
- name (VARCHAR(200))
- email (VARCHAR(200))
- message (TEXT)
- is_read (BIT, default: 0)
- created_at (TIMESTAMP)

#### Users
- id (INT, PK, Auto-increment)
- username (VARCHAR(255), Unique)
- password (VARCHAR(255))
- email (VARCHAR(255))
- role (VARCHAR(50), default: 'user')
- created_at, updated_at (TIMESTAMP)

#### Achievements
- id (INT, PK, Auto-increment)
- village_id (INT, FK to Villages.id)
- title (VARCHAR)
- awarded_by (VARCHAR)
- created_at, updated_at (TIMESTAMP)

#### SpecialPersonalities
- id (INT, PK, Auto-increment)
- village_id (INT, FK to Villages.id)
- name (VARCHAR)
- achievement (VARCHAR)
- role (VARCHAR)
- photo_url (VARCHAR, nullable)
- created_at, updated_at (TIMESTAMP)

### 1.3 Dependencies Installation
Backend dependencies:
- express
- cors
- dotenv
- mssql (or equivalent SQL client)
- jsonwebtoken
- multer
- fs-extra
- nodemon (dev)

Frontend dependencies:
- react
- react-dom
- vite
- eslint (config)

## Phase 2: Backend API Development

### 2.1 Server Initialization
- Create Express server with middleware:
  - cors()
  - express.json()
  - Static file serving for uploads
- Load environment variables with dotenv
- Initialize database connection pool

### 2.2 Database Initialization Scripts
Create initialization scripts for:
- Users table (if not exists)
- PageContent table (if not exists)
- ContactMessages table (if not exists)

### 2.3 Authentication System
Implement:
- User registration endpoint (/auth/register)
  - Validate username, password, email
  - Handle admin registration with secret key
  - Hash passwords (optional for simplicity)
  - Check for existing usernames
- Login endpoint (/auth/login)
  - Validate credentials
  - Return dummy tokens for admin/user roles
  - Support legacy /login endpoint
- Admin middleware for protected routes

### 2.4 Village Information API
Implement:
- GET /village - Retrieve village information with images, achievements, special personalities
  - Join with VillageImages, Achievements, SpecialPersonalities tables
  - Fallback to dummy data if database is empty
  - Return structured response with history in English/Gujarati
- POST /village/update - Update village information (admin)
- POST /village/upload-image - Upload village images (admin)
- DELETE /village/image/:id - Delete village images (admin)

### 2.5 Census API
Implement:
- GET /census - Retrieve census data for village
  - Fallback to dummy data if empty
- POST /census/add - Add census record (admin)
- POST /census/update - Update census record (admin)
- DELETE /census/:id - Delete census record (admin)

### 2.6 Panchayat Members API
Implement:
- GET /panchayat - Retrieve panchayat members
  - Fallback to dummy data if empty
- POST /panchayat/member/add - Add member (max 3 limit) (admin)
- POST /panchayat/member/update - Update member (admin)
- POST /panchayat/member/upload-photo - Upload member photo (admin)

### 2.7 Services API
Implement:
- GET /services - Retrieve all services with items
- POST /services/update - Replace all services and items (admin)
  - Delete existing services/items
  - Insert new services with display_order
  - Insert new service items with display_order

### 2.8 Education Modules API
Implement:
- GET /education/modules/:moduleId - Retrieve module data
  - Parse JSON fields (basic_info, map_info)
  - Include records and announcements
- POST /education/modules/:moduleId/update - Update module data (admin)
- POST /education/modules/:moduleId/upload-photo - Upload photos for records (admin)
- Special handling for primary-school endpoint transformation

### 2.9 Employment Modules API
Implement:
- GET /employment/modules/:moduleId - Retrieve module data
  - Group records by type
  - Handle special cases (employment-board, market-yard)
- POST /employment/modules/:moduleId/update - Update module data (admin)
- POST /employment/modules/:moduleId/upload-file - Upload files for records (admin)

### 2.10 Facilities Modules API
Implement:
- GET /facilities/modules/:moduleId - Retrieve module data
  - Group records by type
- POST /facilities/modules/:moduleId/update - Update module data (admin)
- POST /facilities/modules/:moduleId/upload-photo - Upload photos (admin)

### 2.11 Page Builder API
Implement:
- GET /pages - Retrieve all pages
- GET /pages/:slug - Retrieve page by slug
  - Parse content_json
- POST /pages - Create new page
- PUT /pages/:id - Update page
- DELETE /pages/:id - Delete page

### 2.12 Live Page Editor API
Implement:
- GET /page-content/:pageName - Retrieve saved layout
- PUT /page-content/:pageName - Save section layout (admin)
  - Use MERGE/UPSERT operation

### 2.13 Contact System API
Implement:
- GET /contact/info - Retrieve contact information (fallback to defaults)
- PUT /contact/info - Update contact information (admin)
- POST /contact/message - Submit contact message
- GET /contact/messages - Retrieve all messages (admin)
- PUT /contact/messages/:id/read - Mark message as read (admin)
- DELETE /contact/messages/:id - Delete message (admin)

### 2.14 File Upload Handling
- Configure multer for file uploads
- Ensure uploads directory exists
- Generate unique filenames (timestamp + originalname)
- Serve uploaded files statically
- Handle file deletion when removing database records

## Phase 3: Frontend Development

### 3.1 Project Structure
- src/
  - components/ - Reusable components
  - pages/ - Page components
  - assets/ - Images, icons
  - hooks/ - Custom React hooks
  - services/ - API service functions
  - utils/ - Utility functions
  - App.css - Main styling
  - main.jsx - Entry point
  - App.jsx - Main app component

### 3.2 Core Components
- Counter component (from CSS)
- Hero section with animated framework/Vite logos
- Next steps section with social icons
- Docs section layout
- Ticks decoration
- Icon components for social media

### 3.3 Pages/Views
- Home/Landing page
- Village information page
- Census data visualization
- Panchayat members display
- Services directory
- Service details page
- Education modules
- Employment modules
- Facilities modules
- Custom pages (from page builder)
- Contact page
- Admin dashboard (for protected routes)

### 3.4 API Integration
- Create service functions for all backend endpoints
- Handle loading states and errors
- Implement data transformation where needed
- Manage authentication state (tokens, user role)

### 3.5 Admin Functionality
- Protected routes for admin-only features
- Forms for creating/updating:
  - Village information
  - Census data
  - Panchayat members
  - Services and service items
  - Education/employment/facilities modules
  - Page builder
  - Contact information
- File upload components for images/documents

### 3.6 Styling
- Implement CSS from provided App.css
- Create responsive design for mobile (max-width: 1024px)
- Use CSS variables for theming
- Implement hover/focus states
- Create layout structures (flexbox/grid)

## Phase 4: Testing & Deployment

### 4.1 API Testing
- Test all endpoints with various scenarios:
  - Empty database (fallback to dummy data)
  - Normal operation with data
  - Error conditions
  - Validation checks
  - Authentication requirements

### 4.2 Frontend Testing
- Test component rendering
- Test API integration
- Test form submissions
- Test file uploads
- Test navigation and routing

### 4.3 Deployment Preparation
- Create build scripts for frontend
- Configure production environment variables
- Prepare database seeding scripts (if needed)
- Create deployment documentation

## Phase 5: Optional Enhancements

### 5.1 Real Authentication
- Implement proper JWT authentication
- Add password hashing (bcrypt)
- Add refresh token mechanism

### 5.2 Advanced Features
- Search functionality across modules
- Data export/import capabilities
- Multilingual support (English/Gujarati toggling)
- Analytics dashboard
- Notification system

### 5.3 Performance Optimizations
- Database indexing
- API response caching
- Frontend code splitting
- Image optimization

## Implementation Notes

### Data Flow Principles
1. All admin-modifiable data stored in database with fallback to hardcoded dummy data
2. RESTful API design with consistent response formats
3. Proper error handling with meaningful messages
4. File uploads stored in filesystem with references in database
5. JSON fields used for flexible data structures (modules, page content)
6. Display ordering for lists (services, service items, etc.)

### Security Considerations
- Admin-protected routes for data modification
- Input validation on all endpoints
- File upload validation (types, sizes)
- SQL injection prevention through parameterized queries
- CORS configuration for frontend access

### Scalability Considerations
- Modular API design
- Database indexing strategy
- Pagination for large datasets (if needed)
- CDN-ready static file serving

## Completion Criteria
The implemented system should:
1. Serve village information with fallback to sample data
2. Allow admin users to update all configurable data
3. Provide public APIs for frontend consumption
4. Handle file uploads and storage properly
5. Support the page builder functionality
6. Include contact form submission and admin management
7. Work with the provided frontend styling and structure