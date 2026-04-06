"""
ML model for next-day price direction prediction.

predict_direction  → used at inference time (auto-trains on first call)
train_model        → explicit re-training entry point
"""

import os
import pickle
from typing import Dict, Any

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from ml.features import FEATURE_COLS, build_feature_dataset, build_live_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "saved_scaler.pkl")


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

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(SCALER_PATH, "wb") as f:
        pickle.dump(scaler, f)

    return {
        "trained_on": ticker,
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "accuracy": round(float(accuracy), 3),
    }


def _load_or_train():
    """Load persisted model + scaler, training fresh if not found."""
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        with open(SCALER_PATH, "rb") as f:
            scaler = pickle.load(f)
        return model, scaler

    print("[EquityLens] No saved model found — training on SPY data...")
    train_model("SPY")
    return _load_or_train()


def predict_direction(ticker: str, features_dict: Dict) -> Dict[str, Any]:
    """
    Predict next-day price direction for `ticker`.

    Returns:
        ticker, prediction ("Up" / "Down"), confidence (%), direction ("up" / "down")
    """
    model, scaler = _load_or_train()

    X_live = build_live_features(features_dict)

    # Guarantee column order matches training
    for col in FEATURE_COLS:
        if col not in X_live.columns:
            X_live[col] = 0.0
    X_live = X_live[FEATURE_COLS]

    X_scaled = scaler.transform(X_live)

    prediction = int(model.predict(X_scaled)[0])
    proba = model.predict_proba(X_scaled)[0]
    confidence = round(float(np.max(proba)) * 100, 1)

    direction = "Up" if prediction == 1 else "Down"

    return {
        "ticker": ticker,
        "prediction": direction,
        "confidence": confidence,
        "direction": direction.lower(),
    }
