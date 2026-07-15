"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#beranda", label: "Beranda", id: "beranda" },
  { href: "#tentang", label: "Tentang PM2.5", id: "tentang" },
  { href: "#prediksi", label: "Prediksi", id: "prediksi" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("beranda");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = links.map((l) => document.getElementById(l.id)).filter(Boolean);

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((s) => obs.observe(s!));
    return () => obs.disconnect();
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/8 bg-[#090b10]/90 py-3 shadow-lg backdrop-blur-xl"
          : "py-4"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#beranda"
          className="font-display flex items-center gap-3 text-base font-bold tracking-tight transition hover:opacity-80"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-lg transition hover:border-teal-400/30 hover:shadow-lg hover:shadow-teal-500/10">
            🌫
          </span>
          Udara<span className="text-[var(--primary)]">Cast</span>
        </a>

        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 md:hidden"
          aria-label="Menu navigasi"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className={`h-0.5 w-5 bg-white transition ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-5 bg-white transition ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-5 bg-white transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>

        <ul
          className={`absolute left-4 right-4 top-[calc(100%+0.5rem)] flex flex-col gap-1 rounded-2xl border border-white/10 bg-[#090b10]/95 p-2 shadow-2xl backdrop-blur-xl md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-white/5 md:p-1 md:shadow-none ${
            open ? "flex" : "hidden md:flex"
          }`}
        >
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition md:rounded-full md:px-4 md:py-2 ${
                  active === link.id
                    ? "nav-link-active"
                    : "text-[var(--text-muted)] hover:bg-[var(--primary)] hover:text-[#042f2e]"
                }`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
