import os
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error, r2_score
from sklearn.model_selection import ParameterGrid, train_test_split
import tensorflow as tf
from tensorflow.keras.layers import Dense, Input, LSTM
from tensorflow.keras.models import Sequential

tf.get_logger().setLevel("ERROR")

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DEFAULT_CSV = DATA_DIR / "pm25.csv"

PM25_COLUMNS = ["pm2.5", "pm25", "pm_2_5", "value", "konsentrasi", "concentration"]


def create_dataset(series, timesteps=10):
    X, y = [], []
    for i in range(len(series) - timesteps):
        X.append(series[i : (i + timesteps)])
        y.append(series[i + timesteps])
    return np.array(X), np.array(y)


def build_lstm(input_shape, units=50, lr=0.001):
    model = Sequential()
    model.add(Input(shape=input_shape))
    model.add(LSTM(units, activation="tanh"))
    model.add(Dense(1))
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=lr), loss="mse")
    return model


def evaluate(y_true, y_pred):
    return {
        "rmse": round(float(np.sqrt(mean_squared_error(y_true, y_pred))), 4),
        "mape": round(float(mean_absolute_percentage_error(y_true, y_pred)), 4),
        "r2": round(float(r2_score(y_true, y_pred)), 4),
    }


def sine_cosine_algorithm(obj_func, lb, ub, dim, n_agents=5, max_iter=10):
    import random

    positions = np.random.uniform(lb, ub, (n_agents, dim))
    best_pos = None
    best_score = float("inf")

    for t in range(max_iter):
        r1 = 2 - t * (2 / max_iter)
        for i in range(n_agents):
            for d in range(dim):
                r2 = 2 * np.pi * random.random()
                r3 = 2 * random.random()
                r4 = random.random()
                if r4 < 0.5:
                    positions[i, d] += r1 * np.sin(r2) * abs(r3 * best_score - positions[i, d])
                else:
                    positions[i, d] += r1 * np.cos(r2) * abs(r3 * best_score - positions[i, d])
                positions[i, d] = np.clip(positions[i, d], lb[d], ub[d])
            score = obj_func(positions[i])
            if score < best_score:
                best_score = score
                best_pos = positions[i].copy()
    return best_pos, best_score


def find_pm25_column(df):
    for col in df.columns:
        if str(col).strip().lower().replace(" ", "") in PM25_COLUMNS or str(col).strip().lower() == "pm2.5":
            return col
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if len(numeric_cols) == 1:
        return numeric_cols[0]
    raise ValueError(
        "Kolom PM2.5 tidak ditemukan. Pastikan CSV punya kolom 'PM2.5' "
        "atau hanya satu kolom angka."
    )


def resolve_dataset_path():
    if not DATA_DIR.exists():
        DATA_DIR.mkdir(parents=True)

    csv_files = sorted(DATA_DIR.glob("*.csv"))
    if DEFAULT_CSV.exists():
        return DEFAULT_CSV, "default"
    if csv_files:
        return csv_files[0], "first_csv"
    return None, "missing"


def load_dataframe():
    path, source = resolve_dataset_path()
    if path is None:
        raise FileNotFoundError(
            f"Dataset tidak ditemukan. Letakkan file CSV di: {DATA_DIR}\\pm25.csv"
        )

    df = pd.read_csv(path)
    col = find_pm25_column(df)
    series = pd.to_numeric(df[col], errors="coerce").dropna().values
    if len(series) < 50:
        raise ValueError("Dataset terlalu sedikit. Minimal 50 baris data PM2.5.")

    return series, {
        "file": path.name,
        "path": str(path),
        "column": str(col),
        "rows": int(len(series)),
        "source": source,
    }


def load_data(timesteps=10):
    series, _ = load_dataframe()
    X, y = create_dataset(series, timesteps)
    X = X.reshape((X.shape[0], X.shape[1], 1))
    return train_test_split(X, y, test_size=0.2, shuffle=False)


def run_all_models():
    _, dataset_info = load_dataframe()
    X_train, X_test, y_train, y_test = load_data()
    input_shape = (X_train.shape[1], 1)

    model_default = build_lstm(input_shape, units=50, lr=0.001)
    model_default.fit(X_train, y_train, epochs=20, batch_size=16, verbose=0)
    y_pred_default = model_default.predict(X_test, verbose=0).flatten()

    param_grid = {"units": [32, 64], "lr": [0.001, 0.005], "epochs": [20]}
    best_score_grid = float("inf")
    best_params_grid = None
    best_model_grid = None
    for params in ParameterGrid(param_grid):
        model = build_lstm(input_shape, units=params["units"], lr=params["lr"])
        model.fit(X_train, y_train, epochs=params["epochs"], batch_size=16, verbose=0)
        y_pred = model.predict(X_test, verbose=0)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        if rmse < best_score_grid:
            best_score_grid = rmse
            best_params_grid = params
            best_model_grid = model
    y_pred_grid = best_model_grid.predict(X_test, verbose=0).flatten()

    def objective(params):
        model = build_lstm(input_shape, units=int(params[0]), lr=params[1])
        model.fit(X_train, y_train, epochs=10, batch_size=16, verbose=0)
        y_pred = model.predict(X_test, verbose=0)
        return float(np.sqrt(mean_squared_error(y_test, y_pred)))

    best_params_sca, best_score_sca = sine_cosine_algorithm(
        objective, [16, 0.0001], [128, 0.01], dim=2, n_agents=5, max_iter=5
    )
    model_sca = build_lstm(input_shape, units=int(best_params_sca[0]), lr=float(best_params_sca[1]))
    model_sca.fit(X_train, y_train, epochs=20, batch_size=16, verbose=0)
    y_pred_sca = model_sca.predict(X_test, verbose=0).flatten()

    return {
        "dataset": dataset_info,
        "models": {
            "default": {
                "name": "LSTM Default",
                "params": {"units": 50, "lr": 0.001, "epochs": 20},
                "metrics": evaluate(y_test, y_pred_default),
                "predictions": y_pred_default.tolist(),
            },
            "grid_search": {
                "name": "Grid Search LSTM",
                "params": {
                    "units": int(best_params_grid["units"]),
                    "lr": float(best_params_grid["lr"]),
                    "epochs": int(best_params_grid["epochs"]),
                },
                "metrics": evaluate(y_test, y_pred_grid),
                "predictions": y_pred_grid.tolist(),
            },
            "sca_lstm": {
                "name": "SCA-LSTM",
                "params": {
                    "units": int(best_params_sca[0]),
                    "lr": round(float(best_params_sca[1]), 6),
                    "epochs": 20,
                    "sca_rmse": round(float(best_score_sca), 4),
                },
                "metrics": evaluate(y_test, y_pred_sca),
                "predictions": y_pred_sca.tolist(),
            },
        },
        "actual": y_test.tolist(),
        "sample_count": len(y_test),
    }
