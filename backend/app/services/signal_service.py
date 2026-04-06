import yfinance as yf
import pandas as pd
from typing import Dict, Any


def _momentum_score(ticker: str) -> float:
    """Compute a 0–50 momentum component from recent price trends."""
    stock = yf.Ticker(ticker)
    hist = stock.history(period="1mo")

    if len(hist) < 10:
        return 25.0

    hist["r5"] = hist["Close"].pct_change(5)
    hist["r10"] = hist["Close"].pct_change(10)

    r5 = float(hist["r5"].iloc[-1])
    r10 = float(hist["r10"].iloc[-1])

    # Weighted blend; r5 more recent, r10 for trend confirmation
    blended = (r5 * 0.6 + r10 * 0.4) * 100  # expressed as percent

    # Map: +10% → 50, 0% → 25, −10% → 0
    score = 25.0 + (blended * 2.5)
    return max(0.0, min(50.0, score))


def _build_explanation(label: str, momentum: float, sentiment: float, pct_positive: float) -> str:
    pct = round(pct_positive)
    if label == "Bullish":
        if momentum > 35 and sentiment > 30:
            return (
                f"Bullish due to strong upward price momentum and positive news sentiment. "
                f"{pct}% of recent headlines are positive."
            )
        if momentum > 35:
            return "Bullish driven by strong price momentum over the recent period, despite mixed sentiment."
        return f"Bullish due to overwhelmingly positive news sentiment — {pct}% of headlines are positive."

    if label == "Bearish":
        if momentum < 15 and sentiment < 20:
            return "Bearish due to a declining price trend combined with negative market sentiment."
        if momentum < 15:
            return "Bearish driven by weak or negative price momentum over the recent period."
        return f"Bearish due to predominantly negative news flow — only {pct}% of headlines are positive."

    return (
        "Neutral signal — price momentum and news sentiment are balanced with no clear directional bias."
    )


def compute_signal(ticker: str, sentiment_score: float, pct_positive: float) -> Dict[str, Any]:
    momentum = _momentum_score(ticker)

    # Sentiment score in [−1, +1] → map to [0, 50]
    sentiment_component = ((sentiment_score + 1) / 2) * 50

    total = round(max(0.0, min(100.0, momentum + sentiment_component)), 1)

    if total >= 60:
        label = "Bullish"
    elif total <= 40:
        label = "Bearish"
    else:
        label = "Neutral"

    explanation = _build_explanation(label, momentum, sentiment_component, pct_positive)

    return {
        "ticker": ticker,
        "score": total,
        "label": label,
        "explanation": explanation,
    }
