@echo off
title PM2.5 Predictor - Laravel
cd /d "%~dp0"

echo ============================================
echo  Website: http://localhost:8000
echo  Tekan Ctrl+C untuk berhenti
echo ============================================
echo.

php artisan serve --host=0.0.0.0 --port=8000
