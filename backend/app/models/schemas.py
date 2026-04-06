from pydantic import BaseModel
from typing import List, Optional


class PricePoint(BaseModel):
    date: str
    close: float
    ma5: Optional[float] = None
    ma10: Optional[float] = None


class StockResponse(BaseModel):
    ticker: str
    company_name: str
    current_price: float
    price_change_pct: float
    prices: List[PricePoint]


class Headline(BaseModel):
    title: str
    url: str
    published_at: str
    sentiment: str
    score: float


class SentimentResponse(BaseModel):
    ticker: str
    avg_score: float
    pct_positive: float
    pct_neutral: float
    pct_negative: float
    headlines: List[Headline]


class SignalResponse(BaseModel):
    ticker: str
    score: float
    label: str
    explanation: str


class PredictionResponse(BaseModel):
    ticker: str
    prediction: str
    confidence: float
    direction: str
