# ============================================================
# MySQL Root Password Reset Script
# RIGHT-CLICK this file → "Run with PowerShell" as Administrator
# OR open PowerShell as Admin and run:
#   powershell -ExecutionPolicy Bypass -File RESET_MYSQL_PASSWORD.ps1
# ============================================================

$ErrorActionPreference = "Continue"
$mysqld  = "C:\Program Files\MySQL\MySQL Server 9.6\bin\mysqld.exe"
$mysql   = "C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql.exe"
$dataDir = "C:\ProgramData\MySQL\MySQL Server 9.6\Data"
$newPwd  = "Laravel@123"
$initFile = "$env:TEMP\mysql_pwd_reset.sql"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  MySQL Root Password Reset" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check admin
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: Must run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click this file and select 'Run with PowerShell'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[1/5] Stopping MySQL96 service..." -ForegroundColor Yellow
Stop-Service -Name "MySQL96" -Force -ErrorAction Stop
Start-Sleep -Seconds 3
Write-Host "      MySQL96 stopped." -ForegroundColor Green

Write-Host "[2/5] Creating password reset SQL file..." -ForegroundColor Yellow
$sql = "ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY '$newPwd'; FLUSH PRIVILEGES;"
$sql | Set-Content -Path $initFile -Encoding UTF8
Write-Host "      Init file: $initFile" -ForegroundColor Green

Write-Host "[3/5] Starting mysqld with --init-file to reset password..." -ForegroundColor Yellow
$proc = Start-Process -FilePath $mysqld `
    -ArgumentList "--init-file=`"$initFile`" --datadir=`"$dataDir`" --standalone --console" `
    -PassThru -WindowStyle Hidden
Write-Host "      mysqld started (PID: $($proc.Id)), waiting 8 seconds..." -ForegroundColor Green
Start-Sleep -Seconds 8

Write-Host "[4/5] Stopping temporary mysqld instance..." -ForegroundColor Yellow
Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "      Done." -ForegroundColor Green

Write-Host "[5/5] Restarting MySQL96 service..." -ForegroundColor Yellow
Start-Service -Name "MySQL96"
Start-Sleep -Seconds 4
Write-Host "      MySQL96 restarted." -ForegroundColor Green

# Test the new password
Write-Host ""
Write-Host "Testing new password '$newPwd'..." -ForegroundColor Cyan
$testResult = & $mysql -u root -p"$newPwd" -h 127.0.0.1 -P 3306 -e "SELECT 'Connection OK';" 2>&1
if ($testResult -match "Connection OK") {
    Write-Host "SUCCESS! Password reset to: $newPwd" -ForegroundColor Green
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  Now run in panchayat-laravel folder:" -ForegroundColor Cyan
    Write-Host "  php setup_db.php Laravel@123" -ForegroundColor White
    Write-Host "============================================" -ForegroundColor Cyan
} else {
    Write-Host "Test result: $testResult" -ForegroundColor Red
    Write-Host "Password reset may have failed. Check MySQL logs." -ForegroundColor Red
}

# Clean up
Remove-Item $initFile -ErrorAction SilentlyContinue
Read-Host "Press Enter to exit"
