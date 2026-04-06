"""
Feature engineering for the EquityLens ML model.

build_feature_dataset  → used for training (returns full DataFrame)
build_live_features    → used for live inference (returns single-row DataFrame)
"""

import yfinance as yf
import pandas as pd
from typing import Tuple, Dict

FEATURE_COLS = [
    "daily_return",
    "ma5_ratio",
    "ma10_ratio",
    "volatility_5d",
    "momentum_3d",
    "momentum_10d",
    "volume_ratio",
]


def build_feature_dataset(ticker: str, period: str = "2y") -> Tuple[pd.DataFrame, pd.Series]:
    """
    Download historical data and compute all features + target label.

    Target: 1 if next-day close > today close, else 0.
    """
    stock = yf.Ticker(ticker)
    hist = stock.history(period=period)

    if len(hist) < 30:
        raise ValueError(f"Not enough historical data for {ticker}.")

    df = hist[["Close", "Volume"]].copy()

    df["daily_return"] = df["Close"].pct_change()
    df["ma5"] = df["Close"].rolling(5).mean()
    df["ma10"] = df["Close"].rolling(10).mean()
    df["ma5_ratio"] = df["Close"] / df["ma5"]
    df["ma10_ratio"] = df["Close"] / df["ma10"]
    df["volatility_5d"] = df["daily_return"].rolling(5).std()
    df["momentum_3d"] = df["Close"].pct_change(3)
    df["momentum_10d"] = df["Close"].pct_change(10)
    df["volume_ma5"] = df["Volume"].rolling(5).mean()
    df["volume_ratio"] = df["Volume"] / df["volume_ma5"]

    # Binary target: next day up (1) or down (0)
    df["target"] = (df["Close"].shift(-1) > df["Close"]).astype(int)

    df = df.dropna()

    return df[FEATURE_COLS], df["target"]


def build_live_features(features_dict: Dict) -> pd.DataFrame:
    """
    Convert the raw feature dict from stock_service into a model-ready DataFrame row.
    """
    price = features_dict["current_price"]
    ma5 = features_dict["ma5"] or price
    ma10 = features_dict["ma10"] or price
    volume = features_dict.get("volume", 1.0)
    volume_ma5 = features_dict.get("volume_ma5", volume) or volume

    row = {
        "daily_return": features_dict["daily_return"],
        "ma5_ratio": price / ma5,
        "ma10_ratio": price / ma10,
        "volatility_5d": features_dict["volatility_5d"],
        "momentum_3d": features_dict["momentum_3d"],
        "momentum_10d": features_dict.get("momentum_10d", features_dict["momentum_3d"]),
        "volume_ratio": volume / volume_ma5 if volume_ma5 else 1.0,
    }

    return pd.DataFrame([row], columns=FEATURE_COLS)
