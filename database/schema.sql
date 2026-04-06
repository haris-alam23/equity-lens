-- EquityLens PostgreSQL Schema

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS watchlist (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ticker      VARCHAR(10) NOT NULL,
    added_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, ticker)
);

CREATE TABLE IF NOT EXISTS sentiment_cache (
    id          SERIAL PRIMARY KEY,
    ticker      VARCHAR(10) NOT NULL,
    avg_score   FLOAT,
    pct_positive FLOAT,
    pct_neutral  FLOAT,
    pct_negative FLOAT,
    fetched_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_sentiment_ticker ON sentiment_cache(ticker);
