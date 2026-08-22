@echo off
echo ========================================
echo PanchayatSuvidha Deployment Script
echo ========================================
echo.

echo [1/4] Building React frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Cleaning Laravel public/app directory...
if exist "panchayat-laravel\public\app" (
    rmdir /s /q "panchayat-laravel\public\app"
)
mkdir "panchayat-laravel\public\app"

echo.
echo [3/4] Copying build files to Laravel...
xcopy /E /I /Y "frontend\dist\*" "panchayat-laravel\public\app\"
if %errorlevel% neq 0 (
    echo ERROR: Failed to copy files!
    pause
    exit /b 1
)

echo.
echo [4/4] Optimizing Laravel...
cd panchayat-laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
cd ..

echo.
echo ========================================
echo Deployment Complete! ✓
echo ========================================
echo.
echo Your app is ready at: http://localhost:8000
echo.
pause
