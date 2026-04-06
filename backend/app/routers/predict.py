import sys
import os
import asyncio
from fastapi import APIRouter, HTTPException

# Ensure /ml is importable when running from /backend
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from app.services.stock_service import get_features_for_ml
from app.services.sentiment_service import get_sentiment_analysis

router = APIRouter()


@router.get("/predict/{ticker}", summary="Next-day price direction prediction with confidence")
async def predict(ticker: str):
    try:
        from ml.model import predict_direction

        # Run blocking I/O concurrently in thread pool
        features, sentiment = await asyncio.gather(
            asyncio.to_thread(get_features_for_ml, ticker.upper()),
            get_sentiment_analysis(ticker.upper()),
        )

        features["sentiment_score"] = sentiment["avg_score"]
        features["pct_positive"] = sentiment["pct_positive"] / 100.0

        return await asyncio.to_thread(predict_direction, ticker.upper(), features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
