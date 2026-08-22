# PanchayatSuvidha Deployment Guide

## Architecture
- **Frontend**: React 19 + Vite (SPA)
- **Backend**: Laravel 11 (REST API)
- **Database**: MySQL/MariaDB

---

## Option 1: Laravel Serves React (Single Server) ⭐ EASIEST

This approach builds React into Laravel's public folder. Perfect for shared hosting or single VPS.

### Step 1: Build React for Production

```bash
cd frontend
npm run build
```

This creates a `frontend/dist` folder with optimized files.

### Step 2: Copy Build to Laravel Public Folder

**Windows:**
```bash
# From project root
xcopy /E /I /Y frontend\dist panchayat-laravel\public\app
```

**Linux/Mac:**
```bash
# From project root
cp -r frontend/dist/* panchayat-laravel/public/app/
```

### Step 3: Configure Laravel Routes

Laravel needs to serve the React app for all non-API routes. Update `panchayat-laravel/routes/web.php`:

```php
<?php

use Illuminate\Support\Facades\Route;

// Serve React app for all routes except /api
Route::get('/{any}', function () {
    return file_get_contents(public_path('app/index.html'));
})->where('any', '^(?!api).*$');
```

### Step 4: Update React Environment for Production

Create `frontend/.env.production`:

```env
VITE_API_URL=/api
```

This makes React use relative URLs (same domain as Laravel).

### Step 5: Rebuild React with Production Config

```bash
cd frontend
npm run build
```

Then copy again to Laravel public folder.

### Step 6: Deploy to Server

Upload the `panchayat-laravel` folder to your server and configure:

1. Point domain to `panchayat-laravel/public`
2. Set up `.env` file with database credentials
3. Run migrations: `php artisan migrate`
4. Run seeders: `php artisan db:seed`
5. Set permissions: `chmod -R 755 storage bootstrap/cache`

---

## Option 2: Separate Hosting (Better Performance)

### Frontend Deployment (Vercel/Netlify)

**Vercel:**
1. Push code to GitHub
2. Import project on Vercel
3. Set root directory: `frontend`
4. Set environment variable: `VITE_API_URL=https://your-api-domain.com/api`
5. Deploy

**Netlify:**
1. Push code to GitHub
2. Import project on Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Base directory: `frontend`
6. Environment: `VITE_API_URL=https://your-api-domain.com/api`

### Backend Deployment (Laravel)

**Shared Hosting (cPanel):**
1. Upload `panchayat-laravel` folder
2. Move contents of `public` to `public_html`
3. Update `index.php` paths to point to Laravel folder
4. Create MySQL database via cPanel
5. Update `.env` with database credentials
6. Run migrations via SSH or cPanel terminal

**VPS (DigitalOcean, AWS, etc.):**
1. Install PHP 8.2+, Composer, MySQL
2. Clone repository
3. Run `composer install --optimize-autoloader --no-dev`
4. Set up `.env` file
5. Run `php artisan migrate --seed`
6. Configure Nginx/Apache to point to `public` folder
7. Set up SSL with Let's Encrypt

---

## Option 3: Docker Deployment

Use Docker Compose to run both frontend and backend in containers.

---

## Database Setup

### MySQL Database Requirements
- MySQL 5.7+ or MariaDB 10.3+
- Create database: `panchayat_db`
- Create user with full privileges

```sql
CREATE DATABASE panchayat_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'panchayat_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON panchayat_db.* TO 'panchayat_user'@'localhost';
FLUSH PRIVILEGES;
```

### Laravel .env Configuration

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=panchayat_db
DB_USERNAME=panchayat_user
DB_PASSWORD=your_password
```

---

## Post-Deployment Checklist

- [ ] Database migrated and seeded
- [ ] `.env` configured with production values
- [ ] Storage and cache folders writable
- [ ] CORS configured for frontend domain
- [ ] SSL certificate installed (HTTPS)
- [ ] Admin credentials secured
- [ ] File upload directory configured
- [ ] Backup strategy in place

---

## Hosting Providers Recommendations

### Budget-Friendly
- **Hostinger** ($2-5/month) - Good for Laravel + React
- **Namecheap** ($3-8/month) - Shared hosting with SSH
- **InfinityFree** (Free) - Limited but works for testing

### Professional
- **DigitalOcean** ($6-12/month) - VPS with full control
- **AWS Lightsail** ($5-10/month) - Easy VPS
- **Cloudways** ($10-20/month) - Managed Laravel hosting

### Frontend Only
- **Vercel** (Free tier) - Best for React
- **Netlify** (Free tier) - Great for static sites
- **GitHub Pages** (Free) - Simple static hosting

---

## Performance Optimization

### Laravel
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### React
- Already optimized by Vite build
- Enable gzip compression on server
- Use CDN for static assets

---

## Troubleshooting

### React shows blank page
- Check browser console for errors
- Verify `VITE_API_URL` is correct
- Check Laravel CORS configuration

### API returns 404
- Verify `.htaccess` exists in Laravel public folder
- Check Apache mod_rewrite is enabled
- Verify API routes in `routes/api.php`

### Database connection failed
- Check `.env` database credentials
- Verify MySQL service is running
- Check firewall allows MySQL port 3306

---

## Security Recommendations

1. Change default admin credentials
2. Use strong `APP_KEY` in Laravel
3. Enable HTTPS (SSL certificate)
4. Set `APP_DEBUG=false` in production
5. Restrict database user privileges
6. Regular backups of database and uploads
7. Keep Laravel and dependencies updated
8. Use environment variables for secrets
