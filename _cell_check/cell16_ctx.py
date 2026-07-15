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

# Mengganti nilai NaN dengan 0 di semua kolom
df = df.fillna(0)

# Pemilihan Fitur Numerik
df = df.drop(columns=['City', 'Country', 'Date'])
df.head()

values=df.values;

import pandas as pd
import numpy
from matplotlib import pyplot

groups = [0, 1, 2, 3, 4, 5, 6, 7, 8]
col_names = df.columns.tolist()
i = 1
pyplot.figure()
for group in groups:
    pyplot.subplot(len(groups), 1, i)
    pyplot.hist(values[:, group])
    pyplot.title(col_names[group])
    i += 1
pyplot.show()