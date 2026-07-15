"""Hyperparameter & metrik model terbaru (notebook skripsi)."""

TIMESTEPS = 10

LSTM_DEFAULT = {
    "units": 50,
    "lr": 0.001,
    "epochs": 20,
    "batch_size": 16,
}

GRID_SEARCH_BEST = {
    "units": 32,
    "lr": 0.005,
    "epochs": 20,
    "batch_size": 32,
}

SCA_LSTM = {
    "units": 98,
    "lr": 0.009125,
    "epochs": 24,
    "batch_size": 8,
}

# Epoch lebih sedikit untuk prediksi web (lebih cepat, arsitektur sama)
SCA_LSTM_INFERENCE = {
    **SCA_LSTM,
    "epochs": 8,
}

SCA_BOUNDS = {
    "lb": [16, 0.0001, 10, 8],
    "ub": [128, 0.01, 30, 32],
}

RESEARCH_METRICS = {
    "default": {"rmse": 0.1175, "mape": 1.1031, "r2": 0.9728},
    "grid_search": {"rmse": 0.1157, "mape": 1.2679, "r2": 0.9736},
    "sca_lstm": {"rmse": 0.1130, "mape": 1.1907, "r2": 0.9748},
}

DATA_FILES = {
    "pm25_series": "pm25.csv",
    "global_multi_city": "global_air_quality.csv",
}
