import {
  getLocationStats,
  getSeriesForPrediction,
  getYears,
  TIMESTEPS,
} from "./airQuality";
import type { Pm25Category, PredictResult } from "./types";

export function pm25Category(value: number): Pm25Category {
  if (value <= 12) {
    return {
      label: "Baik",
      emoji: "🟢",
      color: "good",
      message: "Udara dalam kondisi baik dan aman untuk seluruh aktivitas luar ruangan.",
    };
  }
  if (value <= 35) {
    return {
      label: "Sedang",
      emoji: "🟡",
      color: "moderate",
      message:
        "Kualitas udara dapat diterima. Kelompok sensitif sebaiknya membatasi aktivitas luar ruangan yang lama.",
    };
  }
  if (value <= 55) {
    return {
      label: "Tidak Sehat",
      emoji: "🟠",
      color: "unhealthy",
      message:
        "Anggota kelompok sensitif dapat mengalami dampak kesehatan. Kurangi aktivitas di luar ruangan.",
    };
  }
  return {
    label: "Sangat Tidak Sehat",
    emoji: "🔴",
    color: "very-unhealthy",
    message: "Semua orang berisiko terkena dampak kesehatan. Hindari aktivitas luar ruangan.",
  };
}

function weightedPredict(series: number[]): number {
  const window = series.slice(-TIMESTEPS);
  let weighted = 0;
  let weightSum = 0;
  window.forEach((value, i) => {
    const w = i + 1;
    weighted += value * w;
    weightSum += w;
  });
  return Math.max(Math.round((weighted / weightSum) * 10) / 10, 0.1);
}

export function predict(country: string, city: string, year: number): PredictResult {
  const series = getSeriesForPrediction(country, city, year);
  if (series.length < TIMESTEPS + 1) {
    throw new Error("Data historis tidak cukup untuk prediksi lokasi ini.");
  }

  const prediction = weightedPredict(series);
  const category = pm25Category(prediction);
  const years = getYears(country, city);
  const yearMeta = years.find((y) => y.year === year) ?? {
    year,
    type: "forecast" as const,
    label: String(year),
  };
  const stats = getLocationStats(country, city, year);

  return {
    country,
    city,
    year,
    prediction,
    unit: "µg/m³",
    status: category.label,
    emoji: category.emoji,
    color: category.color,
    message: category.message,
    year_type: yearMeta.type,
    year_label: yearMeta.label,
    historical_avg: stats.avg_pm25,
    data_points: stats.data_points,
    min_pm25: stats.min_pm25,
    max_pm25: stats.max_pm25,
    prediction_note:
      yearMeta.type === "forecast"
        ? "Estimasi berdasarkan pola data historis di lokasi ini."
        : `Estimasi untuk tahun ${year} berdasarkan data historis sebelumnya.`,
  };
}
