export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/8 py-12 text-center">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-display text-lg font-bold">
          Udara<span className="text-[var(--primary)]">Cast</span>
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Platform informasi publik untuk prediksi kualitas udara PM2.5
        </p>
        <p className="mx-auto mt-4 max-w-lg text-xs leading-relaxed text-[var(--text-muted)]">
          Prediksi pada situs ini bersifat estimasi berbasis data historis. Untuk keputusan
          kesehatan, selalu merujuk pada sumber resmi pemerintah setempat.
        </p>
        <p className="mt-4 text-xs text-[var(--text-muted)] opacity-70">
          © {year} UdaraCast · Data: Global Air Quality
        </p>
      </div>
    </footer>
  );
}
