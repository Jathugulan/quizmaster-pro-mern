import { useState, useEffect } from 'react';
import { Camera, Save, KeyRound, BarChart3, Award, ClipboardList, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { attemptApi } from '../../api/attemptApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { fileToDataUrl } from '../../utils/image.js';

export default function UserProfile() {
  const { user, updateUser, changePassword } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
  });
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [photo, setPhoto] = useState(user?.photo || '');
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const [stats, setStats] = useState({ total: 0, passed: 0, avg: 0 });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
      });
      setPhoto(user.photo || '');
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const res = await attemptApi.getMyAttempts({ limit: 100 });
        const mine = res?.items || [];
        const total = mine.length;
        const passed = mine.filter((a) => a.passed).length;
        const avg = total ? mine.reduce((s, a) => s + (a.result?.percent || 0), 0) / total : 0;
        if (isMounted) setStats({ total, passed, avg });
      } catch (e) {
        console.warn('[Profile] Failed to load attempt statistics:', e);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      setPhoto(url);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateUser({ name: form.name.trim(), email: form.email.trim(), photo });
      toast.success('Account profile updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const doChangePassword = async () => {
    if (pwd.next !== pwd.confirm) return toast.error('New passwords do not match.');
    if (pwd.next.length < 6) return toast.error('Password must be at least 6 characters.');
    if (!pwd.current) return toast.error('Please enter your current password.');

    setChangingPw(true);
    try {
      await changePassword({ currentPassword: pwd.current, newPassword: pwd.next });
      setPwd({ current: '', next: '', confirm: '' });
      toast.success('Password changed successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-7 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Student Profile</h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Manage your personal details, verified credentials, and security password.
        </p>
      </div>

      {/* Stats Summary Bento Bar */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="apple-card p-4 sm:p-5 text-center">
          <ClipboardList className="mx-auto mb-1.5 text-primary" size={20} />
          <div className="text-xl sm:text-2xl font-black text-text">{stats.total}</div>
          <div className="text-[11px] font-bold text-text-secondary">Total Exams</div>
        </div>
        <div className="apple-card p-4 sm:p-5 text-center">
          <Award className="mx-auto mb-1.5 text-amber-500" size={20} />
          <div className="text-xl sm:text-2xl font-black text-emerald-500">{stats.passed}</div>
          <div className="text-[11px] font-bold text-text-secondary">Passed</div>
        </div>
        <div className="apple-card p-4 sm:p-5 text-center">
          <BarChart3 className="mx-auto mb-1.5 text-primary" size={20} />
          <div className="text-xl sm:text-2xl font-black text-primary">{stats.avg.toFixed(0)}%</div>
          <div className="text-[11px] font-bold text-text-secondary">Average Score</div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="apple-card p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-black text-text tracking-tight flex items-center gap-2">
          <ShieldCheck size={20} className="text-primary" /> Personal Information
        </h2>

        <div className="flex items-center gap-4 pb-2">
          {photo ? (
            <img src={photo} alt={form.name} className="h-20 w-20 rounded-2xl object-cover ring-2 ring-primary shadow-sm" />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-primary/10 text-primary font-black text-2xl shadow-sm">
              {form.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <label className="btn-outline-grad cursor-pointer text-xs h-9 px-3.5">
            <Camera size={14} /> Change Avatar
            <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-base">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input-base"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="label-base">Username (Read-only)</label>
            <input
              type="text"
              value={form.username}
              disabled
              className="input-base opacity-60 cursor-not-allowed"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-base">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input-base"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <button onClick={saveProfile} disabled={saving} className="btn-primary-grad px-5">
          <Save size={15} /> {saving ? 'Saving Changes…' : 'Save Profile Changes'}
        </button>
      </div>

      {/* Security Form */}
      <div className="apple-card p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-black text-text tracking-tight flex items-center gap-2">
          <KeyRound size={20} className="text-primary" /> Security &amp; Password
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label-base">Current Password</label>
            <input
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
              className="input-base"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="label-base">New Password</label>
            <input
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
              className="input-base"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="label-base">Confirm Password</label>
            <input
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
              className="input-base"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button onClick={doChangePassword} disabled={changingPw} className="btn-secondary px-5">
          <KeyRound size={15} /> {changingPw ? 'Updating Password…' : 'Update Security Password'}
        </button>
      </div>
    </div>
  );
}