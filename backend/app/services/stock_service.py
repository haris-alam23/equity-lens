import yfinance as yf
import pandas as pd
from typing import Dict, Any


def get_stock_data(ticker: str, period: str = "3mo") -> Dict[str, Any]:
    """Fetch historical price data and compute moving averages."""
    stock = yf.Ticker(ticker)
    hist = stock.history(period=period)

    if hist.empty:
        raise ValueError(f"No price data found for ticker '{ticker}'. Check the symbol and try again.")

    info = {}
    try:
        info = stock.info
    except Exception:
        pass

    company_name = info.get("longName") or info.get("shortName") or ticker

    hist["ma5"] = hist["Close"].rolling(window=5).mean()
    hist["ma10"] = hist["Close"].rolling(window=10).mean()

    prices = []
    for date, row in hist.iterrows():
        prices.append({
            "date": date.strftime("%Y-%m-%d"),
            "close": round(float(row["Close"]), 2),
            "ma5": round(float(row["ma5"]), 2) if not pd.isna(row["ma5"]) else None,
            "ma10": round(float(row["ma10"]), 2) if not pd.isna(row["ma10"]) else None,
        })

    current_price = float(hist["Close"].iloc[-1])
    prev_price = float(hist["Close"].iloc[-2]) if len(hist) > 1 else current_price
    price_change_pct = ((current_price - prev_price) / prev_price) * 100

    return {
        "ticker": ticker.upper(),
        "company_name": company_name,
        "current_price": round(current_price, 2),
        "price_change_pct": round(price_change_pct, 2),
        "prices": prices,
    }


def get_features_for_ml(ticker: str) -> Dict[str, float]:
    """Extract the latest feature values needed for ML prediction."""
    stock = yf.Ticker(ticker)
    hist = stock.history(period="3mo")

    if len(hist) < 15:
        raise ValueError("Insufficient historical data for prediction.")

    hist["daily_return"] = hist["Close"].pct_change()
    hist["ma5"] = hist["Close"].rolling(5).mean()
    hist["ma10"] = hist["Close"].rolling(10).mean()
    hist["volatility_5d"] = hist["daily_return"].rolling(5).std()
    hist["momentum_3d"] = hist["Close"].pct_change(3)
    hist["momentum_10d"] = hist["Close"].pct_change(10)
    hist["volume_ma5"] = hist["Volume"].rolling(5).mean()

    latest = hist.iloc[-1]

    return {
        "daily_return": float(latest["daily_return"]),
        "ma5": float(latest["ma5"]),
        "ma10": float(latest["ma10"]),
        "volatility_5d": float(latest["volatility_5d"]),
        "momentum_3d": float(latest["momentum_3d"]),
        "momentum_10d": float(latest["momentum_10d"]),
        "current_price": float(latest["Close"]),
        "volume": float(latest["Volume"]),
        "volume_ma5": float(latest["volume_ma5"]) if not pd.isna(latest["volume_ma5"]) else float(latest["Volume"]),
    }
