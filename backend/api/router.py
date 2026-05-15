import os
import requests
from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np
from services.stock_data import fetch_stock_data
from services.technical_analysis import calculate_advanced_ta
from agents.sentiment_agent import get_news_sentiment
from agents.reasoning_agent import generate_final_analysis
from agents.chat_agent import generate_chat_response
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    ticker: str
    message: str
    history: List[ChatMessage]
    context: Optional[Dict[str, Any]] = {}

api_router = APIRouter()

@api_router.get("/status")
def get_status():
    return {"status": "ok"}

@api_router.get("/search/{query}")
async def search_ticker(query: str):
    api_key = os.environ.get("FINNHUB_API_KEY")
    if not api_key:
        return {"result": []}
    url = f"https://finnhub.io/api/v1/search?q={query}&token={api_key}"
    try:
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            # Filter and limit to top 5 results to avoid massive dropdowns
            results = data.get('result', [])
            return {"result": results[:5]}
    except Exception:
        pass
    return {"result": []}

@api_router.get("/stock/{ticker}")
async def get_stock(ticker: str, period: str = "1Y"):
    mapping = {
        "1D": ("1d", "5m"),
        "1W": ("5d", "15m"),
        "1M": ("1mo", "1d"),
        "6M": ("6mo", "1d"),
        "1Y": ("1y", "1d"),
        "5Y": ("5y", "1wk"),
        "MAX": ("max", "1mo"),
    }
    yf_period, yf_interval = mapping.get(period.upper(), ("1y", "1d"))
    try:
        df = fetch_stock_data(ticker, period=yf_period, interval=yf_interval)
        df.reset_index(inplace=True)
        date_col = 'Date' if 'Date' in df.columns else 'Datetime'
        
        # Format date differently based on whether we have intraday data
        if 'Datetime' in df.columns or yf_interval in ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h']:
            df[date_col] = df[date_col].dt.strftime('%Y-%m-%d %H:%M:%S')
        else:
            df[date_col] = df[date_col].dt.strftime('%Y-%m-%d')
            
        df = df.replace([np.inf, -np.inf], np.nan).where(pd.notnull(df), None)
        return {"ticker": ticker, "data": df.to_dict(orient='records'), "period": period}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/signals/{ticker}")
async def get_signals(ticker: str):
    try:
        df = fetch_stock_data(ticker, period="1y")
        return calculate_advanced_ta(df)
    except Exception as e:
         raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/news/{ticker}")
async def get_news(ticker: str):
    return get_news_sentiment(ticker)

@api_router.get("/analyze/{ticker}")
async def analyze_stock(ticker: str):
    try:
        df = fetch_stock_data(ticker, period="1y")
        ta_data = calculate_advanced_ta(df)
        sentiment_data = get_news_sentiment(ticker)
        reasoning = generate_final_analysis(ticker, ta_data, sentiment_data)
        
        return {
            "ticker": ticker,
            "technical_analysis": ta_data,
            "sentiment": sentiment_data,
            "reasoning": reasoning
        }
    except Exception as e:
         raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    res = generate_chat_response(
        request.ticker, 
        request.message, 
        [h.model_dump() for h in request.history], 
        request.context
    )
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res
