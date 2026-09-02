# share-prediction — Prototype scaffold

This branch contains a minimal prototype scaffold for the Share Prediction app: a FastAPI backend and a React (Vite) frontend.

Features:
- Backend: FastAPI app with /health and /predict endpoints. Uses yfinance + pandas to fetch historical data and compute simple indicator-based predictions for horizons (15/30/60 days).
- Frontend: Vite + React app with an input for tickers, calls the backend, and displays simple results.

Run locally (development):

1. Start backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .\.venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Start frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and use the UI. The frontend calls backend at http://localhost:8000; if you run in different hosts/ports, update `frontend/src/api.js`.

Notes:
- This is a prototype scaffold with a simple heuristic predictor; replace with the full pipeline and ML models later.
- Ensure you have network access for yfinance to fetch data.
