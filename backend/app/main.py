from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import yfinance as yf
import pandas as pd
import numpy as np

app = FastAPI(title="Share Prediction Prototype")

class PredictRequest(BaseModel):
    symbols: List[str]
    horizons: List[int] = [15, 30, 60]


def compute_rsi(series: pd.Series, period: int = 14) -> float:
    delta = series.diff().dropna()
    up = delta.clip(lower=0).rolling(period).mean()
    down = -delta.clip(upper=0).rolling(period).mean()
    rs = up / (down.replace(0, np.nan))
    rsi = 100 - (100 / (1 + rs))
    return float(rsi.iloc[-1]) if not rsi.empty else None


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict(req: PredictRequest) -> Dict[str, Any]:
    results = {}
    for symbol in req.symbols:
        try:
            ticker = yf.Ticker(symbol)
            # fetch 1y daily history
            hist = ticker.history(period="1y", interval="1d")
            if hist.empty or 'Close' not in hist.columns:
                raise ValueError("No historical data")

            close = hist['Close'].dropna()
            returns = close.pct_change().dropna()

            # simple expected daily return: mean of last 30 trading days
            lookback = min(len(returns), 30)
            if lookback < 5:
                exp_daily = float(returns.mean())
            else:
                exp_daily = float(returns.tail(lookback).mean())

            vol = float(returns.tail(lookback).std()) if lookback >= 2 else 0.0

            ma20 = float(close.rolling(20).mean().iloc[-1]) if len(close) >= 20 else None
            ma50 = float(close.rolling(50).mean().iloc[-1]) if len(close) >= 50 else None
            rsi14 = compute_rsi(close, 14) if len(close) >= 15 else None

            horizon_preds = {}
            for h in req.horizons:
                # approx compounded return
                pred_return = ( (1 + exp_daily) ** h - 1 ) * 100
                # confidence heuristic: higher vol -> lower confidence
                confidence = max(0.0, 1.0 - vol * np.sqrt(h) * 5)
                confidence = float(min(1.0, max(0.0, confidence)))
                horizon_preds[str(h)] = {
                    "predicted_return_pct": round(float(pred_return), 4),
                    "confidence": round(confidence, 4)
                }

            results[symbol] = {
                "symbol": symbol,
                "ma20": ma20,
                "ma50": ma50,
                "rsi14": rsi14,
                "latest_close": float(close.iloc[-1]),
                "horizons": horizon_preds
            }
        except Exception as e:
            results[symbol] = {"error": str(e)}
    return results
