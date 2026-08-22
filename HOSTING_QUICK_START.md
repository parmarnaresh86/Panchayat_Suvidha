# Quick Start: Host PanchayatSuvidha

## Local Testing (Before Hosting)

### Option A: Automated Deployment (Recommended)

**Windows:**
```bash
deploy-to-laravel.bat
```

**Linux/Mac:**
```bash
chmod +x deploy-to-laravel.sh
./deploy-to-laravel.sh
```

Then visit: http://localhost:8000

### Option B: Manual Steps

```bash
# 1. Build React
cd frontend
npm run build

# 2. Copy to Laravel (Windows)
xcopy /E /I /Y dist ..\panchayat-laravel\public\app

# 2. Copy to Laravel (Linux/Mac)
cp -r dist/* ../panchayat-laravel/public/app/

# 3. Start Laravel
cd ../panchayat-laravel
php artisan serve
```

Visit: http://localhost:8000

---

## Deploy to Shared Hosting (cPanel)

### Step 1: Prepare Files Locally

Run the deployment script:
```bash
deploy-to-laravel.bat
```

### Step 2: Upload to Server

1. **Compress the Laravel folder:**
   - Right-click `panchayat-laravel` → Send to → Compressed folder
   - Creates `panchayat-laravel.zip`

2. **Upload via cPanel File Manager:**
   - Login to cPanel
   - Go to File Manager
   - Upload `panchayat-laravel.zip` to home directory
   - Extract the zip file

### Step 3: Configure cPanel

1. **Move public folder contents:**
   ```
   panchayat-laravel/public/* → public_html/
   ```

2. **Update index.php paths:**
   Edit `public_html/index.php`:
   ```php
   require __DIR__.'/../panchayat-laravel/vendor/autoload.php';
   $app = require_once __DIR__.'/../panchayat-laravel/bootstrap/app.php';
   ```

3. **Create MySQL Database:**
   - cPanel → MySQL Databases
   - Create database: `username_panchayat`
   - Create user with password
   - Add user to database with ALL PRIVILEGES

4. **Configure .env:**
   Edit `panchayat-laravel/.env`:
   ```env
   APP_URL=https://yourdomain.com
   DB_DATABASE=username_panchayat
   DB_USERNAME=username_dbuser
   DB_PASSWORD=your_password
   ```

5. **Run Migrations (via SSH or cPanel Terminal):**
   ```bash
   cd panchayat-laravel
   php artisan migrate --seed
   ```

### Step 4: Test

Visit: https://yourdomain.com

---

## Deploy to VPS (DigitalOcean, AWS, etc.)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.2
sudo apt install php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl -y

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install MySQL
sudo apt install mysql-server -y

# Install Nginx
sudo apt install nginx -y
```

### Step 2: Upload Code

```bash
# Clone or upload your code
cd /var/www
sudo git clone your-repo.git panchayat
cd panchayat

# Install dependencies
cd panchayat-laravel
composer install --optimize-autoloader --no-dev
```

### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/panchayat`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/panchayat/panchayat-laravel/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/panchayat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: Setup Database & Deploy

```bash
# Create database
sudo mysql
CREATE DATABASE panchayat_db;
CREATE USER 'panchayat_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL ON panchayat_db.* TO 'panchayat_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Configure Laravel
cd /var/www/panchayat/panchayat-laravel
cp .env.example .env
nano .env  # Edit database credentials

# Run migrations
php artisan key:generate
php artisan migrate --seed
php artisan config:cache
php artisan route:cache

# Set permissions
sudo chown -R www-data:www-data /var/www/panchayat
sudo chmod -R 755 /var/www/panchayat/panchayat-laravel/storage
sudo chmod -R 755 /var/www/panchayat/panchayat-laravel/bootstrap/cache
```

### Step 5: Install SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

---

## Deploy Frontend to Vercel + Backend to Server

### Frontend (Vercel)

1. Push code to GitHub
2. Go to vercel.com → Import Project
3. Select repository
4. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variable:** `VITE_API_URL=https://api.yourdomain.com/api`
5. Deploy

### Backend (Any Server)

Follow VPS steps above, but configure CORS in Laravel:

Edit `panchayat-laravel/config/cors.php`:
```php
'allowed_origins' => ['https://your-vercel-app.vercel.app'],
```

---

## Troubleshooting

### "React app not built yet" error
Run: `deploy-to-laravel.bat` or build manually

### 500 Internal Server Error
- Check Laravel logs: `panchayat-laravel/storage/logs/laravel.log`
- Verify `.env` configuration
- Check file permissions

### API calls fail
- Verify `VITE_API_URL` in frontend
- Check CORS configuration in Laravel
- Ensure API routes are working: `http://yourdomain.com/api/services`

### Database connection error
- Verify MySQL is running
- Check `.env` database credentials
- Test connection: `php artisan tinker` then `DB::connection()->getPdo();`

---

## Cost Estimates

### Budget Options
- **Hostinger Shared:** $2-5/month (includes domain)
- **Namecheap Shared:** $3-8/month
- **Vercel (Frontend) + Free MySQL:** $0/month (limited)

### Professional Options
- **DigitalOcean Droplet:** $6/month
- **AWS Lightsail:** $5/month
- **Cloudways:** $10/month (managed)

---

## Next Steps

1. ✅ Test locally using deployment script
2. ✅ Choose hosting provider
3. ✅ Purchase domain (optional)
4. ✅ Follow deployment steps for your chosen method
5. ✅ Configure SSL certificate
6. ✅ Set up backups
7. ✅ Monitor and maintain

Need help? Check DEPLOYMENT_GUIDE.md for detailed instructions!
