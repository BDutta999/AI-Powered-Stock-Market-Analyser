import os
from groq import Groq
import json

def generate_chat_response(ticker: str, user_message: str, chat_history: list, context_data: dict) -> dict:
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
         return {"error": "GROQ API Key missing."}

    groq_client = Groq(api_key=groq_api_key)

    # Convert context to a formatted string, trimming if it's too large, though llama-3 supports large contexts
    context_str = json.dumps(context_data, indent=2)

    system_prompt = f"""
You are an expert AI stock research assistant. The user is currently looking at the stock dashboard for {ticker}.
Here is the current analysis data for {ticker} that the user is seeing:
{context_str}

Answer the user's questions about the stock, technical indicators, news, or general market conditions.
Be concise, professional, and helpful. Format your responses with markdown. Do not hallucinate data; if you do not know, state that.
"""
    
    messages = [{"role": "system", "content": system_prompt}]
    
    for msg in chat_history:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        
    messages.append({"role": "user", "content": user_message})

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
         return {"error": str(e)}
