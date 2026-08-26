import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Eye,
  Award,
  ArrowLeft,
  Clock,
  BadgeCheck,
  FileText,
  Image as ImageIcon,
  Download,
  Printer,
  Sparkles,
  RotateCcw,
  Share2,
} from 'lucide-react';
import { attemptApi } from '../../api/attemptApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import ResultCard from '../../components/ResultCard.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import CertificateDocument from '../../components/CertificateDocument.jsx';
import { Modal } from '../../components/Modal.jsx';
import { certificateProps } from './Certificates.jsx';
import { downloadCertificateJpg, downloadCertificatePdf } from '../../utils/exportCertificate.js';
import { formatDuration } from '../../utils/scoreCalculator.js';
import { PageSkeleton } from '../../components/Skeleton.jsx';

export default function Result() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const certRef = useRef(null);
  const modalCertRef = useRef(null);
  const [busy, setBusy] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadAttempt() {
      setLoading(true);
      try {
        const data = await attemptApi.getAttemptById(attemptId);
        if (isMounted) setAttempt(data);
      } catch (err) {
        console.warn('[Result] Failed to load attempt result:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAttempt();
    return () => {
      isMounted = false;
    };
  }, [attemptId]);

  const doCert = async (kind) => {
    setBusy(kind);
    try {
      const serial = attempt?.certificate?.verificationId || attempt?.id || 'QM';
      const targetRef = certRef.current || modalCertRef.current;
      if (kind === 'jpg') {
        await downloadCertificateJpg(targetRef, `QuizMaster-${serial}.jpg`);
        toast.success('Certificate successfully downloaded as high-res JPG image!');
      } else {
        await downloadCertificatePdf(targetRef, `QuizMaster-${serial}.pdf`);
        toast.success('Certificate successfully downloaded as print-ready PDF document!');
      }
    } catch (e) {
      toast.error(e?.message || 'Could not generate the certificate.');
      console.error(e);
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <PageSkeleton />;

  if (!attempt) {
    return (
      <EmptyState
        title="Result not found"
        description="This attempt record may have been removed or does not exist."
        action={
          <Link to="/user/results" className="btn-primary-grad">
            View All My Results
          </Link>
        }
      />
    );
  }

  const cp = certificateProps(attempt, user);

  return (
    <div className="max-w-4xl mx-auto space-y-7 animate-fade-in pb-16">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/user/results"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to My Results History
        </Link>
        <span className="text-xs font-semibold text-text-secondary">
          Submitted {new Date(attempt.submittedAt).toLocaleString()}
        </span>
      </div>

      {/* Main Result Card */}
      <ResultCard attempt={attempt} />

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          onClick={() => navigate(`/user/review/${attempt.id || attemptId}`)}
          className="btn-primary-grad px-5"
        >
          <Eye size={16} /> Detailed Answer Breakdown &amp; Solutions
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {attempt.passed && (
            <button
              onClick={() => setPreviewOpen(true)}
              className="btn-outline-grad text-xs px-4"
            >
              <Award size={15} /> Certificate Preview
            </button>
          )}
          <Link
            to={`/user/quiz/${attempt.quizId}`}
            className="btn-secondary text-xs px-4"
          >
            <RotateCcw size={15} /> Examination Details
          </Link>
        </div>
      </div>

      {/* Certificate Showcase Section (if passed) */}
      {attempt.passed && (
        <div className="apple-card p-6 sm:p-8 space-y-5 bg-gradient-to-br from-card to-amber-500/5 border-amber-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <BadgeCheck size={14} /> Official Credential Unlocked
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-text tracking-tight">
                Certificate of Academic Achievement
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary">
                Verification Serial:{' '}
                <strong className="text-text font-mono">
                  {attempt.certificate?.verificationId || attempt.id}
                </strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => doCert('pdf')}
                disabled={Boolean(busy)}
                className="btn-primary-grad text-xs h-10 px-4"
              >
                <FileText size={14} /> {busy === 'pdf' ? 'Generating PDF…' : 'Download PDF'}
              </button>
              <button
                onClick={() => doCert('jpg')}
                disabled={Boolean(busy)}
                className="btn-outline-grad text-xs h-10 px-4"
              >
                <ImageIcon size={14} /> {busy === 'jpg' ? 'Generating JPG…' : 'Download JPG'}
              </button>
              <button
                onClick={() => window.print()}
                className="btn-secondary text-xs h-10 px-3.5"
                aria-label="Print certificate"
              >
                <Printer size={15} />
              </button>
            </div>
          </div>

          {/* Inline scaled preview */}
          <div className="overflow-hidden rounded-2xl border border-border shadow-apple bg-surface p-2 sm:p-4">
            <div ref={certRef} className="w-full">
              <CertificateDocument {...cp} />
            </div>
          </div>
        </div>
      )}

      {/* Modal Full-Screen Preview */}
      {previewOpen && (
        <Modal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title="Certificate of Achievement"
          size="lg"
        >
          <div className="space-y-4">
            <div ref={modalCertRef} className="w-full">
              <CertificateDocument {...cp} />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button onClick={() => doCert('pdf')} className="btn-primary-grad text-xs px-4">
                <Download size={14} /> Download PDF
              </button>
              <button onClick={() => setPreviewOpen(false)} className="btn-secondary text-xs px-4">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}