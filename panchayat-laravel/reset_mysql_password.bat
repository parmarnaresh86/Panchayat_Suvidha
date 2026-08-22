@echo off
echo ============================================
echo  MySQL Root Password Reset Tool
echo  Run this file as Administrator
echo ============================================
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Please right-click this file and select "Run as Administrator"
    pause
    exit /b 1
)

echo [1/4] Stopping MySQL96 service...
net stop MySQL96
timeout /t 3 /nobreak >nul

echo [2/4] Creating password reset SQL file...
echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'Laravel@123'; FLUSH PRIVILEGES; > "%TEMP%\reset_pwd.sql"

echo [3/4] Starting MySQL with --init-file to reset password...
"C:\Program Files\MySQL\MySQL Server 9.6\bin\mysqld.exe" --init-file="%TEMP%\reset_pwd.sql" --console --daemonize
timeout /t 5 /nobreak >nul

echo [4/4] Restarting MySQL96 service normally...
net start MySQL96
timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo  Done! New MySQL root password: Laravel@123
echo ============================================
echo.
echo Now run in panchayat-laravel folder:
echo   php setup_db.php Laravel@123
echo.
pause
