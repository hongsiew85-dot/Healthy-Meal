import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Award, 
  Leaf, 
  ArrowRight,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { ChatMessage } from '../types';
import { askSGDietitian } from '../services/geminiService';

interface SGDietitianCoachProps {
  onNavigateToTab: (tab: 'meals' | 'activesg') => void;
}

export const SGDietitianCoach: React.FC<SGDietitianCoachProps> = ({ onNavigateToTab }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello! I'm your certified Singapore Clinical Dietitian & Sports Nutritionist here at NutriActive SG.\n\nWhether you're looking for healthy hawker centre hacks (like ordering low-sodium fish soup or thunder tea rice), calculating your post-ActiveSG workout protein replenishment, or managing Nutri-Grade choices, ask away!`,
      timestamp: 'Just now',
      quickReplies: [
        'Healthiest picks at Amoy Street Food Centre',
        'Fueling for a 1-hour ActiveSG Badminton session',
        'How to order low-sodium Yong Tau Foo',
        'Best high-protein clean eats under S$10',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const history = messages.map(m => ({ sender: m.sender, text: m.text }));
      const replyText = await askSGDietitian(textToSend, history);

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: 'Prioritize wholegrains, lean proteins like chicken breast or mackerel, and avoid heavy gravies to keep sodium low!',
        timestamp: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputText);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Profile Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 subtle-card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
            <Bot className="w-7 h-7 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">SG Dietitian AI Coach</h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                HPB Certified AI
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trained on Health Promotion Board (HPB) Singapore nutrition guidelines & hawker food data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('meals')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-500 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>View Clean Eats</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigateToTab('activesg')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Book ActiveSG Court</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* NutriBalance MCP Server Integration Badge & Tools Banner */}
      <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 subtle-card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">NutriBalance MCP Active</span>
              <a
                href="/api/mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 hover:underline"
              >
                /api/mcp
              </a>
            </div>
            <p className="text-[11px] text-slate-500">
              Connected to <span className="font-mono text-[10px]">server.smithery.ai/NutriBalance/nutribalance-mcp</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleSend('Calculate my TDEE, BMR, and daily macro targets (NutriBalance MCP calculate_tdee)')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
          >
            calculate_tdee
          </button>
          <button
            onClick={() => handleSend('Generate a 2000 kcal high-protein meal plan for Singapore active lifestyle (NutriBalance MCP generate_meal_plan)')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
          >
            generate_meal_plan
          </button>
          <button
            onClick={() => handleSend('How do I fix protein and iron deficiency for sports performance? (NutriBalance MCP fix_deficiency)')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
          >
            fix_deficiency
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 subtle-card-shadow space-y-5 min-h-[460px] flex flex-col justify-between">
        
        {/* Messages List */}
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Quick Reply Pills */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(reply)}
                          className="px-3 py-1.5 rounded-xl text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/60 font-medium transition cursor-pointer text-left"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`text-[10px] text-slate-400 ${isUser ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isThinking && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500 font-medium flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                <span>Formulating personalized Singapore clinical advice...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleFormSubmit} className="pt-4 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about Singapore hawker hacks, post-workout macros, Nutri-Grade..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="p-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 text-white rounded-2xl shadow-sm transition cursor-pointer"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
