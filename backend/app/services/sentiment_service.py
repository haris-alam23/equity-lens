import os
import httpx
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from typing import Dict, Any, List
from datetime import datetime

analyzer = SentimentIntensityAnalyzer()


def analyze_text(text: str) -> Dict:
    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]
    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"
    return {"score": round(compound, 3), "label": label}


async def fetch_news_from_api(ticker: str) -> List[Dict]:
    api_key = os.getenv("NEWS_API_KEY", "")
    if not api_key:
        return []

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://newsapi.org/v2/everything",
            params={
                "q": f"{ticker} stock",
                "sortBy": "publishedAt",
                "pageSize": 10,
                "language": "en",
                "apiKey": api_key,
            },
            timeout=10.0,
        )
        data = response.json()
        return data.get("articles", [])


def _mock_headlines(ticker: str) -> List[Dict]:
    """Fallback mock headlines when NewsAPI key is not configured."""
    templates = [
        (f"{ticker} reports stronger-than-expected quarterly earnings", 0.62, "positive"),
        (f"Analysts upgrade {ticker} with raised price target", 0.45, "positive"),
        (f"{ticker} announces strategic acquisition to expand market share", 0.38, "positive"),
        (f"Market volatility weighs on {ticker} amid macro uncertainty", -0.15, "negative"),
        (f"Investors await {ticker} guidance update at upcoming investor day", 0.04, "neutral"),
    ]
    now = datetime.utcnow().isoformat() + "Z"
    return [
        {"title": t, "url": "", "published_at": now, "sentiment": lbl, "score": sc}
        for t, sc, lbl in templates
    ]


async def get_sentiment_analysis(ticker: str) -> Dict[str, Any]:
    raw_articles = []
    try:
        raw_articles = await fetch_news_from_api(ticker)
    except Exception:
        pass

    if raw_articles:
        headlines = []
        for article in raw_articles[:10]:
            title = article.get("title", "")
            if not title or title == "[Removed]":
                continue
            s = analyze_text(title)
            headlines.append({
                "title": title,
                "url": article.get("url", ""),
                "published_at": article.get("publishedAt", ""),
                "sentiment": s["label"],
                "score": s["score"],
            })
    else:
        headlines = _mock_headlines(ticker)

    if not headlines:
        return {
            "ticker": ticker,
            "avg_score": 0.0,
            "pct_positive": 0.0,
            "pct_neutral": 100.0,
            "pct_negative": 0.0,
            "headlines": [],
        }

    scores = [h["score"] for h in headlines]
    avg_score = round(sum(scores) / len(scores), 3)

    positive = sum(1 for h in headlines if h["sentiment"] == "positive")
    negative = sum(1 for h in headlines if h["sentiment"] == "negative")
    neutral = len(headlines) - positive - negative
    total = len(headlines)

    return {
        "ticker": ticker,
        "avg_score": avg_score,
        "pct_positive": round((positive / total) * 100, 1),
        "pct_neutral": round((neutral / total) * 100, 1),
        "pct_negative": round((negative / total) * 100, 1),
        "headlines": headlines[:3],
    }
