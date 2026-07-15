import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UdaraCast — Informasi & Prediksi Kualitas Udara PM2.5",
  description:
    "Platform informasi publik untuk memantau dan memprediksi konsentrasi PM2.5 di berbagai kota. Cek status kualitas udara dan kategori kesehatannya.",
  openGraph: {
    title: "UdaraCast",
    description: "Prediksi kualitas udara PM2.5 untuk berbagai kota di dunia.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${syne.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
