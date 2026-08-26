import { useState, useEffect, useMemo, useRef } from 'react';
import { Award, Eye, Printer, Image as ImageIcon, FileText, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { attemptApi } from '../../api/attemptApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { Modal } from '../../components/Modal.jsx';
import CertificateDocument from '../../components/CertificateDocument.jsx';
import { formatDuration } from '../../utils/scoreCalculator.js';
import { downloadCertificateJpg, downloadCertificatePdf } from '../../utils/exportCertificate.js';
import { CardSkeleton } from '../../components/Skeleton.jsx';

// Props used to render a certificate for a passing attempt.
export function certificateProps(attempt, user) {
  const dateLabel = attempt?.submittedAt
    ? new Date(attempt.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const serial = attempt?.certificate?.verificationId || `QM-${(attempt?.id || 'CERT').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)}`;
  return {
    studentName: user?.name || 'Student',
    quizTitle: attempt?.title || 'Examination',
    category: attempt?.category || 'General',
    percent: attempt?.result?.percent || 100,
    correct: attempt?.result?.correct || 0,
    of: attempt?.result?.maximum || 0,
    timeLabel: formatDuration(attempt?.timeTakenSeconds || 0),
    dateLabel,
    serial,
    difficulty: attempt?.difficulty || 'Standard',
  };
}

export default function Certificates() {
  const { user } = useAuth();
  const toast = useToast();
  const [active, setActive] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const offscreenRef = useRef(null);
  const [offscreenAttempt, setOffscreenAttempt] = useState(null);
  const [passedAttempts, setPassedAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCerts() {
      setLoading(true);
      try {
        const res = await attemptApi.getMyAttempts({ passed: true, limit: 100 });
        if (isMounted) {
          setPassedAttempts(res?.items || []);
        }
      } catch (err) {
        console.warn('[Certificates] Failed to load credentials:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCerts();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const certs = useMemo(() => {
    const byQuiz = {};
    passedAttempts.forEach((a) => {
      if (a.passed && (!byQuiz[a.quizId] || (a.result?.percent || 0) > (byQuiz[a.quizId].result?.percent || 0))) {
        byQuiz[a.quizId] = a;
      }
    });
    return Object.values(byQuiz).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }, [passedAttempts]);

  const handleDirectDownload = async (cert, format) => {
    const key = `${cert.id}-${format}`;
    setDownloadingId(key);
    setOffscreenAttempt(cert);

    // Give DOM time to update offscreen ref
    setTimeout(async () => {
      try {
        const props = certificateProps(cert, user);
        if (format === 'jpg') {
          await downloadCertificateJpg(offscreenRef.current, `QuizMaster-${props.serial}.jpg`);
          toast.success(`Certificate downloaded as JPG image.`);
        } else {
          await downloadCertificatePdf(offscreenRef.current, `QuizMaster-${props.serial}.pdf`);
          toast.success(`Certificate downloaded as PDF document.`);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to export certificate. Please try again.');
      } finally {
        setDownloadingId(null);
      }
    }, 150);
  };

  return (
    <div className="space-y-7 animate-fade-in pb-12">
      {/* Hidden offscreen certificate for instant download */}
      {offscreenAttempt && (
        <div className="fixed -left-[9999px] top-0 pointer-events-none">
          <div ref={offscreenRef} className="w-[1000px]">
            <CertificateDocument {...certificateProps(offscreenAttempt, user)} />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
            <Sparkles size={13} /> Official Credentials
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
            My Verified Certificates
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Achieve passing marks on examinations to unlock verifiable, high-resolution credentials.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : certs.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates earned yet"
          description="Pass an accredited examination in the library to earn your first official certificate."
          action={<a href="/user/library" className="btn-primary-grad">Explore Examination Library</a>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {certs.map((c) => {
            const cp = certificateProps(c, user);
            return (
              <div
                key={c.id}
                className="apple-card group p-5 flex flex-col justify-between gap-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-apple-lg border-2 border-border/80 hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="badge-primary">{c.category}</span>
                    <h3 className="font-extrabold text-base sm:text-lg text-text group-hover:text-primary transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-xs text-text-secondary font-mono">
                      Serial: <strong>{cp.serial}</strong>
                    </p>
                  </div>
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-sm">
                    <Award size={24} />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between text-xs">
                  <span className="text-text-secondary font-medium">Earned Grade</span>
                  <span className="font-black text-success text-sm flex items-center gap-1">
                    <CheckCircle2 size={15} /> {Math.round(c.result?.percent || 100)}% ({c.grade || 'A+'})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                  <button
                    onClick={() => setActive(c)}
                    className="btn-primary-grad flex-1 text-xs h-9"
                  >
                    <Eye size={14} /> View Certificate
                  </button>
                  <button
                    onClick={() => handleDirectDownload(c, 'pdf')}
                    disabled={downloadingId === `${c.id}-pdf`}
                    className="btn-outline-grad text-xs h-9 px-3"
                    title="Download PDF"
                  >
                    <FileText size={14} /> {downloadingId === `${c.id}-pdf` ? '…' : 'PDF'}
                  </button>
                  <button
                    onClick={() => handleDirectDownload(c, 'jpg')}
                    disabled={downloadingId === `${c.id}-jpg`}
                    className="btn-outline-grad text-xs h-9 px-3"
                    title="Download JPG"
                  >
                    <ImageIcon size={14} /> {downloadingId === `${c.id}-jpg` ? '…' : 'JPG'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Certificate Preview Modal */}
      {active && (
        <Modal
          open={Boolean(active)}
          onClose={() => setActive(null)}
          title="Certificate Preview"
          size="lg"
        >
          <div className="space-y-4">
            <div className="w-full">
              <CertificateDocument {...certificateProps(active, user)} />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => handleDirectDownload(active, 'pdf')}
                className="btn-primary-grad text-xs px-4"
              >
                <Download size={14} /> Download PDF
              </button>
              <button onClick={() => setActive(null)} className="btn-secondary text-xs px-4">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}