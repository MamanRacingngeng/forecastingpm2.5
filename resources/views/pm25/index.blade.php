<!DOCTYPE html>

<html lang="id">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>UdaraCast — Informasi & Prediksi Kualitas Udara PM2.5</title>
    <meta name="description" content="Platform informasi publik untuk memantau dan memprediksi konsentrasi PM2.5 di berbagai kota. Cek status kualitas udara dan kategori kesehatannya.">

    <link rel="preconnect" href="https://fonts.googleapis.com">

    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="{{ asset('css/pm25.css') }}">

</head>

<body>

    <div class="ambient" aria-hidden="true">

        <div class="orb orb-1"></div>

        <div class="orb orb-2"></div>

        <div class="orb orb-3"></div>

    </div>



    <nav class="navbar" id="navbar">

        <div class="container nav-inner">

            <div class="logo">

                <span class="logo-mark">🌫</span>

                <span>Udara<span style="color:var(--primary)">Cast</span></span>

            </div>

            <button class="nav-toggle" id="nav-toggle" type="button" aria-label="Buka menu navigasi" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>

            <ul class="nav-links" id="nav-links">

                <li><a href="#beranda">Beranda</a></li>

                <li><a href="#tentang">Tentang PM2.5</a></li>

                <li><a href="#prediksi">Prediksi</a></li>

            </ul>

        </div>

    </nav>



    <header id="beranda" class="hero">

        <div class="container hero-layout">

            <div class="hero-content">

                <div class="hero-badge">Informasi Kualitas Udara</div>

                <h1>

                    Pantau <span class="highlight">PM2.5</span>

                    <span class="line-2">di kotamu, kapan saja</span>

                </h1>

                <p class="hero-desc">

                    UdaraCast membantu masyarakat memahami kualitas udara melalui prediksi

                    konsentrasi PM2.5 berbasis data <strong>Global Air Quality</strong>.

                    Pilih lokasi, lihat estimasi polusi, dan ketahui kategori kesehatannya.

                </p>

                <div class="hero-actions">

                    <a href="#prediksi" class="btn btn-primary">Cek Prediksi Sekarang</a>

                    <a href="#tentang" class="btn btn-outline">Pelajari PM2.5</a>

                </div>

                <div class="hero-stats">

                    <div class="stat-card"><span class="stat-num">Global</span><span class="stat-label">Cakupan Data</span></div>

                    <div class="stat-card"><span class="stat-num">PM2.5</span><span class="stat-label">Indikator Utama</span></div>

                    <div class="stat-card"><span class="stat-num">Forecast</span><span class="stat-label">Prediksi Tahunan</span></div>

                </div>

            </div>



            <div class="hero-visual" aria-hidden="true">

                <div class="aqi-ring">

                    <div class="ring-orbit ring-orbit-2"></div>

                    <div class="ring-orbit"></div>

                    <div class="ring-core">

                        <span class="val">PM2.5</span>

                        <span class="unit">µg/m³</span>

                        <span class="lbl">Estimasi Real-time</span>

                    </div>

                    <div class="floating-tag tag-1"><strong>Estimasi</strong>Konsentrasi PM2.5</div>

                    <div class="floating-tag tag-2"><strong>Multi-kota</strong>Berbagai lokasi</div>

                    <div class="floating-tag tag-3"><strong>Kategori</strong>Status kesehatan</div>

                </div>

            </div>

        </div>

    </header>



    <section id="tentang" class="section">

        <div class="container">

            <div class="section-head center reveal">

                <span class="section-eyebrow">Mengapa PM2.5?</span>

                <h2 class="section-title">Partikel halus yang mengubah kualitas hidup</h2>

                <p class="section-subtitle">Ukuran ≤ 2.5 mikrometer — terlalu kecil untuk disaring, terlalu besar untuk diabaikan.</p>

            </div>

            <div class="about-grid reveal">

                <div class="about-card">

                    <div class="about-icon">🏭</div>

                    <h3>Sumber Polutan</h3>

                    <p>Industri, kendaraan bermotor, pembakaran biomassa, dan aktivitas perkotaan padat yang menghasilkan partikel halus.</p>

                </div>

                <div class="about-card">

                    <div class="about-icon">🫁</div>

                    <h3>Dampak Kesehatan</h3>

                    <p>Masuk ke paru-paru dan aliran darah — memicu ISPA, asma, hingga gangguan kardiovaskular jangka panjang.</p>

                </div>

                <div class="about-card">

                    <div class="about-icon">📡</div>

                    <h3>Butuh Prediksi</h3>

                    <p>Estimasi dini membantu pemerintah dan masyarakat mengambil langkah mitigasi sebelum polusi memuncak.</p>

                </div>

            </div>

            <div class="pm25-scale reveal">

                <h3>Standar Kategori Kualitas Udara (µg/m³)</h3>

                <div class="scale-bar">

                    <div class="scale-item good"><span>0–12</span>Baik</div>

                    <div class="scale-item moderate"><span>12–35</span>Sedang</div>

                    <div class="scale-item unhealthy"><span>35–55</span>Tidak Sehat</div>

                    <div class="scale-item very-unhealthy"><span>55+</span>Sangat Tidak Sehat</div>

                </div>

            </div>

        </div>

    </section>



    <section id="prediksi" class="section section-alt">

        <div class="container">

            <div class="prediksi-header reveal">

                <span class="section-eyebrow">Prediksi</span>

                <h2 class="section-title">Cek kualitas udara di kotamu</h2>

                <p class="section-subtitle">

                    Pilih negara, kota, dan tahun — dapatkan estimasi konsentrasi PM2.5 beserta kategori kesehatannya.

                </p>

            </div>



            <div class="dataset-overview reveal" id="dataset-overview">

                <div class="overview-item"><span>🌍 Negara</span><strong id="ov-countries">-</strong></div>

                <div class="overview-item"><span>🏙️ Kota</span><strong id="ov-cities">-</strong></div>

                <div class="overview-item"><span>📅 Periode Data</span><strong id="ov-years">-</strong></div>

            </div>



            <div class="dashboard-grid reveal">

                <div class="dashboard-form-card">

                    <h3>Cek Kualitas Udara</h3>

                    <p class="form-subtitle">Pilih lokasi dan tahun untuk melihat estimasi PM2.5.</p>

                    <form id="user-predict-form">

                        <div class="form-group">

                            <label for="select-country">Negara</label>

                            <select id="select-country" required>

                                <option value="">Memuat negara...</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="select-city">Kota</label>

                            <select id="select-city" required disabled>

                                <option value="">Pilih negara terlebih dahulu</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="select-year">Tahun</label>

                            <select id="select-year" required disabled>

                                <option value="">Pilih kota terlebih dahulu</option>

                            </select>

                            <small class="field-hint" id="year-hint"></small>

                        </div>

                        <button type="submit" class="btn btn-primary btn-block" id="btn-predict">

                            Prediksi Sekarang →

                        </button>

                    </form>

                    <div class="model-info-box">

                        Hasil yang ditampilkan bersifat <strong>estimasi</strong> berbasis data historis,

                        bukan pengukuran langsung di lapangan. Untuk keputusan kesehatan,

                        rujuk sumber resmi pemerintah setempat.

                    </div>

                </div>



                <div class="dashboard-result-card" id="result-card">

                    <div id="result-placeholder" class="result-placeholder">

                        <div class="placeholder-visual">🌍</div>

                        <p>Pilih <strong>negara</strong>, <strong>kota</strong>, dan <strong>tahun</strong>,<br>lalu klik <strong>Prediksi Sekarang</strong>.</p>

                    </div>

                    <div id="result-content" class="hidden">

                        <div class="result-header">

                            <span id="result-emoji" class="result-emoji">🟢</span>

                            <div>

                                <span id="result-status" class="result-status">Baik</span>

                                <span id="result-year-badge" class="year-badge">Forecast</span>

                            </div>

                        </div>

                        <div class="result-details">

                            <div class="result-row"><span>Negara</span><strong id="result-country">-</strong></div>

                            <div class="result-row"><span>Kota</span><strong id="result-city">-</strong></div>

                            <div class="result-row"><span>Tahun</span><strong id="result-year">-</strong></div>

                            <div class="result-row highlight-row">

                                <span>Prediksi PM2.5</span>

                                <strong id="result-pm25" class="pm25-value">-</strong>

                            </div>

                        </div>

                        <div class="result-stats-grid">

                            <div class="stat-mini"><span>Rata-rata Historis</span><strong id="result-historical">-</strong></div>

                            <div class="stat-mini"><span>Riwayat Data</span><strong id="result-datapoints">-</strong></div>

                            <div class="stat-mini"><span>Range PM2.5</span><strong id="result-range">-</strong></div>

                        </div>

                        <p id="result-message" class="result-message"></p>

                        <p id="result-note" class="result-note"></p>

                    </div>

                    <div id="result-loading" class="result-loading hidden">

                        <div class="spinner"></div>

                        <p>Menghitung estimasi kualitas udara…<br><small style="opacity:0.75">Proses pertama kali ±10–30 detik</small></p>

                    </div>

                </div>

            </div>

        </div>

    </section>



    <footer class="footer">

        <div class="container">

            <p class="footer-brand">Udara<span style="color:var(--primary)">Cast</span></p>

            <p>Platform informasi publik untuk prediksi kualitas udara PM2.5</p>

            <p class="footer-disclaimer">

                Prediksi pada situs ini bersifat estimasi berbasis data historis.

                Untuk keputusan kesehatan, selalu merujuk pada sumber resmi pemerintah setempat.

            </p>

            <p class="footer-sub">&copy; {{ date('Y') }} UdaraCast · Data: Global Air Quality</p>

        </div>

    </footer>



    <script>

        window.PM25_API = {

            countries: "{{ route('api.countries') }}",

            cities: "{{ route('api.cities') }}",

            years: "{{ route('api.years') }}",

            overview: "{{ route('api.overview') }}",

            userPredict: "{{ route('api.user-predict') }}",

        };

    </script>

    <script src="{{ asset('js/pm25.js') }}"></script>

</body>

</html>


