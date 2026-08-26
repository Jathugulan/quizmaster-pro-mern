import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { Save, ArrowLeft, Sparkles, Check, Plus, Trash2, HelpCircle } from 'lucide-react';
import { questionApi } from '../../api/questionApi.js';
import { categoryApi } from '../../api/categoryApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/Modal.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';

const L = ['A', 'B', 'C', 'D', 'E', 'F'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function QuestionEditor() {
  const { questionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = !questionId || questionId === 'new' || questionId === 'undefined';

  const defaultCategory = searchParams.get('category') || '';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    text: '',
    category: defaultCategory || 'Web Development',
    difficulty: 'Medium',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctIndex: 0,
    marks: 1,
    negativeMarks: 0,
    explanation: '',
    isActive: true,
  });

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('Medium');
  const [aiCount, setAiCount] = useState(5);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResults, setAiResults] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const catRes = await categoryApi.getCategories();
        const loadedCats = catRes?.items || catRes || [];
        if (isMounted) setCategories(loadedCats);

        if (!isNew && questionId && questionId !== 'undefined') {
          setLoading(true);
          const q = await questionApi.getQuestionById(questionId);
          if (isMounted && q) {
            setForm({
              text: q.text || '',
              category: q.category || (loadedCats[0]?.name || 'Web Development'),
              difficulty: q.difficulty || 'Medium',
              type: q.type || 'multiple-choice',
              options: q.options?.length ? [...q.options] : ['', '', '', ''],
              correctIndex: q.correctIndex ?? 0,
              marks: q.marks ?? 1,
              negativeMarks: q.negativeMarks ?? 0,
              explanation: q.explanation || '',
              isActive: q.isActive ?? true,
            });
          }
        } else if (loadedCats.length > 0 && !defaultCategory) {
          setForm((f) => ({ ...f, category: loadedCats[0].name }));
        }
      } catch (err) {
        toast.error('Failed to load data: ' + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [questionId, isNew, defaultCategory, toast]);

  const setOption = (i, v) => {
    setForm((f) => {
      const options = [...f.options];
      options[i] = v;
      return { ...f, options };
    });
  };

  const addOption = () => {
    if (form.options.length >= 6) return;
    setForm((f) => ({ ...f, options: [...f.options, ''] }));
  };

  const removeOption = (idx) => {
    if (form.options.length <= 2) return;
    setForm((f) => {
      const options = f.options.filter((_, i) => i !== idx);
      let correctIndex = f.correctIndex;
      if (correctIndex >= options.length) correctIndex = options.length - 1;
      return { ...f, options, correctIndex };
    });
  };

  const persist = async (e) => {
    e.preventDefault();
    const filled = form.options.every((o) => o.trim());
    if (!form.text.trim()) return toast.error('Question text is required.');
    if (!filled) return toast.error('All answer choices must contain text.');
    if (Number(form.negativeMarks) > Number(form.marks)) {
      return toast.error('Negative marks penalty cannot exceed positive marks.');
    }

    setSaving(true);
    const payload = {
      text: form.text.trim(),
      category: form.category.trim(),
      difficulty: form.difficulty,
      type: form.type,
      options: form.options.map((o) => o.trim()),
      correctIndex: Number(form.correctIndex),
      marks: Number(form.marks) || 1,
      negativeMarks: Number(form.negativeMarks) || 0,
      explanation: form.explanation.trim(),
      isActive: form.isActive,
    };

    try {
      if (isNew) {
        await questionApi.createQuestion(payload);
        toast.success('Question authored and saved to bank.');
      } else {
        await questionApi.updateQuestion(questionId, payload);
        toast.success('Question updated successfully.');
      }
      navigate('/admin/questions');
    } catch (err) {
      toast.error(err.message || 'Failed to save question.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) {
      toast.error('Please specify a subject topic for AI generation.');
      return;
    }
    setAiGenerating(true);
    setAiResults([]);
    try {
      const questions = await questionApi.generateAI({
        topic: aiTopic.trim(),
        difficulty: aiDifficulty,
        count: Number(aiCount) || 5,
        type: 'multiple-choice',
      });
      setAiResults(questions || []);
      toast.success(`Generated ${questions.length} questions with Google Gemini AI!`);
    } catch (err) {
      toast.error(err.message || 'AI question generation failed.');
    } finally {
      setAiGenerating(false);
    }
  };

  const saveAiQuestion = async (q) => {
    try {
      await questionApi.createQuestion(q);
      setAiResults((prev) => prev.filter((item) => item !== q));
      toast.success('AI question saved to Question Bank!');
    } catch (err) {
      toast.error('Failed to save AI question: ' + err.message);
    }
  };

  const applyAiQuestionToEditor = (q) => {
    setForm({
      text: q.text,
      category: q.category || aiTopic,
      difficulty: q.difficulty || 'Medium',
      type: q.type || 'multiple-choice',
      options: q.options,
      correctIndex: q.correctIndex,
      marks: q.marks || 1,
      negativeMarks: q.negativeMarks || 0,
      explanation: q.explanation || '',
      isActive: true,
    });
    setAiModalOpen(false);
    toast.success('Loaded AI question into editor form.');
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="max-w-3xl mx-auto space-y-7 animate-fade-in pb-16">
      <Link
        to="/admin/questions"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} /> Back to Question Bank
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
            {isNew ? 'Author Question' : 'Edit Question'}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Configure question prompt, answer choices, correct index, and penalties.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAiModalOpen(true)}
          className="btn-primary-grad text-xs h-9 px-3.5 bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          <Sparkles size={14} /> Generate with Gemini AI
        </button>
      </div>

      <form onSubmit={persist} className="space-y-6">
        {/* Main Prompt Card */}
        <div className="apple-card p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-black text-text">Question Prompt</h2>
          <div>
            <label className="label-base">Question Text</label>
            <textarea
              className="input-base min-h-[90px]"
              placeholder="e.g. Which of the following data structures operates on a Last-In-First-Out (LIFO) basis?"
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-base">Category *</label>
              <select
                className="input-base"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                required
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-base">Difficulty Level</label>
              <select
                className="input-base cursor-pointer"
                value={form.difficulty}
                onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Answer Options Card */}
        <div className="apple-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-text">Answer Choices</h2>
            <button
              type="button"
              onClick={addOption}
              disabled={form.options.length >= 6}
              className="btn-secondary text-xs h-8 px-2.5 disabled:opacity-30"
            >
              <Plus size={13} /> Add Choice
            </button>
          </div>
          <p className="text-xs text-text-secondary">
            Select the radio button next to the choice that represents the <strong className="text-text">correct answer</strong>.
          </p>

          <div className="space-y-3">
            {form.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, correctIndex: idx }))}
                  className={`h-9 w-9 shrink-0 grid place-items-center rounded-xl text-xs font-black transition-all ${
                    form.correctIndex === idx
                      ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/40'
                      : 'bg-surface text-muted border border-border hover:text-text'
                  }`}
                  title="Mark as correct option"
                >
                  {form.correctIndex === idx ? <Check size={16} /> : L[idx] || idx + 1}
                </button>

                <input
                  type="text"
                  className="input-base flex-1"
                  placeholder={`Choice ${L[idx] || idx + 1} text…`}
                  value={opt}
                  onChange={(e) => setOption(idx, e.target.value)}
                  required
                />

                {form.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="h-9 w-9 shrink-0 grid place-items-center rounded-xl text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                    title="Remove choice"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scoring & Explanation */}
        <div className="apple-card p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-black text-text">Marks &amp; Solution Explanation</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-base">Positive Marks (+)</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="20"
                className="input-base"
                value={form.marks}
                onChange={(e) => setForm((f) => ({ ...f, marks: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label-base">Negative Penalty (-)</label>
              <input
                type="number"
                step="0.25"
                min="0"
                max="10"
                className="input-base"
                value={form.negativeMarks}
                onChange={(e) => setForm((f) => ({ ...f, negativeMarks: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="label-base">Detailed Explanation (Optional)</label>
            <textarea
              className="input-base min-h-[80px]"
              placeholder="Explain why the designated option is correct. Displayed to candidates in post-exam review."
              value={form.explanation}
              onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary-grad w-full h-12 text-sm font-bold shadow-md">
          <Save size={16} /> {saving ? 'Saving Question…' : isNew ? 'Author & Save Question' : 'Save Question Changes'}
        </button>
      </form>

      {/* Google Gemini AI Generation Modal */}
      {aiModalOpen && (
        <Modal
          open={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          title="Google Gemini AI Question Generator"
          size="lg"
        >
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label className="label-base">Topic / Subject</label>
                <input
                  type="text"
                  placeholder="e.g. React 19 Server Components, Asynchronous JavaScript, Quantum Computing"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="input-base"
                />
              </div>
              <div>
                <label className="label-base">Difficulty</label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value)}
                  className="input-base cursor-pointer"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="label-base">Question Count</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={aiCount}
                  onChange={(e) => setAiCount(e.target.value)}
                  className="input-base"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={aiGenerating}
                  className="btn-primary-grad w-full h-10 text-xs font-bold"
                >
                  <Sparkles size={14} /> {aiGenerating ? 'Generating…' : 'Generate Now'}
                </button>
              </div>
            </div>

            {aiResults.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-border max-h-96 overflow-y-auto pr-1">
                <p className="text-xs font-bold text-text-secondary">
                  Generated Questions ({aiResults.length}) — Click to import into editor or save directly to bank:
                </p>
                {aiResults.map((q, idx) => (
                  <div key={idx} className="apple-card p-4 space-y-2 border border-border text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-extrabold text-sm text-text">{q.text}</p>
                      <span className="badge-primary text-[10px] shrink-0">{q.difficulty}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-text-secondary font-medium">
                      {(q.options || []).map((o, oi) => (
                        <div
                          key={oi}
                          className={`p-1.5 rounded-lg border ${
                            oi === q.correctIndex
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold'
                              : 'bg-surface border-border'
                          }`}
                        >
                          {L[oi]}. {o}
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted italic">{q.explanation}</p>
                    <div className="flex justify-end gap-2 pt-2 border-t border-border">
                      <button
                        type="button"
                        onClick={() => applyAiQuestionToEditor(q)}
                        className="btn-secondary text-xs h-7 px-2.5"
                      >
                        Load in Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => saveAiQuestion(q)}
                        className="btn-outline-grad text-xs h-7 px-2.5"
                      >
                        Save to Bank
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}