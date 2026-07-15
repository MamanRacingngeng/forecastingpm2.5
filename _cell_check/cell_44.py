# Visualisasi Perbandingan Nilai Aktual vs Prediksi (SCA-LSTM)
plt.figure(figsize=(15, 6))

# Menampilkan 100 data pertama dari hasil pengujian
plt.plot(y_test[:100], label='Data Aktual (PM2.5)', color='blue', linewidth=2)
plt.plot(y_pred_sca[:100], label='Prediksi SCA-LSTM', color='red', linestyle='--', linewidth=2)

plt.title('Grafik Perbandingan Nilai Aktual vs Prediksi PM2.5 (SCA-LSTM)')
plt.xlabel('Indeks Data (Waktu)')
plt.ylabel('Nilai PM2.5 (Normalized)')
plt.legend()
plt.grid(True)

plt.show()