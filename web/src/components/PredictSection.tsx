"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import CountUp from "@/components/CountUp";
import Reveal from "@/components/Reveal";
import type { Overview, PredictResult, YearOption } from "@/lib/types";

type ViewState = "idle" | "loading" | "result" | "error";

export default function PredictSection() {
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [years, setYears] = useState<YearOption[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [year, setYear] = useState("");

  const [view, setView] = useState<ViewState>("idle");
  const [result, setResult] = useState<PredictResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/overview")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOverview(json.data.overview);
      })
      .catch(() => {});

    fetch("/api/countries")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCountries(json.data.countries);
      })
      .catch(() => {});
  }, []);

  const loadYears = useCallback(async (c: string, ci: string) => {
    const res = await fetch(
      `/api/years?country=${encodeURIComponent(c)}&city=${encodeURIComponent(ci)}`,
    );
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    setYears(json.data.years);
    setYear("");
  }, []);

  const loadCities = useCallback(
    async (c: string) => {
      const res = await fetch(`/api/cities?country=${encodeURIComponent(c)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setCities(json.data.cities);
      if (json.data.cities.length === 1) {
        setCity(json.data.cities[0]);
        await loadYears(c, json.data.cities[0]);
      } else {
        setCity("");
        setYears([]);
        setYear("");
      }
    },
    [loadYears],
  );

  const onCountryChange = async (value: string) => {
    setCountry(value);
    setCity("");
    setYear("");
    setYears([]);
    setCities([]);
    if (value) await loadCities(value);
  };

  const onCityChange = async (value: string) => {
    setCity(value);
    setYear("");
    if (country && value) await loadYears(country, value);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!country || !city || !year) return;

    setView("loading");
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, city, year: parseInt(year, 10) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Prediksi gagal");
      setResult(json.data);
      setView("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setView("error");
    }
  };

  const selectClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-teal-400/20 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <section id="prediksi" className="relative bg-[var(--bg-soft)]/80 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-10 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
              Prediksi
            </span>
            <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
              Cek kualitas udara di kotamu
            </h2>
            <p className="mt-3 text-[var(--text-muted)]">
              Pilih negara, kota, dan tahun — dapatkan estimasi konsentrasi PM2.5 beserta kategori
              kesehatannya.
            </p>
          </div>
        </Reveal>

        {overview && (
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: "🌍", label: "Negara", value: `${overview.countries} negara` },
              { icon: "🏙️", label: "Kota", value: `${overview.cities} kota` },
              { icon: "📅", label: "Periode Data", value: overview.date_range },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 80}>
                <div className="card-hover rounded-2xl border border-white/8 bg-[var(--bg-card)] px-4 py-4">
                  <span className="text-sm text-[var(--text-muted)]">
                    {item.icon} {item.label}
                  </span>
                  <strong className="mt-1 block text-base font-bold">{item.value}</strong>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Reveal delay={100}>
            <form
              onSubmit={onSubmit}
              className="h-full rounded-2xl border border-white/8 bg-[var(--bg-card)] p-6 backdrop-blur-sm md:p-8"
            >
              <h3 className="font-display text-xl font-bold">Cek Kualitas Udara</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Pilih lokasi dan tahun untuk melihat estimasi PM2.5.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="country" className="mb-1.5 block text-sm font-semibold">
                    Negara
                  </label>
                  <select
                    id="country"
                    required
                    className={selectClass}
                    value={country}
                    onChange={(e) => onCountryChange(e.target.value)}
                  >
                    <option value="">-- Pilih Negara --</option>
                    {countries.map((c) => (
                      <option key={c} value={c} className="bg-[#141a26]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="city" className="mb-1.5 block text-sm font-semibold">
                    Kota
                  </label>
                  <select
                    id="city"
                    required
                    disabled={!country}
                    className={selectClass}
                    value={city}
                    onChange={(e) => onCityChange(e.target.value)}
                  >
                    <option value="">
                      {country ? "-- Pilih Kota --" : "Pilih negara terlebih dahulu"}
                    </option>
                    {cities.map((c) => (
                      <option key={c} value={c} className="bg-[#141a26]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="year" className="mb-1.5 block text-sm font-semibold">
                    Tahun
                  </label>
                  <select
                    id="year"
                    required
                    disabled={!city}
                    className={selectClass}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    <option value="">
                      {city ? "-- Pilih Tahun --" : "Pilih kota terlebih dahulu"}
                    </option>
                    {years.map((y) => (
                      <option key={y.year} value={y.year} className="bg-[#141a26]">
                        {y.label}
                      </option>
                    ))}
                  </select>
                  {city && (
                    <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                      Pilih tahun historis atau tahun prediksi (forecast)
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={view === "loading"}
                  className="btn-shine w-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 py-3.5 text-sm font-bold text-[#042f2e] shadow-lg shadow-teal-500/20 transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {view === "loading" ? "Menghitung..." : "Prediksi Sekarang →"}
                </button>
              </div>

              <p className="mt-5 rounded-xl border border-white/8 bg-white/3 p-4 text-xs leading-relaxed text-[var(--text-muted)]">
                Hasil yang ditampilkan bersifat <strong className="text-white">estimasi</strong>{" "}
                berbasis data historis, bukan pengukuran langsung di lapangan. Untuk keputusan
                kesehatan, rujuk sumber resmi pemerintah setempat.
              </p>
            </form>
          </Reveal>

          <Reveal delay={180}>
            <div
              className={`min-h-[420px] rounded-2xl border border-white/8 bg-[var(--bg-card)] p-6 backdrop-blur-sm md:p-8 ${
                result ? `status-${result.color} result-card-active` : ""
              }`}
            >
              {view === "idle" && (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                  <div className="float-tag mb-4 text-5xl">🌍</div>
                  <p className="max-w-xs text-sm text-[var(--text-muted)]">
                    Pilih <strong className="text-white">negara</strong>,{" "}
                    <strong className="text-white">kota</strong>, dan{" "}
                    <strong className="text-white">tahun</strong>, lalu klik{" "}
                    <strong className="text-white">Prediksi Sekarang</strong>.
                  </p>
                </div>
              )}

              {view === "loading" && (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 text-center">
                  <div className="spinner" />
                  <p className="text-sm text-[var(--text-muted)]">
                    Menghitung estimasi kualitas udara
                    <span className="loading-dots inline-flex gap-0.5 pl-1">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </span>
                  </p>
                </div>
              )}

              {view === "error" && (
                <div className="animate-result-in flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                  <div className="mb-4 text-5xl">⚠️</div>
                  <p className="text-sm font-semibold text-[var(--very-unhealthy)]">{error}</p>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    Coba pilih lokasi lain atau klik Prediksi Sekarang lagi.
                  </p>
                </div>
              )}

              {view === "result" && result && (
                <div className="space-y-6">
                  <div className="animate-result-in flex items-center gap-4">
                    <span className="text-4xl">{result.emoji}</span>
                    <div>
                      <p className={`text-2xl font-bold text-[var(--status-color,var(--primary))]`}>
                        {result.status}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold ${
                          result.year_type === "forecast"
                            ? "bg-amber-400/15 text-amber-300"
                            : "bg-white/10 text-[var(--text-muted)]"
                        }`}
                      >
                        {result.year_type === "forecast" ? "Prediksi" : "Historis"}
                      </span>
                    </div>
                  </div>

                  <div className="animate-result-in animate-result-in-delay-1 space-y-3 text-sm">
                    {[
                      ["Negara", result.country],
                      ["Kota", result.city],
                      [
                        "Tahun",
                        `${result.year} (${result.year_type === "forecast" ? "Prediksi" : "Historis"})`,
                      ],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between border-b border-white/6 pb-2">
                        <span className="text-[var(--text-muted)]">{label}</span>
                        <strong>{val}</strong>
                      </div>
                    ))}
                    <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                      <span className="font-semibold">Prediksi PM2.5</span>
                      <strong className="text-2xl font-bold text-[var(--primary)]">
                        <CountUp value={result.prediction} suffix={` ${result.unit}`} />
                      </strong>
                    </div>
                  </div>

                  <div className="animate-result-in animate-result-in-delay-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      ["Rata-rata Historis", `${result.historical_avg} µg/m³`],
                      ["Riwayat Data", `${result.data_points} titik`],
                      ["Range PM2.5", `${result.min_pm25} – ${result.max_pm25} µg/m³`],
                    ].map(([label, val]) => (
                      <div key={label} className="card-hover rounded-xl bg-white/5 p-3 text-center">
                        <span className="block text-xs text-[var(--text-muted)]">{label}</span>
                        <strong className="mt-1 block text-sm font-bold">{val}</strong>
                      </div>
                    ))}
                  </div>

                  <p className="animate-result-in animate-result-in-delay-3 text-sm leading-relaxed text-[var(--text-muted)]">
                    {result.message}
                  </p>
                  {result.prediction_note && (
                    <p className="text-xs text-[var(--text-muted)]">{result.prediction_note}</p>
                  )}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
