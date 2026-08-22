# Laravel Implementation Guide

## Step 1: Create Laravel Project

```bash
# Create new Laravel 11 project
composer create-project laravel/laravel panchayat-laravel

cd panchayat-laravel

# Install Laravel Sanctum for API authentication
composer require laravel/sanctum

# Publish Sanctum configuration
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

## Step 2: Configure Environment

Edit `.env`:

```env
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

FILESYSTEM_DISK=public

ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
ADMIN_REGISTRATION_SECRET=admin-secret

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

## Step 3: Configure CORS

Edit `config/cors.php`:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

## Step 4: Create Database Migrations

### Migration Files to Create

Run these commands:

```bash
php artisan make:migration create_villages_table
php artisan make:migration create_village_images_table
php artisan make:migration create_census_table
php artisan make:migration create_panchayat_members_table
php artisan make:migration create_achievements_table
php artisan make:migration create_special_personalities_table
php artisan make:migration create_users_table --create=users
php artisan make:migration create_services_table
php artisan make:migration create_service_items_table
php artisan make:migration create_education_modules_table
php artisan make:migration create_education_records_table
php artisan make:migration create_education_announcements_table
php artisan make:migration create_employment_modules_table
php artisan make:migration create_employment_records_table
php artisan make:migration create_facilities_modules_table
php artisan make:migration create_facilities_records_table
php artisan make:migration create_pages_table
php artisan make:migration create_page_contents_table
php artisan make:migration create_contact_messages_table
```

See separate migration files in the `laravel-backend/database/migrations/` folder.

## Step 5: Create Eloquent Models

Run these commands:

```bash
php artisan make:model Village
php artisan make:model VillageImage
php artisan make:model Census
php artisan make:model PanchayatMember
php artisan make:model Achievement
php artisan make:model SpecialPersonality
php artisan make:model Service
php artisan make:model ServiceItem
php artisan make:model EducationModule
php artisan make:model EducationRecord
php artisan make:model EducationAnnouncement
php artisan make:model EmploymentModule
php artisan make:model EmploymentRecord
php artisan make:model FacilitiesModule
php artisan make:model FacilitiesRecord
php artisan make:model Page
php artisan make:model PageContent
php artisan make:model ContactMessage
```

See separate model files in the `laravel-backend/app/Models/` folder.

## Step 6: Create Controllers

Run these commands:

```bash
php artisan make:controller Api/AuthController
php artisan make:controller Api/VillageController
php artisan make:controller Api/CensusController
php artisan make:controller Api/PanchayatController
php artisan make:controller Api/ServiceController
php artisan make:controller Api/EducationModuleController
php artisan make:controller Api/EmploymentModuleController
php artisan make:controller Api/FacilitiesModuleController
php artisan make:controller Api/PageController
php artisan make:controller Api/PageContentController
php artisan make:controller Api/ContactController
```

See separate controller files in the `laravel-backend/app/Http/Controllers/Api/` folder.

## Step 7: Create Middleware

```bash
php artisan make:middleware AdminMiddleware
```

Edit `app/Http/Middleware/AdminMiddleware.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}
```

Register middleware in `bootstrap/app.php`:

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

## Step 8: Define API Routes

Edit `routes/api.php` - see separate file `laravel-backend/routes/api.php`.

## Step 9: Configure File Storage

```bash
# Create symbolic link for public storage
php artisan storage:link

# Create uploads directory
mkdir -p storage/app/public/uploads
```

## Step 10: Run Migrations

```bash
php artisan migrate
```

## Step 11: Create Seeders (Optional)

```bash
php artisan make:seeder VillageSeeder
php artisan make:seeder UserSeeder
```

## Step 12: Start Laravel Server

```bash
php artisan serve
# Server will run on http://localhost:8000
```

## Step 13: Update React Frontend

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

Restart React dev server:

```bash
cd frontend
npm run dev
```

## Testing the Migration

### Test Authentication

```bash
# Register admin user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password",
    "email": "admin@example.com",
    "role": "admin",
    "adminSecret": "admin-secret"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password",
    "role": "admin"
  }'
```

### Test Public Endpoints

```bash
# Get village data
curl http://localhost:8000/api/village

# Get census data
curl http://localhost:8000/api/census

# Get panchayat members
curl http://localhost:8000/api/panchayat
```

### Test Admin Endpoints

```bash
# Update village (requires token)
curl -X POST http://localhost:8000/api/village/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Sayla",
    "taluka": "Sayla",
    "district": "Surendranagar"
  }'
```

## Common Issues & Solutions

### Issue 1: CORS Errors
**Solution**: Ensure `config/cors.php` has `http://localhost:5173` in allowed origins.

### Issue 2: File Upload Not Working
**Solution**: Run `php artisan storage:link` and check permissions on `storage/app/public`.

### Issue 3: Token Not Working
**Solution**: Ensure Sanctum middleware is applied and `SANCTUM_STATEFUL_DOMAINS` is set correctly.

### Issue 4: Database Connection Failed
**Solution**: Check MySQL is running and credentials in `.env` are correct.

## Performance Optimization

### Enable Query Caching

```php
// In config/database.php
'mysql' => [
    // ...
    'options' => [
        PDO::ATTR_EMULATE_PREPARES => true,
    ],
],
```

### Enable Response Caching

```bash
composer require spatie/laravel-responsecache
```

### Optimize Autoloader

```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Deployment Checklist

- [ ] Set `APP_ENV=production` in `.env`
- [ ] Set `APP_DEBUG=false` in `.env`
- [ ] Generate new `APP_KEY`: `php artisan key:generate`
- [ ] Run migrations on production database
- [ ] Set up proper file permissions
- [ ] Configure web server (Nginx/Apache)
- [ ] Set up SSL certificate
- [ ] Update frontend `VITE_API_URL` to production URL
- [ ] Enable caching (config, routes, views)
- [ ] Set up queue workers if needed
- [ ] Configure backup strategy

## Next Steps

1. Create all migration files (provided separately)
2. Create all model files (provided separately)
3. Create all controller files (provided separately)
4. Define routes in `api.php` (provided separately)
5. Test each endpoint
6. Update frontend and test integration
