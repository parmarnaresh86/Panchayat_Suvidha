# Quick Start - Laravel Backend

## Start the Application

### 1. Start Laravel Backend
```bash
cd panchayat-laravel
php artisan serve
```
✅ Server running at: `http://localhost:8000`

### 2. Start React Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend running at: `http://localhost:5173`

---

## Test the Application

### Public Pages (No Login Required)
- Village Profile: `http://localhost:5173/`
- Services: `http://localhost:5173/services`
- Contact: `http://localhost:5173/contact`
- Panchayat Details: `http://localhost:5173/panchayat`

### Admin Access
1. Go to: `http://localhost:5173/login`
2. Login with:
   - **Username**: `admin`
   - **Password**: `password`
   - **Role**: Admin
3. Access Admin Dashboard: `http://localhost:5173/admin`

### Register New User
1. Go to: `http://localhost:5173/register`
2. Fill in details
3. For admin registration, use secret: `admin-secret`

---

## API Endpoints

### Base URL
```
http://localhost:8000/api
```

### Test Endpoints (using curl or Postman)

**Get Village Data:**
```bash
curl http://localhost:8000/api/village
```

**Register User:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","email":"test@test.com","role":"user"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password","role":"admin"}'
```

---

## Database

### View Database
```bash
cd panchayat-laravel
php artisan tinker
```

Then run:
```php
// Check users
User::all();

// Check village data
\App\Models\Village::first();

// Check modules
\App\Models\EducationModule::all();
```

### Reset Database
```bash
php artisan migrate:fresh
php artisan db:seed --class=ModuleSeeder
```

---

## Troubleshooting

### Laravel Server Not Starting
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Use different port
php artisan serve --port=8001
```

### Frontend Can't Connect
Check `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

### Database Errors
```bash
# Check migrations
php artisan migrate:status

# Re-run migrations
php artisan migrate:fresh
```

### CORS Errors
Check `panchayat-laravel/config/cors.php`:
```php
'allowed_origins' => ['http://localhost:5173'],
```

---

## Stop the Application

### Stop Laravel
Press `Ctrl+C` in the terminal running `php artisan serve`

### Stop Frontend
Press `Ctrl+C` in the terminal running `npm run dev`

---

## Switch Back to Node.js Backend (if needed)

1. Start Node.js backend:
   ```bash
   cd backend
   npm start
   ```

2. Update `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. Restart frontend:
   ```bash
   cd frontend
   npm run dev
   ```

---

## Production Deployment

See `LARAVEL_BACKEND_READY.md` for detailed production deployment instructions.
