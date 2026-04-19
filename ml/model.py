import joblib
import numpy as np
import pandas as pd
from tensorflow import keras
from catboost import CatBoostClassifier


HORIZONS = [3, 5, 10, 30]
WINDOW    = 20


def load_models():
    models = {}

    for h in [3, 5, 30]:
        models[f"lstm_{h}d"] = keras.models.load_model(f"model/lstm_binary_{h}d.keras")

    catboost_10d = CatBoostClassifier()
    catboost_10d.load_model("model/catboost_binary_10d.cbm")
    models["catboost_10d"] = catboost_10d

    return models


def load_artifacts():
    features = joblib.load("model/features.pkl")
    scaler   = joblib.load("model/scaler.pkl")
    return features, scaler


def predict_all(models, features, scaler, df: pd.DataFrame) -> dict:
    result = {}

    last_row = df.iloc[[-1]][features]

    for h in [3, 5, 30]:
        model      = models[f"lstm_{h}d"]
        prediction = _predict_lstm(model, scaler, features, df)
        result[f"{h}d"] = prediction

    result["10d"] = _predict_catboost(models["catboost_10d"], last_row)

    return result


def _predict_lstm(model, scaler, features, df: pd.DataFrame) -> dict:
    if len(df) < WINDOW:
        return {"signal": 0, "direction": "недостаточно данных", "confidence": 0.0}

    window_data = df[features].iloc[-WINDOW:].values
    scaled      = scaler.transform(window_data)
    X           = scaled.reshape(1, WINDOW, len(features))

    proba      = model.predict(X, verbose=0)[0][0]
    signal     = 1 if proba > 0.5 else 0
    confidence = round(float(proba) if signal == 1 else float(1 - proba), 3)

    return {
        "signal":     signal,
        "direction":  "вверх" if signal == 1 else "вниз",
        "confidence": confidence,
    }


def _predict_catboost(model, row: pd.DataFrame) -> dict:
    pred       = int(model.predict(row)[0])
    proba      = model.predict_proba(row)[0]
    confidence = round(float(max(proba)), 3)

    return {
        "signal":     pred,
        "direction":  "вверх" if pred == 1 else "вниз",
        "confidence": confidence,
    }