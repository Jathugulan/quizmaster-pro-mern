import { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Calendar,
  Layers,
  FileText,
  CheckCircle2,
  BookOpen,
  Users,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import { exportReportsToCsv } from '../../utils/pdfExport.js';

export default function ReportsManagement() {
  const toast = useToast();

  const [reportType, setReportType] = useState('students'); // students | quizzes | marks
  const [category, setCategory] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getReports({
        reportType,
        category: category !== 'all' ? category : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setReportData(res || { rows: [] });
    } catch (err) {
      toast.error('Failed to generate report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, category]);

  const handleExportCsv = () => {
    if (!reportData?.rows || reportData.rows.length === 0) {
      toast.info('No data available to export.');
      return;
    }
    const filename = `QuizMaster_${reportType}_Report_${new Date().toISOString().split('T')[0]}.csv`;
    exportReportsToCsv(reportData.rows, filename);
    toast.success('Report successfully exported to CSV / Excel.');
  };

  const rows = reportData?.rows || [];
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
            <FileSpreadsheet size={14} /> Data Exports &amp; Auditing
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Reports &amp; Data Export</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Generate and export custom analytics datasets into CSV, Microsoft Excel, and tabular formats.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={rows.length === 0 || loading}
          className="btn-primary-grad text-xs h-10 px-5 shadow-sm font-bold disabled:opacity-50"
        >
          <Download size={14} /> Export CSV / Excel ({rows.length} records)
        </button>
      </div>

      {/* Report Type Selector & Filters */}
      <div className="apple-card p-6 space-y-4 border border-border">
        {/* Report Type Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'students', label: 'Student Performance Report', desc: 'Candidate progress, score averages & completion', icon: Users },
            { id: 'quizzes', label: 'Quiz Performance Report', desc: 'Assessment statistics, difficulty & pass rates', icon: BookOpen },
            { id: 'marks', label: 'Detailed Marks & Results Report', desc: 'Granular per-attempt marks & outcome breakdown', icon: FileText },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                reportType === type.id
                  ? 'bg-primary/10 border-primary ring-2 ring-primary/30'
                  : 'bg-surface border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className={`p-2 rounded-xl ${reportType === type.id ? 'bg-primary text-white' : 'bg-card text-muted'}`}>
                  <type.icon size={16} />
                </div>
                <span className="font-extrabold text-xs text-text">{type.label}</span>
              </div>
              <p className="text-[11px] text-text-secondary">{type.desc}</p>
            </button>
          ))}
        </div>

        {/* Date and Category Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border">
          <div>
            <label className="label-base">Subject Category</label>
            <select
              className="input-base text-xs font-bold cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Programming">Programming</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="General Knowledge">General Knowledge</option>
              <option value="English Literature">English Literature</option>
            </select>
          </div>

          <div>
            <label className="label-base">From Date</label>
            <input
              type="date"
              className="input-base text-xs"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="label-base">To Date</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="input-base text-xs"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              <button onClick={fetchReport} className="btn-secondary text-xs h-10 px-4 shrink-0 font-bold">
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Table Preview */}
      <div className="apple-card overflow-hidden border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-text">Data Preview &amp; Audit Table</h2>
            <p className="text-xs text-text-secondary">Showing generated records ready for export</p>
          </div>
          <span className="text-xs font-bold text-muted">{rows.length} Rows</span>
        </div>

        {loading ? (
          <CardSkeleton />
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted">
            No report data found matching current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base w-full text-xs">
              <thead>
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="capitalize">
                      {h.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface/50">
                    {headers.map((h) => (
                      <td key={h} className="whitespace-nowrap font-medium">
                        {String(row[h])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
