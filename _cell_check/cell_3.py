import pandas as pd
from pathlib import Path

# Kompatibel Google Colab dan lokal
csv_path: str
try:
    from google.colab import drive
    drive.mount('/content/drive')
    csv_path = '/content/drive/My Drive/SkripsiLebColeb/global_air_quality.csv'
except ImportError:
    local_path = Path('data/global_air_quality.csv')
    if not local_path.exists():
        local_path = Path('global_air_quality (2).csv')
    csv_path = str(local_path)

df = pd.read_csv(csv_path)
print(df.head())