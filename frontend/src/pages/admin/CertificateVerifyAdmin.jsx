import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
  Calendar,
  User,
  BookOpen,
} from 'lucide-react';
import { certificationApi } from '../../api/certificationApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import CertificateDocument from '../../components/CertificateDocument.jsx';

export default function CertificateVerifyAdmin() {
  const toast = useToast();
  const [serial, setSerial] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!serial.trim()) return;

    setLoading(true);
    try {
      const res = await certificationApi.verifyPublicCertificate(serial.trim());
      setResult(res);
    } catch (err) {
      setResult({
        verified: false,
        status: 'not_found',
        message: 'No certificate matched this serial number in the active database.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
          <ShieldCheck size={14} /> Official Certification Validator
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
          Certificate Verification Console
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Perform administrative serial lookups, validate cryptographic signatures, and audit credential status.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="apple-card p-6 sm:p-8 space-y-4 border border-border">
        <form onSubmit={handleVerify} className="max-w-xl space-y-3">
          <label className="font-bold text-xs text-text block">
            Enter Certificate Serial Number or Verification Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input-base text-xs font-mono font-bold"
              placeholder="e.g. QM-2026-64A7E9"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-grad text-xs px-5 font-bold shrink-0"
            >
              {loading ? 'Validating…' : 'Validate'}
            </button>
          </div>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div className="apple-card p-6 sm:p-8 border border-border space-y-5 animate-pop-in">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              {result.verified ? (
                <div className="h-10 w-10 rounded-xl bg-success-soft text-success flex items-center justify-center border border-success/30">
                  <CheckCircle2 size={22} />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-xl bg-danger-soft text-danger flex items-center justify-center border border-danger/30">
                  <XCircle size={22} />
                </div>
              )}
              <div>
                <h3 className="font-black text-base text-text">
                  {result.verified ? 'Valid & Verified Digital Certificate' : 'Certificate Verification Failed'}
                </h3>
                <span className="text-xs text-muted">
                  Status: <strong className="uppercase text-text">{result.status}</strong>
                </span>
              </div>
            </div>

            {result.verified && (
              <Link
                to={`/verify-certificate/${result.certificateNumber}`}
                target="_blank"
                className="btn-secondary text-xs h-9 px-3 font-bold"
              >
                <ExternalLink size={13} /> Open Public Registry Page
              </Link>
            )}
          </div>

          {result.verified ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface">
                <span className="text-muted block text-[10px] uppercase font-bold">Candidate</span>
                <span className="font-bold text-text">{result.studentName}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface">
                <span className="text-muted block text-[10px] uppercase font-bold">Serial Number</span>
                <span className="font-mono font-bold text-primary">{result.certificateNumber}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface">
                <span className="text-muted block text-[10px] uppercase font-bold">Assessment</span>
                <span className="font-bold text-text">{result.quizTitle}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface">
                <span className="text-muted block text-[10px] uppercase font-bold">Grade</span>
                <span className="font-bold text-success">{result.grade} ({result.scorePercentage}%)</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-danger font-medium">{result.message || 'Certificate is invalid.'}</p>
          )}
        </div>
      )}
    </div>
  );
}
