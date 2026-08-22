#!/bin/bash

echo "========================================"
echo "PanchayatSuvidha Deployment Script"
echo "========================================"
echo ""

echo "[1/4] Building React frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Frontend build failed!"
    exit 1
fi
cd ..

echo ""
echo "[2/4] Cleaning Laravel public/app directory..."
rm -rf panchayat-laravel/public/app
mkdir -p panchayat-laravel/public/app

echo ""
echo "[3/4] Copying build files to Laravel..."
cp -r frontend/dist/* panchayat-laravel/public/app/
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to copy files!"
    exit 1
fi

echo ""
echo "[4/4] Optimizing Laravel..."
cd panchayat-laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
cd ..

echo ""
echo "========================================"
echo "Deployment Complete! ✓"
echo "========================================"
echo ""
echo "Your app is ready at: http://localhost:8000"
echo ""
