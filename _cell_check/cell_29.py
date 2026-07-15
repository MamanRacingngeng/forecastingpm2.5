from sklearn.preprocessing import StandardScaler

# Gunakan Z-Score Normalization
scaler_X_zscore = StandardScaler()
scaler_Y_zscore = StandardScaler()

X_scale_zscore = scaler_X_zscore.fit_transform(X)
y_scale_zscore = scaler_Y_zscore.fit_transform(Y)

# Ubah ke DataFrame agar lebih mudah dibaca
X_scaled_zscore_df = pd.DataFrame(X_scale_zscore, columns=X.columns)
y_scaled_zscore_df = pd.DataFrame(y_scale_zscore, columns=Y.columns)

# Tampilkan hasil
print("Hasil Z-Score Normalization untuk X:")
print(X_scaled_zscore_df.head())
print("\nHasil Z-Score Normalization untuk Y:")
print(y_scaled_zscore_df.head())