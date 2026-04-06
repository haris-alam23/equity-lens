import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routers import stock, sentiment, signal, predict

app = FastAPI(
    title="EquityLens — Financial Sentiment & Market Intelligence API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stock.router, prefix="/api", tags=["Stock"])
app.include_router(sentiment.router, prefix="/api", tags=["Sentiment"])
app.include_router(signal.router, prefix="/api", tags=["Signal"])
app.include_router(predict.router, prefix="/api", tags=["Prediction"])


@app.get("/healthz")
def health():
    return {"status": "ok", "message": "EquityLens API is running"}


# Serve built React frontend in production
_frontend_dist = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
)

if os.path.exists(_frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(_frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        return FileResponse(os.path.join(_frontend_dist, "index.html"))
