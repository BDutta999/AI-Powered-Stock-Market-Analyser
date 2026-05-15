'use client';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, User, Bot, Loader2 } from 'lucide-react';

export function AIChat({ ticker, context }: { ticker: string, context: any }) {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: 'assistant', content: `Hi! I'm your AI analyst. Ask me anything about ${ticker}.` }]);
  }, [ticker]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/api/v1/chat', {
        ticker,
        message: userMsg,
        history: messages.slice(1),
        context
      });
      setMessages([...newMessages, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-gray-900 border border-gray-800 rounded-2xl shadow-xl h-[600px] overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2 bg-gray-800/50">
        <MessageSquare className="text-blue-500 w-5 h-5" />
        <h2 className="text-lg font-semibold text-white">AI Analyst Chat</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 hide-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-blue-500" />
              </div>
            )}
            <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-gray-800 text-gray-200 rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-gray-300" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-gray-800 rounded-tl-sm flex gap-1 items-center">
               <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" />
               <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
               <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-gray-800 bg-gray-800/30 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Ask about ${ticker}...`}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button 
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
