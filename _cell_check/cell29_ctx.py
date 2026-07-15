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

from sklearn.preprocessing import MinMaxScaler, StandardScaler

# memfilter data jadi numerik
X = df.drop(columns=['PM2.5'])
Y = df[['PM2.5']]

# Gunakan Min-Max Normalization
scaler_X = MinMaxScaler()
scaler_Y = MinMaxScaler()

X_scale = scaler_X.fit_transform(X)
y_scale = scaler_Y.fit_transform(Y)

# Ubah ke DataFrame agar lebih mudah dibaca
X_scaled_df = pd.DataFrame(X_scale, columns=list(X.columns))
y_scaled_df = pd.DataFrame(y_scale, columns=list(Y.columns))

print(X_scaled_df)
print(y_scaled_df)

from sklearn.preprocessing import StandardScaler

# Gunakan Z-Score Normalization
scaler_X_zscore = StandardScaler()
scaler_Y_zscore = StandardScaler()

X_scale_zscore = scaler_X_zscore.fit_transform(X)
y_scale_zscore = scaler_Y_zscore.fit_transform(Y)

# Ubah ke DataFrame agar lebih mudah dibaca
X_scaled_zscore_df = pd.DataFrame(X_scale_zscore, columns=list(X.columns))
y_scaled_zscore_df = pd.DataFrame(y_scale_zscore, columns=list(Y.columns))

# Tampilkan hasil
print("Hasil Z-Score Normalization untuk X:")
print(X_scaled_zscore_df.head())
print("\nHasil Z-Score Normalization untuk Y:")
print(y_scaled_zscore_df.head())