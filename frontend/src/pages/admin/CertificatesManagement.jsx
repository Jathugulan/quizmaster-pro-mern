import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  ShieldCheck,
  Ban,
  RotateCcw,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ScrollText,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { certificationApi } from '../../api/certificationApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, ConfirmModal } from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import CertificateDocument from '../../components/CertificateDocument.jsx';
import { downloadCertificatePdf } from '../../utils/exportCertificate.js';

export default function CertificatesManagement() {
  const toast = useToast();

  const [certificates, setCertificates] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Preview & Action Modals state
  const [previewCert, setPreviewCert] = useState(null);
  const [revokeCert, setRevokeCert] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [reissueCert, setReissueCert] = useState(null);
  const [reissueReason, setReissueReason] = useState('');
  const [deleteCert, setDeleteCert] = useState(null);

  const [downloadingId, setDownloadingId] = useState(null);
  const offscreenRef = useRef(null);
  const [offscreenCert, setOffscreenCert] = useState(null);

  const fetchCertificates = async (page = 1) => {
    setLoading(true);
    try {
      const res = await certificationApi.getCertificates({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setCertificates(res?.items || []);
      setPagination(res?.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
    } catch (err) {
      toast.error('Failed to load certificates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCertificates(1);
  };

  const handleDownload = async (cert) => {
    setDownloadingId(cert.id);
    setOffscreenCert(cert);

    setTimeout(async () => {
      try {
        if (offscreenRef.current) {
          await downloadCertificatePdf(offscreenRef.current, `QuizMaster-${cert.certificateNumber}.pdf`);
          toast.success(`Official Certificate ${cert.certificateNumber} exported.`);
        }
      } catch (err) {
        toast.error('Export failed: ' + err.message);
      } finally {
        setDownloadingId(null);
      }
    }, 200);
  };

  const handleRevoke = async () => {
    if (!revokeCert) return;
    try {
      await certificationApi.revokeCertificate(revokeCert.id, revokeReason || 'Administrative revocation');
      toast.success(`Certificate ${revokeCert.certificateNumber} revoked.`);
      setRevokeCert(null);
      setRevokeReason('');
      fetchCertificates(pagination.page);
    } catch (err) {
      toast.error('Revocation failed: ' + err.message);
    }
  };

  const handleReissue = async () => {
    if (!reissueCert) return;
    try {
      const newCert = await certificationApi.reissueCertificate(reissueCert.id, {
        reason: reissueReason || 'Reissued by administrator',
      });
      toast.success(`Certificate reissued as ${newCert?.certificateNumber || 'new certificate'}.`);
      setReissueCert(null);
      setReissueReason('');
      fetchCertificates(pagination.page);
    } catch (err) {
      toast.error('Reissue failed: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteCert) return;
    try {
      await certificationApi.deleteCertificate(deleteCert.id);
      toast.success(`Certificate ${deleteCert.certificateNumber} permanently removed.`);
      setDeleteCert(null);
      fetchCertificates(pagination.page);
    } catch (err) {
      toast.error('Deletion failed: ' + err.message);
    }
  };

  const getDocProps = (c) => ({
    studentName: c.student?.name || 'Student',
    quizTitle: c.quizTitle || 'Skill Examination',
    category: c.category || 'General',
    percent: c.percentage || 100,
    correct: Math.round(((c.percentage || 100) / 100) * 10),
    of: 10,
    timeLabel: 'Completed',
    dateLabel: c.issueDate ? new Date(c.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Verified',
    serial: c.certificateNumber || 'QM-CERT',
    difficulty: 'Standard',
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hidden container for PDF rendering */}
      {offscreenCert && (
        <div className="fixed -left-[9999px] top-0 pointer-events-none">
          <div ref={offscreenRef} className="w-[1000px]">
            <CertificateDocument {...getDocProps(offscreenCert)} />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
            <Award size={14} /> Digital Credentials &amp; Verification Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
            Certificate Management
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Issue, verify, revoke, reissue, and monitor high-resolution digital credentials with public cryptographic verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/certificate-templates" className="btn-secondary text-xs h-10 px-4 font-bold">
            <ScrollText size={14} /> Templates
          </Link>
          <Link to="/admin/certificate-requests" className="btn-secondary text-xs h-10 px-4 font-bold">
            <FileCheck size={14} /> Requests
          </Link>
          <Link to="/admin/certificates/create" className="btn-primary-grad text-xs h-10 px-4 shadow-sm font-bold">
            <Plus size={15} /> Issue Certificate
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="apple-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border border-border">
        <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2 lg:col-span-3">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input-base pl-9 text-xs"
            placeholder="Search by certificate #, student name, email, or exam title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <select
          className="input-base text-xs font-bold cursor-pointer"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Certificate Statuses</option>
          <option value="issued">Issued / Valid</option>
          <option value="pending">Pending Approval</option>
          <option value="revoked">Revoked</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates found"
          description="Adjust your search filters or issue a new digital certificate."
          action={
            <Link to="/admin/certificates/create" className="btn-primary-grad">
              <Plus size={14} /> Issue New Certificate
            </Link>
          }
        />
      ) : (
        <div className="apple-card overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="table-base w-full">
              <thead>
                <tr>
                  <th>Certificate Details</th>
                  <th>Student Candidate</th>
                  <th>Assessment</th>
                  <th>Score / Grade</th>
                  <th>Issued Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => (
                  <tr key={c.id} className="hover:bg-surface/50 transition-colors">
                    <td>
                      <div className="space-y-0.5">
                        <span className="font-mono font-black text-xs text-primary flex items-center gap-1">
                          <ShieldCheck size={13} /> {c.certificateNumber}
                        </span>
                        <p className="font-bold text-xs text-text truncate max-w-[200px]">{c.quizTitle}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        {c.student?.photo ? (
                          <img
                            src={c.student.photo}
                            alt={c.student.name}
                            className="h-8 w-8 rounded-xl object-cover ring-1 ring-border"
                          />
                        ) : (
                          <div className="h-8 w-8 shrink-0 grid place-items-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                            {c.student?.name?.charAt(0) || 'S'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link to={`/admin/students/${c.student?.id}`} className="font-bold text-xs text-text hover:text-primary hover:underline truncate block">
                            {c.student?.name}
                          </Link>
                          <span className="text-[10px] text-muted truncate block">{c.student?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-primary text-[10px]">{c.category || 'General'}</span>
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        <span className="font-black text-xs text-text">{c.percentage}%</span>
                        <span className="text-[10px] font-extrabold text-primary block">Grade: {c.grade || 'Pass'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-text-secondary">
                        {c.issueDate ? new Date(c.issueDate).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                          c.status === 'issued'
                            ? 'bg-success-soft text-success border border-success/30'
                            : c.status === 'revoked'
                            ? 'bg-danger-soft text-danger border border-danger/30'
                            : 'bg-warning-soft text-warning border border-warning/30'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewCert(c)}
                          className="btn-secondary text-xs h-8 px-2.5 font-bold"
                          title="Preview Certificate Document"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleDownload(c)}
                          disabled={downloadingId === c.id}
                          className="btn-secondary text-xs h-8 px-2.5 font-bold"
                          title="Export PDF Certificate"
                        >
                          <Download size={13} />
                        </button>
                        <Link
                          to={`/verify-certificate/${c.certificateNumber}`}
                          target="_blank"
                          className="btn-secondary text-xs h-8 px-2.5 font-bold"
                          title="Open Public Verification Link"
                        >
                          <ExternalLink size={13} />
                        </Link>
                        {c.status === 'issued' ? (
                          <button
                            onClick={() => setRevokeCert(c)}
                            className="btn-secondary text-xs h-8 px-2.5 font-bold text-danger hover:bg-danger/10"
                            title="Revoke Certificate"
                          >
                            <Ban size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setReissueCert(c)}
                            className="btn-secondary text-xs h-8 px-2.5 font-bold text-primary hover:bg-primary/10"
                            title="Reissue Replacement Certificate"
                          >
                            <RotateCcw size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteCert(c)}
                          className="btn-secondary text-xs h-8 px-2.5 font-bold text-muted hover:text-danger hover:bg-danger/10"
                          title="Delete Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between text-xs">
              <span className="font-bold text-muted">
                Page {pagination.page} of {pagination.pages} ({pagination.total} records)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchCertificates(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="btn-secondary text-xs h-8 px-3 disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  onClick={() => fetchCertificates(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="btn-secondary text-xs h-8 px-3 disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {previewCert && (
        <Modal
          open={Boolean(previewCert)}
          onClose={() => setPreviewCert(null)}
          title={`Certificate Preview: ${previewCert.certificateNumber}`}
          size="lg"
        >
          <div className="space-y-5">
            <div className="w-full">
              <CertificateDocument {...getDocProps(previewCert)} />
            </div>

            {/* Audit History Snapshot */}
            {previewCert.history && previewCert.history.length > 0 && (
              <div className="p-3.5 rounded-xl bg-surface border border-border text-xs space-y-1.5">
                <span className="font-extrabold text-text uppercase tracking-wider text-[10px]">
                  Audit History Log
                </span>
                {previewCert.history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-muted">
                    <span>
                      <strong className="text-text capitalize">{h.action}</strong> by {h.performedBy}: {h.reason}
                    </span>
                    <span className="text-[10px]">{new Date(h.timestamp).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => handleDownload(previewCert)}
                className="btn-primary-grad text-xs px-4"
              >
                <Download size={14} /> Download PDF
              </button>
              <button onClick={() => setPreviewCert(null)} className="btn-secondary text-xs px-4">
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Revoke Modal with Mandatory Reason */}
      {revokeCert && (
        <Modal
          open={Boolean(revokeCert)}
          onClose={() => setRevokeCert(null)}
          title="Revoke Digital Certificate"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger flex items-start gap-2.5">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Permanent Compliance Action</strong>
                Revoking will flag this serial number as INVALID on public verification registries. Historical compliance audit records will be preserved.
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text">Reason for Revocation *</label>
              <textarea
                className="input-base text-xs h-20"
                placeholder="e.g. Ineligible candidate score recalculation, violation of testing integrity, duplicate issuance..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button onClick={() => setRevokeCert(null)} className="btn-secondary text-xs px-4">
                Cancel
              </button>
              <button onClick={handleRevoke} className="btn-danger text-xs px-4">
                Confirm Revocation
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reissue Modal */}
      {reissueCert && (
        <Modal
          open={Boolean(reissueCert)}
          onClose={() => setReissueCert(null)}
          title="Reissue Replacement Certificate"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">
              A new unique certificate serial number will be generated for <strong>{reissueCert.student?.name}</strong>. The old certificate will be marked as superseded.
            </p>

            <div className="space-y-1">
              <label className="font-bold text-text">Reason for Reissuance</label>
              <input
                className="input-base text-xs"
                placeholder="e.g. Corrected student name spelling, updated course details..."
                value={reissueReason}
                onChange={(e) => setReissueReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button onClick={() => setReissueCert(null)} className="btn-secondary text-xs px-4">
                Cancel
              </button>
              <button onClick={handleReissue} className="btn-primary-grad text-xs px-4">
                Reissue Certificate
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteCert)}
        title="Permanently Delete Certificate Record?"
        message={`Are you sure you want to completely erase certificate ${deleteCert?.certificateNumber}? Note: For regulatory compliance, revoking is generally recommended over deletion.`}
        confirmText="Delete Permanently"
        danger={true}
        onConfirm={handleDelete}
        onClose={() => setDeleteCert(null)}
      />
    </div>
  );
}
