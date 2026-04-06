from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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


@app.get("/")
def root():
    return {"status": "ok", "message": "EquityLens API is running"}
