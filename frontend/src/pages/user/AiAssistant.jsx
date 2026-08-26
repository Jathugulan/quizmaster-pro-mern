import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Bot, Loader2, RefreshCw, Lightbulb, BookOpen, Zap } from "lucide-react";
import { aiApi } from "../../api/aiApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const SUGGESTIONS = [
  "Explain the difference between async/await and Promises",
  "Give me 3 practice questions on React hooks",
  "Help me understand what I got wrong in my last attempt",
  "What topics should I study to improve my score?",
  "Explain the concept of binary search",
];

export default function AiAssistant() {
  const { user } = useAuth();
  const toast = useToast();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your AI Study Assistant powered by Gemini. I'm here to help you understand concepts, explain quiz answers, generate practice questions, and guide your learning journey. What would you like to explore today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await aiApi.studyAssistant(msg, true);
      setMessages((prev) => [...prev, { role: "assistant", text: res.response }]);
    } catch (err) {
      const errMsg = err.message?.includes("not configured")
        ? "⚠️ The AI assistant is not configured yet. Please ask your admin to set up the Gemini API key."
        : "I encountered an error. Please try again in a moment.";
      setMessages((prev) => [...prev, { role: "assistant", text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    setRecLoading(true);
    try {
      const res = await aiApi.getRecommendations();
      setRecommendations(res);
    } catch (err) {
      toast.error("Could not load recommendations.");
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
          <Sparkles size={14} /> AI Study Assistant
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">AI Study Assistant</h1>
        <p className="text-sm text-text-secondary mt-1">Your personal AI tutor — ask anything about your studies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-2 apple-card flex flex-col h-[600px]">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple grid place-items-center shadow-md">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <p className="font-black text-text text-sm">QuizMaster AI Tutor</p>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <p className="text-xs text-muted">Powered by Gemini AI · Online</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                {m.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple grid place-items-center shrink-0">
                    <Bot size={15} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-white rounded-tr-none" : "bg-surface border border-border text-text rounded-tl-none"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple grid place-items-center shrink-0">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="bg-surface border border-border px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SUGGESTIONS.slice(0, 3).map((s) => (
              <button key={s} onClick={() => sendMessage(s)} disabled={loading}
                className="text-xs px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors font-medium disabled:opacity-40 truncate max-w-[200px]">
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="p-4 pt-2 flex gap-2 border-t border-border">
            <input className="input-base flex-1 text-sm" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your studies..." disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary-grad h-10 px-4 shrink-0 disabled:opacity-50">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </form>
        </div>

        {/* Right Panel: Recommendations */}
        <div className="space-y-4">
          <div className="apple-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-text text-sm flex items-center gap-2"><Lightbulb size={16} className="text-primary" />Study Recommendations</h3>
              <button onClick={loadRecommendations} disabled={recLoading} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                {recLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} {recommendations ? "Refresh" : "Get AI Tips"}
              </button>
            </div>

            {!recommendations && !recLoading && (
              <div className="text-center py-6">
                <Sparkles size={28} className="text-primary/40 mx-auto mb-2" />
                <p className="text-xs text-muted">Click "Get AI Tips" to receive personalized study recommendations based on your quiz history.</p>
              </div>
            )}

            {recLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            )}

            {recommendations && !recLoading && (
              <div className="space-y-3 text-xs">
                {recommendations.priority && (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="font-black text-primary">🎯 Top Priority</p>
                    <p className="text-text-secondary mt-1">{recommendations.priority}</p>
                  </div>
                )}
                {recommendations.recommendations?.slice(0, 3).map((r, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-surface border border-border space-y-1">
                    <p className="font-bold text-text">{r.category}</p>
                    <p className="text-text-secondary leading-relaxed">{r.reason}</p>
                  </div>
                ))}
                {recommendations.motivationMessage && (
                  <p className="text-center text-text-secondary italic pt-1">{recommendations.motivationMessage}</p>
                )}
              </div>
            )}
          </div>

          <div className="apple-card p-5 space-y-3">
            <h3 className="font-black text-text text-sm flex items-center gap-2"><Zap size={16} className="text-primary" />Quick Prompts</h3>
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)} disabled={loading}
                  className="w-full text-left text-xs px-3 py-2.5 rounded-xl bg-surface border border-border hover:bg-surface-hover hover:border-primary/30 transition-all font-medium text-text-secondary hover:text-text disabled:opacity-40">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
