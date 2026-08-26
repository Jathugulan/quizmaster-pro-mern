import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Award, BarChart3, ArrowRight, FileText, Image as ImageIcon, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { attemptApi } from '../../api/attemptApi.js';
import EmptyState from '../../components/EmptyState.jsx';
import { timeAgo, formatDuration } from '../../utils/scoreCalculator.js';
import CertificateDocument from '../../components/CertificateDocument.jsx';
import { certificateProps } from './Certificates.jsx';
import { downloadCertificateJpg, downloadCertificatePdf } from '../../utils/exportCertificate.js';
import { useToast } from '../../context/ToastContext.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';

const CATEGORIES = [
  'All',
  'Computer Science',
  'Web Development',
  'Mathematics',
  'Science',
  'History',
  'General Knowledge',
];

export default function MyResults() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [resultFilter, setResultFilter] = useState('all'); // all | passed | failed
  const [downloadingId, setDownloadingId] = useState(null);
  const [activeAttemptForExport, setActiveAttemptForExport] = useState(null);
  const exportCertRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function loadMyAttempts() {
      setLoading(true);
      try {
        const res = await attemptApi.getMyAttempts({ limit: 100 });
        if (isMounted) {
          setAttempts(res?.items || []);
        }
      } catch (err) {
        console.warn('[MyResults] Failed to fetch attempts:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMyAttempts();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const rows = useMemo(() => {
    let list = [...attempts];

    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter((a) => a.title?.toLowerCase().includes(s) || a.category?.toLowerCase().includes(s));
    }
    if (category !== 'All') {
      list = list.filter((a) => a.category?.toLowerCase() === category.toLowerCase());
    }
    if (resultFilter === 'passed') list = list.filter((a) => a.passed);
    if (resultFilter === 'failed') list = list.filter((a) => !a.passed);
    return list;
  }, [attempts, search, category, resultFilter]);

  const stats = useMemo(() => {
    const passed = attempts.filter((a) => a.passed).length;
    const avg = attempts.length
      ? attempts.reduce((s, a) => s + (a.result?.percent || 0), 0) / attempts.length
      : 0;
    return { total: attempts.length, passed, avg };
  }, [attempts]);

  const triggerExport = async (e, attempt, format) => {
    e.stopPropagation();
    const key = `${attempt.id}-${format}`;
    setDownloadingId(key);
    setActiveAttemptForExport(attempt);

    setTimeout(async () => {
      try {
        const props = certificateProps(attempt, user);
        if (format === 'jpg') {
          await downloadCertificateJpg(exportCertRef.current, `QuizMaster-${props.serial}.jpg`);
          toast.success('Certificate downloaded as JPG image.');
        } else {
          await downloadCertificatePdf(exportCertRef.current, `QuizMaster-${props.serial}.pdf`);
          toast.success('Certificate downloaded as PDF document.');
        }
      } catch (err) {
        toast.error('Failed to export certificate: ' + err.message);
      } finally {
        setDownloadingId(null);
      }
    }, 150);
  };

  return (
    <div className="space-y-7 animate-fade-in pb-12">
      {/* Hidden container for rendering printable certificates */}
      {activeAttemptForExport && (
        <div className="fixed -left-[9999px] top-0 pointer-events-none">
          <div ref={exportCertRef} className="w-[1000px]">
            <CertificateDocument {...certificateProps(activeAttemptForExport, user)} />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
            My Examination History
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Review detailed solutions, scores, time taken, and download your earned certificates.
          </p>
        </div>
      </div>

      {/* Stats Summary Bento Bar */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="apple-card p-4 sm:p-5 text-center">
          <div className="text-xl sm:text-3xl font-black text-text">{stats.total}</div>
          <div className="text-[11px] font-bold text-text-secondary mt-0.5">Total Attempts</div>
        </div>
        <div className="apple-card p-4 sm:p-5 text-center">
          <div className="text-xl sm:text-3xl font-black text-emerald-500">{stats.passed}</div>
          <div className="text-[11px] font-bold text-text-secondary mt-0.5">Examinations Passed</div>
        </div>
        <div className="apple-card p-4 sm:p-5 text-center">
          <div className="text-xl sm:text-3xl font-black text-primary">
            {stats.avg.toFixed(0)}%
          </div>
          <div className="text-[11px] font-bold text-text-secondary mt-0.5">Average Performance</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="apple-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by quiz title or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-base text-xs font-bold py-2.5 px-3 cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="input-base text-xs font-bold py-2.5 px-3 cursor-pointer"
            >
              <option value="all">All Outcomes</option>
              <option value="passed">Passed Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No attempt records found"
          description="You have not completed any examinations matching the selected criteria."
          action={
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setResultFilter('all');
              }}
              className="btn-outline-grad text-xs font-bold"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="space-y-3.5">
          {rows.map((a) => (
            <div
              key={a.id}
              onClick={() => navigate(`/user/result/${a.id}`)}
              className="apple-card group p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-apple-lg border border-border"
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-black text-base shadow-sm ${
                    a.passed
                      ? 'bg-success/15 text-success border border-success/30'
                      : 'bg-danger/15 text-danger border border-danger/30'
                  }`}
                >
                  {a.grade || (a.passed ? 'PASS' : 'FAIL')}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-primary text-[10px]">{a.category}</span>
                    <span className="text-[11px] font-semibold text-muted">
                      {timeAgo(a.submittedAt)}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-text group-hover:text-primary transition-colors truncate">
                    {a.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                    <span>
                      Score: <strong className="text-text">{Math.round(a.result?.percent || 0)}%</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Time: <strong className="text-text">{formatDuration(a.timeTakenSeconds || 0)}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {a.passed && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => triggerExport(e, a, 'pdf')}
                      disabled={downloadingId === `${a.id}-pdf`}
                      className="btn-outline-grad text-[11px] h-8 px-2.5"
                      title="Download PDF Certificate"
                    >
                      <FileText size={13} /> {downloadingId === `${a.id}-pdf` ? '…' : 'PDF'}
                    </button>
                    <button
                      onClick={(e) => triggerExport(e, a, 'jpg')}
                      disabled={downloadingId === `${a.id}-jpg`}
                      className="btn-outline-grad text-[11px] h-8 px-2.5"
                      title="Download JPG Certificate"
                    >
                      <ImageIcon size={13} /> {downloadingId === `${a.id}-jpg` ? '…' : 'JPG'}
                    </button>
                  </div>
                )}
                <button className="btn-secondary text-xs h-8 px-3">
                  Breakdown <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}