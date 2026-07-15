"use client";

import { useEffect, useState } from "react";

const SAMPLES = [
  { value: 18.4, status: "Sedang", color: "#facc15" },
  { value: 8.2, status: "Baik", color: "#4ade80" },
  { value: 42.1, status: "Tidak Sehat", color: "#fb923c" },
  { value: 28.6, status: "Sedang", color: "#facc15" },
];

export default function LiveGauge() {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState(SAMPLES[0].value);
  const sample = SAMPLES[index];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % SAMPLES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const target = SAMPLES[index].value;
    const start = display;
    const startTime = performance.now();
    const duration = 900;

    let frame: number;
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round((start + (target - start) * eased) * 10) / 10);
      if (p < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const pct = Math.min((display / 60) * 100, 100);

  return (
    <div className="relative mx-auto flex w-full max-w-sm items-center justify-center lg:max-w-none">
      <div className="gauge-pulse relative aspect-square w-full max-w-[320px]">
        <div
          className="absolute inset-0 rounded-full transition-colors duration-700"
          style={{
            background: `conic-gradient(from 180deg, ${sample.color}40 ${pct}%, transparent ${pct}%)`,
          }}
        />
        <div className="absolute inset-0 rounded-full border border-teal-400/25" />
        <div className="ring-spin absolute inset-4 rounded-full border border-dashed border-white/15" />
        <div className="ring-spin-reverse absolute inset-8 rounded-full border border-teal-400/10" />

        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-[var(--bg-card)]/90 text-center shadow-2xl backdrop-blur-sm">
          <span
            className="font-display text-4xl font-extrabold tabular-nums transition-colors duration-500 sm:text-5xl"
            style={{ color: sample.color }}
          >
            {display.toFixed(1)}
          </span>
          <span className="text-sm text-[var(--text-muted)]">µg/m³</span>
          <span
            className="mt-2 rounded-full px-3 py-0.5 text-xs font-bold transition-all duration-500"
            style={{ background: `${sample.color}22`, color: sample.color }}
          >
            {sample.status}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--primary)]">
            Live Preview
          </span>
        </div>

        <div className="float-tag float-tag-1 absolute -left-1 top-10 hidden rounded-xl border border-white/10 bg-[var(--bg-card)]/90 px-3 py-2 text-xs backdrop-blur-sm sm:block">
          <strong className="text-[var(--primary)]">Estimasi</strong> PM2.5
        </div>
        <div className="float-tag float-tag-2 absolute -right-1 bottom-20 hidden rounded-xl border border-white/10 bg-[var(--bg-card)]/90 px-3 py-2 text-xs backdrop-blur-sm sm:block">
          <strong className="text-[var(--primary)]">Multi-kota</strong> Global
        </div>
        <div className="float-tag float-tag-3 absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-xl border border-white/10 bg-[var(--bg-card)]/90 px-3 py-2 text-xs backdrop-blur-sm sm:block">
          <strong className="text-[var(--primary)]">Kategori</strong> Kesehatan
        </div>
      </div>
    </div>
  );
}
