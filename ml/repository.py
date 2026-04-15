import pandas as pd
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert

from models import Candle, Macro, Instrument, Fundamental, Consensus


class CandleRepository:

    @staticmethod
    def get_tracked_tickers(db: Session) -> list[str]:
        rows = db.query(Candle.ticker).distinct().all()
        return [r[0] for r in rows]

    @staticmethod
    def get_last_date(db: Session, ticker: str) -> date | None:
        result = (
            db.query(Candle.date)
            .filter(Candle.ticker == ticker)
            .order_by(Candle.date.desc())
            .first()
        )
        return result[0] if result else None

    @staticmethod
    def bulk_insert(db: Session, df: pd.DataFrame):
        rows = df.to_dict(orient="records")
        stmt = insert(Candle).values(rows).on_conflict_do_nothing(
            index_elements=["ticker", "date"]
        )
        db.execute(stmt)
        db.commit()

    @staticmethod
    def get_candles(db: Session, ticker: str, days: int = 150) -> pd.DataFrame:
        date_from = date.today() - timedelta(days=days)
        rows = (
            db.query(Candle)
            .filter(Candle.ticker == ticker, Candle.date >= date_from)
            .order_by(Candle.date)
            .all()
        )
        if not rows:
            return pd.DataFrame()

        return pd.DataFrame([{
            "Date":   r.date,
            "Open":   r.open,
            "High":   r.high,
            "Low":    r.low,
            "Close":  r.close,
            "Volume": r.volume,
            "ticker": r.ticker,
        } for r in rows])


class MacroRepository:

    @staticmethod
    def get_last_date(db: Session) -> date | None:
        result = (
            db.query(Macro.date)
            .order_by(Macro.date.desc())
            .first()
        )
        return result[0] if result else None

    @staticmethod
    def bulk_insert(db: Session, df: pd.DataFrame):
        rows = df.to_dict(orient="records")
        stmt = insert(Macro).values(rows).on_conflict_do_nothing(
            index_elements=["date"]
        )
        db.execute(stmt)
        db.commit()

    @staticmethod
    def get_macro(db: Session, days: int = 150) -> pd.DataFrame:
        date_from = date.today() - timedelta(days=days)
        rows = (
            db.query(Macro)
            .filter(Macro.date >= date_from)
            .order_by(Macro.date)
            .all()
        )
        if not rows:
            return pd.DataFrame()

        return pd.DataFrame([{
            "Date":   r.date,
            "usdrub": r.usdrub,
            "imoex":  r.imoex,
            "brent":  r.brent,
        } for r in rows])


class InstrumentRepository:

    @staticmethod
    def get(db: Session, ticker: str) -> Instrument | None:
        return db.query(Instrument).filter(Instrument.ticker == ticker).first()

    @staticmethod
    def upsert(db: Session, ticker: str, instrument_uid: str, asset_uid: str):
        stmt = insert(Instrument).values(
            ticker=ticker,
            instrument_uid=instrument_uid,
            asset_uid=asset_uid,
        ).on_conflict_do_update(
            index_elements=["ticker"],
            set_={
                "instrument_uid": instrument_uid,
                "asset_uid":      asset_uid,
            }
        )
        db.execute(stmt)
        db.commit()


class FundamentalRepository:

    @staticmethod
    def get(db: Session, ticker: str) -> Fundamental | None:
        return db.query(Fundamental).filter(Fundamental.ticker == ticker).first()

    @staticmethod
    def is_stale(record: Fundamental, days: int = 7) -> bool:
        if record is None or record.updated_at is None:
            return True
        return datetime.now() - record.updated_at > timedelta(days=days)

    @staticmethod
    def upsert(db: Session, ticker: str, data: dict):
        stmt = insert(Fundamental).values(
            ticker=ticker, **data
        ).on_conflict_do_update(
            index_elements=["ticker"],
            set_={**data, "updated_at": datetime.now()}
        )
        db.execute(stmt)
        db.commit()


class ConsensusRepository:

    @staticmethod
    def get(db: Session, ticker: str) -> Consensus | None:
        return db.query(Consensus).filter(Consensus.ticker == ticker).first()

    @staticmethod
    def is_stale(record: Consensus, days: int = 7) -> bool:
        if record is None or record.updated_at is None:
            return True
        return datetime.now() - record.updated_at > timedelta(days=days)

    @staticmethod
    def upsert(db: Session, ticker: str, data: dict):
        stmt = insert(Consensus).values(
            ticker=ticker, **data
        ).on_conflict_do_update(
            index_elements=["ticker"],
            set_={**data, "updated_at": datetime.now()}
        )
        db.execute(stmt)
        db.commit()