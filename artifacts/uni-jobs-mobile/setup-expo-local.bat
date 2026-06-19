@echo off
REM Setup script for local Expo Go development on Windows
REM This script helps configure the API endpoint for testing on physical devices

echo.
echo 🚀 UniJobs - Expo Go Local Development Setup
echo =============================================
echo.

REM Get machine IP (first non-loopback IPv4 address)
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /R "IPv4 Address"') do (
    set "MACHINE_IP=%%A"
    goto :found_ip
)

:found_ip
if defined MACHINE_IP (
    set "MACHINE_IP=%MACHINE_IP:~1%"
    echo 📱 Detected your machine IP: %MACHINE_IP%
) else (
    echo ⚠️  Could not detect machine IP. Using localhost.
    set "MACHINE_IP=192.168.x.x"
    echo 📋 Please update MACHINE_IP in this script with your actual IP from:
    echo    - Open PowerShell
    echo    - Run: ipconfig
    echo    - Look for "IPv4 Address" ^(e.g., 192.168.1.100^)
)
echo.

echo 🌍 API Endpoint: %MACHINE_IP%:5000
echo.

echo 📝 To use this configuration:
echo    1. Update .env.local with: EXPO_PUBLIC_DOMAIN=%MACHINE_IP%:5000
echo    2. Or run with: set EXPO_PUBLIC_DOMAIN=%MACHINE_IP%:5000 ^&^& pnpm exec expo start
echo.

echo ✅ Setup complete!
echo.

REM Optional: Ask to start Expo Go
set /p START_EXPO="Start Expo Go dev server now? (y/n): "
if /i "%START_EXPO%"=="y" (
    set EXPO_PUBLIC_DOMAIN=%MACHINE_IP%:5000
    pnpm exec expo start
) else (
    echo.
    echo To start manually, run:
    echo   set EXPO_PUBLIC_DOMAIN=%MACHINE_IP%:5000
    echo   pnpm exec expo start
)

pause
