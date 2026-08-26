import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Award,
  Clock,
  Calendar,
  User,
  BookOpen,
  Download,
  Share2,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import { formatDuration } from '../../utils/scoreCalculator.js';
import { exportResultPdf } from '../../utils/pdfExport.js';

export default function ResultDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadResultDetail() {
      setLoading(true);
      try {
        const res = await adminApi.getResultDetail(id);
        if (isMounted) setResult(res);
      } catch (err) {
        toast.error('Failed to load result details: ' + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadResultDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleExportPdf = async () => {
    if (!result) return;
    setExporting(true);
    try {
      await exportResultPdf(result);
      toast.success('Official assessment summary PDF generated.');
    } catch (err) {
      toast.error('Failed to generate PDF: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="apple-card p-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Result Record Not Found</h2>
        <p className="text-sm text-muted">The requested assessment attempt does not exist.</p>
        <Link to="/admin/results" className="btn-primary-grad inline-flex">
          Back to Results
        </Link>
      </div>
    );
  }

  const { student, quiz, scoreCard, questionsAnalysis } = result;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Back & Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={16} /> Back to Results Table
        </button>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/admin/users/${student.id}`}
            className="btn-secondary text-xs h-9 px-3.5 font-bold"
          >
            <User size={13} /> View Student Profile
          </Link>
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="btn-primary-grad text-xs h-9 px-4 shadow-sm font-bold"
          >
            <Download size={14} /> {exporting ? 'Generating PDF…' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="apple-card p-6 sm:p-8 space-y-4 border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {quiz.category || 'General'} Assessment
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight">{quiz.title}</h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              Candidate: <strong className="text-text">{student.name}</strong> (@{student.username}) · {student.email}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-muted shrink-0">
            <Calendar size={14} />
            Submitted: {scoreCard.submittedAt ? new Date(scoreCard.submittedAt).toLocaleString() : 'Recently'}
          </div>
        </div>

        {/* Scorecard Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-border">
          <div className="p-3.5 rounded-2xl bg-surface/50 border border-border text-center">
            <span className="text-[11px] font-bold text-text-secondary">Obtained Marks</span>
            <div className="text-xl font-black text-text mt-0.5">
              {scoreCard.obtainedMarks} / {scoreCard.totalMarks}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface/50 border border-border text-center">
            <span className="text-[11px] font-bold text-text-secondary">Percentage</span>
            <div className="text-xl font-black text-primary mt-0.5">{scoreCard.percentage}%</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface/50 border border-border text-center">
            <span className="text-[11px] font-bold text-text-secondary">Status Outcome</span>
            <div className={`text-xl font-black mt-0.5 ${scoreCard.passed ? 'text-success' : 'text-danger'}`}>
              {scoreCard.passed ? 'PASS' : 'FAIL'} ({scoreCard.grade})
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface/50 border border-border text-center">
            <span className="text-[11px] font-bold text-text-secondary">Correct</span>
            <div className="text-xl font-black text-success mt-0.5">{scoreCard.correct}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface/50 border border-border text-center">
            <span className="text-[11px] font-bold text-text-secondary">Wrong / Skipped</span>
            <div className="text-xl font-black text-danger mt-0.5">
              {scoreCard.wrong} / {scoreCard.skipped}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface/50 border border-border text-center">
            <span className="text-[11px] font-bold text-text-secondary">Duration</span>
            <div className="text-xl font-black text-text mt-0.5">
              {formatDuration(scoreCard.timeTakenSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Question-by-Question Analysis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-black text-text tracking-tight">
            Detailed Question Analysis ({questionsAnalysis.length})
          </h2>
          <span className="text-xs font-bold text-muted">Review candidate options &amp; solutions</span>
        </div>

        <div className="space-y-4">
          {questionsAnalysis.map((q) => (
            <div
              key={q.index}
              className={`apple-card p-6 space-y-4 border transition-all ${
                q.outcome === 'correct'
                  ? 'border-success/30 bg-success-soft/20'
                  : q.outcome === 'wrong'
                  ? 'border-danger/30 bg-danger-soft/20'
                  : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-surface border border-border grid place-items-center text-xs font-black text-text">
                    {q.index}
                  </span>
                  <span className="text-xs font-bold text-text-secondary">Question #{q.index}</span>
                </div>

                <div className="flex items-center gap-2">
                  {q.outcome === 'correct' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-success bg-success-soft px-2.5 py-1 rounded-full border border-success/30">
                      <CheckCircle2 size={13} /> Correct (+{q.marksGained} pt)
                    </span>
                  ) : q.outcome === 'wrong' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-danger bg-danger-soft px-2.5 py-1 rounded-full border border-danger/30">
                      <XCircle size={13} /> Incorrect (0 pt)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-muted bg-surface px-2.5 py-1 rounded-full border border-border">
                      <MinusCircle size={13} /> Skipped
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <p className="font-bold text-sm sm:text-base text-text leading-relaxed">{q.text}</p>

              {/* Choice Options Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {(q.options || []).map((opt, oi) => {
                  const isCorrectChoice = oi === q.correctOptionIndex;
                  const isStudentChoice = oi === q.selectedOptionIndex;

                  return (
                    <div
                      key={oi}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
                        isCorrectChoice
                          ? 'bg-success-soft border-success/50 text-success font-bold ring-1 ring-success/30'
                          : isStudentChoice && !isCorrectChoice
                          ? 'bg-danger-soft border-danger/50 text-danger font-bold ring-1 ring-danger/30'
                          : 'bg-surface/50 border-border text-text-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="h-5 w-5 rounded-md bg-card border border-border grid place-items-center text-[10px] font-black shrink-0">
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className="truncate">{opt}</span>
                      </div>

                      <div className="shrink-0 text-[10px] font-extrabold uppercase">
                        {isCorrectChoice && '✓ Correct Answer'}
                        {isStudentChoice && !isCorrectChoice && '✗ Candidate Choice'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Solution Explanation if present */}
              {q.explanation && (
                <div className="p-3.5 rounded-xl bg-surface border border-border text-xs space-y-1">
                  <span className="font-bold text-text block">Solution Explanation:</span>
                  <p className="text-text-secondary leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
