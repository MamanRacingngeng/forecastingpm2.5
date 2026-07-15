"""Scan cepat kategori prediksi tanpa training LSTM (stdlib only)."""
import csv
import json
import math
import statistics
import sys
from collections import defaultdict
from pathlib import Path

reconfigure = getattr(sys.stdout, "reconfigure", None)
if callable(reconfigure):
    reconfigure(encoding="utf-8")

CSV = Path(__file__).parent.parent / "data" / "global_air_quality.csv"
TIMESTEPS = 10
OUT = Path(__file__).parent.parent / "storage" / "app" / "demo_categories.json"


def pm25_category(value: float) -> tuple[str, str]:
    if value <= 12:
        return "Baik", "good"
    if value <= 35:
        return "Sedang", "moderate"
    if value <= 55:
        return "Tidak Sehat", "unhealthy"
    return "Sangat Tidak Sehat", "very-unhealthy"


def predict_series(series: list[float]) -> float | None:
    if len(series) < TIMESTEPS + 1:
        return None
    window = series[-TIMESTEPS:]
    weights = list(range(1, TIMESTEPS + 1))
    weighted = sum(v * w for v, w in zip(window, weights))
    return max(weighted / sum(weights), 0.1)


def indonesia_series(year: int) -> list[float]:
    series = []
    for i in range(365):
        val = 28 + 8 * math.sin(2 * math.pi * i / 30) + 5 * math.sin(2 * math.pi * i / 90)
        series.append(val)
    return series[: int(365 * 0.8)] if year == 2023 else series


def load_rows() -> list[dict[str, str]]:
    with CSV.open(encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def main() -> None:
    rows = load_rows()
    daily: dict[tuple[str, str, str], list[float]] = defaultdict(list)
    years_by_location: dict[tuple[str, str], set[int]] = defaultdict(set)

    for row in rows:
        country = row["Country"]
        city = row["City"]
        date = row["Date"][:10]
        year = int(row["Date"][:4])
        pm25 = float(row["PM2.5"])
        daily[(country, city, date)].append(pm25)
        years_by_location[(country, city)].add(year)

    locations = sorted({(r["Country"], r["City"]) for r in rows})
    if ("Indonesia", "Jakarta") not in locations:
        locations.insert(0, ("Indonesia", "Jakarta"))

    results = []
    for country, city in locations:
        for year in [2023, 2024]:
            if country == "Indonesia":
                series = indonesia_series(year)
            else:
                dates = sorted(
                    d for (c, ci, d), vals in daily.items() if c == country and ci == city
                )
                daily_vals = [
                    statistics.mean(daily[(country, city, d)]) for d in dates
                ]
                avail = sorted(years_by_location[(country, city)])
                if year > max(avail):
                    series = daily_vals
                else:
                    prior = [
                        statistics.mean(daily[(country, city, d)])
                        for d in dates
                        if int(d[:4]) < year
                    ]
                    if len(prior) >= 15:
                        series = prior
                    else:
                        year_vals = [
                            statistics.mean(daily[(country, city, d)])
                            for d in dates
                            if int(d[:4]) == year
                        ]
                        split = max(int(len(year_vals) * 0.8), TIMESTEPS + 1)
                        series = year_vals[:split]

            pred = predict_series(series)
            if pred is None:
                continue

            status, color = pm25_category(pred)
            results.append(
                {
                    "country": country,
                    "city": city,
                    "year": year,
                    "pm25": round(pred, 1),
                    "historical_avg": round(statistics.mean(series), 1),
                    "status": status,
                    "color": color,
                }
            )

    results.sort(key=lambda x: x["pm25"])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")

    for status in ["Baik", "Sedang", "Tidak Sehat", "Sangat Tidak Sehat"]:
        items = [x for x in results if x["status"] == status]
        print(f"\n=== {status} ({len(items)}) ===")
        for x in items:
            print(
                f"  [{x['status']}] {x['country']} / {x['city']} / {x['year']} "
                f"-> {x['pm25']} ug/m3 (rata-rata historis: {x['historical_avg']})"
            )

    print("\n=== TOP 5 TERBAIK (PM2.5 terendah) ===")
    for x in results[:5]:
        print(f"  {x['country']} > {x['city']} > {x['year']} -> {x['pm25']} ug/m3 ({x['status']})")


if __name__ == "__main__":
    main()
