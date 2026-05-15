'use client';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Activity, TrendingUp, TrendingDown, AlertTriangle, FileText, BarChart2 } from 'lucide-react';
import { TradingViewChart } from './TradingViewChart';
import { AIChat } from './AIChat';



export default function StockDashboard() {
  const [tickerInput, setTickerInput] = useState('');
  const [activeTicker, setActiveTicker] = useState('AAPL');
  const [activePeriod, setActivePeriod] = useState('1Y');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (tickerInput.trim().length > 1) {
      const delayFn = setTimeout(async () => {
        try {
          const res = await axios.get(`http://localhost:8000/api/v1/search/${tickerInput}`);
          setSuggestions(res.data.result || []);
          setShowSuggestions(true);
        } catch (e) {
          setSuggestions([]);
        }
      }, 300);
      return () => clearTimeout(delayFn);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [tickerInput]);

  const handleSelectSuggestion = (symbol: string) => {
    setActiveTicker(symbol);
    setTickerInput(symbol);
    setShowSuggestions(false);
  };

  const { data: analysisData, isLoading: isAnalysisLoading, error: analysisError } = useQuery({
    queryKey: ['analyze', activeTicker],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:8000/api/v1/analyze/${activeTicker}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: chartData, isLoading: isChartLoading } = useQuery({
    queryKey: ['stock', activeTicker, activePeriod],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:8000/api/v1/stock/${activeTicker}?period=${activePeriod}`);
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const isLoading = isAnalysisLoading;
  const error = analysisError;
  const data = analysisData;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tickerInput.trim()) {
      setActiveTicker(tickerInput.trim().toUpperCase());
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-blue-500" />
            AI Market Terminal
          </h1>
          <p className="text-gray-400 text-sm mt-1">Institutional-grade insights powered by LLMs</p>
        </div>
        
        <form ref={searchRef} onSubmit={handleSearch} className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Search symbol (e.g. NVDA)" 
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase transition-colors"
          />
          <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
          <button type="submit" className="hidden">Search</button>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
              {suggestions.map((s, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleSelectSuggestion(s.symbol)}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm flex justify-between items-center"
                >
                  <span className="font-semibold text-white">{s.symbol}</span>
                  <span className="text-gray-400 text-xs truncate ml-4">{s.description}</span>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      {isLoading && (
        <div className="h-64 flex items-center justify-center border border-gray-800 bg-gray-900 rounded-2xl animate-pulse">
          <p className="text-gray-400 flex items-center gap-2">
            <Activity className="animate-spin w-5 h-5 text-blue-500" /> Analyzing Market Data & News...
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <span>Error loading data: {(error as any).response?.data?.detail || (error as any).message}</span>
        </div>
      )}

      {data && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Main Chart Column */}
          <div className="lg:col-span-2 xl:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">{activeTicker} Chart</h2>
                <div className="flex bg-gray-800 rounded-lg p-1 overflow-x-auto hide-scrollbar">
                  {['1D', '1W', '1M', '6M', '1Y', '5Y', 'MAX'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setActivePeriod(period)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        activePeriod === period
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              {chartData ? (
                <div className="w-full relative">
                  {isChartLoading && (
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                      <Activity className="animate-spin text-blue-500 w-8 h-8" />
                    </div>
                  )}
                  <TradingViewChart data={chartData} />
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                  {isChartLoading ? 'Loading chart...' : 'No chart data available'}
                </div>
              )}
            </div>

            {/* AI Reasoning Panel */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                <BarChart2 className="text-purple-500" />
                AI Strategic Reasoning
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h3 className="text-gray-400 text-sm mb-1">Probable Direction</h3>
                    <div className="flex items-center gap-2">
                      {data.reasoning?.probable_direction === 'Bullish' ? (
                        <TrendingUp className="text-green-500" />
                      ) : data.reasoning?.probable_direction === 'Bearish' ? (
                        <TrendingDown className="text-red-500" />
                      ) : (
                        <Activity className="text-yellow-500" />
                      )}
                      <span className="text-lg font-medium text-white">{data.reasoning?.probable_direction || 'Neutral'}</span>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h3 className="text-gray-400 text-sm mb-1">Confidence</h3>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-white">{data.reasoning?.confidence_percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-700 h-1.5 mt-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full" 
                        style={{width: `${data.reasoning?.confidence_percentage || 0}%`}}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 p-4 rounded-xl h-full">
                    <h3 className="text-gray-400 text-sm mb-2">Short-term Outlook</h3>
                    <p className="text-sm text-gray-200">{data.reasoning?.short_term_outlook}</p>
                    <h3 className="text-gray-400 text-sm mb-2 mt-4">Long-term Outlook</h3>
                    <p className="text-sm text-gray-200">{data.reasoning?.long_term_outlook}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 xl:col-span-1 space-y-6">
            {/* Sentiment Gauge */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <FileText className="text-blue-500" />
                News Sentiment
              </h2>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  data.sentiment?.sentiment === 'Bullish' ? 'bg-green-500/10 text-green-400' :
                  data.sentiment?.sentiment === 'Bearish' ? 'bg-red-500/10 text-red-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {data.sentiment?.sentiment}
                </span>
                <span className="text-sm text-gray-400">Score: {data.sentiment?.score}/100</span>
              </div>
              <p className="text-sm text-gray-300 mt-4 leading-relaxed">
                {data.sentiment?.summary}
              </p>
            </div>

            {/* Technical Indicators */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">Technical Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Trend</span>
                  <span className="text-white font-medium">{data.technical_analysis?.trend}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">RSI (14)</span>
                  <span className="text-white font-medium">{data.technical_analysis?.summary?.RSI}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">MACD</span>
                  <span className="text-white font-medium">{data.technical_analysis?.summary?.MACD}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Support</span>
                  <span className="text-green-400 font-medium">${data.technical_analysis?.support}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Resistance</span>
                  <span className="text-red-400 font-medium">${data.technical_analysis?.resistance}</span>
                </div>
              </div>
              {data.technical_analysis?.signals?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Signals Detected</h3>
                  <ul className="space-y-1">
                    {data.technical_analysis.signals.map((sig: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${sig.includes('Bullish') || sig.includes('above') ? 'bg-green-500' : 'bg-red-500'}`} />
                        {sig}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* AI Chat Sidebar */}
          <div className="lg:col-span-3 xl:col-span-1 space-y-6">
            <AIChat ticker={activeTicker} context={data} />
          </div>
        </div>
      )}
    </div>
  );
}
