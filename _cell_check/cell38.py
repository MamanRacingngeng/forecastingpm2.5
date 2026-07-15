# ============================================
# 1. Import Library
# ============================================
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Input
from tensorflow.keras.optimizers import Adam
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error, r2_score
from sklearn.model_selection import train_test_split, ParameterGrid
import random

# ============================================
# 2. Load Data (Dummy Example -> ganti dengan dataset PM2.5)
# ============================================
time = np.arange(0, 500, 0.1)
data = np.sin(time) + 0.1 * np.random.randn(len(time))  # dummy data

df_dummy = pd.DataFrame({'PM2.5': data})

# Fungsi untuk membuat data supervised
def create_dataset(series: np.ndarray, timesteps: int = 10) -> tuple[np.ndarray, np.ndarray]:
    X, y = [], []
    for i in range(len(series) - timesteps):
        X.append(series[i:(i + timesteps)])
        y.append(series[i + timesteps])
    return np.asarray(X, dtype=np.float32), np.asarray(y, dtype=np.float32)

timesteps = 10
X_arr, y_arr = create_dataset(df_dummy['PM2.5'].to_numpy(), timesteps)

# Reshape untuk LSTM [samples, timesteps, features]
X_lstm = X_arr.reshape((X_arr.shape[0], X_arr.shape[1], 1))
X_train, X_test, y_train, y_test = train_test_split(
    X_lstm, y_arr, test_size=0.2, shuffle=False
)

# ============================================
# 3. Build LSTM Function
# ============================================
def build_lstm(units: int = 50, lr: float = 0.001) -> Sequential:
    model = Sequential()
    model.add(Input(shape=(timesteps, 1)))
    model.add(LSTM(units, activation='tanh'))
    model.add(Dense(1))
    optimizer = Adam(learning_rate=lr)
    model.compile(optimizer=optimizer, loss='mse')
    return model

# ============================================
# 4. Model 1: LSTM Default (tanpa tuning)
# ============================================
model_default = build_lstm(units=50, lr=0.001)
model_default.fit(X_train, y_train, epochs=20, batch_size=16, verbose=0)
y_pred_default = model_default.predict(X_test)

# ============================================
# 5. Model 2: Grid Search LSTM
# ============================================
param_grid = {
    'units': [32, 64],
    'lr': [0.001, 0.005],
    'epochs': [20]
}

best_score_grid = float('inf')
best_params_grid = None
best_model_grid = None

for params in ParameterGrid(param_grid):
    model = build_lstm(units=params['units'], lr=params['lr'])
    model.fit(X_train, y_train, epochs=params['epochs'], batch_size=16, verbose=0)
    y_pred = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    if rmse < best_score_grid:
        best_score_grid = rmse
        best_params_grid = params
        best_model_grid = model

if best_model_grid is None:
    raise RuntimeError("Grid search tidak menghasilkan model terbaik")

y_pred_grid = best_model_grid.predict(X_test)

print("=== Grid Search Result ===")
print("Best Params:", best_params_grid)
print("Best RMSE:", best_score_grid)

# ============================================
# 6. Model 3: SCA-LSTM
# ============================================
def sine_cosine_algorithm(obj_func, lb, ub, dim, n_agents=5, max_iter=10):
    positions = np.random.uniform(lb, ub, (n_agents, dim))
    best_pos = None
    best_score = float('inf')

    for t in range(max_iter):
        r1 = 2 - t * (2/max_iter)
        for i in range(n_agents):
            for d in range(dim):
                r2 = 2*np.pi*random.random()
                r3 = 2*random.random()
                r4 = random.random()

                if r4 < 0.5:
                    positions[i,d] = positions[i,d] + r1*np.sin(r2)*abs(r3*best_score - positions[i,d])
                else:
                    positions[i,d] = positions[i,d] + r1*np.cos(r2)*abs(r3*best_score - positions[i,d])

                positions[i,d] = np.clip(positions[i,d], lb[d], ub[d])

            score = obj_func(positions[i])
            if score < best_score:
                best_score = score
                best_pos = positions[i].copy()
    return best_pos, best_score

# Fungsi objektif (minimasi RMSE)
def objective(params):
    units = int(params[0])
    lr = params[1]
    model = build_lstm(units=units, lr=lr)
    model.fit(X_train, y_train, epochs=10, batch_size=16, verbose=0)
    y_pred = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    return rmse

# Batas parameter [units, lr]
lb = [16, 0.0001]
ub = [128, 0.01]

best_params_sca, best_score_sca = sine_cosine_algorithm(objective, lb, ub, dim=2, n_agents=5, max_iter=5)

print("\n=== SCA Result ===")
print("Best Params (units, lr):", best_params_sca)
print("Best RMSE (SCA):", best_score_sca)

if best_params_sca is None:
    raise RuntimeError("SCA tidak menghasilkan parameter terbaik")

# Bangun ulang model dengan parameter terbaik dari SCA
model_sca = build_lstm(units=int(best_params_sca[0]), lr=float(best_params_sca[1]))
model_sca.fit(X_train, y_train, epochs=20, batch_size=16, verbose=0)
y_pred_sca = model_sca.predict(X_test)

# ============================================
# 7. Evaluasi Semua Model
# ============================================
def evaluate(y_true, y_pred, label):
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mape = mean_absolute_percentage_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    print(f"{label} -> RMSE: {rmse:.4f}, MAPE: {mape:.4f}, R2: {r2:.4f}")

print("\n=== Evaluasi Akhir ===")
evaluate(y_test, y_pred_default, "LSTM Default")
evaluate(y_test, y_pred_grid, "Grid Search LSTM")
evaluate(y_test, y_pred_sca, "SCA-LSTM")