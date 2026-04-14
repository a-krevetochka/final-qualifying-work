import os
import pandas as pd
from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from moex import get_candles, get_macro
from indicators import add_indicators
from features import add_features, get_feature_row
from model import load_models, load_artifacts, predict_all
from fundamental import get_full_fundamental

load_dotenv()

models   = {}
features = []
scaler   = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global models, features, scaler
    models           = load_models()
    features, scaler = load_artifacts()
    print("Модели загружены")
    yield


app = FastAPI(
    title="Stock Analysis API",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": len(models) > 0}


@app.get("/analysis/{ticker}")
def analysis(ticker: str):
    ticker = ticker.upper()

    try:
        df_candles = get_candles(ticker, days=150)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Не удалось загрузить данные для {ticker}: {e}")

    if len(df_candles) < 60:
        raise HTTPException(status_code=400, detail=f"Недостаточно данных для {ticker}")

    try:
        df_indicators = add_indicators(df_candles)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка расчёта индикаторов: {e}")

    try:
        macro         = get_macro()
        df_features   = add_features(df_indicators, macro)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка расчёта признаков: {e}")

    missing = [f for f in features if f not in df_features.columns]
    if missing:
        raise HTTPException(status_code=500, detail=f"Отсутствуют признаки: {missing}")

    try:
        signals = predict_all(models, features, scaler, df_features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка предсказания: {e}")

    try:
        fundamental = get_full_fundamental(ticker)
    except Exception as e:
        fundamental = {"error": str(e)}

    current_price = round(float(df_candles["Close"].iloc[-1]), 2)
    last_date     = df_candles["Date"].iloc[-1].strftime("%Y-%m-%d")

    return {
        "ticker":        ticker,
        "current_price": current_price,
        "last_date":     last_date,
        "technical": {
            "3d":  signals.get("3d"),
            "5d":  signals.get("5d"),
            "10d": signals.get("10d"),
            "30d": signals.get("30d"),
        },
        "fundamental": fundamental.get("scoring"),
        "consensus":   fundamental.get("consensus"),
        "raw":         fundamental.get("raw"),
    }


@app.get("/fundamental/{ticker}")
def fundamental(ticker: str):
    ticker = ticker.upper()
    try:
        return get_full_fundamental(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/technical/{ticker}")
def technical(ticker: str):
    ticker = ticker.upper()

    try:
        df_candles    = get_candles(ticker, days=150)
        df_indicators = add_indicators(df_candles)
        macro         = get_macro()
        df_features   = add_features(df_indicators, macro)
        signals       = predict_all(models, features, scaler, df_features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "ticker":  ticker,
        "signals": signals,
    }