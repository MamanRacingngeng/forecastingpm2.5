"""
Prediksi PM2.5 per negara & kota — model SCA-LSTM (hyperparameter terbaru).
"""

import argparse
import json
import os
import sys
from pathlib import Path

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

from model_config import DATA_FILES, SCA_LSTM_INFERENCE, TIMESTEPS

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR.parent / "data"
PM25_SERIES_FILE = DATA_DIR / DATA_FILES["pm25_series"]
GLOBAL_FILE = DATA_DIR / DATA_FILES["global_multi_city"]


def build_lstm(input_shape, units, lr):
    import tensorflow as tf
    from tensorflow.keras.layers import Dense, Input, LSTM
    from tensorflow.keras.models import Sequential

    tf.get_logger().setLevel("ERROR")
    model = Sequential()
    model.add(Input(shape=input_shape))
    model.add(LSTM(units, activation="tanh"))
    model.add(Dense(1))
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=lr), loss="mse")
    return model


def create_dataset(series, timesteps=TIMESTEPS):
    X, y = [], []
    for i in range(len(series) - timesteps):
        X.append(series[i : (i + timesteps)])
        y.append(series[i + timesteps])
    return np.array(X), np.array(y)


def find_pm25_column(df):
    for col in df.columns:
        normalized = str(col).strip().lower().replace(" ", "")
        if normalized in {"pm2.5", "pm25", "pm_2_5"}:
            return col
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if len(numeric_cols) == 1:
        return numeric_cols[0]
    raise ValueError("Kolom PM2.5 tidak ditemukan.")


def load_pm25_series():
    if not PM25_SERIES_FILE.exists():
        raise FileNotFoundError(f"Dataset {PM25_SERIES_FILE.name} tidak ditemukan.")
    df = pd.read_csv(PM25_SERIES_FILE)
    col = find_pm25_column(df)
    time_col = next((c for c in df.columns if str(c).lower() in {"datetime", "date", "timestamp"}), None)
    if time_col:
        df[time_col] = pd.to_datetime(df[time_col], errors="coerce")
        df[col] = pd.to_numeric(df[col], errors="coerce")
        df = df.dropna(subset=[time_col, col]).sort_values(time_col)
        return df[col].values.astype(float)
    return pd.to_numeric(df[col], errors="coerce").dropna().values.astype(float)


def load_global_dataframe():
    df = pd.read_csv(GLOBAL_FILE)
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df["PM2.5"] = pd.to_numeric(df["PM2.5"], errors="coerce")
    return df.dropna(subset=["Date", "PM2.5", "Country", "City"])


def load_dataframe():
    return load_global_dataframe()


def get_countries():
    countries = sorted(load_dataframe()["Country"].unique().tolist())
    if PM25_SERIES_FILE.exists() and "Indonesia" not in countries:
        countries.insert(0, "Indonesia")
    elif "Indonesia" in countries:
        countries.remove("Indonesia")
        countries.insert(0, "Indonesia")
    return countries


def get_years(country):
    if country == "Indonesia" and PM25_SERIES_FILE.exists():
        df = pd.read_csv(PM25_SERIES_FILE)
        time_col = next((c for c in df.columns if str(c).lower() in {"datetime", "date", "timestamp"}), None)
        if time_col:
            years = sorted(pd.to_datetime(df[time_col], errors="coerce").dt.year.dropna().astype(int).unique().tolist())
            forecast = max(years) + 1
            if forecast not in years:
                years.append(forecast)
            return years

    subset = load_dataframe()[load_dataframe()["Country"] == country]
    years = sorted(subset["Date"].dt.year.unique().astype(int).tolist())
    forecast_year = max(years) + 1
    if forecast_year not in years:
        years.append(forecast_year)
    return years


def get_primary_city(df, country):
    counts = df[df["Country"] == country]["City"].value_counts()
    return counts.index[0]


def pm25_category(value):
    if value <= 12:
        return {
            "label": "Baik",
            "emoji": "🟢",
            "color": "good",
            "message": "Udara dalam kondisi baik dan aman untuk seluruh aktivitas luar ruangan.",
        }
    if value <= 35:
        return {
            "label": "Sedang",
            "emoji": "🟡",
            "color": "moderate",
            "message": "Kualitas udara dapat diterima. Kelompok sensitif sebaiknya membatasi aktivitas luar ruangan yang lama.",
        }
    if value <= 55:
        return {
            "label": "Tidak Sehat",
            "emoji": "🟠",
            "color": "unhealthy",
            "message": "Anggota kelompok sensitif dapat mengalami dampak kesehatan. Kurangi aktivitas di luar ruangan.",
        }
    return {
        "label": "Sangat Tidak Sehat",
        "emoji": "🔴",
        "color": "very-unhealthy",
        "message": "Semua orang berisiko terkena dampak kesehatan. Hindari aktivitas luar ruangan.",
    }


def train_and_predict(series):
    if len(series) < TIMESTEPS + 5:
        raise ValueError("Data historis tidak cukup untuk prediksi.")

    X, y = create_dataset(series)
    X = X.reshape((X.shape[0], X.shape[1], 1))

    if len(X) < 20:
        X_train, y_train = X, y
    else:
        X_train, _, y_train, _ = train_test_split(X, y, test_size=0.2, shuffle=False)

    params = SCA_LSTM_INFERENCE
    model = build_lstm((TIMESTEPS, 1), units=params["units"], lr=params["lr"])
    model.fit(
        X_train,
        y_train,
        epochs=params["epochs"],
        batch_size=params["batch_size"],
        verbose=0,
    )

    last_window = series[-TIMESTEPS:].reshape(1, TIMESTEPS, 1)
    prediction = float(model.predict(last_window, verbose=0)[0][0])
    return max(prediction, 0.1)


def get_series_for_location(country, city, year):
    year = int(year)

    if country == "Indonesia" and PM25_SERIES_FILE.exists():
        series = load_pm25_series()
        df = pd.read_csv(PM25_SERIES_FILE)
        time_col = next((c for c in df.columns if str(c).lower() in {"datetime", "date", "timestamp"}), None)
        dates = pd.to_datetime(df[time_col], errors="coerce")
        col = find_pm25_column(df)
        values = pd.to_numeric(df[col], errors="coerce")
        frame = pd.DataFrame({"date": dates, "pm25": values}).dropna().sort_values("date")
        available_years = sorted(frame["date"].dt.year.unique().tolist())

        if year > max(available_years):
            return series, "forecast"
        prior = frame[frame["date"].dt.year < year]["pm25"].values
        if len(prior) >= TIMESTEPS + 5:
            return prior.astype(float), "historical"
        year_vals = frame[frame["date"].dt.year == year]["pm25"].values
        split = max(int(len(year_vals) * 0.8), TIMESTEPS + 1)
        return year_vals[:split].astype(float), "in-year"

    df = load_dataframe()
    city_df = df[(df["Country"] == country) & (df["City"] == city)].sort_values("Date")
    daily = city_df.groupby("Date")["PM2.5"].mean().reset_index()
    available_years = sorted(daily["Date"].dt.year.unique().tolist())

    if year > max(available_years):
        return daily["PM2.5"].values.astype(float), "forecast"

    prior = daily[daily["Date"].dt.year < year]["PM2.5"].values
    if len(prior) >= TIMESTEPS + 5:
        return prior.astype(float), "historical"

    year_data = daily[daily["Date"].dt.year == year]["PM2.5"].values
    split = max(int(len(year_data) * 0.8), TIMESTEPS + 1)
    return year_data[:split].astype(float), "in-year"


def predict_for_user(country, year, city=None):
    df = load_dataframe()
    city = city or (get_primary_city(df, country) if country != "Indonesia" else "Jakarta")
    year = int(year)

    train_series, mode = get_series_for_location(country, city, year)
    prediction = train_and_predict(train_series)
    category = pm25_category(prediction)

    return {
        "country": country,
        "city": city,
        "year": year,
        "prediction": round(prediction, 1),
        "unit": "µg/m³",
        "status": category["label"],
        "emoji": category["emoji"],
        "color": category["color"],
        "message": category["message"],
        "mode": mode,
    }


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

    parser = argparse.ArgumentParser()
    parser.add_argument("--action", required=True, choices=["countries", "years", "predict"])
    parser.add_argument("--country", default="")
    parser.add_argument("--city", default="")
    parser.add_argument("--year", default="")
    args = parser.parse_args()

    if args.action == "countries":
        result = {"countries": get_countries()}
    elif args.action == "years":
        if not args.country:
            raise SystemExit("Country wajib diisi")
        result = {"years": get_years(args.country)}
    else:
        if not args.country or not args.year:
            raise SystemExit("Country dan year wajib diisi")
        result = predict_for_user(args.country, int(args.year), args.city or None)

    print(json.dumps({"success": True, "data": result}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
