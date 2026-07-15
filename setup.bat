@echo off
title Setup PM2.5 Laravel Demo
cd /d "%~dp0"

set PYTHON=C:\Users\ACER\anaconda3\python.exe

echo ============================================
echo  Setup Website Laravel - Prediksi PM2.5
echo ============================================
echo.

echo [1/3] Install dependensi PHP (Composer)...
call composer install --no-interaction
if errorlevel 1 exit /b 1

echo.
echo [2/3] Install dependensi Python (TensorFlow)...
"%PYTHON%" -m pip install -r ml\requirements.txt
if errorlevel 1 exit /b 1

echo.
echo [3/3] Setup environment...
if not exist ".env" copy .env.example .env
php artisan key:generate --ansi

echo.
echo Setup selesai! Jalankan: jalankan.bat
pause
