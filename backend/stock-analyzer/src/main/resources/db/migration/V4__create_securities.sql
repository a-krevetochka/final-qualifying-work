CREATE TABLE IF NOT EXISTS securities (
                                          id             BIGSERIAL PRIMARY KEY,
                                          ticker         VARCHAR(10)  NOT NULL UNIQUE,
                                          name           VARCHAR(255),
                                          sector         VARCHAR(50),
                                          instrument_uid VARCHAR(100),
                                          asset_uid      VARCHAR(100),
                                          listed         BOOLEAN DEFAULT true,
                                          updated_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_securities_ticker ON securities(ticker);
CREATE INDEX IF NOT EXISTS ix_securities_sector ON securities(sector);