import asyncio
from fastapi import APIRouter, HTTPException, Query
from app.services.stock_service import get_stock_data

router = APIRouter()

VALID_PERIODS = {"7d", "1mo", "3mo", "6mo", "1y"}


@router.get("/stock/{ticker}", summary="Historical price data with moving averages, volume, RSI, and key stats")
async def get_stock(
    ticker: str,
    period: str = Query(default="3mo", description="History period: 7d | 1mo | 3mo | 6mo | 1y"),
):
    if period not in VALID_PERIODS:
        raise HTTPException(status_code=400, detail=f"Invalid period '{period}'. Choose from: {', '.join(sorted(VALID_PERIODS))}")
    try:
        return await asyncio.to_thread(get_stock_data, ticker.upper(), period)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stock data: {str(e)}")
