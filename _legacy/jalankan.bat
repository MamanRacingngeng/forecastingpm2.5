@echo off
title PM2.5 Predictor
cd /d "%~dp0"

set PYTHON=C:\Users\ACER\anaconda3\python.exe

if not exist "%PYTHON%" (
    echo Python tidak ditemukan. Jalankan setup.bat terlebih dahulu.
    pause
    exit /b 1
)

if not exist "data\pm25.csv" (
    echo Membuat dataset contoh...
    "%PYTHON%" buat_dataset_contoh.py
)

echo.
echo ============================================
echo  Website berjalan di: http://localhost:5000
echo  Tekan Ctrl+C untuk berhenti
echo ============================================
echo.

"%PYTHON%" app.py
