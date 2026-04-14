import os
import numpy as np
import requests
from dotenv import load_dotenv

load_dotenv()

TINKOFF_TOKEN = os.getenv("TINKOFF_TOKEN")
BASE_URL      = "https://invest-public-api.tinkoff.ru/rest"
HEADERS       = {
    "Authorization": f"Bearer {TINKOFF_TOKEN}",
    "Content-Type":  "application/json",
}


def find_instrument(ticker: str) -> dict:
    resp = requests.post(
        f"{BASE_URL}/tinkoff.public.invest.api.contract.v1.InstrumentsService/FindInstrument",
        headers=HEADERS,
        json={
            "query":                ticker,
            "instrumentKind":       "INSTRUMENT_TYPE_SHARE",
            "apiTradeAvailableFlag": True,
        },
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()

    for inst in data.get("instruments", []):
        if inst.get("ticker") == ticker:
            return inst

    raise ValueError(f"Инструмент {ticker} не найден")


def get_asset_uid(instrument_uid: str) -> str:
    resp = requests.post(
        f"{BASE_URL}/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetInstrumentBy",
        headers=HEADERS,
        json={"idType": "INSTRUMENT_ID_TYPE_UID", "id": instrument_uid},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json().get("instrument", {}).get("assetUid", "")


def get_fundamentals(asset_uid: str) -> dict:
    resp = requests.post(
        f"{BASE_URL}/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetAssetFundamentals",
        headers=HEADERS,
        json={"assets": [asset_uid]},
        timeout=10,
    )
    resp.raise_for_status()
    fundamentals = resp.json().get("fundamentals", [])

    if not fundamentals:
        return {}

    return fundamentals[0]


def get_consensus(instrument_uid: str) -> dict:
    resp = requests.post(
        f"{BASE_URL}/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetForecastBy",
        headers=HEADERS,
        json={"instrumentId": instrument_uid},
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()
    c    = data.get("consensus", {})

    if not c:
        return {}

    current = c.get("currentPrice", {})
    target  = c.get("consensus", {})
    change  = c.get("priceChangeRel", {})

    return {
        "recommendation": c.get("recommendation", "RECOMMENDATION_UNSPECIFIED").replace("RECOMMENDATION_", ""),
        "current_price":  round(_quotation(current), 2),
        "target_price":   round(_quotation(target), 2),
        "price_change_pct": round(_quotation(change), 2),
    }


def graham_score(f: dict) -> dict:
    def val(key):
        v = f.get(key, 0)
        return float(v) if v else 0.0

    pe         = val("peRatioTtm")
    pb         = val("priceToBookTtm")
    roa        = val("roa")
    roe        = val("roe")
    net_margin = val("netMarginMrq")
    debt_eq    = val("totalDebtToEquityMrq")
    div_yield  = val("dividendYieldDailyTtm")
    growth_1y  = val("oneYearAnnualRevenueGrowthRate")
    eps        = val("epsTtm")

    scores = {
        "pe":         1 if 0 < pe < 15 else 0,
        "pb":         1 if 0 < pb < 1.5 else 0,
        "pe_pb":      1 if pe > 0 and pb > 0 and pe * pb < 22.5 else 0,
        "debt":       1 if 0 <= debt_eq < 100 else 0,
        "liquidity":  1 if net_margin > 5 else 0,
        "profitable": 1 if roa > 0 else 0,
        "dividend":   1 if div_yield > 0 else 0,
        "growth":     1 if growth_1y > 0 else 0,
        "roe":        1 if roe > 10 else 0,
        "eps":        1 if eps > 0 else 0,
    }

    total_points = sum(scores.values())
    total_score  = round(total_points / 10 * 100, 1)

    if total_score >= 70:
        interpretation = "Привлекательна"
    elif total_score >= 50:
        interpretation = "Нейтральна"
    else:
        interpretation = "Непривлекательна"

    return {
        "score":          total_score,
        "points":         f"{total_points}/10",
        "interpretation": interpretation,
        "criteria":       scores,
    }


def get_full_fundamental(ticker: str) -> dict:
    instrument   = find_instrument(ticker)
    inst_uid     = instrument["uid"]
    asset_uid    = get_asset_uid(inst_uid)
    fundamentals = get_fundamentals(asset_uid)
    consensus    = get_consensus(inst_uid)
    scoring      = graham_score(fundamentals)

    return {
        "ticker":      ticker,
        "scoring":     scoring,
        "consensus":   consensus,
        "raw":         {
            "pe_ratio":          fundamentals.get("peRatioTtm"),
            "pb_ratio":          fundamentals.get("priceToBookTtm"),
            "roe":               fundamentals.get("roe"),
            "roa":               fundamentals.get("roa"),
            "net_margin":        fundamentals.get("netMarginMrq"),
            "debt_to_equity":    fundamentals.get("totalDebtToEquityMrq"),
            "div_yield":         fundamentals.get("dividendYieldDailyTtm"),
            "revenue_growth_1y": fundamentals.get("oneYearAnnualRevenueGrowthRate"),
            "eps_ttm":           fundamentals.get("epsTtm"),
            "market_cap":        fundamentals.get("marketCapitalization"),
        },
    }


def _quotation(q: dict) -> float:
    if not q:
        return 0.0
    return float(q.get("units", 0)) + float(q.get("nano", 0)) / 1e9