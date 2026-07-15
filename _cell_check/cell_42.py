import matplotlib.pyplot as plt

# Plot the 'PM2.5' column
plt.figure(figsize=(10, 6))
plt.plot(df['PM2.5'])
plt.title('Nilai PM2.5 dari Waktu ke Waktu')
plt.xlabel('Indeks Data')
plt.ylabel('Nilai PM2.5')
plt.grid(True)
plt.show()