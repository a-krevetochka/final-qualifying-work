import pandas as pd
import numpy as np
from ta.trend import EMAIndicator, MACD
from ta.momentum import RSIIndicator
from ta.volatility import BollingerBands


def add_indicators(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    ema20 = EMAIndicator(close=df["Close"], window=20)
    ema50 = EMAIndicator(close=df["Close"], window=50)
    df["EMA_20"] = ema20.ema_indicator()
    df["EMA_50"] = ema50.ema_indicator()

    macd = MACD(close=df["Close"])
    df["MACD"]        = macd.macd()
    df["MACD_signal"] = macd.macd_signal()
    df["MACD_diff"]   = macd.macd_diff()

    rsi = RSIIndicator(close=df["Close"], window=14)
    df["RSI"] = rsi.rsi()

    bb = BollingerBands(close=df["Close"], window=20)
    df["BB_high"]  = bb.bollinger_hband()
    df["BB_low"]   = bb.bollinger_lband()
    df["BB_mid"]   = bb.bollinger_mavg()
    df["BB_width"] = (df["BB_high"] - df["BB_low"]) / df["BB_mid"]

    df["Volume_MA"] = df["Volume"].rolling(window=20).mean()

    df = df.dropna().reset_index(drop=True)

    return df