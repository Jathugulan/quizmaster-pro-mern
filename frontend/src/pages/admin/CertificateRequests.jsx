import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { certificationApi } from '../../api/certificationApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';

export default function CertificateRequests() {
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [approveItem, setApproveItem] = useState(null);
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async (page = 1) => {
    setLoading(true);
    try {
      const res = await certificationApi.getRequests({
        page,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setRequests(res?.items || []);
      setPagination(res?.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
    } catch (err) {
      toast.error('Failed to load certificate requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleApprove = async () => {
    if (!approveItem) return;
    setProcessing(true);
    try {
      await certificationApi.approveRequest(approveItem.id);
      toast.success(`Request for ${approveItem.student?.name} approved and digital certificate issued.`);
      setApproveItem(null);
      fetchRequests(pagination.page);
    } catch (err) {
      toast.error('Approval failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectItem) return;
    if (!rejectionReason.trim()) {
      toast.error('Please specify a rejection reason.');
      return;
    }

    setProcessing(true);
    try {
      await certificationApi.rejectRequest(rejectItem.id, rejectionReason.trim());
      toast.info(`Request for ${rejectItem.student?.name} rejected.`);
      setRejectItem(null);
      setRejectionReason('');
      fetchRequests(pagination.page);
    } catch (err) {
      toast.error('Rejection failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
            <Inbox size={14} /> Candidate Verification Queue
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
            Certificate Requests
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Review student certification requests, evaluate qualifying scores, and issue official credentials.
          </p>
        </div>

        <select
          className="input-base text-xs font-bold cursor-pointer max-w-xs"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Request Statuses</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved &amp; Issued</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No pending certificate requests"
          description="All candidate certificate submissions have been processed."
        />
      ) : (
        <div className="apple-card overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="table-base w-full">
              <thead>
                <tr>
                  <th>Student Candidate</th>
                  <th>Assessment Title</th>
                  <th>Type</th>
                  <th>Score</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-surface/50 transition-colors">
                    <td>
                      <div className="flex items-center gap-2.5">
                        {r.student?.photo ? (
                          <img
                            src={r.student.photo}
                            alt={r.student.name}
                            className="h-8 w-8 rounded-xl object-cover ring-1 ring-border"
                          />
                        ) : (
                          <div className="h-8 w-8 shrink-0 grid place-items-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                            {r.student?.name?.charAt(0) || 'S'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link to={`/admin/students/${r.student?.id}`} className="font-bold text-xs text-text hover:text-primary hover:underline truncate block">
                            {r.student?.name}
                          </Link>
                          <span className="text-[10px] text-muted truncate block">{r.student?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-text">{r.quiz?.title || 'Examination'}</span>
                        <span className="badge-primary text-[10px]">{r.quiz?.category || 'General'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-text-secondary">{r.certificateType}</span>
                    </td>
                    <td>
                      <span className="font-black text-xs text-text">{r.percentage || r.score}%</span>
                    </td>
                    <td>
                      <span className="text-xs text-muted">
                        {r.requestDate ? new Date(r.requestDate).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                          r.status === 'approved'
                            ? 'bg-success-soft text-success'
                            : r.status === 'rejected'
                            ? 'bg-danger-soft text-danger'
                            : 'bg-warning-soft text-warning'
                        }`}
                      >
                        {r.status}
                      </span>
                      {r.rejectionReason && (
                        <p className="text-[10px] text-danger mt-1 italic max-w-xs truncate">
                          Reason: {r.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="text-right">
                      {r.status === 'pending' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setApproveItem(r)}
                            className="btn-primary-grad text-xs h-8 px-3 font-bold"
                            title="Approve & Issue Certificate"
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            onClick={() => setRejectItem(r)}
                            className="btn-secondary text-xs h-8 px-3 font-bold text-danger hover:bg-danger/10"
                            title="Reject Request"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted font-bold">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between text-xs">
              <span className="font-bold text-muted">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchRequests(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="btn-secondary text-xs h-8 px-3 disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  onClick={() => fetchRequests(pagination.page + 1)}
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

      {/* Approve Modal */}
      {approveItem && (
        <Modal
          open={Boolean(approveItem)}
          onClose={() => setApproveItem(null)}
          title="Approve Certificate Issuance"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">
              Are you sure you want to approve this certificate request for <strong>{approveItem.student?.name}</strong> regarding examination <strong>{approveItem.quiz?.title}</strong>?
            </p>
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
              <div>Student: <strong>{approveItem.student?.name}</strong> ({approveItem.student?.email})</div>
              <div>Qualifying Score: <strong>{approveItem.percentage || approveItem.score}%</strong></div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button onClick={() => setApproveItem(null)} className="btn-secondary text-xs px-4">
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={processing}
                className="btn-primary-grad text-xs px-4 font-bold"
              >
                {processing ? 'Issuing…' : 'Approve & Issue Certificate'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectItem && (
        <Modal
          open={Boolean(rejectItem)}
          onClose={() => setRejectItem(null)}
          title="Reject Certificate Request"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-text">Reason for Rejection *</label>
              <textarea
                className="input-base text-xs h-20"
                placeholder="e.g. Minimum passing percentage not satisfied, duplicate request, requirement incomplete..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button onClick={() => setRejectItem(null)} className="btn-secondary text-xs px-4">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="btn-danger text-xs px-4 font-bold"
              >
                {processing ? 'Processing…' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
