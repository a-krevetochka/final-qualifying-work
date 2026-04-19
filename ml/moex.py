import requests
import pandas as pd
from datetime import datetime, timedelta

MOEX_BASE = "https://iss.moex.com/iss"


def get_nearest_brent_ticker() -> str:
    url  = "https://iss.moex.com/iss/engines/futures/markets/forts/securities.json?q=BR"
    resp = requests.get(url, timeout=10)
    data = resp.json()

    columns = data["securities"]["columns"]
    rows    = data["securities"]["data"]

    df = pd.DataFrame(rows, columns=columns)
    df = df[df["ASSETCODE"] == "BR"][["SECID", "LASTTRADEDATE"]].copy()
    df["LASTTRADEDATE"] = pd.to_datetime(df["LASTTRADEDATE"])
    df = df[df["LASTTRADEDATE"] >= pd.Timestamp.now()]
    df = df.sort_values("LASTTRADEDATE")

    return df.iloc[0]["SECID"]


def get_brent(days: int = 150) -> pd.DataFrame:
    ticker    = get_nearest_brent_ticker()
    date_from = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    date_to   = datetime.now().strftime("%Y-%m-%d")

    url = (
        f"{MOEX_BASE}/engines/futures/markets/forts"
        f"/boards/RFUD/securities/{ticker}/candles.json"
        f"?from={date_from}&till={date_to}&interval=24"
    )

    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    columns = data["candles"]["columns"]
    rows    = data["candles"]["data"]

    df = pd.DataFrame(rows, columns=columns)
    df["Date"]  = pd.to_datetime(df["begin"])
    df = df.rename(columns={"close": "Close"})
    df = df[["Date", "Close"]].sort_values("Date").reset_index(drop=True)

    return df


def get_candles(ticker: str, days: int = 150) -> pd.DataFrame:
    date_from = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    date_to   = datetime.now().strftime("%Y-%m-%d")

    url = (
        f"{MOEX_BASE}/engines/stock/markets/shares/boards/TQBR"
        f"/securities/{ticker}/candles.json"
        f"?from={date_from}&till={date_to}&interval=24&start=0"
    )

    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    columns = data["candles"]["columns"]
    rows    = data["candles"]["data"]

    if not rows:
        raise ValueError(f"Нет данных для тикера {ticker}")

    df = pd.DataFrame(rows, columns=columns)
    df = df.rename(columns={
        "open":   "Open",
        "high":   "High",
        "low":    "Low",
        "close":  "Close",
        "volume": "Volume",
        "begin":  "Date",
    })
    df["Date"]   = pd.to_datetime(df["Date"])
    df["ticker"] = ticker
    df = df[["Date", "Open", "High", "Low", "Close", "Volume", "ticker"]]
    df = df.sort_values("Date").reset_index(drop=True)

    return df


def get_macro() -> dict:
    result    = {}
    date_from = (datetime.now() - timedelta(days=150)).strftime("%Y-%m-%d")
    date_to   = datetime.now().strftime("%Y-%m-%d")

    endpoints = {
        "usdrub": (
            "engines/currency/markets/selt/boards/CETS"
            "/securities/USD000UTSTOM/candles.json"
        ),
        "imoex": (
            "engines/stock/markets/index/boards/SNDX"
            "/securities/IMOEX/candles.json"
        ),
    }

    for key, path in endpoints.items():
        url  = f"{MOEX_BASE}/{path}?from={date_from}&till={date_to}&interval=24"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        columns = data["candles"]["columns"]
        rows    = data["candles"]["data"]

        df = pd.DataFrame(rows, columns=columns)
        df["Date"] = pd.to_datetime(df["begin"])
        df = df.rename(columns={"close": "Close"})
        df = df[["Date", "Close"]].sort_values("Date").reset_index(drop=True)

        result[key] = df

    result["brent"] = get_brent(days=150)

    return result