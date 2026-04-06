from fastapi import APIRouter, HTTPException
from app.services.signal_service import compute_signal
from app.services.sentiment_service import get_sentiment_analysis

router = APIRouter()


@router.get("/signal/{ticker}", summary="Market signal score (0–100) with Bullish/Neutral/Bearish label")
async def get_signal(ticker: str):
    try:
        sentiment = await get_sentiment_analysis(ticker.upper())
        return compute_signal(
            ticker.upper(),
            sentiment["avg_score"],
            sentiment["pct_positive"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signal computation failed: {str(e)}")
