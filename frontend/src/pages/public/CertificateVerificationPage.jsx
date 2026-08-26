import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Calendar,
  User,
  BookOpen,
  Share2,
  Copy,
  Download,
  ExternalLink,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Search,
} from 'lucide-react';
import { certificationApi } from '../../api/certificationApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';
import CertificateDocument from '../../components/CertificateDocument.jsx';
import { downloadCertificatePdf } from '../../utils/exportCertificate.js';
import { CardSkeleton } from '../../components/Skeleton.jsx';

export default function CertificateVerificationPage() {
  const { certificateNumber } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [searchSerial, setSearchSerial] = useState(certificateNumber || '');
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(Boolean(certificateNumber));
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const offscreenRef = useRef(null);

  const performVerification = async (serial) => {
    if (!serial?.trim()) return;
    setLoading(true);
    try {
      const res = await certificationApi.verifyPublicCertificate(serial.trim());
      setCertData(res);
    } catch (err) {
      setCertData({
        verified: false,
        status: 'not_found',
        message: 'Certificate serial number was not found in the official registry.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certificateNumber) {
      performVerification(certificateNumber);
    }
  }, [certificateNumber]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchSerial.trim()) {
      navigate(`/verify-certificate/${encodeURIComponent(searchSerial.trim())}`);
      performVerification(searchSerial.trim());
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Verification link copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareLinkedIn = () => {
    if (!certData) return;
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`Verified Credential: ${certData.quizTitle} by QuizMaster`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleDownload = async () => {
    if (!certData) return;
    setDownloading(true);
    try {
      if (offscreenRef.current) {
        await downloadCertificatePdf(offscreenRef.current, `Verified-${certData.certificateNumber}.pdf`);
        toast.success('Official verified certificate downloaded.');
      }
    } catch (err) {
      toast.error('Download failed: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const docProps = certData ? {
    studentName: certData.studentName || 'Student',
    quizTitle: certData.quizTitle || 'Assessment',
    category: certData.category || 'General',
    percent: certData.scorePercentage || 100,
    correct: 10,
    of: 10,
    timeLabel: 'Verified Exam',
    dateLabel: certData.issueDate ? new Date(certData.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Verified',
    serial: certData.certificateNumber || 'QM-CERT',
    difficulty: 'Accredited',
  } : null;

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary/20 selection:text-primary flex flex-col justify-between">
      {/* Hidden container for PDF export */}
      {docProps && (
        <div className="fixed -left-[9999px] top-0 pointer-events-none">
          <div ref={offscreenRef} className="w-[1000px]">
            <CertificateDocument {...docProps} />
          </div>
        </div>
      )}

      {/* Public Top Navbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/85 backdrop-blur-xl px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 select-none">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-light via-primary to-primary-dark text-white shadow-md shadow-primary/20">
            <GraduationCap size={20} strokeWidth={2.2} />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-text">QuizMaster</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">Public Verification Registry</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/auth/signin" className="btn-secondary text-xs h-9 px-3.5 font-bold hidden sm:inline-flex">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Verification Content */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8 flex-1">
        {/* Verification Lookup Input */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck size={14} /> Official Credential Registry
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-text">
            Digital Certificate Verification
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto">
            Instantly validate the authenticity, academic validity, and issuance metadata of any QuizMaster digital certificate.
          </p>

          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto relative pt-2">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted mt-1" />
            <input
              type="text"
              className="input-base pl-10 pr-24 py-2.5 text-xs font-mono font-bold"
              placeholder="e.g. QM-2026-AB12CD"
              value={searchSerial}
              onChange={(e) => setSearchSerial(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn-primary-grad absolute right-1.5 top-1/2 -translate-y-1/2 mt-1 text-xs h-8 px-3.5 font-bold"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Verification Status Card */}
        {loading ? (
          <div className="apple-card p-8 border border-border">
            <CardSkeleton />
          </div>
        ) : certData ? (
          certData.verified ? (
            /* Verified Certificate Card */
            <div className="apple-card p-6 sm:p-8 space-y-6 border-2 border-success/40 bg-gradient-to-b from-success-soft/10 via-card to-card shadow-apple-lg animate-pop-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-success-soft text-success flex items-center justify-center border border-success/30 shrink-0">
                    <CheckCircle2 size={26} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-success bg-success-soft px-2 py-0.5 rounded-md border border-success/30">
                      ✓ Officially Verified Credential
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-text mt-1">
                      Authentic Certificate Registry Match
                    </h2>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="btn-secondary text-xs h-9 px-3 font-bold min-h-[36px]"
                    title="Copy Verification Link"
                  >
                    <Copy size={13} /> {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={handleShareLinkedIn}
                    className="btn-secondary text-xs h-9 px-3 font-bold text-[#0077b5] min-h-[36px]"
                    title="Share to LinkedIn"
                  >
                    <Share2 size={13} /> Share
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="btn-primary-grad text-xs h-9 px-3.5 font-bold shadow-sm min-h-[36px]"
                  >
                    <Download size={13} /> {downloading ? 'Exporting…' : 'Download PDF'}
                  </button>
                </div>
              </div>

              {/* Certificate Safe Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-surface/50 border border-border">
                  <span className="text-text-secondary block font-bold text-[10px] uppercase">Candidate Name</span>
                  <span className="text-sm font-black text-text">{certData.studentName}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface/50 border border-border">
                  <span className="text-text-secondary block font-bold text-[10px] uppercase">Certificate Number</span>
                  <span className="text-sm font-mono font-black text-primary">{certData.certificateNumber}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface/50 border border-border">
                  <span className="text-text-secondary block font-bold text-[10px] uppercase">Assessment Title</span>
                  <span className="text-sm font-bold text-text">{certData.quizTitle}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface/50 border border-border">
                  <span className="text-text-secondary block font-bold text-[10px] uppercase">Academic Grade / Score</span>
                  <span className="text-sm font-black text-success">
                    {certData.grade} ({certData.scorePercentage}%)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface/50 border border-border">
                  <span className="text-text-secondary block font-bold text-[10px] uppercase">Date Issued</span>
                  <span className="text-sm font-bold text-text">
                    {certData.issueDate ? new Date(certData.issueDate).toLocaleDateString() : 'Official'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface/50 border border-border">
                  <span className="text-text-secondary block font-bold text-[10px] uppercase">Issuing Authority</span>
                  <span className="text-sm font-bold text-text">{certData.issuedBy}</span>
                </div>
              </div>

              {/* Full Document Rendering with responsive container */}
              <div className="pt-4 border-t border-border overflow-x-auto w-full">
                <div className="min-w-[640px] sm:min-w-0">
                  <CertificateDocument {...docProps} />
                </div>
              </div>
            </div>
          ) : certData.status === 'revoked' ? (
            /* Revoked Certificate Card */
            <div className="apple-card p-8 border-2 border-danger/40 bg-gradient-to-b from-danger-soft/10 via-card to-card text-center space-y-4 shadow-apple-lg">
              <div className="h-16 w-16 mx-auto rounded-3xl bg-danger-soft text-danger flex items-center justify-center border border-danger/30">
                <XCircle size={36} />
              </div>
              <div>
                <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-danger-soft text-danger border border-danger/30">
                  ✕ Certificate Revoked
                </span>
                <h2 className="text-xl font-black text-text mt-3">
                  This Certificate Has Been Revoked
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Serial Number: <strong className="font-mono text-text">{certData.certificateNumber}</strong>
                </p>
                <div className="p-3.5 max-w-md mx-auto mt-3 rounded-xl bg-surface border border-border text-xs text-danger font-semibold">
                  Revocation Reason: {certData.revocationReason}
                </div>
              </div>
            </div>
          ) : (
            /* Not Found Certificate Card */
            <div className="apple-card p-8 border border-border text-center space-y-4">
              <div className="h-14 w-14 mx-auto rounded-3xl bg-warning-soft text-warning flex items-center justify-center border border-warning/30">
                <AlertTriangle size={30} />
              </div>
              <h2 className="text-xl font-black text-text">Certificate Record Not Found</h2>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                No verified digital credential matches the serial number entered. Please check for spelling mistakes or contact the issuing institution.
              </p>
            </div>
          )
        ) : null}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} QuizMaster Academy. Verified Examination &amp; Certification Registry.</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-text transition-colors">Home</Link>
            <Link to="/auth/signin" className="hover:text-text transition-colors">Student Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
