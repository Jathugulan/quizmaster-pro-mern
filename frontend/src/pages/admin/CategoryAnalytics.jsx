import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Tag,
  ArrowLeft,
  BookOpen,
  TrendingUp,
  Award,
  Activity,
  BarChart2,
  CheckCircle2,
  Users,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { categoryApi } from '../../api/categoryApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';

const COLORS = ['#0071e3', '#34c759', '#ff9500', '#ff2d55', '#af52de', '#5856d6', '#0284c7'];

export default function CategoryAnalytics() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await categoryApi.getCategories({ includeCounts: true });
        setCategories(res?.items || res || []);
      } catch (err) {
        toast.error('Failed to load category analytics: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [toast]);

  if (loading) return <CardSkeleton cards={4} />;

  // Calculate highest & most popular category
  const sortedByAttempts = [...categories].sort((a, b) => (b.attemptsCount || 0) - (a.attemptsCount || 0));
  const sortedByScore = [...categories].filter((c) => (c.attemptsCount || 0) > 0).sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));

  const mostPopular = sortedByAttempts[0] || null;
  const highestPerforming = sortedByScore[0] || null;
  const lowestPerforming = sortedByScore.length > 1 ? sortedByScore[sortedByScore.length - 1] : null;

  const totalAttempts = categories.reduce((sum, c) => sum + (c.attemptsCount || 0), 0);
  const totalQuizzes = categories.reduce((sum, c) => sum + (c.quizCount || 0), 0);

  const attemptsData = categories.map((c) => ({
    name: c.name,
    attempts: c.attemptsCount || 0,
    quizzes: c.quizCount || 0,
    avgScore: c.averageScore || 0,
    passRate: c.passRate || 0,
  }));

  return (
    <div className="space-y-7 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/categories"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Categories
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Category Analytics &amp; Insights</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Comparative performance, student participation, and academic attainment across subject categories.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="apple-card p-5 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase">Most Popular Subject</span>
            <Sparkles size={16} className="text-amber-500" />
          </div>
          <p className="text-xl font-black text-text mt-2">{mostPopular ? mostPopular.name : 'N/A'}</p>
          <span className="text-xs text-muted font-semibold">
            {mostPopular ? `${mostPopular.attemptsCount || 0} candidate attempts` : 'No attempts recorded'}
          </span>
        </div>

        <div className="apple-card p-5 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase">Highest Attainment</span>
            <Award size={16} className="text-emerald-500" />
          </div>
          <p className="text-xl font-black text-emerald-500 mt-2">
            {highestPerforming ? highestPerforming.name : 'N/A'}
          </p>
          <span className="text-xs text-muted font-semibold">
            {highestPerforming ? `${highestPerforming.averageScore}% class average` : 'No data'}
          </span>
        </div>

        <div className="apple-card p-5 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase">Priority Revision Target</span>
            <TrendingUp size={16} className="text-primary" />
          </div>
          <p className="text-xl font-black text-text mt-2">
            {lowestPerforming ? lowestPerforming.name : 'N/A'}
          </p>
          <span className="text-xs text-muted font-semibold">
            {lowestPerforming ? `${lowestPerforming.averageScore}% average score` : 'Adequate performance across all tracks'}
          </span>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attempt Volume by Category */}
        <div className="apple-card p-6 border border-border space-y-4">
          <h3 className="text-base font-black text-text flex items-center gap-2">
            <BarChart2 size={16} className="text-primary" /> Examination Submissions by Category
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attemptsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="attempts" fill="#0071e3" radius={[6, 6, 0, 0]} name="Attempts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Score Comparison */}
        <div className="apple-card p-6 border border-border space-y-4">
          <h3 className="text-base font-black text-text flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" /> Average Attainment Score (%)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attemptsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avgScore" fill="#34c759" radius={[6, 6, 0, 0]} name="Average Score %" />
                <Bar dataKey="passRate" fill="#af52de" radius={[6, 6, 0, 0]} name="Pass Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparative Breakdown Table */}
      <div className="apple-card overflow-hidden border border-border">
        <div className="p-5 border-b border-border">
          <h3 className="text-base font-black text-text">Complete Category Performance Index</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4 text-center">Available Quizzes</th>
                <th className="py-3 px-4 text-center">Question Items</th>
                <th className="py-3 px-4 text-center">Total Attempts</th>
                <th className="py-3 px-4 text-center">Class Average</th>
                <th className="py-3 px-4 text-center">Pass Rate</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-4">
                    <Link to={`/admin/categories/${cat.id}`} className="font-bold text-text hover:text-primary">
                      {cat.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-center font-bold">{cat.quizCount || 0}</td>
                  <td className="py-3 px-4 text-center font-bold">{cat.questionCount || 0}</td>
                  <td className="py-3 px-4 text-center font-bold text-primary">{cat.attemptsCount || 0}</td>
                  <td className="py-3 px-4 text-center font-black">{cat.averageScore || 0}%</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`badge text-[10px] font-bold ${
                      (cat.passRate || 0) >= 60 ? 'badge-success' : 'badge-warning'
                    }`}>
                      {cat.passRate || 0}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/admin/categories/${cat.id}`}
                      className="btn-secondary text-xs h-7 px-2.5 font-bold inline-flex items-center gap-1"
                    >
                      Inspect Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
