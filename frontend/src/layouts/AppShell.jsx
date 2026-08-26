import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  GraduationCap,
  Sparkles,
  Bell,
  Search,
  CheckCircle2,
  ChevronDown,
  User as UserIcon,
  Settings as SettingsIcon,
  Award,
  BookOpen,
  Users,
  LayoutDashboard,
  FileCheck2,
  ChevronRight,
  ArrowRight,
  FileQuestion,
  Clock,
  Loader2,
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { adminApi } from '../api/adminApi.js';
import { quizApi } from '../api/quizApi.js';

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 select-none focus:outline-none">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-light via-primary to-primary-dark text-white shadow-md shadow-primary/20 shrink-0">
        <GraduationCap size={20} strokeWidth={2.2} />
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
      </div>
      <div className="min-w-0">
        <span className="text-base font-black tracking-tight text-text truncate block">QuizMaster</span>
        <span className="block text-[9px] font-extrabold uppercase tracking-wider text-primary truncate">Enterprise Pro</span>
      </div>
    </Link>
  );
}

function Avatar({ user }) {
  const initials = (user?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  if (user?.photo) {
    return (
      <img
        src={user.photo}
        alt={user?.name}
        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover ring-2 ring-border shrink-0"
      />
    );
  }
  return (
    <div className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-gradient-to-br from-primary/20 to-purple/20 text-primary text-xs font-bold ring-1 ring-primary/25 shrink-0">
      {initials}
    </div>
  );
}

export default function AppShell({ items, roleLabel }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Live Auto-suggest Search State
  const [searchResults, setSearchResults] = useState({ quizzes: [], students: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Notifications Popover
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // User Profile Dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  // Keyboard shortcut listener for global search ('/' key)
  useEffect(() => {
    function handleKeyDown(e) {
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchFocused(false);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile drawer & popups when route changes
  useEffect(() => {
    setOpen(false);
    setMobileSearchOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
    setSearchFocused(false);
  }, [location.pathname]);

  // Live Search Query Debounce
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setSearchResults({ quizzes: [], students: [] });
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const promises = [
          quizApi.getQuizzes({ search: q, limit: 5, status: isAdmin ? 'all' : 'published' }).catch(() => ({ items: [] })),
        ];

        if (isAdmin) {
          promises.push(adminApi.getUsers({ search: q, limit: 3, role: 'user' }).catch(() => ({ items: [] })));
        }

        const [quizRes, userRes] = await Promise.all(promises);
        setSearchResults({
          quizzes: quizRes?.items || [],
          students: userRes?.items || [],
        });
      } catch (err) {
        // Silently catch search errors
      } finally {
        setSearchLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery, isAdmin]);

  // Load admin notifications if admin
  useEffect(() => {
    if (!isAdmin) return;
    let isMounted = true;
    async function fetchNotifs() {
      try {
        const res = await adminApi.getNotifications({ limit: 6 });
        if (isMounted && res) {
          setNotifs(res.items || []);
          setUnreadCount(res.unreadCount || 0);
        }
      } catch (err) {
        // Silently ignore background notification fetch errors
      }
    }
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAdmin]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out.');
    navigate('/auth/signin');
  };

  const handleGlobalSearch = (e) => {
    e?.preventDefault?.();
    const q = searchQuery.trim();
    if (!q) return;

    setSearchFocused(false);
    setMobileSearchOpen(false);

    if (isAdmin) {
      navigate(`/admin/quizzes?search=${encodeURIComponent(q)}`);
    } else {
      navigate(`/user/library?search=${encodeURIComponent(q)}`);
    }
  };

  const handleSelectQuiz = (quizId) => {
    setSearchFocused(false);
    setSearchQuery('');
    if (isAdmin) {
      navigate(`/admin/quiz/${quizId}`);
    } else {
      navigate(`/user/quiz/${quizId}`);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSearchFocused(false);
    setSearchQuery('');
    navigate(`/admin/students`);
  };

  const handleMarkAllRead = async () => {
    try {
      await adminApi.markNotificationRead('all');
      setUnreadCount(0);
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  // Breadcrumb generator
  const getBreadcrumb = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0) return 'Home';
    return pathSegments.map((segment, i) => {
      let formatted = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

      // If segment is a MongoDB ObjectId (24 hex characters) or long alphanumeric ID, replace with clean contextual label
      const isRawId = /^[0-9a-fA-F]{20,}$/.test(segment) || /^[0-9a-zA-Z_-]{20,}$/.test(segment);
      if (isRawId) {
        const prevSegment = pathSegments[i - 1]?.toLowerCase();
        if (prevSegment === 'result' || prevSegment === 'results') {
          formatted = 'Assessment Report';
        } else if (prevSegment === 'quiz' || prevSegment === 'quizzes') {
          formatted = 'Assessment Details';
        } else if (prevSegment === 'attempt') {
          formatted = 'Examination Session';
        } else if (prevSegment === 'review') {
          formatted = 'Solution Breakdown';
        } else if (prevSegment === 'users' || prevSegment === 'students') {
          formatted = 'Student Profile';
        } else if (prevSegment === 'verify' || prevSegment === 'certificate') {
          formatted = 'Credential Details';
        } else {
          formatted = 'Details';
        }
      }

      return (
        <span key={i} className="inline-flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} className="text-muted" />}
          <span className={i === pathSegments.length - 1 ? 'text-text font-bold' : 'text-muted'}>
            {formatted}
          </span>
        </span>
      );
    });
  };

  // Primary 4 shortcuts for bottom bar on mobile
  const bottomBarNav = isAdmin
    ? [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/admin/students', label: 'Students', icon: Users },
        { to: '/admin/quizzes', label: 'Quizzes', icon: BookOpen },
        { to: '/admin/certificates', label: 'Certificates', icon: Award },
      ]
    : [
        { to: '/user', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/user/library', label: 'Library', icon: BookOpen },
        { to: '/user/results', label: 'Results', icon: FileCheck2 },
        { to: '/user/certificates', label: 'Certificates', icon: Award },
      ];

  const hasResults = searchResults.quizzes.length > 0 || searchResults.students.length > 0;

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary/20 selection:text-primary">
      {/* ---------------- Desktop Apple HIG Sidebar ---------------- */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border bg-card/90 backdrop-blur-2xl z-30 shadow-apple-sm">
        <div className="px-5 h-16 flex items-center border-b border-border">
          <Brand />
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          <div className="px-3 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted">
            <span>{roleLabel} Console</span>
            <Sparkles size={12} className="text-primary/70" />
          </div>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/25 translate-x-0.5 font-bold'
                    : 'text-text-secondary hover:bg-surface hover:text-text'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={17}
                    className={`transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                      isActive ? 'text-white' : 'text-muted group-hover:text-text'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-3 bg-surface/30">
          <div className="flex items-center justify-between px-2">
            <ThemeToggle showLabel />
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted hover:text-danger hover:bg-red-500/10 transition-colors"
              title="Sign out of account"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
          <Link
            to={isAdmin ? '/admin/profile' : '/user/profile'}
            className="flex items-center gap-3 rounded-xl bg-card border border-border p-2.5 shadow-sm hover:border-primary/40 transition-colors"
          >
            <Avatar user={user} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-text">{user?.name}</p>
              <p className="truncate text-[11px] text-muted capitalize">{user?.role} Account</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* ---------------- Right Content Area Wrapper (Offset by lg:pl-64) ---------------- */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* ---------------- Top Navbar Header ---------------- */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/85 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
          {/* Mobile Brand / Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-text hover:bg-surface-hover transition-colors"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <Brand />
          </div>

          {/* Desktop Breadcrumb Navigation */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium">
            {getBreadcrumb()}
          </div>

          {/* Desktop Global Live Search Bar */}
          <div className="hidden sm:flex items-center flex-1 max-w-md mx-6 relative" ref={searchContainerRef}>
            <form onSubmit={handleGlobalSearch} className="relative w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={isAdmin ? "Search quizzes, students... (Press /)" : "Search quizzes, subjects... (Press /)"}
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                className="input-base pl-9 pr-10 py-1.5 h-9 text-xs"
              />
              {searchLoading ? (
                <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
              ) : (
                <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted bg-surface px-1.5 py-0.5 rounded border border-border select-none">
                  /
                </kbd>
              )}
            </form>

            {/* Live Search Auto-suggest Dropdown */}
            {searchFocused && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-apple-lg p-3 z-50 animate-pop-in space-y-3 max-h-96 overflow-y-auto">
                {searchLoading && !hasResults ? (
                  <div className="py-6 flex items-center justify-center gap-2 text-xs text-muted">
                    <Loader2 size={15} className="animate-spin text-primary" /> Searching...
                  </div>
                ) : !hasResults ? (
                  <div className="py-5 text-center text-xs text-muted">
                    No exact matches found for "<span className="font-bold text-text">{searchQuery}</span>"
                  </div>
                ) : (
                  <>
                    {searchResults.quizzes.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted px-2">
                          Examinations ({searchResults.quizzes.length})
                        </span>
                        {searchResults.quizzes.map((q) => (
                          <button
                            key={q.id}
                            onClick={() => handleSelectQuiz(q.id)}
                            className="w-full p-2 rounded-xl text-left hover:bg-surface flex items-center justify-between gap-3 group transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-text group-hover:text-primary transition-colors truncate">
                                {q.title}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-muted mt-0.5">
                                <span className="font-semibold text-primary">{q.category}</span>
                                <span>·</span>
                                <span>{q.questionCount || (q.questionIds ? q.questionIds.length : 0)} Qs</span>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                              Open <ArrowRight size={12} />
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.students.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted px-2">
                          Students ({searchResults.students.length})
                        </span>
                        {searchResults.students.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => handleSelectStudent(s.id)}
                            className="w-full p-2 rounded-xl text-left hover:bg-surface flex items-center justify-between gap-3 group transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-text group-hover:text-primary transition-colors truncate">
                                {s.name}
                              </p>
                              <p className="text-[10px] text-muted truncate">{s.email}</p>
                            </div>
                            <span className="text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                              View <ArrowRight size={12} />
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <div className="pt-2 border-t border-border">
                  <button
                    onClick={handleGlobalSearch}
                    className="w-full text-center text-xs font-bold text-primary hover:underline py-1"
                  >
                    View all results for "{searchQuery}" →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="sm:hidden grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-text hover:bg-surface-hover transition-colors"
              aria-label="Toggle search"
            >
              <Search size={16} />
            </button>

            <ThemeToggle />

            {/* Admin Notification Bell */}
            {isAdmin && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-text hover:bg-surface-hover transition-colors"
                  aria-label="View notifications"
                  title="Notifications"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-black text-white shadow-sm ring-2 ring-card">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Popover */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 rounded-2xl bg-card border border-border shadow-apple-lg p-3 sm:p-4 space-y-3 z-50 animate-pop-in">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <div className="flex items-center gap-1.5">
                        <Bell size={15} className="text-primary" />
                        <span className="font-extrabold text-sm text-text">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <CheckCircle2 size={12} /> Mark all
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {notifs.length === 0 ? (
                        <p className="text-xs text-muted text-center py-6">No recent notifications.</p>
                      ) : (
                        notifs.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl border text-xs transition-colors ${
                              n.isRead
                                ? 'bg-surface/30 border-border text-text-secondary'
                                : 'bg-primary/5 border-primary/25 text-text font-medium'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-bold text-text truncate">{n.title}</p>
                              <span className="text-[10px] text-muted shrink-0">
                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
                      <Link
                        to="/admin/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="font-bold text-primary hover:underline text-xs"
                      >
                        View All Notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface transition-colors"
                aria-label="User menu"
              >
                <Avatar user={user} />
                <ChevronDown size={14} className="text-muted hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-apple-lg p-2 space-y-1 z-50 animate-pop-in">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="font-bold text-xs text-text truncate">{user?.name}</p>
                    <p className="text-[11px] text-muted truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {user?.role}
                    </span>
                  </div>

                  <Link
                    to={isAdmin ? '/admin/profile' : '/user/profile'}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text hover:bg-surface transition-colors"
                  >
                    <UserIcon size={14} className="text-muted" /> Profile
                  </Link>

                  <Link
                    to={isAdmin ? '/admin/settings' : '/user/settings'}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text hover:bg-surface transition-colors"
                  >
                    <SettingsIcon size={14} className="text-muted" /> Settings
                  </Link>

                  <div className="pt-1 border-t border-border">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-danger hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Search Overlay Input */}
        {mobileSearchOpen && (
          <div className="sm:hidden sticky top-16 z-20 bg-card border-b border-border p-3 animate-fade-in">
            <form onSubmit={handleGlobalSearch} className="relative w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder={isAdmin ? "Search quizzes, students..." : "Search available quizzes..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="input-base pl-9 pr-4 py-1.5 h-9 text-xs"
              />
            </form>
          </div>
        )}

        {/* ---------------- Mobile Sidebar Drawer ---------------- */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setOpen(false)}
            />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-card border-r border-border p-4 shadow-apple-lg z-10 animate-pop-in">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <Brand />
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl bg-surface text-text"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4 space-y-1">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'text-text-secondary hover:bg-surface hover:text-text'
                      }`
                    }
                  >
                    <item.icon size={17} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="pt-4 border-t border-border space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 text-danger p-2.5 text-xs font-bold"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- Main Content Area ---------------- */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          <Outlet />
        </main>

        {/* ---------------- Mobile Bottom Navigation Bar ---------------- */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-xl border-t border-border z-30 flex items-center justify-around px-2 py-2 shadow-apple">
          {bottomBarNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition-colors ${
                  isActive ? 'text-primary' : 'text-muted hover:text-text'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold text-muted hover:text-text"
          >
            <Menu size={18} />
            <span>More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}