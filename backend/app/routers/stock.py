from fastapi import APIRouter, HTTPException
from app.services.stock_service import get_stock_data

router = APIRouter()


@router.get("/stock/{ticker}", summary="Historical price data with moving averages")
async def get_stock(ticker: str):
    try:
        return get_stock_data(ticker.upper())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stock data: {str(e)}")
