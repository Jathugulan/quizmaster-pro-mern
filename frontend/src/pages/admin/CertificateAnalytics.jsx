import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart as PieChartIcon,
  Award,
  CheckCircle,
  Clock,
  Ban,
  TrendingUp,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { certificationApi } from '../../api/certificationApi.js';
import { CardSkeleton } from '../../components/Skeleton.jsx';

const COLORS = ['#0071e3', '#15803d', '#b45309', '#7e22ce', '#0284c7', '#d97706'];

export default function CertificateAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadAnalytics() {
      setLoading(true);
      try {
        const res = await certificationApi.getAnalytics();
        if (isMounted) setData(res);
      } catch (err) {
        console.warn('[CertificateAnalytics] Failed to fetch data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const kpis = data?.kpis || {
    total: 0,
    issued: 0,
    pending: 0,
    revoked: 0,
    thisMonth: 0,
    avgScore: 85,
  };

  const byCategory = (data?.byCategory || []).map((c) => ({
    name: c.category,
    value: c.count,
  }));

  const byGrade = (data?.byGrade || []).map((g) => ({
    name: g.grade,
    count: g.count,
  }));

  const timeline = data?.timeline || [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
            <PieChartIcon size={14} /> Credential Telemetry &amp; Attainment Metrics
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
            Certification Analytics
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Real-time insights on credential velocity, grade distribution, subject mastery rates, and verification metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/admin/certificates" className="btn-secondary text-xs h-10 px-4 font-bold">
            <Award size={14} /> View All Certificates
          </Link>
          <Link to="/admin/reports" className="btn-primary-grad text-xs h-10 px-4 shadow-sm font-bold">
            Export Certificate Report
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="apple-card p-4 space-y-1 border border-border">
          <span className="text-xs font-bold text-text-secondary">Total Certificates</span>
          <div className="text-2xl font-black text-text">{kpis.total}</div>
          <p className="text-[10px] text-muted">All-time generated</p>
        </div>

        <div className="apple-card p-4 space-y-1 border border-border">
          <span className="text-xs font-bold text-text-secondary">Issued &amp; Active</span>
          <div className="text-2xl font-black text-success">{kpis.issued}</div>
          <p className="text-[10px] text-muted">Verified credentials</p>
        </div>

        <div className="apple-card p-4 space-y-1 border border-border">
          <span className="text-xs font-bold text-text-secondary">This Month</span>
          <div className="text-2xl font-black text-primary">+{kpis.thisMonth}</div>
          <p className="text-[10px] text-muted">New certifications</p>
        </div>

        <div className="apple-card p-4 space-y-1 border border-border">
          <span className="text-xs font-bold text-text-secondary">Pending Requests</span>
          <div className="text-2xl font-black text-amber-500">{kpis.pending}</div>
          <p className="text-[10px] text-muted">Awaiting review</p>
        </div>

        <div className="apple-card p-4 space-y-1 border border-border">
          <span className="text-xs font-bold text-text-secondary">Revoked</span>
          <div className="text-2xl font-black text-danger">{kpis.revoked}</div>
          <p className="text-[10px] text-muted">Invalidated</p>
        </div>

        <div className="apple-card p-4 space-y-1 border border-border">
          <span className="text-xs font-bold text-text-secondary">Avg Cert Score</span>
          <div className="text-2xl font-black text-purple">{kpis.avgScore}%</div>
          <p className="text-[10px] text-muted">Attainment average</p>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Timeline Chart */}
          <div className="apple-card p-6 border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-text">Certificates Issued Over Time</h3>
                <p className="text-xs text-text-secondary">Daily certification issuance volume</p>
              </div>
              <span className="badge-primary text-[10px]">Last 30 Days</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline.length > 0 ? timeline : [{ date: 'Today', count: kpis.issued }]}>
                  <defs>
                    <linearGradient id="certGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0071e3" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0071e3" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" name="Certificates" stroke="#0071e3" strokeWidth={2.5} fill="url(#certGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* By Category Chart */}
          <div className="apple-card p-6 border border-border space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-text">Certificates by Subject Category</h3>
              <p className="text-xs text-text-secondary">Credentials earned across academic disciplines</p>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              {byCategory.length === 0 ? (
                <p className="text-xs text-muted">No category data available yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCategory}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Certificates" fill="#0071e3" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="apple-card p-6 border border-border space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-text">Certificate Grade Breakdown</h3>
              <p className="text-xs text-text-secondary">Academic tier distribution (Distinction, Merit, Pass)</p>
            </div>

            <div className="h-60 w-full flex items-center justify-center">
              {byGrade.length === 0 ? (
                <p className="text-xs text-muted">No grade data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byGrade}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {byGrade.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Quality Seal / Credential Standing */}
          <div className="apple-card p-6 border border-border space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success-soft text-success border border-success/30">
                <ShieldCheck size={14} /> 100% Cryptographically Verifiable
              </div>
              <h3 className="font-extrabold text-base text-text">Platform Integrity Standing</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                All issued digital credentials contain tamper-proof cryptographic hashes, unique sequential registry IDs, and dynamic QR routing ensuring immediate third-party verification for employers and academic institutions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border text-xs">
              <div className="p-3 rounded-xl bg-surface">
                <span className="text-muted block text-[10px] uppercase font-bold">Revocation Ratio</span>
                <span className="font-black text-sm text-text">
                  {kpis.total > 0 ? `${((kpis.revoked / kpis.total) * 100).toFixed(1)}%` : '0.0%'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface">
                <span className="text-muted block text-[10px] uppercase font-bold">Public Verification</span>
                <span className="font-black text-sm text-success flex items-center gap-1">
                  <CheckCircle size={14} /> Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
