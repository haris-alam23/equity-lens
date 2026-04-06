"""
Standalone training script.

Usage:
    python ml/train.py           # trains on SPY (default)
    python ml/train.py AAPL      # trains on AAPL
"""

import sys
from ml.model import train_model


if __name__ == "__main__":
    ticker = sys.argv[1] if len(sys.argv) > 1 else "SPY"
    print(f"Training model on {ticker}...")
    metrics = train_model(ticker)
    print(f"Done. Metrics: {metrics}")
