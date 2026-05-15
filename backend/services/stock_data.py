import yfinance as yf
import pandas as pd
import ta
import numpy as np

def fetch_stock_data(ticker: str, period: str = "1mo", interval: str = "1d") -> pd.DataFrame:
    """
    Fetch historical stock data using yfinance.
    """
    stock = yf.Ticker(ticker)
    df = stock.history(period=period, interval=interval)
    if df.empty:
        raise ValueError(f"No data found for ticker {ticker}")
    return df

def add_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add technical indicators (SMA, RSI, MACD) to the dataframe using the 'ta' library.
    """
    # We need at least enough data points to compute these. Fillna helps if not enough data.
    # Simple Moving Average (SMA)
    df['SMA_20'] = ta.trend.sma_indicator(close=df['Close'], window=20, fillna=True)
    df['SMA_50'] = ta.trend.sma_indicator(close=df['Close'], window=50, fillna=True)
    
    # Relative Strength Index (RSI)
    df['RSI_14'] = ta.momentum.rsi(close=df['Close'], window=14, fillna=True)
    
    # Moving Average Convergence Divergence (MACD)
    macd = ta.trend.MACD(close=df['Close'], fillna=True)
    df['MACD'] = macd.macd()
    df['MACD_Signal'] = macd.macd_signal()
    df['MACD_Diff'] = macd.macd_diff()
    
    return df

def get_stock_analysis(ticker: str, period: str = "6mo"):
    df = fetch_stock_data(ticker, period=period)
    df = add_technical_indicators(df)
    
    # Convert index to a normal column
    df.reset_index(inplace=True)
    
    # Determine the date column name ('Date' or 'Datetime')
    date_col = 'Date' if 'Date' in df.columns else 'Datetime'
    if date_col in df.columns:
        df[date_col] = df[date_col].dt.strftime('%Y-%m-%d')
    
    # Replace NaNs/Infs with None for JSON compliance
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.where(pd.notnull(df), None)
    
    return df.to_dict(orient='records')
