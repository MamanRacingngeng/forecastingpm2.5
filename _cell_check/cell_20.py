# Memilih fitur dan variabel target dari array 'values'
features = values[:, 1:]  # Memilih semua kolom kecuali kolom pertama (PM2.5) sebagai fitur
target = values[:, 0]     # Memilih kolom pertama (PM2.5) sebagai variabel target

# Menampilkan bentuk fitur dan target yang dipilih
print("Bentuk fitur:", features.shape)
print("Bentuk target:", target.shape)