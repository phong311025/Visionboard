import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, Send, X, Sparkles, Trash2, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('aesthetic_planner_chat_history');
      return saved ? JSON.parse(saved) : [
        {
            id: 'welcome',
            text: 'Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho kế hoạch năm 2026 của bạn?',
            sender: 'bot',
            timestamp: Date.now()
        }
      ];
    } catch (e) {
      return [];
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    localStorage.setItem('aesthetic_planner_chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleClearChat = () => {
      if (window.confirm("Bạn có chắc muốn xoá toàn bộ lịch sử trò chuyện?")) {
          const initialMsg: Message = {
            id: 'welcome',
            text: 'Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho kế hoạch năm 2026 của bạn?',
            sender: 'bot',
            timestamp: Date.now()
        };
        setMessages([initialMsg]);
      }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Chuyển đổi lịch sử chat hiện tại sang định dạng history của Gemini
      // Loại bỏ tin nhắn lỗi hoặc tin nhắn welcome nếu cần, ở đây ta lấy 10 tin gần nhất để tiết kiệm token context
      const history = messages.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        history: history,
        config: {
            systemInstruction: "Bạn là một trợ lý AI thông minh, thân thiện và đầy cảm hứng nằm trong ứng dụng 'Sổ Tay Cuộc Sống Aesthetic' (Vision Board 2026). Nhiệm vụ của bạn là giúp người dùng lập kế hoạch, đặt mục tiêu (OKR), chia nhỏ nhiệm vụ và giữ động lực. Hãy trả lời ngắn gọn, súc tích, sử dụng giọng văn nhẹ nhàng, tích cực (tone Aesthetic/Pastel).",
        }
      });

      const result = await chat.sendMessage({ message: userMessage.text });
      const responseText = result.text;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText || "Xin lỗi, tôi không thể trả lời ngay lúc này.",
        sender: 'bot',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Gemini API Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.",
        sender: 'bot',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 w-[90vw] md:w-[400px] h-[500px] md:h-[600px] mb-4 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-rose-500 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Sparkles className="w-4 h-4 text-yellow-200" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Assistant</h3>
                <p className="text-[10px] text-rose-100 opacity-90">Powered by Gemini 3.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleClearChat} className="p-1.5 hover:bg-white/20 rounded-full transition-colors" title="Xoá lịch sử">
                    <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-rose-50/30 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-rose-500 text-white rounded-tr-none'
                      : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-rose-100">
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Hỏi tôi về mục tiêu của bạn..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400 px-2"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-xl transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-rose-500 text-white shadow-md hover:bg-rose-600 transform hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] text-center text-gray-400 mt-2">
                AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${isOpen ? 'bg-gray-500 rotate-90' : 'bg-gradient-to-br from-rose-400 to-rose-600'}`}
      >
        {isOpen ? (
            <X className="w-6 h-6 text-white" />
        ) : (
            <MessageCircle className="w-7 h-7 text-white animate-pulse" />
        )}
        
        {/* Tooltip */}
        {!isOpen && (
            <span className="absolute right-full mr-3 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Chat với AI
            </span>
        )}
      </button>
    </div>
  );
};

export default ChatBot;
