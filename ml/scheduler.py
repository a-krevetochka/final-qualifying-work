import logging
from datetime import date, timedelta

import pandas as pd
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session

from database import SessionLocal
from moex import get_candles, get_macro
from fundamental import find_instrument, get_asset_uid, get_fundamentals, get_consensus, graham_score
from repository import (
    CandleRepository,
    MacroRepository,
    InstrumentRepository,
    FundamentalRepository,
    ConsensusRepository,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_all_tickers(db: Session) -> list[str]:
    return CandleRepository.get_tracked_tickers(db)


def update_candles(db: Session, ticker: str):
    try:
        last_date = CandleRepository.get_last_date(db, ticker)
        days      = 150 if last_date is None else (date.today() - last_date).days + 5

        if days <= 0:
            logger.info(f"{ticker}: свечи актуальны")
            return

        df = get_candles(ticker, days=days)

        df_insert = pd.DataFrame({
            "ticker": df["ticker"],
            "date":   df["Date"].dt.date,
            "open":   df["Open"],
            "high":   df["High"],
            "low":    df["Low"],
            "close":  df["Close"],
            "volume": df["Volume"],
        })

        CandleRepository.bulk_insert(db, df_insert)
        logger.info(f"{ticker}: свечи обновлены ({len(df_insert)} строк)")

    except Exception as e:
        logger.error(f"{ticker}: ошибка обновления свечей — {e}")


def update_macro(db: Session):
    try:
        last_date = MacroRepository.get_last_date(db)
        days      = 150 if last_date is None else (date.today() - last_date).days + 5

        if days <= 0:
            logger.info("Макро: данные актуальны")
            return

        macro = get_macro()

        df_usdrub = macro["usdrub"].rename(columns={"Close": "usdrub"})
        df_imoex  = macro["imoex"].rename(columns={"Close": "imoex"})
        df_brent  = macro["brent"].rename(columns={"Close": "brent"})

        df = df_usdrub.merge(df_imoex, on="Date", how="outer")
        df = df.merge(df_brent, on="Date", how="outer")
        df = df.sort_values("Date").ffill()
        df["date"] = pd.to_datetime(df["Date"]).dt.date
        df = df[["date", "usdrub", "imoex", "brent"]].dropna()

        MacroRepository.bulk_insert(db, df)
        logger.info(f"Макро: обновлено ({len(df)} строк)")

    except Exception as e:
        logger.error(f"Макро: ошибка обновления — {e}")


def update_fundamentals(db: Session, ticker: str):
    try:
        instrument = InstrumentRepository.get(db, ticker)

        if instrument is None:
            inst      = find_instrument(ticker)
            inst_uid  = inst["uid"]
            asset_uid = get_asset_uid(inst_uid)
            InstrumentRepository.upsert(db, ticker, inst_uid, asset_uid)
            instrument = InstrumentRepository.get(db, ticker)

        record = FundamentalRepository.get(db, ticker)
        if not FundamentalRepository.is_stale(record):
            logger.info(f"{ticker}: фундаментал актуален")
            return

        f       = get_fundamentals(instrument.asset_uid)
        scoring = graham_score(f)

        def val(key):
            v = f.get(key, 0)
            return float(v) if v else 0.0

        FundamentalRepository.upsert(db, ticker, {
            "pe_ratio":       val("peRatioTtm"),
            "pb_ratio":       val("priceToBookTtm"),
            "roe":            val("roe"),
            "roa":            val("roa"),
            "net_margin":     val("netMarginMrq"),
            "debt_to_equity": val("totalDebtToEquityMrq"),
            "div_yield":      val("dividendYieldDailyTtm"),
            "revenue_growth": val("oneYearAnnualRevenueGrowthRate"),
            "eps_ttm":        val("epsTtm"),
            "market_cap":     val("marketCapitalization"),
            "graham_score":   scoring["score"],
            "interpretation": scoring["interpretation"],
        })
        logger.info(f"{ticker}: фундаментал обновлён")

    except Exception as e:
        logger.error(f"{ticker}: ошибка обновления фундаментала — {e}")


def update_consensus(db: Session, ticker: str):
    try:
        instrument = InstrumentRepository.get(db, ticker)
        if instrument is None:
            return

        record = ConsensusRepository.get(db, ticker)
        if not ConsensusRepository.is_stale(record):
            logger.info(f"{ticker}: консенсус актуален")
            return

        consensus = get_consensus(instrument.instrument_uid)
        if not consensus:
            return

        ConsensusRepository.upsert(db, ticker, consensus)
        logger.info(f"{ticker}: консенсус обновлён")

    except Exception as e:
        logger.error(f"{ticker}: ошибка обновления консенсуса — {e}")


async def job_daily():
    logger.info("Запуск ежедневного обновления...")
    db      = SessionLocal()
    tickers = get_all_tickers(db)
    logger.info(f"Тикеров в БД: {len(tickers)}")
    try:
        for ticker in tickers:
            update_candles(db, ticker)
        update_macro(db)
    finally:
        db.close()
    logger.info("Ежедневное обновление завершено")


async def job_weekly():
    logger.info("Запуск еженедельного обновления...")
    db = SessionLocal()
    try:
        from repository import SecuritiesRepository
        tickers = SecuritiesRepository.get_all_tickers(db)
        logger.info(f"Тикеров в securities: {len(tickers)}")
        for ticker in tickers:
            update_fundamentals(db, ticker)
            update_consensus(db, ticker)
    finally:
        db.close()
    logger.info("Еженедельное обновление завершено")


def create_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(timezone="Europe/Moscow")

    scheduler.add_job(
        job_daily,
        trigger="cron",
        hour=19,
        minute=30,
        id="daily_update",
    )

    scheduler.add_job(
        job_weekly,
        trigger="cron",
        day_of_week="sun",
        hour=10,
        minute=0,
        id="weekly_update",
    )

    return scheduler