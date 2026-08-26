import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  CheckCircle,
  Award,
  Clock,
  Sparkles,
  BarChart3,
  Search,
  X,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { adminApi } from '../../api/adminApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';

const COMPARISON_COLORS = ['#0071e3', '#15803d', '#b45309', '#7e22ce'];

export default function StudentProgress() {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Initial student loading
  useEffect(() => {
    let isMounted = true;
    async function loadStudents() {
      try {
        const res = await adminApi.getUsers({ limit: 50 });
        if (isMounted) {
          const list = res?.items || [];
          setAvailableStudents(list);

          const paramId = searchParams.get('studentId');
          if (paramId) {
            setSelectedIds([paramId]);
          } else if (list.length > 0) {
            setSelectedIds(list.slice(0, 2).map((s) => s.id));
          }
        }
      } catch (err) {
        toast.error('Failed to load student list: ' + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStudents();
    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // Load comparison data when selectedIds change
  useEffect(() => {
    if (selectedIds.length === 0) {
      setComparisonData([]);
      return;
    }
    async function fetchComparison() {
      try {
        const res = await adminApi.compareStudents(selectedIds);
        setComparisonData(res?.comparisons || []);
      } catch (err) {
        toast.error('Failed to fetch comparison: ' + err.message);
      }
    }
    fetchComparison();
  }, [selectedIds]);

  const toggleStudent = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) {
        toast.info('At least one student must remain selected.');
        return;
      }
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      if (selectedIds.length >= 4) {
        toast.warning('You can compare a maximum of 4 students simultaneously.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Build Category Comparison Chart Data
  const allCategories = Array.from(
    new Set(comparisonData.flatMap((c) => Object.keys(c.categories || {})))
  );

  const categoryChartData = allCategories.map((cat) => {
    const row = { category: cat };
    comparisonData.forEach((s) => {
      row[s.name] = s.categories?.[cat] || 0;
    });
    return row;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
          <TrendingUp size={14} /> Performance Analytics &amp; Benchmarking
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
          Student Progress &amp; Multi-Student Comparison
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Compare candidate trajectories, subject mastery, examination pass rates, and learning pace side-by-side.
        </p>
      </div>

      {/* Student Selector Bar */}
      <div className="apple-card p-6 space-y-4 border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-text">Selected Students ({selectedIds.length}/4)</h2>
            <p className="text-xs text-text-secondary">Pick candidate profiles to compare on the metrics board</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search candidate name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-8 py-1.5 text-xs"
            />
          </div>
        </div>

        {/* Selected Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {availableStudents
            .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 12)
            .map((s) => {
              const isSelected = selectedIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleStudent(s.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm ring-2 ring-primary/40'
                      : 'bg-surface text-text-secondary border border-border hover:border-primary/40 hover:text-text'
                  }`}
                >
                  {isSelected ? <X size={13} /> : <Plus size={13} />}
                  <span>{s.name}</span>
                </button>
              );
            })}
        </div>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : comparisonData.length === 0 ? (
        <div className="apple-card p-12 text-center text-xs text-muted">
          No students selected for comparison. Please select 1 to 4 students above.
        </div>
      ) : (
        <>
          {/* Side-by-Side Comparison Cards Grid */}
          <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${comparisonData.length}`}>
            {comparisonData.map((s, idx) => (
              <div
                key={s.id}
                className="apple-card p-6 space-y-4 border border-border relative overflow-hidden"
              >
                <div
                  className="absolute top-0 inset-x-0 h-1.5"
                  style={{ backgroundColor: COMPARISON_COLORS[idx % COMPARISON_COLORS.length] }}
                />

                <div className="flex items-center gap-3.5 pt-1">
                  {s.photo ? (
                    <img src={s.photo} alt={s.name} className="h-12 w-12 rounded-2xl object-cover ring-1 ring-border" />
                  ) : (
                    <div className="h-12 w-12 shrink-0 grid place-items-center rounded-2xl bg-primary/10 text-primary font-black text-base border border-primary/20">
                      {s.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-text truncate">{s.name}</h3>
                    <p className="text-[11px] text-text-secondary truncate">@{s.username}</p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-border text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-text-secondary">Average Score:</span>
                    <span className="font-black text-text">{s.avgScore}%</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-text-secondary">Highest Score:</span>
                    <span className="font-bold text-success">{s.highestScore}%</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-text-secondary">Pass Rate:</span>
                    <span className="font-bold text-primary">{s.passRate}%</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-text-secondary">Total Attempts:</span>
                    <span className="font-bold text-text">{s.totalAttempts}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-text-secondary">Time Spent:</span>
                    <span className="font-bold text-text">{s.totalTimeMinutes} min</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/admin/users/${s.id}`}
                    className="btn-secondary w-full text-xs h-8 justify-center font-bold"
                  >
                    View Full Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Category Mastery Comparative Chart */}
          {allCategories.length > 0 && (
            <div className="apple-card p-6 space-y-4 border border-border">
              <div>
                <h2 className="text-base font-black text-text">Subject Mastery Comparison</h2>
                <p className="text-xs text-text-secondary">Candidate average score % benchmarked across subjects</p>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.4} />
                    <XAxis dataKey="category" stroke="currentColor" className="text-muted text-[10px]" />
                    <YAxis stroke="currentColor" className="text-muted text-[10px]" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        borderColor: 'var(--color-border)',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'var(--color-text)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
                    {comparisonData.map((s, idx) => (
                      <Bar
                        key={s.id}
                        dataKey={s.name}
                        fill={COMPARISON_COLORS[idx % COMPARISON_COLORS.length]}
                        radius={[6, 6, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
