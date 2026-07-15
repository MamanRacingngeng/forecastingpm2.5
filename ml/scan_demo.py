"""Scan semua negara/kota untuk kategori prediksi demo."""
import json
import subprocess
import sys
from pathlib import Path

SCRIPT = Path(__file__).parent / "predict_user.py"
PYTHON = sys.executable

LOCATIONS = [
    ("Indonesia", "Jakarta"),
    ("Australia", "Sydney"),
    ("Brazil", "Rio de Janeiro"),
    ("Canada", "Toronto"),
    ("China", "Beijing"),
    ("Egypt", "Cairo"),
    ("France", "Paris"),
    ("Germany", "Berlin"),
    ("India", "Mumbai"),
    ("Japan", "Tokyo"),
    ("Mexico", "Mexico City"),
    ("Russia", "Moscow"),
    ("South Africa", "Johannesburg"),
    ("South Korea", "Seoul"),
    ("Spain", "Madrid"),
    ("Thailand", "Bangkok"),
    ("Turkey", "Istanbul"),
    ("UAE", "Dubai"),
    ("UK", "London"),
    ("USA", "Los Angeles"),
    ("USA", "New York"),
]

results = []
for country, city in LOCATIONS:
    for year in [2023, 2024]:
        proc = subprocess.run(
            [PYTHON, str(SCRIPT), "--action", "predict", "--country", country, "--city", city, "--year", str(year)],
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        try:
            data = json.loads(proc.stdout)["data"]
            results.append({
                "country": country,
                "city": city,
                "year": year,
                "pm25": data["prediction"],
                "status": data["status"],
                "emoji": data["emoji"],
            })
        except Exception:
            pass

for status in ["Baik", "Sedang", "Tidak Sehat", "Sangat Tidak Sehat"]:
    items = [x for x in results if x["status"] == status]
    print(f"\n=== {status} ({len(items)}) ===")
    for x in sorted(items, key=lambda i: i["pm25"]):
        print(f"  {x['emoji']} {x['country']} / {x['city']} / {x['year']} -> {x['pm25']} ug/m3")
