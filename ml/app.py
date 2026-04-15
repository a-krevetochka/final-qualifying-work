import os
import pandas as pd
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from database import init_db, get_db, SessionLocal
from models import Candle, Macro, Instrument, Fundamental, Consensus
from repository import (
    CandleRepository,
    MacroRepository,
    InstrumentRepository,
    FundamentalRepository,
    ConsensusRepository,
)
from scheduler import create_scheduler, job_daily, job_weekly, update_candles, update_macro, update_fundamentals, update_consensus
from moex import get_candles, get_macro
from indicators import add_indicators
from features import add_features, get_feature_row
from model import load_models, load_artifacts, predict_all
from fundamental import find_instrument, get_asset_uid, get_full_fundamental

load_dotenv()

models   = {}
features = []
scaler   = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global models, features, scaler

    init_db()

    models           = load_models()
    features, scaler = load_artifacts()
    print("Модели загружены")

    scheduler = create_scheduler()
    scheduler.start()
    print("Шедьюлер запущен")

    yield

    scheduler.shutdown()
    print("Шедьюлер остановлен")


app = FastAPI(
    title="Stock Analysis API",
    version="1.0.0",
    lifespan=lifespan,
)


def _get_candles_from_db_or_api(db: Session, ticker: str) -> pd.DataFrame:
    df = CandleRepository.get_candles(db, ticker, days=150)

    if df.empty:
        df_raw = get_candles(ticker, days=150)
        df_insert = pd.DataFrame({
            "ticker": df_raw["ticker"],
            "date":   df_raw["Date"].dt.date,
            "open":   df_raw["Open"],
            "high":   df_raw["High"],
            "low":    df_raw["Low"],
            "close":  df_raw["Close"],
            "volume": df_raw["Volume"],
        })
        CandleRepository.bulk_insert(db, df_insert)
        df = CandleRepository.get_candles(db, ticker, days=150)

    df["Date"] = pd.to_datetime(df["Date"])
    return df


def _get_macro_from_db_or_api(db: Session) -> dict:
    df_macro = MacroRepository.get_macro(db, days=150)

    if df_macro.empty:
        update_macro(db)
        df_macro = MacroRepository.get_macro(db, days=150)

    df_macro["Date"] = pd.to_datetime(df_macro["Date"])

    return {
        "usdrub": df_macro[["Date", "usdrub"]].rename(columns={"usdrub": "Close"}),
        "imoex":  df_macro[["Date", "imoex"]].rename(columns={"imoex": "Close"}),
        "brent":  df_macro[["Date", "brent"]].rename(columns={"brent": "Close"}),
    }


def _get_instrument(db: Session, ticker: str) -> Instrument:
    instrument = InstrumentRepository.get(db, ticker)

    if instrument is None:
        inst      = find_instrument(ticker)
        inst_uid  = inst["uid"]
        asset_uid = get_asset_uid(inst_uid)
        InstrumentRepository.upsert(db, ticker, inst_uid, asset_uid)
        instrument = InstrumentRepository.get(db, ticker)

    return instrument


def _get_fundamental(db: Session, ticker: str, instrument: Instrument) -> dict:
    record = FundamentalRepository.get(db, ticker)

    if FundamentalRepository.is_stale(record):
        update_fundamentals(db, ticker)
        record = FundamentalRepository.get(db, ticker)

    if record is None:
        return {}

    return {
        "score":          record.graham_score,
        "interpretation": record.interpretation,
        "raw": {
            "pe_ratio":       record.pe_ratio,
            "pb_ratio":       record.pb_ratio,
            "roe":            record.roe,
            "roa":            record.roa,
            "net_margin":     record.net_margin,
            "debt_to_equity": record.debt_to_equity,
            "div_yield":      record.div_yield,
            "revenue_growth": record.revenue_growth,
            "eps_ttm":        record.eps_ttm,
            "market_cap":     record.market_cap,
        }
    }


def _get_consensus(db: Session, ticker: str, instrument: Instrument) -> dict:
    record = ConsensusRepository.get(db, ticker)

    if ConsensusRepository.is_stale(record):
        update_consensus(db, ticker)
        record = ConsensusRepository.get(db, ticker)

    if record is None:
        return {}

    return {
        "recommendation":   record.recommendation,
        "current_price":    record.current_price,
        "target_price":     record.target_price,
        "price_change_pct": record.price_change_pct,
    }


@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": len(models) > 0}


@app.get("/analysis/{ticker}")
def analysis(ticker: str, db: Session = Depends(get_db)):
    ticker = ticker.upper()

    try:
        df_candles = _get_candles_from_db_or_api(db, ticker)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Нет данных для {ticker}: {e}")

    if len(df_candles) < 60:
        raise HTTPException(status_code=400, detail=f"Недостаточно данных для {ticker}")

    try:
        df_indicators = add_indicators(df_candles)
        macro         = _get_macro_from_db_or_api(db)
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
        instrument   = _get_instrument(db, ticker)
        fundamental  = _get_fundamental(db, ticker, instrument)
        consensus    = _get_consensus(db, ticker, instrument)
    except Exception as e:
        fundamental = {}
        consensus   = {}

    current_price = round(float(df_candles["Close"].iloc[-1]), 2)
    last_date     = pd.to_datetime(df_candles["Date"].iloc[-1]).strftime("%Y-%m-%d")

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
        "fundamental": fundamental,
        "consensus":   consensus,
    }


@app.get("/fundamental/{ticker}")
def fundamental(ticker: str, db: Session = Depends(get_db)):
    ticker     = ticker.upper()
    instrument = _get_instrument(db, ticker)
    return _get_fundamental(db, ticker, instrument)


@app.get("/technical/{ticker}")
def technical(ticker: str, db: Session = Depends(get_db)):
    ticker = ticker.upper()

    try:
        df_candles    = _get_candles_from_db_or_api(db, ticker)
        df_indicators = add_indicators(df_candles)
        macro         = _get_macro_from_db_or_api(db)
        df_features   = add_features(df_indicators, macro)
        signals       = predict_all(models, features, scaler, df_features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"ticker": ticker, "signals": signals}


@app.post("/admin/update/daily")
async def trigger_daily_update():
    await job_daily()
    return {"status": "done"}


@app.post("/admin/update/weekly")
async def trigger_weekly_update():
    await job_weekly()
    return {"status": "done"}