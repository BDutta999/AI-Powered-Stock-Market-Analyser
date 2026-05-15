import pandas as pd
import ta
import numpy as np

def calculate_advanced_ta(df: pd.DataFrame) -> dict:
    if df.empty or len(df) < 200:
        return {"error": "Not enough data (need at least 200 periods)"}
        
    close = df['Close']
    high = df['High']
    low = df['Low']
    volume = df['Volume']
    
    # EMA
    df['EMA_20'] = ta.trend.ema_indicator(close, window=20, fillna=True)
    df['EMA_50'] = ta.trend.ema_indicator(close, window=50, fillna=True)
    df['EMA_200'] = ta.trend.ema_indicator(close, window=200, fillna=True)
    
    # RSI
    df['RSI_14'] = ta.momentum.rsi(close, window=14, fillna=True)
    
    # MACD
    macd = ta.trend.MACD(close, fillna=True)
    df['MACD'] = macd.macd()
    df['MACD_Signal'] = macd.macd_signal()
    
    # Bollinger Bands
    bb = ta.volatility.BollingerBands(close, fillna=True)
    df['BB_High'] = bb.bollinger_hband()
    df['BB_Low'] = bb.bollinger_lband()
    
    # ATR
    df['ATR'] = ta.volatility.average_true_range(high, low, close, fillna=True)
    
    # Volume spike (current volume > 2x 20-day average volume)
    df['Vol_SMA_20'] = volume.rolling(window=20).mean().fillna(0)
    
    latest = df.iloc[-1]
    
    volume_spike = bool(latest['Volume'] > 2 * latest['Vol_SMA_20'])
    
    # Determine trend
    if latest['Close'] > latest['EMA_50'] and latest['EMA_50'] > latest['EMA_200']:
        trend = "Strong Uptrend"
    elif latest['Close'] > latest['EMA_200']:
        trend = "Uptrend"
    elif latest['Close'] < latest['EMA_50'] and latest['EMA_50'] < latest['EMA_200']:
        trend = "Strong Downtrend"
    else:
        trend = "Sideways / Choppy"
        
    # Bullish / Bearish signals
    signals = []
    if latest['RSI_14'] < 30: signals.append("RSI Oversold (Bullish)")
    if latest['RSI_14'] > 70: signals.append("RSI Overbought (Bearish)")
    if latest['MACD'] > latest['MACD_Signal']: signals.append("MACD Bullish Crossover")
    if latest['MACD'] < latest['MACD_Signal']: signals.append("MACD Bearish Crossover")
    if volume_spike: signals.append("High Volume Anomaly detected")
    if latest['Close'] < latest['BB_Low']: signals.append("Price below lower Bollinger Band (Potential Reversal)")
    if latest['Close'] > latest['BB_High']: signals.append("Price above upper Bollinger Band (Potential Pullback)")

    return {
        "trend": trend,
        "signals": signals,
        "confidence_score": 75,
        "support": round(latest['BB_Low'], 2),
        "resistance": round(latest['BB_High'], 2),
        "summary": {
            "RSI": round(latest['RSI_14'], 2),
            "MACD": round(latest['MACD'], 2),
            "ATR": round(latest['ATR'], 2),
            "EMA_20": round(latest['EMA_20'], 2),
            "EMA_50": round(latest['EMA_50'], 2),
            "EMA_200": round(latest['EMA_200'], 2),
        }
    }
