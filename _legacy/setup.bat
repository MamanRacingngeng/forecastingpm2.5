@echo off
title PM2.5 Predictor - Setup
cd /d "%~dp0"

set PYTHON=C:\Users\ACER\anaconda3\python.exe
if not exist "%PYTHON%" (
    echo Python Anaconda tidak ditemukan di %PYTHON%
    echo Silakan install Anaconda atau edit path di file ini.
    pause
    exit /b 1
)

echo ============================================
echo  Setup Website Prediksi PM2.5
echo ============================================
echo.

echo [1/3] Install dependensi...
"%PYTHON%" -m pip install -r requirements.txt
if errorlevel 1 (
    echo Gagal install dependensi.
    pause
    exit /b 1
)

echo.
echo [2/3] Cek dataset...
if not exist "data\pm25.csv" (
    echo Dataset belum ada. Membuat contoh dataset...
    "%PYTHON%" buat_dataset_contoh.py
) else (
    echo Dataset ditemukan: data\pm25.csv
)

echo.
echo [3/3] Setup selesai!
echo.
echo Cara menjalankan website:
echo   Double-click: jalankan.bat
echo   Atau ketik:   "%PYTHON%" app.py
echo.
pause
