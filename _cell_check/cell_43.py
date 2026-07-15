import matplotlib.pyplot as plt
import numpy as np

# Nilai metrik hasil penelitian (Evaluasi Akhir)
labels = ['LSTM Default', 'Grid Search LSTM', 'SCA-LSTM']
rmse_scores = [0.1195, 0.1179, 0.1096]
mape_scores = [0.6282, 0.6592, 0.5640]
r2_scores = [0.9716, 0.9724, 0.9761]

x = np.arange(len(labels), dtype=float)
width = 0.25

fig, ax1 = plt.subplots(figsize=(12, 7))

rects1 = ax1.bar(x - width, rmse_scores, width, label='RMSE (Rendah=Bagus)', color='skyblue')
rects3 = ax1.bar(x, r2_scores, width, label='R2 (Tinggi=Bagus)', color='lightgreen')
rects2 = ax1.bar(x + width, mape_scores, width, label='MAPE (Rendah=Bagus)', color='orange')

ax1.set_ylabel('Score Value')
ax1.set_ylim(0, max(max(rmse_scores), max(mape_scores), max(r2_scores)) * 1.2)
ax1.set_title('Perbandingan Evaluasi Performa Model')
ax1.set_xticks(x)
ax1.set_xticklabels(labels)

ax1.legend(loc='upper left')

def autolabel(rects):
    for rect in rects:
        height = rect.get_height()
        ax1.annotate(f'{height:.4f}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3), textcoords="offset points",
                    ha='center', va='bottom')

autolabel(rects1)
autolabel(rects3)
autolabel(rects2)

fig.tight_layout()
plt.show()