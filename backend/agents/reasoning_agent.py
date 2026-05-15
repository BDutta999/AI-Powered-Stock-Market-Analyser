import os
from groq import Groq
import json

def generate_final_analysis(ticker: str, ta_data: dict, sentiment_data: dict) -> dict:
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
         return {"error": "GROQ API Key missing."}

    groq_client = Groq(api_key=groq_api_key)

    prompt = f"""
    You are an expert AI stock research analyst. Analyze the following data for {ticker}.
    
    Technical Analysis: {json.dumps(ta_data)}
    News Sentiment: {json.dumps(sentiment_data)}
    
    Based on this, generate a structured analysis.
    Remember: Do not guarantee predictions, but DO NOT default to a generic confidence score like 60%. 
    Calculate a highly dynamic "confidence_percentage" (from 0 to 100) based strictly on how strongly the Technical Analysis signals align with the News Sentiment. 
    If both point strongly in the same direction, confidence should be high (75-95%). If they conflict, confidence should be low (30-50%).
    
    Output a JSON object exactly with these keys:
    {{
        "probable_direction": "Bullish" | "Bearish" | "Neutral",
        "confidence_percentage": (integer 0-100),
        "risks": ["risk 1", "risk 2"],
        "support_resistance_explanation": "explanation of key levels",
        "short_term_outlook": "1-2 weeks outlook",
        "long_term_outlook": "1-6 months outlook"
    }}
    """
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
         return {"error": str(e)}
