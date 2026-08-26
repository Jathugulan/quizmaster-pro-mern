import { useState } from "react";
import {
  Sparkles, Wand2, Search, Bot, ChevronRight, Send, CheckCircle2, XCircle,
  Plus, Trash2, AlertTriangle, Loader2, Star, TrendingDown, ShieldCheck,
  MessageSquare, BarChart2, Zap,
} from "lucide-react";
import { aiApi } from "../../api/aiApi.js";
import { quizApi } from "../../api/quizApi.js";
import { questionApi } from "../../api/questionApi.js";
import { adminApi } from "../../api/adminApi.js";
import { useToast } from "../../context/ToastContext.jsx";

const TABS = [
  { id: "generator", label: "Quiz Generator", icon: Wand2, desc: "AI-powered question creation" },
  { id: "analyzer", label: "Question Analyzer", icon: Search, desc: "Quality & clarity analysis" },
  { id: "assistant", label: "Admin Assistant", icon: Bot, desc: "Analytics-driven Q&A" },
];

// ─── Question Generator ───────────────────────────────────────────────────────
function QuizGenerator() {
  const toast = useToast();
  const [form, setForm] = useState({ topic: "", difficulty: "Medium", count: 5, type: "multiple-choice" });
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [approved, setApproved] = useState({});

  const generate = async () => {
    if (!form.topic.trim()) { toast.error("Please enter a topic."); return; }
    setLoading(true);
    setQuestions([]);
    try {
      const res = await aiApi.generateQuestions(form);
      setQuestions(res.questions || []);
      toast.success(`${res.count} questions generated successfully!`);
    } catch (err) {
      toast.error(err.message || "Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  };

  const approve = async (q) => {
    try {
      const payload = {
        text: q.text, category: q.category, difficulty: q.difficulty,
        type: q.type, options: q.options, correctIndex: q.correctIndex,
        marks: q.marks, negativeMarks: q.negativeMarks, explanation: q.explanation,
        status: "pending_review",
      };
      await questionApi.createQuestion(payload);
      setApproved((prev) => ({ ...prev, [q.text]: true }));
      toast.success("Question saved to question bank for review.");
    } catch (err) {
      toast.error("Failed to save question.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="apple-card p-6 space-y-5">
        <h2 className="text-base font-black text-text flex items-center gap-2">
          <Wand2 size={18} className="text-primary" /> Generate Questions with AI
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="form-label">Topic / Subject</label>
            <input className="input-base" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="e.g. JavaScript Promises, React Hooks, World War II..." />
          </div>
          <div>
            <label className="form-label">Difficulty</label>
            <select className="input-base" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </div>
          <div>
            <label className="form-label">Count (max 20)</label>
            <input type="number" min={1} max={20} className="input-base" value={form.count}
              onChange={(e) => setForm({ ...form, count: Math.min(20, Math.max(1, Number(e.target.value))) })} />
          </div>
          <div>
            <label className="form-label">Question Type</label>
            <select className="input-base" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="boolean">True / False</option>
            </select>
          </div>
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary-grad h-11 px-6 font-bold">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : <><Sparkles size={16} /> Generate Questions</>}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-text">{questions.length} Questions Generated — Review Before Publishing</h3>
            <span className="text-xs text-warning font-bold px-2 py-1 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle size={12} className="inline mr-1" />All require admin review
            </span>
          </div>
          {questions.map((q, idx) => (
            <div key={idx} className={`apple-card p-5 border-l-4 ${approved[q.text] ? "border-success opacity-60" : "border-primary"} space-y-3`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-bold text-text text-sm">{idx + 1}. {q.text}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="badge-blue text-[10px]">{q.difficulty}</span>
                    <span className="badge-purple text-[10px]">{q.type}</span>
                    <span className="badge-green text-[10px]">{q.marks} mark{q.marks !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                {approved[q.text] ? (
                  <span className="text-success font-bold text-xs flex items-center gap-1"><CheckCircle2 size={14} />Saved</span>
                ) : (
                  <button onClick={() => approve(q)} className="btn-primary-grad text-xs h-8 px-3">
                    <CheckCircle2 size={13} /> Approve & Save
                  </button>
                )}
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {q.options.map((opt, i) => (
                  <li key={i} className={`text-xs px-3 py-1.5 rounded-lg font-medium border ${i === q.correctIndex ? "bg-success/10 border-success/30 text-success" : "bg-surface border-border text-text-secondary"}`}>
                    {i === q.correctIndex ? "✓ " : ""}{opt}
                  </li>
                ))}
              </ul>
              {q.explanation && (
                <p className="text-xs text-text-secondary bg-surface border border-border rounded-xl p-3">
                  <strong className="text-text">Explanation:</strong> {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Question Analyzer ────────────────────────────────────────────────────────
function QuestionAnalyzer() {
  const toast = useToast();
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [difficulty, setDifficulty] = useState("Medium");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    if (!questionText.trim() || options.filter((o) => o.trim()).length < 2) {
      toast.error("Enter a question and at least 2 options.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await aiApi.analyzeQuestion({ questionData: { text: questionText, options: options.filter((o) => o.trim()), correctIndex, difficulty, explanation } });
      setResult(res);
    } catch (err) {
      toast.error(err.message || "Failed to analyze question.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s) => s >= 80 ? "text-success" : s >= 60 ? "text-warning" : "text-danger";
  const verdictColor = (v) => v === "approve" ? "bg-success/10 text-success border-success/30" : v === "review" ? "bg-warning/10 text-warning border-warning/30" : "bg-danger/10 text-danger border-danger/30";

  return (
    <div className="space-y-6">
      <div className="apple-card p-6 space-y-4">
        <h2 className="text-base font-black text-text flex items-center gap-2"><Search size={18} className="text-primary" />Analyze Question Quality</h2>
        <div>
          <label className="form-label">Question Text</label>
          <textarea className="input-base min-h-[80px]" value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Enter your question..." />
        </div>
        <div>
          <label className="form-label">Answer Options</label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="correct" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} className="shrink-0" />
                <input className="input-base flex-1" value={opt} onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`} />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-1">Select the radio button next to the correct answer.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Difficulty</label>
            <select className="input-base" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </div>
          <div>
            <label className="form-label">Explanation (optional)</label>
            <input className="input-base" value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Why is this answer correct?" />
          </div>
        </div>
        <button onClick={analyze} disabled={loading} className="btn-primary-grad h-11 px-6 font-bold">
          {loading ? <><Loader2 size={16} className="animate-spin" />Analyzing…</> : <><Zap size={16} />Analyze Question</>}
        </button>
      </div>

      {result && (
        <div className="apple-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-text">Analysis Result</h3>
            <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${verdictColor(result.verdict)}`}>
              {result.verdict === "approve" ? "✓ Approve" : result.verdict === "review" ? "⚠ Needs Review" : "✗ Reject"}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[["Clarity", result.clarityScore], ["Difficulty", result.difficultyScore], ["Distractors", result.distractorQuality], ["Grammar", result.grammarScore]].map(([label, score]) => (
              <div key={label} className="apple-card p-4 text-center border border-border">
                <p className={`text-2xl font-black ${scoreColor(score)}`}>{score}</p>
                <p className="text-xs font-bold text-muted mt-1">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-text-secondary bg-surface p-4 rounded-xl border border-border">{result.summary}</p>
          {result.issues?.length > 0 && (
            <div>
              <h4 className="font-bold text-danger text-sm mb-2">Issues Found</h4>
              <ul className="space-y-1">{result.issues.map((i, idx) => <li key={idx} className="text-xs text-danger flex items-start gap-1.5"><XCircle size={12} className="mt-0.5 shrink-0" />{i}</li>)}</ul>
            </div>
          )}
          {result.suggestions?.length > 0 && (
            <div>
              <h4 className="font-bold text-primary text-sm mb-2">Improvement Suggestions</h4>
              <ul className="space-y-1">{result.suggestions.map((s, idx) => <li key={idx} className="text-xs text-text flex items-start gap-1.5"><ChevronRight size={12} className="mt-0.5 shrink-0 text-primary" />{s}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Admin AI Assistant ───────────────────────────────────────────────────────
function AdminAssistant() {
  const toast = useToast();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I'm your QuizMaster Admin AI Assistant. I can answer questions about your platform analytics, student performance, quiz data, and more. What would you like to know?" }
  ]);
  const [loading, setLoading] = useState(false);

  const SUGGESTIONS = [
    "Which quiz has the lowest pass rate?",
    "Which students are at risk of failing?",
    "What category needs more questions?",
    "How is overall performance trending?",
  ];

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await aiApi.adminAssistant(msg);
      setMessages((prev) => [...prev, { role: "assistant", text: res.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: err.message?.includes("not configured") ? "⚠️ Gemini AI API key is not configured. Please add GEMINI_API_KEY to your backend .env file." : "I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="apple-card p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center text-primary"><Bot size={18} /></div>
          <div>
            <p className="font-black text-text text-sm">Admin Analytics Assistant</p>
            <p className="text-xs text-muted">Powered by Gemini AI · Uses real platform data</p>
          </div>
        </div>
        <div className="space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-white rounded-tr-none" : "bg-surface border border-border text-text rounded-tl-none"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface border border-border px-4 py-3 rounded-2xl rounded-tl-none">
                <Loader2 size={16} className="animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => sendMessage(s)} className="text-xs px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors font-medium">
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <input className="input-base flex-1 text-sm" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your platform data..." disabled={loading} />
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary-grad h-10 px-4">
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIManagement() {
  const [tab, setTab] = useState("generator");
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
          <Sparkles size={14} /> AI Management
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">AI-Powered Tools</h1>
        <p className="text-sm text-text-secondary mt-1">Generate questions, analyze quality, and get AI-driven analytics insights.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${tab === t.id ? "bg-primary text-white border-primary shadow-md shadow-primary/25" : "bg-surface border-border text-text-secondary hover:bg-surface-hover hover:text-text"}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "generator" && <QuizGenerator />}
      {tab === "analyzer" && <QuestionAnalyzer />}
      {tab === "assistant" && <AdminAssistant />}
    </div>
  );
}
