# Menampilkan informasi umum tentang dataset
print("Informasi Dataset:")
df.info()

# Memeriksa jumlah nilai yang hilang di setiap kolom
print("\nJumlah Nilai Hilang:")
print(df.isnull().sum())

# Menampilkan beberapa baris pertama dataset
print("\nLima Baris Pertama Dataset:")
display(df.head())