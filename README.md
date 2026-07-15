# UdaraCast — Prediksi Kualitas Udara PM2.5

Platform informasi publik untuk prediksi konsentrasi PM2.5.

## Next.js (Rekomendasi — Deploy Vercel)

Aplikasi web utama ada di folder **`web/`**.

```bash
cd web
npm install
npm run dev
```

Buka **http://localhost:3000**

### Deploy Vercel

1. Push ke GitHub
2. Import di [vercel.com](https://vercel.com) → pilih repo **forecastingpm2.5**
3. Framework: **Next.js** (otomatis)
4. Deploy — root `vercel.json` sudah mengarahkan build ke folder `web/`

> Jika build masih gagal, buka **Project Settings → General → Root Directory** → isi `web` → **Redeploy**.

Detail lengkap: [`web/README.md`](web/README.md)

## Dataset

Taruh CSV di `web/data/` (untuk Vercel) atau `data/` (legacy):

| File | Keterangan |
|------|------------|
| `global_air_quality.csv` | Multi-kota (wajib) |
| `pm25.csv` | Time series Jakarta (opsional) |

## Legacy Laravel + Python

Versi lama masih ada untuk penelitian/model LSTM:

```bash
php artisan serve   # http://localhost:8000
```
