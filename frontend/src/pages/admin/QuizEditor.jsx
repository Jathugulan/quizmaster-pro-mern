import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import {
  Save,
  Send,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Image as ImageIcon,
  Clock,
  Award,
  Layers,
  BookOpen,
  Eye,
  Sliders,
  FileText,
  Tag,
  Globe,
  Settings2,
  RefreshCw,
  Shuffle,
  ShieldCheck,
  CheckSquare,
  Radio,
  ToggleLeft,
} from 'lucide-react';
import { quizApi } from '../../api/quizApi.js';
import { categoryApi } from '../../api/categoryApi.js';
import { aiApi } from '../../api/aiApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';
import { Modal } from '../../components/Modal.jsx';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Easy', 'Medium', 'Hard'];
const QUESTION_TYPES = [
  { id: 'multiple-choice', label: 'Multiple Choice (Single)', icon: Radio },
  { id: 'boolean', label: 'True / False', icon: ToggleLeft },
  { id: 'multiple-select', label: 'Multiple Select', icon: CheckSquare },
];

const DEFAULT_CATEGORIES = [
  'Programming',
  'Web Development',
  'Database Systems',
  'Cloud & DevOps',
  'Artificial Intelligence',
  'Cybersecurity',
  'Data Science',
  'UI/UX Design',
];

export default function QuizEditor() {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = !quizId || quizId === 'new';

  const defaultCategory = searchParams.get('category') || '';

  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // Form State across 4 Steps
  const [form, setForm] = useState({
    // Step 1: Info & Taxonomy
    title: '',
    shortDescription: '',
    description: '',
    thumbnailUrl: '',
    tags: '',
    category: defaultCategory || 'Programming',
    subject: 'JavaScript',
    course: 'Web Development Bootcamp',
    difficulty: 'Intermediate',
    language: 'English',
    instructions: '1. Read each question carefully before choosing your answer.\n2. You can navigate between questions using the question palette.\n3. The quiz will auto-submit once the countdown timer reaches zero.\n4. A passing score earns completion status, and scores ≥ 80% earn a verified certificate.',
    featured: false,

    // Step 2: Configuration
    timeLimit: 15, // in minutes
    durationSeconds: 900,
    passingPercentage: 50,
    certificatePercentage: 80,
    maxAttempts: 0, // 0 = unlimited
    randomizeQuestions: false,
    randomizeOptions: false,
    showResult: true,
    allowReview: true,
    allowRetake: true,
    status: 'draft', // 'draft' | 'published' | 'archived'

    // Step 3: Integrated Questions
    questions: [
      {
        id: 'q_init_1',
        text: 'What is the primary purpose of React useEffect hook?',
        imageUrl: '',
        type: 'multiple-choice',
        options: [
          'To handle side effects such as data fetching and subscriptions',
          'To directly manipulate the browser DOM without reconciliation',
          'To store global Redux state inside functional components',
          'To compile JSX templates into machine code',
        ],
        correctIndex: 0,
        correctIndices: [0],
        marks: 1,
        negativeMarks: 0,
        explanation: 'The useEffect hook lets you perform side effects in functional components.',
      },
      {
        id: 'q_init_2',
        text: 'JavaScript is a single-threaded language with an asynchronous non-blocking event loop.',
        imageUrl: '',
        type: 'boolean',
        options: ['True', 'False'],
        correctIndex: 0,
        correctIndices: [0],
        marks: 1,
        negativeMarks: 0,
        explanation: 'JavaScript runs in a single call stack with an event loop for asynchronous tasks.',
      },
    ],
  });

  // Active question being edited in Step 3
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(0);

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('Medium');
  const [aiCount, setAiCount] = useState(5);
  const [aiType, setAiType] = useState('multiple-choice');
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const catRes = await categoryApi.getCategories();
        const loadedCats = catRes?.items || catRes || [];
        if (isMounted) setCategories(loadedCats);

        if (!isNew && quizId) {
          setLoading(true);
          const qData = await quizApi.getQuizById(quizId);
          if (isMounted && qData) {
            setForm({
              title: qData.title || '',
              shortDescription: qData.shortDescription || '',
              description: qData.description || '',
              thumbnailUrl: qData.thumbnailUrl || '',
              tags: Array.isArray(qData.tags) ? qData.tags.join(', ') : qData.tags || '',
              category: qData.category || (loadedCats[0]?.name || 'Programming'),
              subject: qData.subject || '',
              course: qData.course || '',
              difficulty: qData.difficulty || 'Medium',
              language: qData.language || 'English',
              instructions: qData.instructions || '',
              featured: Boolean(qData.featured),
              timeLimit: qData.timeLimit || Math.round((qData.durationSeconds || 600) / 60),
              durationSeconds: qData.durationSeconds || 600,
              passingPercentage: qData.passingPercentage ?? qData.passingScore ?? 50,
              certificatePercentage: qData.certificatePercentage ?? 80,
              maxAttempts: qData.settings?.maxAttempts || 0,
              randomizeQuestions: Boolean(qData.settings?.randomizeQuestions || qData.settings?.randomize),
              randomizeOptions: Boolean(qData.settings?.randomizeOptions || qData.settings?.shuffleAnswers),
              showResult: qData.settings?.showResult !== false,
              allowReview: qData.settings?.allowReview !== false,
              allowRetake: qData.settings?.allowRetake !== false,
              status: qData.status || 'draft',
              questions: qData.questions?.length
                ? qData.questions.map((q, idx) => ({
                    id: q.id || `q_${idx}`,
                    text: q.text || '',
                    imageUrl: q.imageUrl || '',
                    type: q.type || 'multiple-choice',
                    options: q.options?.length ? [...q.options] : ['Option A', 'Option B'],
                    correctIndex: q.correctIndex ?? 0,
                    correctIndices: q.correctIndices || [q.correctIndex ?? 0],
                    marks: q.marks ?? 1,
                    negativeMarks: q.negativeMarks ?? 0,
                    explanation: q.explanation || '',
                  }))
                : [],
            });
          }
        }
      } catch (err) {
        toast.error('Failed to load quiz data: ' + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [quizId, isNew, toast]);

  // Validation diagnostics for Step 4 Preview & Publish
  const validationIssues = useMemo(() => {
    const issues = [];
    if (!form.title.trim()) issues.push({ step: 1, field: 'title', message: 'Quiz Title is required.' });
    if (!form.category.trim()) issues.push({ step: 1, field: 'category', message: 'Category is required.' });
    if (!form.subject.trim()) issues.push({ step: 1, field: 'subject', message: 'Subject is required.' });
    if (Number(form.timeLimit) <= 0) issues.push({ step: 2, field: 'timeLimit', message: 'Time limit must be at least 1 minute.' });
    if (form.questions.length === 0) {
      issues.push({ step: 3, field: 'questions', message: 'At least 1 question is required before publishing.' });
    } else {
      form.questions.forEach((q, idx) => {
        if (!q.text.trim()) {
          issues.push({ step: 3, field: `q_${idx}`, message: `Question #${idx + 1} is missing question text.` });
        }
        if (!q.options || q.options.length < 2 || q.options.some((o) => !o.trim())) {
          issues.push({ step: 3, field: `q_${idx}_opts`, message: `Question #${idx + 1} must have at least 2 non-empty options.` });
        }
      });
    }
    return issues;
  }, [form]);

  const isValidForPublish = validationIssues.length === 0;

  // Question manipulation helpers
  const handleAddQuestion = (type = 'multiple-choice') => {
    const newQuestion = {
      id: `q_new_${Date.now()}`,
      text: '',
      imageUrl: '',
      type,
      options: type === 'boolean' ? ['True', 'False'] : ['', '', '', ''],
      correctIndex: 0,
      correctIndices: [0],
      marks: 1,
      negativeMarks: 0,
      explanation: '',
    };
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setSelectedQuestionIdx(form.questions.length);
  };

  const handleDuplicateQuestion = (idx) => {
    const original = form.questions[idx];
    const copy = {
      ...original,
      id: `q_copy_${Date.now()}`,
      text: `${original.text} (Copy)`,
      options: [...original.options],
      correctIndices: [...(original.correctIndices || [original.correctIndex])],
    };
    const newQuestions = [...form.questions];
    newQuestions.splice(idx + 1, 0, copy);
    setForm((prev) => ({ ...prev, questions: newQuestions }));
    setSelectedQuestionIdx(idx + 1);
  };

  const handleDeleteQuestion = (idx) => {
    if (form.questions.length <= 1) {
      toast.warning('A quiz must have at least one question.');
      return;
    }
    const filtered = form.questions.filter((_, i) => i !== idx);
    setForm((prev) => ({ ...prev, questions: filtered }));
    setSelectedQuestionIdx((cur) => Math.max(0, Math.min(cur, filtered.length - 1)));
  };

  const handleMoveQuestion = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= form.questions.length) return;
    const newQuestions = [...form.questions];
    const [moved] = newQuestions.splice(idx, 1);
    newQuestions.splice(targetIdx, 0, moved);
    setForm((prev) => ({ ...prev, questions: newQuestions }));
    setSelectedQuestionIdx(targetIdx);
  };

  const updateSelectedQuestion = (patch) => {
    setForm((prev) => {
      const updated = [...prev.questions];
      updated[selectedQuestionIdx] = { ...updated[selectedQuestionIdx], ...patch };
      return { ...prev, questions: updated };
    });
  };

  // AI Generation
  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) {
      toast.warning('Please enter a topic for AI generation.');
      return;
    }
    setAiGenerating(true);
    try {
      const res = await aiApi.generateQuestions({
        topic: aiTopic.trim(),
        difficulty: aiDifficulty,
        count: Number(aiCount) || 5,
        type: aiType,
      });

      const generated = res?.data || res || [];
      if (!Array.isArray(generated) || generated.length === 0) {
        toast.error('AI could not generate questions for this topic. Please try again.');
        return;
      }

      const formatted = generated.map((g, i) => ({
        id: `ai_${Date.now()}_${i}`,
        text: g.question || g.text || 'Untitled AI Question',
        imageUrl: '',
        type: g.type || aiType,
        options: Array.isArray(g.options) && g.options.length >= 2 ? g.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: Number(g.correctIndex) || 0,
        correctIndices: [Number(g.correctIndex) || 0],
        marks: 1,
        negativeMarks: 0,
        explanation: g.explanation || 'Generated by QuizMaster AI Studio.',
      }));

      setForm((prev) => ({
        ...prev,
        questions: [...prev.questions, ...formatted],
      }));
      setAiModalOpen(false);
      setAiTopic('');
      toast.success(`Successfully added ${formatted.length} AI questions to quiz!`);
    } catch (err) {
      toast.error('AI Generation error: ' + (err.message || 'Service unavailable'));
    } finally {
      setAiGenerating(false);
    }
  };

  // Final Persist (Save Draft or Publish)
  const handleSave = async (targetStatus = null) => {
    const finalStatus = targetStatus || form.status;

    if (finalStatus === 'published' && !isValidForPublish) {
      toast.error(`Please fix all validation errors before publishing (${validationIssues[0]?.message})`);
      setActiveStep(validationIssues[0]?.step || 1);
      return;
    }

    setSaving(true);
    const durationSeconds = (Number(form.timeLimit) || 15) * 60;
    const totalMarks = form.questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);

    const payload = {
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      thumbnailUrl: form.thumbnailUrl.trim(),
      tags: form.tags,
      category: form.category.trim(),
      subject: form.subject.trim(),
      course: form.course.trim(),
      language: form.language.trim(),
      instructions: form.instructions.trim(),
      difficulty: form.difficulty,
      durationSeconds,
      timeLimit: Number(form.timeLimit) || 15,
      passingPercentage: Number(form.passingPercentage) || 50,
      certificatePercentage: Number(form.certificatePercentage) || 80,
      totalMarks,
      featured: form.featured,
      status: finalStatus,
      settings: {
        randomize: form.randomizeQuestions,
        shuffleAnswers: form.randomizeOptions,
        randomizeQuestions: form.randomizeQuestions,
        randomizeOptions: form.randomizeOptions,
        showResult: form.showResult,
        allowReview: form.allowReview,
        allowRetake: form.allowRetake,
        maxAttempts: Number(form.maxAttempts) || 0,
      },
      questions: form.questions.map((q, idx) => ({
        id: q.id?.startsWith('q_') || q.id?.startsWith('ai_') ? undefined : q.id,
        text: q.text.trim(),
        imageUrl: q.imageUrl?.trim() || '',
        type: q.type || 'multiple-choice',
        options: q.options.map((o) => o.trim()),
        correctIndex: Number(q.correctIndex) || 0,
        correctIndices: q.correctIndices || [Number(q.correctIndex) || 0],
        marks: Number(q.marks) || 1,
        negativeMarks: Number(q.negativeMarks) || 0,
        explanation: q.explanation.trim(),
        order: idx,
      })),
    };

    try {
      if (isNew) {
        const created = await quizApi.createQuiz(payload);
        toast.success(`Quiz '${form.title}' created successfully in ${finalStatus} mode!`);
        navigate('/admin/quizzes');
      } else {
        await quizApi.updateQuiz(quizId, payload);
        toast.success(`Quiz '${form.title}' updated successfully!`);
        navigate('/admin/quizzes');
      }
    } catch (err) {
      toast.error('Save failed: ' + (err.message || 'Could not save quiz.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  const currentQ = form.questions[selectedQuestionIdx] || form.questions[0];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <Link
            to="/admin/quizzes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition mb-2"
          >
            <ArrowLeft size={14} /> Back to Quizzes
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {isNew ? 'Create New Examination' : `Edit: ${form.title || 'Untitled Quiz'}`}
              </h1>
              <p className="text-xs text-muted">
                Multi-Step Integrated Quiz & Assessment Studio
              </p>
            </div>
          </div>
        </div>

        {/* Global Save Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="btn-outline flex items-center gap-2 text-xs py-2 px-4"
          >
            <Save size={14} /> Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={saving}
            className="btn-primary-grad flex items-center gap-2 text-xs py-2 px-4 shadow-sm"
          >
            <Send size={14} /> {saving ? 'Publishing...' : 'Publish Quiz'}
          </button>
        </div>
      </div>

      {/* 4-Step Interactive Progress Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-surface/70 border border-border/70 p-2 rounded-2xl backdrop-blur">
        {[
          { step: 1, label: 'Quiz Information', desc: 'Title, Subject & Category', icon: FileText },
          { step: 2, label: 'Quiz Configuration', desc: 'Timing, Pass % & Limits', icon: Sliders },
          { step: 3, label: 'Integrated Questions', desc: `${form.questions.length} Questions Authored`, icon: Layers },
          { step: 4, label: 'Preview & Publish', desc: isValidForPublish ? 'Ready to Publish' : `${validationIssues.length} issues to resolve`, icon: Eye },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeStep === item.step;
          const isDone = activeStep > item.step;
          return (
            <button
              key={item.step}
              type="button"
              onClick={() => setActiveStep(item.step)}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.01]'
                  : isDone
                  ? 'bg-surface hover:bg-surface-hover text-foreground'
                  : 'bg-transparent text-muted hover:text-foreground'
              }`}
            >
              <div
                className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : isDone
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-border/60 text-muted'
                }`}
              >
                {isDone ? <Check size={16} /> : <Icon size={16} />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{item.label}</p>
                <p className={`text-[10px] truncate ${isActive ? 'text-white/80' : 'text-muted'}`}>
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* STEP 1: QUIZ INFORMATION */}
      {activeStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-pro p-6 space-y-5">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-base font-bold text-foreground">Step 1 — General Information</h2>
                <p className="text-xs text-muted">Define the core title, descriptions, and examination syllabus.</p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Quiz Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. JavaScript ES6 Fundamentals & Async Mastery"
                  className="input-field w-full text-sm font-medium"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Short Summary (Card Synopsis)
                </label>
                <input
                  type="text"
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="e.g. Test modern JavaScript closures, promises, event loop and ES6 syntax."
                  className="input-field w-full text-sm"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Full Description & Scope
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed syllabus overview for students preparing for the examination..."
                  className="input-field w-full text-sm resize-none"
                />
              </div>

              {/* Examination Instructions */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Candidate Exam Instructions
                </label>
                <textarea
                  rows={3}
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  placeholder="Specific examination rules and instructions shown before starting..."
                  className="input-field w-full text-xs resize-none"
                />
              </div>
            </div>

            {/* Taxonomy: Category, Subject, Course Hierarchy */}
            <div className="card-pro p-6 space-y-5">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-base font-bold text-foreground">Taxonomy & Hierarchy</h2>
                <p className="text-xs text-muted">Structure the quiz under its Category → Subject → Course hierarchy.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Programming"
                    list="category-suggestions"
                    className="input-field w-full text-xs font-semibold"
                  />
                  <datalist id="category-suggestions">
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                    {categories.map((c) => (
                      <option key={c.id || c.name} value={c.name} />
                    ))}
                  </datalist>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. JavaScript"
                    className="input-field w-full text-xs font-semibold"
                  />
                </div>

                {/* Course */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Course / Track
                  </label>
                  <input
                    type="text"
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    placeholder="e.g. Full-Stack Bootcamp"
                    className="input-field w-full text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="input-field w-full text-xs font-semibold"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Language
                  </label>
                  <input
                    type="text"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    placeholder="English"
                    className="input-field w-full text-xs font-semibold"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="es6, async, web, react"
                    className="input-field w-full text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Thumbnail Preview & Quick Stats */}
          <div className="space-y-6">
            <div className="card-pro p-6 space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Quiz Media & Visuals</h3>
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Thumbnail URL</label>
                <input
                  type="url"
                  value={form.thumbnailUrl}
                  onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="input-field w-full text-xs"
                />
              </div>

              <div className="h-44 rounded-xl border border-dashed border-border flex items-center justify-center overflow-hidden bg-surface relative">
                {form.thumbnailUrl ? (
                  <img
                    src={form.thumbnailUrl}
                    alt="Quiz Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon size={32} className="mx-auto text-muted/50 mb-2" />
                    <p className="text-xs text-muted">No thumbnail provided</p>
                    <p className="text-[10px] text-muted/70">A modern gradient will be applied automatically.</p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  Feature on Student Homepage
                </label>
              </div>
            </div>

            <div className="card-pro p-5 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <Sparkles size={16} /> Fast Tip
              </div>
              <p className="text-xs text-muted leading-relaxed">
                You can configure questions directly in Step 3 or generate customized questions instantly using the integrated AI generator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: QUIZ CONFIGURATION */}
      {activeStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Timing & Scoring Thresholds */}
          <div className="card-pro p-6 space-y-6">
            <div className="border-b border-border/60 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Assessment Rules & Timing</h2>
                <p className="text-xs text-muted">Configure candidate duration, passing bars, and attempt limits.</p>
              </div>
              <Clock className="text-primary" size={20} />
            </div>

            <div className="space-y-5">
              {/* Time Limit */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Time Limit (Minutes) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-primary">{form.timeLimit} mins ({form.timeLimit * 60}s)</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={form.timeLimit}
                  onChange={(e) => {
                    const mins = Math.max(1, parseInt(e.target.value || '1', 10));
                    setForm({ ...form, timeLimit: mins, durationSeconds: mins * 60 });
                  }}
                  className="input-field w-full text-sm font-semibold"
                />
                <p className="text-[11px] text-muted mt-1">
                  Server timestamp countdown will automatically submit the quiz when time expires.
                </p>
              </div>

              {/* Passing Percentage */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Passing Score Percentage <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-600">{form.passingPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={form.passingPercentage}
                  onChange={(e) => setForm({ ...form, passingPercentage: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted font-mono">
                  <span>0% (Lenient)</span>
                  <span>50% (Standard)</span>
                  <span>100% (Strict)</span>
                </div>
              </div>

              {/* Certificate Threshold */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Award size={14} className="text-amber-500" /> Certificate Eligibility Threshold
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-600">{form.certificatePercentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={form.certificatePercentage}
                  onChange={(e) => setForm({ ...form, certificatePercentage: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
                <p className="text-[11px] text-muted mt-1">
                  Students achieving this score or higher receive a verifiable digital credential with PDF download.
                </p>
              </div>

              {/* Max Attempts */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Maximum Retake Attempts (0 for unlimited)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={form.maxAttempts}
                  onChange={(e) => setForm({ ...form, maxAttempts: Math.max(0, parseInt(e.target.value || '0', 10)) })}
                  className="input-field w-full text-sm font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Examination Security & Anti-Cheat Settings */}
          <div className="card-pro p-6 space-y-6">
            <div className="border-b border-border/60 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Exam Delivery & Privacy</h2>
                <p className="text-xs text-muted">Control answer shuffling and feedback permissions.</p>
              </div>
              <ShieldCheck className="text-emerald-500" size={20} />
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 hover:bg-surface-hover cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={form.randomizeQuestions}
                  onChange={(e) => setForm({ ...form, randomizeQuestions: e.target.checked })}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Shuffle size={14} /> Question Ordering: {form.randomizeQuestions ? 'Random Order' : 'Admin Defined Order'}
                  </p>
                  <p className="text-[11px] text-muted">
                    {form.randomizeQuestions
                      ? 'Questions are randomly shuffled for each candidate attempt.'
                      : 'Candidates receive questions in the exact sequential order authored by the administrator.'}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 hover:bg-surface-hover cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={form.randomizeOptions}
                  onChange={(e) => setForm({ ...form, randomizeOptions: e.target.checked })}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <RefreshCw size={14} /> Randomize Answer Choices (Shuffle Options)
                  </p>
                  <p className="text-[11px] text-muted">
                    Shuffles option choices uniquely for each candidate and remaps correct index server-side.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 hover:bg-surface-hover cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={form.negativeMarking}
                  onChange={(e) => setForm({ ...form, negativeMarking: e.target.checked })}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">
                    Negative Marking for Incorrect Answers
                  </p>
                  <p className="text-[11px] text-muted">
                    Deducts penalty marks for wrong submissions according to question configuration.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 hover:bg-surface-hover cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={form.showResult}
                  onChange={(e) => setForm({ ...form, showResult: e.target.checked })}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Display Score Immediately on Submission
                  </p>
                  <p className="text-[11px] text-muted">
                    Shows final marks breakdown and percentage directly upon completion.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 hover:bg-surface-hover cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={form.allowReview}
                  onChange={(e) => setForm({ ...form, allowReview: e.target.checked })}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Allow Candidate Answer Review
                  </p>
                  <p className="text-[11px] text-muted">
                    Permits students to inspect explanations and review correct choices post-submission.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: INTEGRATED QUESTION AUTHORING */}
      {activeStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          {/* Left Column: Questions List Navigation */}
          <div className="lg:col-span-4 space-y-4">
            <div className="card-pro p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Questions ({form.questions.length})
                  </h3>
                  <p className="text-[10px] text-muted">Total Marks: {form.questions.reduce((s, q) => s + (Number(q.marks) || 1), 0)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAiModalOpen(true)}
                  className="btn-outline flex items-center gap-1.5 text-xs py-1.5 px-2.5 text-primary border-primary/30 hover:bg-primary/5"
                >
                  <Sparkles size={13} /> AI Generator
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {form.questions.map((q, idx) => {
                  const isSelected = selectedQuestionIdx === idx;
                  const hasError = !q.text.trim() || q.options.some((o) => !o.trim());
                  return (
                    <div
                      key={q.id || idx}
                      onClick={() => setSelectedQuestionIdx(idx)}
                      className={`group flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        isSelected
                          ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                          : 'bg-surface hover:bg-surface-hover border-border/60 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`h-6 w-6 shrink-0 rounded-md flex items-center justify-center font-mono text-[11px] font-bold ${
                            isSelected ? 'bg-primary text-white' : 'bg-border/60 text-muted'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <p className="truncate font-medium text-[11px]">{q.text || 'Untitled Question'}</p>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                        {hasError && <AlertCircle size={13} className="text-rose-500" />}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveQuestion(idx, -1);
                          }}
                          disabled={idx === 0}
                          className="p-1 hover:bg-border/60 rounded disabled:opacity-30"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveQuestion(idx, 1);
                          }}
                          disabled={idx === form.questions.length - 1}
                          className="p-1 hover:bg-border/60 rounded disabled:opacity-30"
                        >
                          <ChevronDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateQuestion(idx);
                          }}
                          className="p-1 hover:bg-border/60 rounded"
                          title="Duplicate"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(idx);
                          }}
                          className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Question Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => handleAddQuestion('multiple-choice')}
                  className="btn-outline flex items-center justify-center gap-1 text-[11px] py-2"
                >
                  <Plus size={13} /> + MCQ
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('boolean')}
                  className="btn-outline flex items-center justify-center gap-1 text-[11px] py-2"
                >
                  <Plus size={13} /> + True/False
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Question Authoring Workbench */}
          <div className="lg:col-span-8 space-y-6">
            {currentQ ? (
              <div className="card-pro p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs">
                      #{selectedQuestionIdx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-foreground">Edit Question Content</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Question Type Selector */}
                    <select
                      value={currentQ.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        const opts =
                          newType === 'boolean'
                            ? ['True', 'False']
                            : currentQ.options.length >= 2
                            ? currentQ.options
                            : ['', '', '', ''];
                        updateSelectedQuestion({ type: newType, options: opts, correctIndex: 0 });
                      }}
                      className="input-field text-xs font-semibold py-1 px-2.5"
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <span className="text-muted">Marks:</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={currentQ.marks || 1}
                        onChange={(e) => updateSelectedQuestion({ marks: Math.max(1, parseInt(e.target.value || '1', 10)) })}
                        className="input-field w-14 text-xs font-bold py-1 px-1.5 text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Question Stem Text */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Question Stem / Statement <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={currentQ.text}
                    onChange={(e) => updateSelectedQuestion({ text: e.target.value })}
                    placeholder="Enter the full question prompt here..."
                    className="input-field w-full text-sm font-medium resize-none"
                  />
                </div>

                {/* Question Image URL */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Optional Diagram / Formula Image URL
                  </label>
                  <input
                    type="url"
                    value={currentQ.imageUrl || ''}
                    onChange={(e) => updateSelectedQuestion({ imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="input-field w-full text-xs"
                  />
                </div>

                {/* Options Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      Answer Choices & Correct Key <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-muted">
                      Click the radio/checkbox to designate the correct answer.
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isCorrect =
                        currentQ.type === 'multiple-select'
                          ? currentQ.correctIndices?.includes(optIdx)
                          : currentQ.correctIndex === optIdx;

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/50 text-foreground'
                              : 'bg-surface border-border/60 text-foreground'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (currentQ.type === 'multiple-select') {
                                const currentList = currentQ.correctIndices || [];
                                const nextList = currentList.includes(optIdx)
                                  ? currentList.filter((x) => x !== optIdx)
                                  : [...currentList, optIdx];
                                updateSelectedQuestion({ correctIndices: nextList });
                              } else {
                                updateSelectedQuestion({ correctIndex: optIdx });
                              }
                            }}
                            className={`h-7 w-7 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs transition ${
                              isCorrect ? 'bg-emerald-600 text-white shadow-sm' : 'bg-border/60 text-muted hover:bg-border'
                            }`}
                          >
                            {isCorrect ? <Check size={14} /> : letter}
                          </button>

                          <input
                            type="text"
                            value={opt}
                            disabled={currentQ.type === 'boolean'}
                            onChange={(e) => {
                              const newOpts = [...currentQ.options];
                              newOpts[optIdx] = e.target.value;
                              updateSelectedQuestion({ options: newOpts });
                            }}
                            placeholder={`Choice ${letter}...`}
                            className="input-field flex-1 text-xs font-medium"
                          />

                          {currentQ.type !== 'boolean' && currentQ.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newOpts = currentQ.options.filter((_, i) => i !== optIdx);
                                const newCi = currentQ.correctIndex >= newOpts.length ? 0 : currentQ.correctIndex;
                                updateSelectedQuestion({ options: newOpts, correctIndex: newCi });
                              }}
                              className="p-1.5 text-muted hover:text-rose-500 rounded"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {currentQ.type !== 'boolean' && currentQ.options.length < 6 && (
                    <button
                      type="button"
                      onClick={() => updateSelectedQuestion({ options: [...currentQ.options, ''] })}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 pt-1"
                    >
                      <Plus size={13} /> Add Choice Option
                    </button>
                  )}
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Answer Explanation / Reference (Revealed in Answer Review)
                  </label>
                  <textarea
                    rows={2}
                    value={currentQ.explanation}
                    onChange={(e) => updateSelectedQuestion({ explanation: e.target.value })}
                    placeholder="Explain why the selected answer is correct..."
                    className="input-field w-full text-xs resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="card-pro p-12 text-center text-muted">
                <p>No questions added yet. Click + MCQ to add your first question.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: PREVIEW & PUBLISH */}
      {activeStep === 4 && (
        <div className="space-y-8 animate-fade-in">
          {/* Pre-Publish Quality & Diagnostics Checklist */}
          <div className={`card-pro p-6 border ${isValidForPublish ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-rose-500/40 bg-rose-500/5'}`}>
            <div className="flex items-start gap-4">
              <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${isValidForPublish ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                {isValidForPublish ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-base font-bold text-foreground">
                  {isValidForPublish ? 'All Pre-Publish Validation Checks Passed!' : 'Pre-Publish Issues Detected'}
                </h3>
                <p className="text-xs text-muted">
                  {isValidForPublish
                    ? 'The examination meets all academic standards, timing constraints, and scoring rules. It is ready for publication.'
                    : `Please resolve the following ${validationIssues.length} issue(s) before publishing:`}
                </p>

                {!isValidForPublish && (
                  <ul className="space-y-1.5 pt-2">
                    {validationIssues.map((iss, i) => (
                      <li key={i} className="text-xs text-rose-600 font-semibold flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        [Step {iss.step}] {iss.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Student Live Simulation View */}
          <div className="card-pro p-8 space-y-6">
            <div className="border-b border-border/60 pb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Candidate Experience Simulator</span>
                <h2 className="text-xl font-bold text-foreground">{form.title || 'Untitled Assessment'}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge-primary">{form.category}</span>
                {form.subject && <span className="badge-muted">{form.subject}</span>}
                <span className="badge-warning">{form.difficulty}</span>
              </div>
            </div>

            <p className="text-sm text-muted leading-relaxed">
              {form.description || form.shortDescription || 'No description provided.'}
            </p>

            {/* Exam Metadata Bento */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface border border-border/60 text-center font-mono">
              <div>
                <p className="text-[10px] text-muted uppercase font-sans font-bold">Total Questions</p>
                <p className="text-lg font-bold text-foreground">{form.questions.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted uppercase font-sans font-bold">Duration</p>
                <p className="text-lg font-bold text-foreground">{form.timeLimit} Mins</p>
              </div>
              <div>
                <p className="text-[10px] text-muted uppercase font-sans font-bold">Passing Grade</p>
                <p className="text-lg font-bold text-emerald-600">{form.passingPercentage}%</p>
              </div>
              <div>
                <p className="text-[10px] text-muted uppercase font-sans font-bold">Certificate</p>
                <p className="text-lg font-bold text-amber-600">≥ {form.certificatePercentage}%</p>
              </div>
            </div>

            {/* Sample Question Preview */}
            <div className="space-y-4 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Previewing Questions ({form.questions.length})</h4>
              <div className="space-y-3">
                {form.questions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border/60 bg-surface/50 space-y-2.5">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-xs font-bold text-foreground">
                        {idx + 1}. {q.text || 'Question text missing'}
                      </p>
                      <span className="text-[10px] font-mono text-muted">{q.marks} Mark</span>
                    </div>

                    {(q.imageUrl || q.diagram) && (
                      <div className="rounded-xl border border-border/60 bg-surface p-2 max-h-56 flex items-center justify-center overflow-hidden">
                        <img
                          src={q.imageUrl || q.diagram}
                          alt={`Diagram for Question ${idx + 1}`}
                          className="max-h-52 w-auto max-w-full object-contain rounded-lg"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const letter = String.fromCharCode(65 + oIdx);
                        const isCorrect = q.correctIndex === oIdx;
                        return (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                              isCorrect ? 'bg-emerald-500/10 border-emerald-500/40 font-semibold' : 'bg-surface border-border/40'
                            }`}
                          >
                            <span className="font-bold text-muted">{letter}.</span> {opt || '(Empty choice)'}
                            {isCorrect && <Check size={13} className="ml-auto text-emerald-600" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Step Navigation Bar */}
      <div className="flex items-center justify-between pt-6 border-t border-border/60">
        <button
          type="button"
          onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
          disabled={activeStep === 1}
          className="btn-outline flex items-center gap-2 text-xs py-2.5 px-4 disabled:opacity-40"
        >
          <ArrowLeft size={14} /> Previous Step
        </button>

        {activeStep < 4 ? (
          <button
            type="button"
            onClick={() => setActiveStep((s) => Math.min(4, s + 1))}
            className="btn-primary-grad flex items-center gap-2 text-xs py-2.5 px-5"
          >
            Next Step <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={saving}
            className="btn-primary-grad flex items-center gap-2 text-xs py-2.5 px-6 shadow-md font-bold"
          >
            <Send size={15} /> {saving ? 'Publishing...' : 'Publish Examination'}
          </button>
        )}
      </div>

      {/* AI Question Generation Modal */}
      <Modal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title="AI Question Generator Studio"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted">
            Automatically generate high-yield, curriculum-aligned questions tailored to your quiz topic and difficulty.
          </p>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Topic / Sub-topic</label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder={`e.g. ${form.subject || 'JavaScript'} Closures and Async/Await`}
              className="input-field w-full text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Difficulty</label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value)}
                className="input-field w-full text-xs font-semibold"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Number of Questions</label>
              <input
                type="number"
                min="1"
                max="10"
                value={aiCount}
                onChange={(e) => setAiCount(Math.min(10, Math.max(1, parseInt(e.target.value || '5', 10))))}
                className="input-field w-full text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Question Type</label>
              <select
                value={aiType}
                onChange={(e) => setAiType(e.target.value)}
                className="input-field w-full text-xs font-semibold"
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="boolean">True / False</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={() => setAiModalOpen(false)}
              className="btn-outline text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={aiGenerating || !aiTopic.trim()}
              className="btn-primary-grad flex items-center gap-2 text-xs py-2 px-5 font-bold"
            >
              <Sparkles size={14} /> {aiGenerating ? 'Synthesizing Questions...' : 'Generate & Insert Questions'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}