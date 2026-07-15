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