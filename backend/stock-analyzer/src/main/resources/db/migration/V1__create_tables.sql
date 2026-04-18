CREATE TABLE IF NOT EXISTS users (
                                     id         BIGSERIAL PRIMARY KEY,
                                     email      VARCHAR(255) NOT NULL UNIQUE,
                                     password   VARCHAR(255) NOT NULL,
                                     username   VARCHAR(255) NOT NULL,
                                     role       VARCHAR(20)  NOT NULL DEFAULT 'USER',
                                     created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
                                         id           BIGSERIAL PRIMARY KEY,
                                         user_id      BIGINT       NOT NULL REFERENCES users(id),
                                         ticker       VARCHAR(10)  NOT NULL,
                                         company_name VARCHAR(255),
                                         added_at     TIMESTAMP,
                                         UNIQUE(user_id, ticker)
);

CREATE TABLE IF NOT EXISTS glossary (
                                        id         BIGSERIAL PRIMARY KEY,
                                        term       VARCHAR(255) NOT NULL UNIQUE,
                                        definition TEXT         NOT NULL,
                                        example    TEXT,
                                        category   VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS comparisons (
                                           id         BIGSERIAL PRIMARY KEY,
                                           user_id    BIGINT REFERENCES users(id),
                                           created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comparison_tickers (
                                                  comparison_id BIGINT      NOT NULL REFERENCES comparisons(id),
                                                  ticker        VARCHAR(10) NOT NULL
);