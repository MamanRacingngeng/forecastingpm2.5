# UdaraCast — Next.js (Vercel)

Platform informasi & prediksi kualitas udara PM2.5.

## Menjalankan Lokal

```bash
cd web
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Deploy ke Vercel

1. Push repo ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Set **Root Directory** ke `web`
4. Deploy

Pastikan folder `web/data/` berisi:
- `global_air_quality.csv`
- `pm25.csv` (opsional, untuk Jakarta)

## Struktur

```
web/
├── data/              ← dataset CSV
├── src/
│   ├── app/           ← halaman & API routes
│   ├── components/    ← UI React
│   └── lib/           ← logika prediksi & data
└── vercel.json
```

## API

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/countries` | GET | Daftar negara |
| `/api/cities?country=` | GET | Daftar kota |
| `/api/years?country=&city=` | GET | Daftar tahun |
| `/api/overview` | GET | Ringkasan dataset |
| `/api/predict` | POST | Prediksi PM2.5 |
