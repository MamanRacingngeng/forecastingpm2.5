from sklearn.preprocessing import StandardScaler

# Inisialisasi StandardScaler
scaler = StandardScaler()

# Lakukan scaling pada fitur
features_scaled = scaler.fit_transform(features)

# Tampilkan beberapa baris pertama dari fitur yang sudah di-scale
print("Fitur setelah scaling:")
print(features_scaled[:5])

# Untuk target, scaling mungkin tidak selalu diperlukan tergantung model, tapi kita bisa melakukannya jika perlu
# target_scaled = scaler.fit_transform(target.reshape(-1, 1))
# print("\nTarget setelah scaling:")
# print(target_scaled[:5])