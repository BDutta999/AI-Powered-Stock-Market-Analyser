import os
import requests
from groq import Groq
import json
import datetime

def get_news_sentiment(ticker: str) -> dict:
    api_key = os.environ.get("FINNHUB_API_KEY")
    groq_api_key = os.environ.get("GROQ_API_KEY")
    
    if not api_key or not groq_api_key:
         return {"sentiment": "Neutral", "score": 50, "summary": "API Keys missing.", "risks": []}

    groq_client = Groq(api_key=groq_api_key)

    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=7)
    url = f"https://finnhub.io/api/v1/company-news?symbol={ticker}&from={start_date}&to={end_date}&token={api_key}"
    
    try:
        res = requests.get(url, timeout=10)
        news = res.json()[:10] if res.status_code == 200 else []
    except Exception as e:
        news = []

    if not news:
        return {"sentiment": "Neutral", "score": 50, "summary": "No recent news found.", "risks": []}
    
    headlines = [n.get("headline", "") for n in news]
    
    prompt = f"""
    Analyze the following recent news headlines for the stock {ticker}.
    Headlines: {headlines}
    
    Output a JSON object exactly with these keys:
    {{
        "sentiment": "Bullish" | "Bearish" | "Neutral",
        "score": (integer 0 to 100, where 100 is most bullish),
        "summary": "Brief summary of catalysts",
        "risks": ["Risk 1", "Risk 2"]
    }}
    Ensure valid JSON output.
    """
    
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        content = completion.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        return {"sentiment": "Neutral", "score": 50, "summary": f"Failed to analyze sentiment: {str(e)}", "risks": []}
