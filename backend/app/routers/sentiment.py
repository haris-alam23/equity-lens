from fastapi import APIRouter, HTTPException
from app.services.sentiment_service import get_sentiment_analysis

router = APIRouter()


@router.get("/sentiment/{ticker}", summary="News sentiment score and top headlines")
async def get_sentiment(ticker: str):
    try:
        return await get_sentiment_analysis(ticker.upper())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")
