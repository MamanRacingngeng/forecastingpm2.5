import fs from "fs";
import path from "path";

import type { YearOption } from "./types";

const TIMESTEPS = 10;

let globalRowsCache: Record<string, string>[] | null = null;
let pm25RowsCache: Record<string, string>[] | null = null;

function dataDir(): string {
  const local = path.join(process.cwd(), "data");
  if (fs.existsSync(local)) return local;
  return path.join(process.cwd(), "..", "data");
}

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(header.map((key, i) => [key, (values[i] ?? "").trim()]));
  });
}

function readCsv(filename: string): Record<string, string>[] {
  const filePath = path.join(dataDir(), filename);
  if (!fs.existsSync(filePath)) return [];
  return parseCsv(fs.readFileSync(filePath, "utf-8"));
}

export function pm25SeriesExists(): boolean {
  return fs.existsSync(path.join(dataDir(), "pm25.csv"));
}

export function getGlobalRows(): Record<string, string>[] {
  if (!globalRowsCache) {
    globalRowsCache = readCsv("global_air_quality.csv");
  }
  return globalRowsCache;
}

export function getPm25Rows(): Record<string, string>[] {
  if (!pm25RowsCache) {
    pm25RowsCache = readCsv("pm25.csv");
  }
  return pm25RowsCache;
}

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatDateIndonesian(dateStr: string): string {
  const d = new Date(dateStr.slice(0, 10));
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function min(nums: number[]): number {
  return nums.length ? Math.min(...nums) : 0;
}

function max(nums: number[]): number {
  return nums.length ? Math.max(...nums) : 0;
}

export function getOverview() {
  const rows = getGlobalRows();
  const dates = [...new Set(rows.map((r) => r.Date.slice(0, 10)))].sort();
  const citySet = new Set(rows.map((r) => `${r.Country}|${r.City}`));

  return {
    countries: getCountries().length,
    cities: citySet.size + (pm25SeriesExists() ? 0 : 0),
    date_range: dates.length
      ? `${formatDateIndonesian(dates[0])} – ${formatDateIndonesian(dates[dates.length - 1])}`
      : "-",
  };
}

export function getCountries(): string[] {
  const countries = [...new Set(getGlobalRows().map((r) => r.Country))].sort();
  if (!countries.includes("Indonesia")) {
    countries.unshift("Indonesia");
  }
  return countries;
}

export function getCities(country: string): string[] {
  if (country === "Indonesia") return ["Jakarta"];
  return [...new Set(
    getGlobalRows()
      .filter((r) => r.Country === country)
      .map((r) => r.City),
  )].sort();
}

function getPm25SeriesYears(): YearOption[] {
  const years = [...new Set(getPm25Rows().map((r) => parseInt(r.datetime.slice(0, 4), 10)))].sort(
    (a, b) => a - b,
  );
  const result: YearOption[] = years.map((y) => ({
    year: y,
    type: "historical",
    label: `${y} — Data Historis`,
  }));
  const forecastYear = years[years.length - 1] + 1;
  result.push({
    year: forecastYear,
    type: "forecast",
    label: `${forecastYear} — Prediksi Forecast`,
  });
  return result;
}

export function getYears(country: string, city: string): YearOption[] {
  if (country === "Indonesia" && city === "Jakarta" && pm25SeriesExists()) {
    return getPm25SeriesYears();
  }

  const years = [
    ...new Set(
      getGlobalRows()
        .filter((r) => r.Country === country && r.City === city)
        .map((r) => parseInt(r.Date.slice(0, 4), 10)),
    ),
  ].sort((a, b) => a - b);

  const result: YearOption[] = years.map((y) => ({
    year: y,
    type: "historical",
    label: `${y} — Data Historis`,
  }));

  const forecastYear = years[years.length - 1] + 1;
  result.push({
    year: forecastYear,
    type: "forecast",
    label: `${forecastYear} — Prediksi Forecast`,
  });

  return result;
}

function getPm25SeriesStats(year: number) {
  let values = getPm25Rows()
    .filter((r) => parseInt(r.datetime.slice(0, 4), 10) === year)
    .map((r) => parseFloat(r["PM2.5"]));

  if (!values.length) {
    values = getPm25Rows().map((r) => parseFloat(r["PM2.5"]));
  }

  return {
    data_points: values.length,
    avg_pm25: Math.round(avg(values) * 10) / 10,
    min_pm25: Math.round(min(values) * 10) / 10,
    max_pm25: Math.round(max(values) * 10) / 10,
  };
}

export function getLocationStats(country: string, city: string, year: number) {
  if (country === "Indonesia" && city === "Jakarta" && pm25SeriesExists()) {
    return getPm25SeriesStats(year);
  }

  let values = getGlobalRows()
    .filter(
      (r) =>
        r.Country === country &&
        r.City === city &&
        parseInt(r.Date.slice(0, 4), 10) === year,
    )
    .map((r) => parseFloat(r["PM2.5"]));

  if (!values.length) {
    values = getGlobalRows()
      .filter((r) => r.Country === country && r.City === city)
      .map((r) => parseFloat(r["PM2.5"]));
  }

  return {
    data_points: values.length,
    avg_pm25: Math.round(avg(values) * 10) / 10,
    min_pm25: Math.round(min(values) * 10) / 10,
    max_pm25: Math.round(max(values) * 10) / 10,
  };
}

function getPm25SeriesForPrediction(year: number): number[] {
  const rows = [...getPm25Rows()].sort((a, b) => a.datetime.localeCompare(b.datetime));
  const availableYears = [...new Set(rows.map((r) => parseInt(r.datetime.slice(0, 4), 10)))].sort(
    (a, b) => a - b,
  );
  const series = rows.map((r) => parseFloat(r["PM2.5"]));
  const maxYear = availableYears[availableYears.length - 1];

  if (year > maxYear) return series;

  const prior = rows
    .filter((r) => parseInt(r.datetime.slice(0, 4), 10) < year)
    .map((r) => parseFloat(r["PM2.5"]));

  if (prior.length >= 15) return prior;

  const yearVals = rows
    .filter((r) => parseInt(r.datetime.slice(0, 4), 10) === year)
    .map((r) => parseFloat(r["PM2.5"]));

  const split = Math.max(Math.floor(yearVals.length * 0.8), 15);
  return yearVals.slice(0, split);
}

export function getSeriesForPrediction(country: string, city: string, year: number): number[] {
  if (country === "Indonesia" && city === "Jakarta" && pm25SeriesExists()) {
    return getPm25SeriesForPrediction(year);
  }

  const daily: Record<string, number[]> = {};
  for (const row of getGlobalRows()) {
    if (row.Country !== country || row.City !== city) continue;
    const date = row.Date.slice(0, 10);
    if (!daily[date]) daily[date] = [];
    daily[date].push(parseFloat(row["PM2.5"]));
  }

  const dates = Object.keys(daily).sort();
  const availableYears = [...new Set(dates.map((d) => parseInt(d.slice(0, 4), 10)))];
  const maxYear = Math.max(...availableYears);

  if (year > maxYear) {
    return dates.map((d) => avg(daily[d]));
  }

  const prior: number[] = [];
  for (const d of dates) {
    if (parseInt(d.slice(0, 4), 10) < year) {
      prior.push(avg(daily[d]));
    }
  }

  if (prior.length >= 15) return prior;

  const yearVals: number[] = [];
  for (const d of dates) {
    if (parseInt(d.slice(0, 4), 10) === year) {
      yearVals.push(avg(daily[d]));
    }
  }

  const split = Math.max(Math.floor(yearVals.length * 0.8), 15);
  return yearVals.slice(0, split);
}

export { TIMESTEPS };
