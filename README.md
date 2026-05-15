<div align="center">
  
# 📈 AI Stock Market Analyst

**An Institutional-Grade AI-Powered Market Terminal**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Llama-3](https://img.shields.io/badge/AI-Llama_3-blue?style=for-the-badge)](https://groq.com/)

</div>

---

## 📖 Overview

The **AI Stock Market Analyst** is a state-of-the-art web application that merges traditional quantitative finance with advanced Large Language Models (LLMs). Rather than just showing raw charts, this platform acts as your personal AI quant researcher. It analyzes market trends, processes technical indicators, reads recent news sentiments, and synthesizes it all into **actionable insights** and **dynamic strategic reasoning**.

Whether you're looking for an AI's confidence in a trend or want to directly chat with an AI assistant fully aware of the live stock context, this terminal provides a stunning "Bloomberg-like" experience out of the box.

---

## ✨ Key Features

- 📊 **Interactive TradingView Charts**: Lightning-fast, beautiful candlestick charting with intraday and historical timeframe support (`1D`, `1W`, `1M`, `6M`, `1Y`, `5Y`, `MAX`).
- 🧠 **Multi-Agent AI Architecture**: Dedicated backend AI agents for distinct tasks (Sentiment Analysis, Strategic Reasoning, Interactive Chat).
- 📰 **Real-Time News Sentiment**: Scrapes and analyzes recent news headlines to determine broader market sentiment (Bullish, Bearish, or Neutral) and assigns a dynamic score.
- 📉 **Advanced Technical Analysis (TA)**: Automatically calculates and evaluates RSI, MACD, Bollinger Bands, EMAs, and Volume anomalies to flag live signals.
- 💬 **Context-Aware AI Chat**: An integrated sidebar chatbot! Ask questions like *"Why is the MACD bearish?"* or *"What are the risks of holding this stock?"* and get answers directly informed by the live data context.
- 🔍 **Live Symbol Search**: Autocomplete ticker search powered by the Finnhub API for smooth navigation.

---

## 🏗️ Architecture & AI Agents

The application employs a **Multi-Agent Backend Structure**:

1. **Quant Engine**: Python-based data aggregator using `yfinance` and `ta` to fetch historical OHLCV data and compute complex indicators.
2. **Sentiment Agent**: Fetches the latest stock news and uses an LLM to distill the global emotional narrative surrounding the company.
3. **Reasoning Agent (Llama 3 70B)**: The "brain" of the operation. It cross-references the Quant Engine's technicals with the Sentiment Agent's narrative. If they align (e.g., Bullish TA + Positive News), confidence scores skyrocket. If they diverge, it warns of risks and volatility.
4. **Interactive Chat Agent**: An isolated agent that holds conversation state with the user while maintaining a system context injection of the exact data the user is viewing.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: React Query & Axios
- **Charting**: [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) (TradingView)
- **Icons**: Lucide React

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Language**: Python 3.10+
- **Data Engineering**: Pandas, NumPy
- **Financial Data Sources**: `yfinance` (Yahoo Finance), Finnhub API
- **AI/LLM Provider**: [Groq](https://groq.com/) (Using `llama-3.3-70b-versatile` for blazing-fast inference)

---

## 🚀 Getting Started

Follow these steps to run the application locally on your machine.

### Prerequisites
- Node.js 18+ and `npm`
- Python 3.10+
- A [Groq API Key](https://console.groq.com/) (For LLM Inference)
- A [Finnhub API Key](https://finnhub.io/) (For ticker search and news)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Stock-Market-Analyser.git
cd Stock-Market-Analyser
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your API keys (see Environment Variables section below)
touch .env

# Run the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
Open a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the Next.js development server
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend API documentation at `http://localhost:8000/docs`.

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory with the following keys:

```ini
GROQ_API_KEY=gsk_your_groq_api_key_here
FINNHUB_API_KEY=your_finnhub_api_key_here
```

---

## 🔮 Future Enhancements

- **User Authentication**: Allow users to save their favorite watchlists and persist chat histories.
- **Portfolio Tracking**: Connect brokerages (via Plaid/Alpaca) to provide AI analysis on current holdings.
- **Alerts System**: WebSocket-based push notifications when the Reasoning Agent detects a high-confidence swing.
- **Options Chain Analysis**: Expand the Quant Engine to factor in options flow and implied volatility.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/Stock-Market-Analyser/issues).

---

<div align="center">
  <i>Built with ❤️ for modern retail investors.</i>
</div>
