import Reveal from "@/components/Reveal";

const cards = [
  {
    icon: "🏭",
    title: "Sumber Polutan",
    text: "Industri, kendaraan bermotor, pembakaran biomassa, dan aktivitas perkotaan padat yang menghasilkan partikel halus.",
  },
  {
    icon: "🫁",
    title: "Dampak Kesehatan",
    text: "Masuk ke paru-paru dan aliran darah — memicu ISPA, asma, hingga gangguan kardiovaskular jangka panjang.",
  },
  {
    icon: "📡",
    title: "Butuh Prediksi",
    text: "Estimasi dini membantu pemerintah dan masyarakat mengambil langkah mitigasi sebelum polusi memuncak.",
  },
];

const scale = [
  { range: "0–12", label: "Baik", color: "bg-emerald-500" },
  { range: "12–35", label: "Sedang", color: "bg-yellow-400" },
  { range: "35–55", label: "Tidak Sehat", color: "bg-orange-400" },
  { range: "55+", label: "Sangat Tidak Sehat", color: "bg-red-400" },
];

export default function AboutSection() {
  return (
    <section id="tentang" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
              Mengapa PM2.5?
            </span>
            <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
              Partikel halus yang mengubah kualitas hidup
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[var(--text-muted)]">
              Ukuran ≤ 2.5 mikrometer — terlalu kecil untuk disaring, terlalu besar untuk diabaikan.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <Reveal key={card.title} delay={i * 100}>
              <article className="card-hover h-full rounded-2xl border border-white/8 bg-[var(--bg-card)] p-6 backdrop-blur-sm">
                <div className="mb-4 text-3xl transition-transform duration-300 group-hover:scale-110">
                  {card.icon}
                </div>
                <h3 className="font-display mb-2 text-lg font-bold">{card.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">{card.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="mt-10 rounded-2xl border border-white/8 bg-[var(--bg-card)] p-6 md:p-8">
            <h3 className="font-display mb-5 text-center text-lg font-bold">
              Standar Kategori Kualitas Udara (µg/m³)
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {scale.map((item, i) => (
                <div
                  key={item.label}
                  className={`scale-item rounded-xl ${item.color} px-3 py-4 text-center text-sm font-bold text-[#042f2e]`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="block text-base">{item.range}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
