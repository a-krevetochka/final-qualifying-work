CREATE INDEX IF NOT EXISTS ix_users_email
    ON users(email);

CREATE INDEX IF NOT EXISTS ix_favorites_user_id
    ON favorites(user_id);

CREATE INDEX IF NOT EXISTS ix_favorites_ticker
    ON favorites(ticker);

CREATE INDEX IF NOT EXISTS ix_glossary_term
    ON glossary(term);

CREATE INDEX IF NOT EXISTS ix_glossary_category
    ON glossary(category);

CREATE INDEX IF NOT EXISTS ix_comparisons_user_id
    ON comparisons(user_id);

CREATE INDEX IF NOT EXISTS ix_comparisons_created_at
    ON comparisons(created_at);

CREATE INDEX IF NOT EXISTS ix_comparison_tickers_comparison_id
    ON comparison_tickers(comparison_id);