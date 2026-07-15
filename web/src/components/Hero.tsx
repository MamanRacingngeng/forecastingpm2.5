import LiveGauge from "@/components/LiveGauge";
import Reveal from "@/components/Reveal";

export default function Hero() {
  return (
    <header id="beranda" className="relative z-10 overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
        <div>
          <Reveal>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
              </span>
              Informasi Kualitas Udara
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem]">
              Pantau{" "}
              <span className="animate-gradient bg-gradient-to-r from-teal-300 via-emerald-200 to-amber-300 bg-[length:200%_auto] bg-clip-text text-transparent">
                PM2.5
              </span>
              <span className="mt-1 block text-2xl font-bold text-[var(--text-muted)] sm:text-3xl">
                di kotamu, kapan saja
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 max-w-lg text-base text-[var(--text-muted)] sm:text-lg">
              UdaraCast membantu masyarakat memahami kualitas udara melalui prediksi konsentrasi
              PM2.5 berbasis data <strong className="text-white">Global Air Quality</strong>. Pilih
              lokasi, lihat estimasi polusi, dan ketahui kategori kesehatannya.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#prediksi"
                className="btn-shine inline-flex rounded-full bg-gradient-to-r from-teal-400 to-teal-600 px-6 py-3 text-sm font-bold text-[#042f2e] shadow-lg shadow-teal-500/25 transition hover:-translate-y-0.5 hover:shadow-teal-500/40"
              >
                Cek Prediksi Sekarang
              </a>
              <a
                href="#tentang"
                className="inline-flex rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                Pelajari PM2.5
              </a>
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { num: "Global", label: "Cakupan Data" },
              { num: "PM2.5", label: "Indikator Utama" },
              { num: "Forecast", label: "Prediksi Tahunan" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={320 + i * 80}>
                <div className="card-hover rounded-2xl border border-white/8 bg-[var(--bg-card)] p-4 backdrop-blur-sm">
                  <span className="block text-xl font-bold text-[var(--primary)]">{s.num}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {s.label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={200}>
          <LiveGauge />
        </Reveal>
      </div>
    </header>
  );
}
