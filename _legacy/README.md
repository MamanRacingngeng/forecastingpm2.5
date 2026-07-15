# Demo Website — Prediksi Kualitas Udara PM2.5

Website demo skripsi untuk prediksi PM2.5 dengan 3 model LSTM:
LSTM Default, Grid Search LSTM, dan SCA-LSTM.

## Lokasi Dataset

**Taruh file dataset Anda di sini:**

```
d:\demoskripsi\data\pm25.csv
```

Format CSV (contoh):

```csv
datetime,PM2.5
2024-01-01 00:00:00,32.5
2024-01-01 01:00:00,28.1
```

Kolom PM2.5 yang dikenali: `PM2.5`, `pm25`, `pm2.5`, `value`, `konsentrasi`.

> Jika belum punya dataset, sistem otomatis membuat **data contoh** saat pertama kali dijalankan.

## Cara Menjalankan (Paling Mudah)

1. **Double-click** `setup.bat` — install dependensi & buat dataset contoh
2. **Double-click** `jalankan.bat` — jalankan website
3. Buka browser: **http://localhost:5000**

## Cara Manual (Terminal)

```bash
cd d:\demoskripsi
C:\Users\ACER\anaconda3\python.exe -m pip install -r requirements.txt
C:\Users\ACER\anaconda3\python.exe buat_dataset_contoh.py
C:\Users\ACER\anaconda3\python.exe app.py
```

## Ganti dengan Dataset Anda

1. Copy file CSV ke folder `data\`
2. Rename jadi `pm25.csv` (ganti file lama)
3. Jalankan ulang `jalankan.bat`
4. Klik **"Latih Ulang Model"** di website

## Struktur Folder

```
demoskripsi/
├── data/
│   ├── pm25.csv          ← TARUH DATASET DI SINI
│   └── CARA_PAKAI.txt
├── app.py
├── lstm_engine.py
├── buat_dataset_contoh.py
├── setup.bat             ← Jalankan sekali
├── jalankan.bat          ← Jalankan website
├── requirements.txt
├── templates/
└── static/
```

## API

| Endpoint       | Fungsi                    |
|----------------|---------------------------|
| `/`            | Halaman website           |
| `/api/predict` | Hasil prediksi & metrik   |
| `/api/refresh` | Latih ulang semua model   |
