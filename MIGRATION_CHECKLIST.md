# Laravel Migration Checklist

## 📋 Pre-Migration Checklist

### Environment Setup
- [ ] PHP 8.2+ installed
- [ ] Composer installed
- [ ] MySQL 8.0+ installed and running
- [ ] Node.js installed (for React frontend)
- [ ] Git installed (for version control)

### Backup Current System
- [ ] Backup MSSQL database
- [ ] Backup Node.js backend code
- [ ] Backup uploaded files (`backend/uploads/`)
- [ ] Document current environment variables
- [ ] Test current system is working

### Documentation Review
- [ ] Read `LARAVEL_MIGRATION_SUMMARY.md`
- [ ] Review `LARAVEL_MIGRATION_PLAN.md`
- [ ] Understand `CODE_COMPARISON.md`
- [ ] Bookmark `QUICK_START_LARAVEL.md`

## 🚀 Phase 1: Laravel Project Setup

### Create Project
- [ ] Run `composer create-project laravel/laravel panchayat-laravel`
- [ ] Navigate to project: `cd panchayat-laravel`
- [ ] Install Sanctum: `composer require laravel/sanctum`
- [ ] Publish Sanctum: `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`

### Configure Environment
- [ ] Copy `.env.example` to `.env`
- [ ] Generate app key: `php artisan key:generate`
- [ ] Set `APP_NAME=PanchayatSuvidha`
- [ ] Set `APP_URL=http://localhost:8000`
- [ ] Configure MySQL credentials in `.env`
- [ ] Add custom env vars: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_REGISTRATION_SECRET`
- [ ] Set `SANCTUM_STATEFUL_DOMAINS=localhost:5173`

### Create Database
- [ ] Login to MySQL: `mysql -u root -p`
- [ ] Create database: `CREATE DATABASE panchayat_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
- [ ] Verify connection: `php artisan tinker` → `DB::connection()->getPdo();`

### Configure CORS
- [ ] Edit `config/cors.php`
- [ ] Set `allowed_origins` to `['http://localhost:5173']`
- [ ] Set `supports_credentials` to `true`

## 🗄️ Phase 2: Database Migration

### Create Migration Files
- [ ] `php artisan make:migration create_villages_table`
- [ ] `php artisan make:migration create_village_images_table`
- [ ] `php artisan make:migration create_census_table`
- [ ] `php artisan make:migration create_panchayat_members_table`
- [ ] `php artisan make:migration create_achievements_table`
- [ ] `php artisan make:migration create_special_personalities_table`
- [ ] `php artisan make:migration create_services_table`
- [ ] `php artisan make:migration create_service_items_table`
- [ ] `php artisan make:migration create_education_modules_table`
- [ ] `php artisan make:migration create_education_records_table`
- [ ] `php artisan make:migration create_education_announcements_table`
- [ ] `php artisan make:migration create_employment_modules_table`
- [ ] `php artisan make:migration create_employment_records_table`
- [ ] `php artisan make:migration create_facilities_modules_table`
- [ ] `php artisan make:migration create_facilities_records_table`
- [ ] `php artisan make:migration create_pages_table`
- [ ] `php artisan make:migration create_page_contents_table`
- [ ] `php artisan make:migration create_contact_messages_table`

### Copy Migration Content
- [ ] Copy provided migration content to each file
- [ ] Review each migration for correctness
- [ ] Check foreign key relationships

### Run Migrations
- [ ] Run `php artisan migrate`
- [ ] Verify all tables created: `php artisan tinker` → `DB::select('SHOW TABLES');`
- [ ] Check table structures match schema

## 🎨 Phase 3: Models & Relationships

### Create Model Files
- [ ] `php artisan make:model Village`
- [ ] `php artisan make:model VillageImage`
- [ ] `php artisan make:model Census`
- [ ] `php artisan make:model PanchayatMember`
- [ ] `php artisan make:model Achievement`
- [ ] `php artisan make:model SpecialPersonality`
- [ ] `php artisan make:model Service`
- [ ] `php artisan make:model ServiceItem`
- [ ] `php artisan make:model EducationModule`
- [ ] `php artisan make:model EducationRecord`
- [ ] `php artisan make:model EducationAnnouncement`
- [ ] `php artisan make:model EmploymentModule`
- [ ] `php artisan make:model EmploymentRecord`
- [ ] `php artisan make:model FacilitiesModule`
- [ ] `php artisan make:model FacilitiesRecord`
- [ ] `php artisan make:model Page`
- [ ] `php artisan make:model PageContent`
- [ ] `php artisan make:model ContactMessage`

### Copy Model Content
- [ ] Copy provided model content to each file
- [ ] Define fillable fields
- [ ] Define relationships (hasMany, belongsTo)
- [ ] Define casts for JSON fields

### Test Models
- [ ] Test Village model: `php artisan tinker` → `Village::first();`
- [ ] Test relationships work correctly

## 🎮 Phase 4: Controllers

### Create Controller Files
- [ ] `php artisan make:controller Api/AuthController`
- [ ] `php artisan make:controller Api/VillageController`
- [ ] `php artisan make:controller Api/CensusController`
- [ ] `php artisan make:controller Api/PanchayatController`
- [ ] `php artisan make:controller Api/ServiceController`
- [ ] `php artisan make:controller Api/EducationModuleController`
- [ ] `php artisan make:controller Api/EmploymentModuleController`
- [ ] `php artisan make:controller Api/FacilitiesModuleController`
- [ ] `php artisan make:controller Api/PageController`
- [ ] `php artisan make:controller Api/PageContentController`
- [ ] `php artisan make:controller Api/ContactController`

### Copy Controller Content
- [ ] Copy provided controller content to each file
- [ ] Review validation rules
- [ ] Check response formats match Node.js
- [ ] Verify error handling

## 🛡️ Phase 5: Middleware & Routes

### Create Middleware
- [ ] `php artisan make:middleware AdminMiddleware`
- [ ] Copy provided middleware content
- [ ] Register middleware in `bootstrap/app.php`

### Define Routes
- [ ] Copy provided routes to `routes/api.php`
- [ ] Group admin routes with middleware
- [ ] Verify route names match Node.js endpoints

### Test Routes
- [ ] Run `php artisan route:list`
- [ ] Verify all routes are registered
- [ ] Check route methods (GET, POST, PUT, DELETE)

## 📁 Phase 6: File Storage

### Configure Storage
- [ ] Run `php artisan storage:link`
- [ ] Create uploads directory: `mkdir -p storage/app/public/uploads`
- [ ] Set permissions: `chmod -R 775 storage`
- [ ] Set permissions: `chmod -R 775 bootstrap/cache`

### Test File Upload
- [ ] Test image upload endpoint
- [ ] Verify file saved in `storage/app/public/uploads/`
- [ ] Verify file accessible via URL

## 🧪 Phase 7: Testing Backend

### Test Authentication
- [ ] Test register endpoint (user)
- [ ] Test register endpoint (admin with secret)
- [ ] Test login endpoint (user)
- [ ] Test login endpoint (admin)
- [ ] Verify token generation
- [ ] Test token authentication

### Test Public Endpoints
- [ ] GET `/api/village`
- [ ] GET `/api/census`
- [ ] GET `/api/panchayat`
- [ ] GET `/api/services`
- [ ] GET `/api/education/modules/{id}`
- [ ] GET `/api/employment/modules/{id}`
- [ ] GET `/api/facilities/modules/{id}`
- [ ] GET `/api/pages`
- [ ] GET `/api/pages/{slug}`
- [ ] GET `/api/page-content/{pageName}`
- [ ] GET `/api/contact/info`
- [ ] POST `/api/contact/message`

### Test Admin Endpoints (with token)
- [ ] POST `/api/village/update`
- [ ] POST `/api/village/upload-image`
- [ ] DELETE `/api/village/image/{id}`
- [ ] POST `/api/panchayat/member/add`
- [ ] POST `/api/panchayat/member/update`
- [ ] POST `/api/panchayat/member/upload-photo`
- [ ] POST `/api/census/add`
- [ ] POST `/api/census/update`
- [ ] DELETE `/api/census/{id}`
- [ ] POST `/api/services/update`
- [ ] POST `/api/education/modules/{id}/update`
- [ ] POST `/api/education/modules/{id}/upload-photo`
- [ ] POST `/api/employment/modules/{id}/update`
- [ ] POST `/api/employment/modules/{id}/upload-file`
- [ ] POST `/api/facilities/modules/{id}/update`
- [ ] POST `/api/pages`
- [ ] PUT `/api/pages/{id}`
- [ ] DELETE `/api/pages/{id}`
- [ ] PUT `/api/page-content/{pageName}`
- [ ] PUT `/api/contact/info`
- [ ] GET `/api/contact/messages`
- [ ] PUT `/api/contact/messages/{id}/read`
- [ ] DELETE `/api/contact/messages/{id}`

### Test File Uploads
- [ ] Village image upload
- [ ] Panchayat member photo upload
- [ ] Education module photo upload
- [ ] Employment module file upload
- [ ] Verify files accessible via URL

## 🌐 Phase 8: Frontend Integration

### Update Frontend Configuration
- [ ] Edit `frontend/.env`
- [ ] Change `VITE_API_URL=http://localhost:8000/api`
- [ ] Restart React dev server: `npm run dev`

### Test Frontend Connection
- [ ] Open React app: `http://localhost:5173`
- [ ] Test homepage loads
- [ ] Test village profile page
- [ ] Test census page
- [ ] Test panchayat details page
- [ ] Test services page

### Test Authentication Flow
- [ ] Test user registration
- [ ] Test user login
- [ ] Test admin login
- [ ] Verify token stored in localStorage
- [ ] Test logout

### Test Admin Dashboard
- [ ] Login as admin
- [ ] Access admin dashboard
- [ ] Test village update
- [ ] Test image upload
- [ ] Test panchayat member CRUD
- [ ] Test census CRUD
- [ ] Test services management
- [ ] Test module management

### Test All CRUD Operations
- [ ] Create operations work
- [ ] Read operations work
- [ ] Update operations work
- [ ] Delete operations work
- [ ] File uploads work
- [ ] Images display correctly

## 🐛 Phase 9: Bug Fixes & Optimization

### Fix Issues
- [ ] Fix any CORS errors
- [ ] Fix any authentication issues
- [ ] Fix any file upload issues
- [ ] Fix any validation errors
- [ ] Fix any response format mismatches

### Optimize Performance
- [ ] Add database indexes
- [ ] Enable query caching
- [ ] Use eager loading for relationships
- [ ] Optimize file upload sizes
- [ ] Add rate limiting

### Code Quality
- [ ] Run `php artisan route:cache`
- [ ] Run `php artisan config:cache`
- [ ] Run `php artisan view:cache`
- [ ] Run `composer dump-autoload --optimize`
- [ ] Check for PSR-12 compliance

## 📊 Phase 10: Data Migration

### Export Data from MSSQL
- [ ] Export Village data
- [ ] Export VillageImages data
- [ ] Export Census data
- [ ] Export PanchayatMembers data
- [ ] Export Achievements data
- [ ] Export SpecialPersonalities data
- [ ] Export Users data (hash passwords!)
- [ ] Export Services data
- [ ] Export ServiceItems data
- [ ] Export all module data

### Import Data to MySQL
- [ ] Create seeders for each table
- [ ] Import Village data
- [ ] Import VillageImages data
- [ ] Import Census data
- [ ] Import PanchayatMembers data
- [ ] Import Achievements data
- [ ] Import SpecialPersonalities data
- [ ] Import Users data (with hashed passwords)
- [ ] Import Services data
- [ ] Import ServiceItems data
- [ ] Import all module data

### Verify Data
- [ ] Check all records imported
- [ ] Verify relationships intact
- [ ] Test queries return correct data
- [ ] Verify file paths updated

## 🚀 Phase 11: Deployment Preparation

### Production Configuration
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Generate new `APP_KEY`
- [ ] Update `APP_URL` to production URL
- [ ] Configure production database
- [ ] Set up SSL certificate

### Security Hardening
- [ ] Change admin credentials
- [ ] Enable rate limiting
- [ ] Configure CORS for production domain
- [ ] Set up firewall rules
- [ ] Enable HTTPS only

### Performance Optimization
- [ ] Run `composer install --optimize-autoloader --no-dev`
- [ ] Run `php artisan config:cache`
- [ ] Run `php artisan route:cache`
- [ ] Run `php artisan view:cache`
- [ ] Set up queue workers
- [ ] Configure caching (Redis/Memcached)

### Monitoring & Logging
- [ ] Set up error logging
- [ ] Configure log rotation
- [ ] Set up monitoring (New Relic, etc.)
- [ ] Configure backup strategy
- [ ] Set up health checks

## ✅ Phase 12: Final Verification

### Functionality Testing
- [ ] All public endpoints work
- [ ] All admin endpoints work
- [ ] Authentication works
- [ ] File uploads work
- [ ] Frontend fully functional
- [ ] No console errors
- [ ] No server errors

### Performance Testing
- [ ] Test response times
- [ ] Test concurrent users
- [ ] Test file upload limits
- [ ] Test database query performance

### Security Testing
- [ ] Test CSRF protection
- [ ] Test SQL injection prevention
- [ ] Test XSS protection
- [ ] Test authentication bypass attempts
- [ ] Test file upload security

### Documentation
- [ ] Update API documentation
- [ ] Document deployment process
- [ ] Document backup/restore process
- [ ] Document troubleshooting steps
- [ ] Create user manual

## 🎉 Phase 13: Go Live

### Pre-Launch
- [ ] Final backup of old system
- [ ] Final backup of new system
- [ ] Notify users of maintenance window
- [ ] Prepare rollback plan

### Launch
- [ ] Switch DNS/routing to new backend
- [ ] Update frontend production build
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Test critical user flows

### Post-Launch
- [ ] Monitor for 24 hours
- [ ] Fix any critical issues
- [ ] Gather user feedback
- [ ] Document lessons learned
- [ ] Celebrate success! 🎊

## 📝 Notes

### Rollback Plan
If critical issues arise:
1. Switch frontend back to Node.js backend (port 5000)
2. Restore MSSQL database if needed
3. Debug Laravel issues separately
4. Re-launch when ready

### Support Resources
- Laravel Docs: https://laravel.com/docs/11.x
- Laravel Sanctum: https://laravel.com/docs/11.x/sanctum
- MySQL Docs: https://dev.mysql.com/doc/
- Stack Overflow: https://stackoverflow.com/questions/tagged/laravel

### Estimated Timeline
- **Phase 1-2**: 4-6 hours (Setup + Database)
- **Phase 3-5**: 8-10 hours (Models + Controllers + Routes)
- **Phase 6-7**: 4-6 hours (Storage + Testing)
- **Phase 8-9**: 4-6 hours (Frontend + Bug Fixes)
- **Phase 10**: 4-6 hours (Data Migration)
- **Phase 11-13**: 4-6 hours (Deployment)
- **Total**: 28-40 hours (3-5 days)

## ✨ Success Criteria

Migration is successful when:
- ✅ All API endpoints return correct data
- ✅ Authentication works (register, login, logout)
- ✅ Admin dashboard fully functional
- ✅ File uploads work and display correctly
- ✅ No console errors in React
- ✅ No server errors in Laravel
- ✅ Response times acceptable
- ✅ All data migrated correctly
- ✅ Frontend works identically to before
- ✅ Users can perform all previous actions

---

**Good luck with your migration!** 🚀

Remember: Take it one phase at a time, test thoroughly, and don't hesitate to refer back to the documentation.
