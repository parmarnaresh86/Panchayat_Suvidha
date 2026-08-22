# Laravel Migration Plan - PanchayatSuvidha Backend

## Overview
This document outlines the complete migration strategy from Node.js/Express + MSSQL to PHP Laravel + MySQL while maintaining the React frontend and database schema.

## Migration Strategy

### Phase 1: Laravel Project Setup
1. Create new Laravel 11 project
2. Configure MySQL database connection
3. Set up CORS for React frontend (port 5173)
4. Configure file upload storage

### Phase 2: Database Migration
1. Convert MSSQL schema to MySQL
2. Create Laravel migrations matching existing schema
3. Create Eloquent models for all tables
4. Set up relationships between models

### Phase 3: API Development
1. Implement authentication (Laravel Sanctum)
2. Create controllers for all endpoints
3. Define API routes (maintain exact same endpoints)
4. Implement middleware for admin protection

### Phase 4: Frontend Integration
1. Update API base URL to Laravel backend
2. Test all API endpoints
3. Verify file uploads work correctly

## Database Schema Conversion

### Key Changes from MSSQL to MySQL:
- `NVARCHAR(MAX)` → `TEXT` or `LONGTEXT`
- `NVARCHAR(n)` → `VARCHAR(n)`
- `IDENTITY(1,1)` → `AUTO_INCREMENT`
- `BIT` → `BOOLEAN` or `TINYINT(1)`
- `GETDATE()` → `CURRENT_TIMESTAMP`
- Remove `TOP 1` → Use `LIMIT 1`

### Tables to Migrate:
1. **Village** - Main village information
2. **VillageImages** - Village gallery images
3. **Census** - Population census data
4. **PanchayatMembers** - Panchayat member details (max 3)
5. **Achievements** - Village achievements
6. **SpecialPersonalities** - Notable persons
7. **Users** - Authentication (admin/user)
8. **Services** - Service categories
9. **ServiceItems** - Individual service items
10. **EducationModules** - Education module metadata
11. **EducationRecords** - Education staff/records (JSON)
12. **EducationAnnouncements** - Education announcements
13. **EmploymentModules** - Employment module metadata
14. **EmploymentRecords** - Employment records (JSON)
15. **FacilitiesModules** - Facilities module metadata
16. **FacilitiesRecords** - Facilities records (JSON)
17. **Pages** - Page builder pages
18. **PageContent** - Live page editor content
19. **ContactMessages** - Contact form submissions

## API Endpoints Mapping

### Public Endpoints (No Auth Required)
| Method | Node.js Endpoint | Laravel Route | Controller Method |
|--------|------------------|---------------|-------------------|
| GET | `/village` | `api/village` | `VillageController@show` |
| GET | `/census` | `api/census` | `CensusController@index` |
| GET | `/panchayat` | `api/panchayat` | `PanchayatController@index` |
| GET | `/services` | `api/services` | `ServiceController@index` |
| GET | `/education/modules/:moduleId` | `api/education/modules/{moduleId}` | `EducationModuleController@show` |
| GET | `/employment/modules/:moduleId` | `api/employment/modules/{moduleId}` | `EmploymentModuleController@show` |
| GET | `/facilities/modules/:moduleId` | `api/facilities/modules/{moduleId}` | `FacilitiesModuleController@show` |
| GET | `/education/primary-school` | `api/education/primary-school` | `EducationModuleController@primarySchool` |
| GET | `/pages` | `api/pages` | `PageController@index` |
| GET | `/pages/:slug` | `api/pages/{slug}` | `PageController@show` |
| GET | `/page-content/:pageName` | `api/page-content/{pageName}` | `PageContentController@show` |
| GET | `/contact/info` | `api/contact/info` | `ContactController@info` |
| POST | `/contact/message` | `api/contact/message` | `ContactController@submitMessage` |

### Auth Endpoints
| Method | Node.js Endpoint | Laravel Route | Controller Method |
|--------|------------------|---------------|-------------------|
| POST | `/auth/register` | `api/auth/register` | `AuthController@register` |
| POST | `/auth/login` | `api/auth/login` | `AuthController@login` |
| POST | `/login` | `api/login` | `AuthController@legacyLogin` |

### Admin Endpoints (Auth Required)
| Method | Node.js Endpoint | Laravel Route | Controller Method |
|--------|------------------|---------------|-------------------|
| POST | `/village/update` | `api/village/update` | `VillageController@update` |
| POST | `/village/upload-image` | `api/village/upload-image` | `VillageController@uploadImage` |
| DELETE | `/village/image/:id` | `api/village/image/{id}` | `VillageController@deleteImage` |
| POST | `/panchayat/member/add` | `api/panchayat/member/add` | `PanchayatController@addMember` |
| POST | `/panchayat/member/update` | `api/panchayat/member/update` | `PanchayatController@updateMember` |
| POST | `/panchayat/member/upload-photo` | `api/panchayat/member/upload-photo` | `PanchayatController@uploadPhoto` |
| POST | `/census/add` | `api/census/add` | `CensusController@store` |
| POST | `/census/update` | `api/census/update` | `CensusController@update` |
| DELETE | `/census/:id` | `api/census/{id}` | `CensusController@destroy` |
| POST | `/services/update` | `api/services/update` | `ServiceController@update` |
| POST | `/education/modules/:moduleId/update` | `api/education/modules/{moduleId}/update` | `EducationModuleController@update` |
| POST | `/education/modules/:moduleId/upload-photo` | `api/education/modules/{moduleId}/upload-photo` | `EducationModuleController@uploadPhoto` |
| POST | `/employment/modules/:moduleId/update` | `api/employment/modules/{moduleId}/update` | `EmploymentModuleController@update` |
| POST | `/employment/modules/:moduleId/upload-file` | `api/employment/modules/{moduleId}/upload-file` | `EmploymentModuleController@uploadFile` |
| POST | `/facilities/modules/:moduleId/update` | `api/facilities/modules/{moduleId}/update` | `FacilitiesModuleController@update` |
| POST | `/education/primary-school/update` | `api/education/primary-school/update` | `EducationModuleController@updatePrimarySchool` |
| POST | `/education/primary-school/upload-photo` | `api/education/primary-school/upload-photo` | `EducationModuleController@uploadPrimarySchoolPhoto` |
| POST | `/pages` | `api/pages` | `PageController@store` |
| PUT | `/pages/:id` | `api/pages/{id}` | `PageController@update` |
| DELETE | `/pages/:id` | `api/pages/{id}` | `PageController@destroy` |
| PUT | `/page-content/:pageName` | `api/page-content/{pageName}` | `PageContentController@update` |
| PUT | `/contact/info` | `api/contact/info` | `ContactController@updateInfo` |
| GET | `/contact/messages` | `api/contact/messages` | `ContactController@messages` |
| PUT | `/contact/messages/:id/read` | `api/contact/messages/{id}/read` | `ContactController@markAsRead` |
| DELETE | `/contact/messages/:id` | `api/contact/messages/{id}` | `ContactController@deleteMessage` |

## Authentication Strategy

### Current (Node.js):
- Dummy JWT tokens (`admin-dummy-token`, `user-dummy-token`)
- Plain text password storage
- Environment-based admin credentials
- Role-based access (admin/user)

### Laravel Implementation:
- **Laravel Sanctum** for API token authentication
- **Bcrypt** password hashing
- Token-based authentication
- Middleware for admin route protection
- Maintain same response format for frontend compatibility

## File Upload Strategy

### Current (Node.js):
- Multer middleware
- Files stored in `backend/uploads/`
- Served statically via Express
- URLs: `http://localhost:5000/uploads/{filename}`

### Laravel Implementation:
- Use Laravel's built-in file upload
- Store in `storage/app/public/uploads/`
- Create symbolic link: `php artisan storage:link`
- URLs: `http://localhost:8000/storage/uploads/{filename}`
- **Frontend Change Required**: Update base URL from port 5000 to 8000

## Environment Variables

### Node.js (.env):
```
DB_USER=sa
DB_PASSWORD=yourpassword
DB_SERVER=localhost
DB_NAME=PanchayatDB
DB_PORT=1433
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
ADMIN_REGISTRATION_SECRET=admin-secret
PORT=5000
```

### Laravel (.env):
```
APP_NAME=PanchayatSuvidha
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=panchayat_db
DB_USERNAME=root
DB_PASSWORD=yourpassword

ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
ADMIN_REGISTRATION_SECRET=admin-secret

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

## Frontend Changes Required

### 1. Update API Base URL
**File**: `frontend/.env`
```
VITE_API_URL=http://localhost:8000/api
```

### 2. No Code Changes Needed
The Axios instance will automatically use the new base URL. All endpoints remain the same.

## Testing Checklist

### Phase 1: Basic Setup
- [ ] Laravel project created
- [ ] MySQL database connected
- [ ] CORS configured for React frontend
- [ ] File storage configured

### Phase 2: Database
- [ ] All migrations created and run successfully
- [ ] All models created with relationships
- [ ] Seeders created for initial data

### Phase 3: Authentication
- [ ] Register endpoint works
- [ ] Login endpoint works (admin & user)
- [ ] Token generation works
- [ ] Admin middleware protects routes

### Phase 4: Public Endpoints
- [ ] GET /village returns correct data
- [ ] GET /census returns correct data
- [ ] GET /panchayat returns correct data
- [ ] GET /services returns correct data
- [ ] All module endpoints work

### Phase 5: Admin Endpoints
- [ ] Village update works
- [ ] Image upload works
- [ ] Panchayat member CRUD works
- [ ] Census CRUD works
- [ ] Services update works
- [ ] Module updates work

### Phase 6: File Uploads
- [ ] Village image upload works
- [ ] Member photo upload works
- [ ] Module photo/file uploads work
- [ ] Files accessible via URL

### Phase 7: Frontend Integration
- [ ] React app connects to Laravel
- [ ] Login flow works
- [ ] Admin dashboard works
- [ ] All CRUD operations work
- [ ] File uploads display correctly

## Migration Timeline

1. **Day 1**: Laravel setup + Database migrations
2. **Day 2**: Models + Authentication
3. **Day 3**: Public API endpoints
4. **Day 4**: Admin API endpoints
5. **Day 5**: File uploads + Testing
6. **Day 6**: Frontend integration + Bug fixes

## Rollback Plan

If issues arise:
1. Keep Node.js backend running on port 5000
2. Switch frontend .env back to port 5000
3. Debug Laravel issues separately
4. Switch back when ready

## Next Steps

1. Review this plan
2. Confirm database schema changes are acceptable
3. Begin Laravel project creation
4. Follow implementation guide (next document)
