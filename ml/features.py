import pandas as pd
import numpy as np


def add_features(df: pd.DataFrame, macro: dict) -> pd.DataFrame:
    df = df.copy()

    df["return_1d"]  = df["Close"].pct_change(1)
    df["return_3d"]  = df["Close"].pct_change(3)
    df["return_5d"]  = df["Close"].pct_change(5)
    df["return_10d"] = df["Close"].pct_change(10)
    df["return_20d"] = df["Close"].pct_change(20)

    df["close_to_ema20"] = (df["Close"] - df["EMA_20"]) / df["EMA_20"]
    df["close_to_ema50"] = (df["Close"] - df["EMA_50"]) / df["EMA_50"]
    df["ema20_to_ema50"] = (df["EMA_20"] - df["EMA_50"]) / df["EMA_50"]

    df["bb_position"] = (df["Close"] - df["BB_low"]) / (df["BB_high"] - df["BB_low"])
    df["volume_ratio"] = df["Volume"] / df["Volume_MA"]
    df["macd_ratio"]   = df["MACD"] / df["Close"]

    for lag in [1, 2, 3, 5]:
        df[f"RSI_lag{lag}"]        = df["RSI"].shift(lag)
        df[f"MACD_diff_lag{lag}"]  = df["MACD_diff"].shift(lag)
        df[f"bb_position_lag{lag}"]= df["bb_position"].shift(lag)
        df[f"volume_ratio_lag{lag}"]= df["volume_ratio"].shift(lag)
        df[f"return_1d_lag{lag}"]  = df["return_1d"].shift(lag)

    df = _add_macro_features(df, macro)

    df = df.dropna().reset_index(drop=True)

    return df


def _add_macro_features(df: pd.DataFrame, macro: dict) -> pd.DataFrame:
    df = df.copy()

    for key, mdf in macro.items():
        mdf = mdf.copy()
        mdf["Date"] = pd.to_datetime(mdf["Date"]).dt.date

        mdf[f"{key}_return_1d"]  = mdf["Close"].pct_change(1)
        mdf[f"{key}_return_5d"]  = mdf["Close"].pct_change(5)
        mdf[f"{key}_return_20d"] = mdf["Close"].pct_change(20)
        mdf[f"{key}_to_ma20"]    = (mdf["Close"] - mdf["Close"].rolling(20).mean()) / mdf["Close"].rolling(20).mean()
        mdf[f"{key}_vol_10d"]    = mdf["Close"].pct_change(1).rolling(10).std()

        mdf = mdf.drop(columns=["Close"])
        mdf["Date"] = pd.to_datetime(mdf["Date"])

        df = df.merge(mdf, on="Date", how="left")

    macro_cols = [c for c in df.columns if any(k in c for k in macro.keys())]
    df[macro_cols] = df[macro_cols].fillna(method="ffill")

    return df


def get_feature_row(df: pd.DataFrame, features: list) -> pd.DataFrame:
    last_row = df.iloc[[-1]][features]
    return last_row