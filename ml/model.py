"""
ML model for next-day price direction prediction.

predict_direction  → used at inference time (auto-trains on first call)
train_model        → explicit re-training entry point
"""

import os
import json
import pickle
from datetime import datetime, timezone
from typing import Dict, Any

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from ml.features import FEATURE_COLS, build_feature_dataset, build_live_features

_MODEL_DIR = os.path.dirname(__file__)


def _model_path(ticker: str) -> str:
    return os.path.join(_MODEL_DIR, f"saved_model_{ticker}.pkl")


def _scaler_path(ticker: str) -> str:
    return os.path.join(_MODEL_DIR, f"saved_scaler_{ticker}.pkl")


def _meta_path(ticker: str) -> str:
    return os.path.join(_MODEL_DIR, f"saved_meta_{ticker}.json")

# Human-readable labels for each feature column
FEATURE_LABELS: Dict[str, str] = {
    "momentum_10d": "10d Momentum",
    "volatility_5d": "5d Volatility",
    "sentiment_score": "Sentiment",
    "ma5_ratio": "MA5 Ratio",
    "ma10_ratio": "MA10 Ratio",
    "daily_return": "Daily Return",
    "volume_ratio": "Volume Ratio",
    "momentum_3d": "3d Momentum",
}


def train_model(ticker: str = "SPY", period: str = "2y") -> Dict[str, Any]:
    """
    Train a Random Forest on historical data for `ticker` and persist to disk.
    Returns training metrics.
    """
    X, y = build_feature_dataset(ticker, period=period)

    # Chronological split — no shuffle to avoid data leakage
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=5,
        min_samples_leaf=10,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train_s, y_train)

    accuracy = accuracy_score(y_test, model.predict(X_test_s))

    with open(_model_path(ticker), "wb") as f:
        pickle.dump(model, f)
    with open(_scaler_path(ticker), "wb") as f:
        pickle.dump(scaler, f)

    accuracy_rounded = round(float(accuracy), 4)
    meta = {
        "accuracy": accuracy_rounded,
        "trained_on": ticker,
        "trained_at": datetime.now(timezone.utc).isoformat(),
    }
    with open(_meta_path(ticker), "w") as f:
        json.dump(meta, f, indent=2)

    return {
        "trained_on": ticker,
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "accuracy": accuracy_rounded,
    }


def _load_meta(ticker: str) -> Dict[str, Any]:
    """Load per-ticker model metadata, or return defaults."""
    path = _meta_path(ticker)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {"accuracy": None, "trained_on": ticker, "trained_at": None}


def _load_or_train(ticker: str):
    """Load persisted model + scaler for ticker, training fresh if not found."""
    mp, sp = _model_path(ticker), _scaler_path(ticker)
    if os.path.exists(mp) and os.path.exists(sp):
        with open(mp, "rb") as f:
            model = pickle.load(f)
        with open(sp, "rb") as f:
            scaler = pickle.load(f)
        return model, scaler

    print(f"[EquityLens] No saved model for {ticker} — training now...")
    train_model(ticker)
    return _load_or_train(ticker)


def predict_direction(ticker: str, features_dict: Dict) -> Dict[str, Any]:
    """
    Predict next-day price direction for `ticker`.

    Returns:
        ticker, prediction ("Up" / "Down"), confidence (%), direction ("up" / "down"),
        prob_up (%), prob_down (%), feature_importance (top 5), model_accuracy
    """
    model, scaler = _load_or_train(ticker)
    meta = _load_meta(ticker)

    X_live = build_live_features(features_dict)

    # Guarantee column order matches training
    for col in FEATURE_COLS:
        if col not in X_live.columns:
            X_live[col] = 0.0
    X_live = X_live[FEATURE_COLS]

    X_scaled = scaler.transform(X_live)

    prediction = int(model.predict(X_scaled)[0])
    proba = model.predict_proba(X_scaled)[0]

    # proba[0] = prob Down (class 0), proba[1] = prob Up (class 1)
    prob_down = round(float(proba[0]) * 100, 1)
    prob_up = round(float(proba[1]) * 100, 1)
    confidence = round(float(np.max(proba)) * 100, 1)

    direction = "Up" if prediction == 1 else "Down"

    # Feature importances — top 5, mapped to readable labels
    importances = model.feature_importances_
    fi_pairs = sorted(
        zip(FEATURE_COLS, importances), key=lambda x: x[1], reverse=True
    )[:5]
    feature_importance = [
        {
            "feature": FEATURE_LABELS.get(col, col),
            "importance": round(float(imp), 4),
        }
        for col, imp in fi_pairs
    ]

    # Model accuracy from metadata
    model_accuracy = meta.get("accuracy")

    return {
        "ticker": ticker,
        "prediction": direction,
        "confidence": confidence,
        "direction": direction.lower(),
        "prob_up": prob_up,
        "prob_down": prob_down,
        "feature_importance": feature_importance,
        "model_accuracy": model_accuracy,
    }
