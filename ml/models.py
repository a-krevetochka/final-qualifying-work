from sqlalchemy import Column, Integer, String, Float, Date, DateTime, BigInteger, UniqueConstraint, Index, Boolean
from sqlalchemy.sql import func
from database import Base


class Candle(Base):
    __tablename__ = "candles"

    id        = Column(Integer, primary_key=True)
    ticker    = Column(String(10), nullable=False)
    date      = Column(Date, nullable=False)
    open      = Column(Float)
    high      = Column(Float)
    low       = Column(Float)
    close     = Column(Float)
    volume    = Column(BigInteger)

    __table_args__ = (
        UniqueConstraint("ticker", "date"),
        Index("ix_candles_ticker_date", "ticker", "date"),
        Index("ix_candles_date", "date"),
    )


class Macro(Base):
    __tablename__ = "macro"

    id     = Column(Integer, primary_key=True)
    date   = Column(Date, nullable=False, unique=True)
    usdrub = Column(Float)
    imoex  = Column(Float)
    brent  = Column(Float)

    __table_args__ = (
        Index("ix_macro_date", "date"),
    )


class Instrument(Base):
    __tablename__ = "instruments"

    id             = Column(Integer, primary_key=True)
    ticker         = Column(String(10), nullable=False, unique=True)
    instrument_uid = Column(String(100))
    asset_uid      = Column(String(100))

    __table_args__ = (
        Index("ix_instruments_ticker", "ticker"),
    )


class Fundamental(Base):
    __tablename__ = "fundamentals"

    id               = Column(Integer, primary_key=True)
    ticker           = Column(String(10), nullable=False, unique=True)
    pe_ratio         = Column(Float)
    pb_ratio         = Column(Float)
    roe              = Column(Float)
    roa              = Column(Float)
    net_margin       = Column(Float)
    debt_to_equity   = Column(Float)
    div_yield        = Column(Float)
    revenue_growth   = Column(Float)
    eps_ttm          = Column(Float)
    market_cap       = Column(Float)
    graham_score     = Column(Float)
    interpretation   = Column(String(50))
    updated_at       = Column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("ix_fundamentals_ticker", "ticker"),
        Index("ix_fundamentals_updated_at", "updated_at"),
    )


class Consensus(Base):
    __tablename__ = "consensus"

    id               = Column(Integer, primary_key=True)
    ticker           = Column(String(10), nullable=False, unique=True)
    recommendation   = Column(String(20))
    current_price    = Column(Float)
    target_price     = Column(Float)
    price_change_pct = Column(Float)
    updated_at       = Column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("ix_consensus_ticker", "ticker"),
        Index("ix_consensus_updated_at", "updated_at"),
    )

class Security(Base):
    __tablename__ = "securities"

    id             = Column(Integer, primary_key=True)
    ticker         = Column(String(10), nullable=False, unique=True)
    name           = Column(String(255))
    sector         = Column(String(50))
    instrument_uid = Column(String(100))
    asset_uid      = Column(String(100))
    listed         = Column(Boolean, default=True)
    updated_at     = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("ix_securities_ticker", "ticker"),
        Index("ix_securities_sector", "sector"),
    )
