"""
Buat file contoh dataset PM2.5 di folder data/.
Jalankan sekali jika belum punya dataset sendiri.
"""

import os
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
OUTPUT = os.path.join(DATA_DIR, "pm25.csv")

os.makedirs(DATA_DIR, exist_ok=True)

np.random.seed(42)
n = 5000
time = np.arange(n)
# Simulasi pola PM2.5 harian + noise
pm25 = (
    25
    + 15 * np.sin(2 * np.pi * time / 24)
    + 8 * np.sin(2 * np.pi * time / (24 * 7))
    + np.random.randn(n) * 3
)
pm25 = np.clip(pm25, 5, 80)

df = pd.DataFrame({"datetime": pd.date_range("2024-01-01", periods=n, freq="h"), "PM2.5": pm25.round(2)})
df.to_csv(OUTPUT, index=False)
print(f"Dataset contoh dibuat: {OUTPUT}")
print(f"Jumlah baris: {len(df)}")
