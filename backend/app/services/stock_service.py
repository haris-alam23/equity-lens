import yfinance as yf
import pandas as pd
from typing import Dict, Any, Optional


def _compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Compute RSI using Wilder's smoothing method."""
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    # First average using simple mean for the seed
    avg_gain = gain.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()

    rs = avg_gain / avg_loss.replace(0, float('nan'))
    rsi = 100 - (100 / (1 + rs))
    return rsi


def _format_market_cap(value: Optional[float]) -> Optional[str]:
    if value is None:
        return None
    if value >= 1e12:
        return f"${value / 1e12:.2f}T"
    if value >= 1e9:
        return f"${value / 1e9:.2f}B"
    if value >= 1e6:
        return f"${value / 1e6:.2f}M"
    return f"${value:,.0f}"


def get_stock_data(ticker: str, period: str = "3mo") -> Dict[str, Any]:
    """Fetch historical price data, compute moving averages, volume, RSI, and key stats."""
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
    hist["rsi"] = _compute_rsi(hist["Close"], period=14)

    prices = []
    for date, row in hist.iterrows():
        prices.append({
            "date": date.strftime("%Y-%m-%d"),
            "close": round(float(row["Close"]), 2),
            "ma5": round(float(row["ma5"]), 2) if not pd.isna(row["ma5"]) else None,
            "ma10": round(float(row["ma10"]), 2) if not pd.isna(row["ma10"]) else None,
            "volume": int(row["Volume"]) if not pd.isna(row["Volume"]) else None,
            "rsi": round(float(row["rsi"]), 2) if not pd.isna(row["rsi"]) else None,
        })

    current_price = float(hist["Close"].iloc[-1])
    prev_price = float(hist["Close"].iloc[-2]) if len(hist) > 1 else current_price
    price_change_pct = ((current_price - prev_price) / prev_price) * 100

    # Build stats object from info
    raw_market_cap = info.get("marketCap")
    raw_dividend = info.get("dividendYield")
    stats = {
        "market_cap": _format_market_cap(raw_market_cap),
        "pe_ratio": round(float(info["trailingPE"]), 2) if info.get("trailingPE") is not None else None,
        "eps": round(float(info["trailingEps"]), 2) if info.get("trailingEps") is not None else None,
        "beta": round(float(info["beta"]), 2) if info.get("beta") is not None else None,
        "week_52_high": round(float(info["fiftyTwoWeekHigh"]), 2) if info.get("fiftyTwoWeekHigh") is not None else None,
        "week_52_low": round(float(info["fiftyTwoWeekLow"]), 2) if info.get("fiftyTwoWeekLow") is not None else None,
        "avg_volume": int(info["averageVolume"]) if info.get("averageVolume") is not None else None,
        "dividend_yield": round(float(raw_dividend) * 100, 2) if raw_dividend is not None else None,
    }

    return {
        "ticker": ticker.upper(),
        "company_name": company_name,
        "current_price": round(current_price, 2),
        "price_change_pct": round(price_change_pct, 2),
        "prices": prices,
        "stats": stats,
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
