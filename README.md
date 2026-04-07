# EquityLens — Financial Sentiment & Market Intelligence Platform

A full-stack MVP combining real-time stock data, news sentiment analysis, and ML predictions into a single, clean interface.

Access it here: https://equity-lens-ai.vercel.app/
---

## Project Structure

```
equityLens/
├── backend/          FastAPI API server
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/  stock · sentiment · signal · predict
│   │   ├── services/ stock_service · sentiment_service · signal_service
│   │   └── models/   schemas.py (Pydantic)
│   ├── requirements.txt
│   └── .env.example
├── frontend/         React + Vite + Tailwind
│   └── src/
│       ├── App.jsx
│       ├── components/
│       ├── hooks/    useStockData.js
│       └── api/      client.js
├── ml/               Scikit-learn model
│   ├── features.py   Feature engineering
│   ├── model.py      Train + predict
│   └── train.py      CLI training script
└── database/
    └── schema.sql    PostgreSQL schema
```

---

## Running Locally

### 1. Backend

```bash
cd backend

# Create and activate virtual env
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (optional — app works without NewsAPI key)
cp .env.example .env
# Edit .env and add your NEWS_API_KEY from https://newsapi.org

# Start the server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

### 2. Frontend

```bash
cd frontend

npm install
npm run dev
```

App available at: http://localhost:5173

---

### 3. ML Model (optional pre-training)

The model auto-trains on first prediction request. To pre-train manually:

```bash
# From the project root
cd backend
python -m ml.train          # trains on SPY (default)
python -m ml.train AAPL     # trains on a specific ticker
```

---

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/stock/{ticker}` | Price history + MA5/MA10 |
| `GET /api/sentiment/{ticker}` | Sentiment score + headlines |
| `GET /api/signal/{ticker}` | Score 0–100, Bullish/Neutral/Bearish, explanation |
| `GET /api/predict/{ticker}` | Up/Down prediction + confidence % |

---

## Features

- **Price Chart** — 3-month close price with 5-day and 10-day moving averages (Recharts)
- **Sentiment Analysis** — VADER-based scoring of recent news headlines via NewsAPI; falls back to mock data without a key
- **Market Signal Score** — 0–100 composite of price momentum + sentiment, with plain-English explanation
- **ML Prediction** — Random Forest trained on price features; auto-trains on SPY on first use
- **Dark UI** — Tailwind CSS dark theme with loading skeletons and per-section error handling

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEWS_API_KEY` | Optional | From [newsapi.org](https://newsapi.org) — enables live headlines |
| `DATABASE_URL` | Optional | PostgreSQL URL for user/watchlist features |

The app works fully without either key (uses yfinance for prices, mock headlines for sentiment).
