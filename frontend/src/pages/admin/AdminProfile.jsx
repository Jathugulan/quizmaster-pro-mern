import { useState, useEffect } from 'react';
import { Camera, Save, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { fileToDataUrl } from '../../utils/image.js';

export default function AdminProfile() {
  const { user, updateUser, changePassword } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
  });
  const [photo, setPhoto] = useState(user?.photo || '');
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

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

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await fileToDataUrl(file));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateUser({ name: form.name.trim(), email: form.email.trim(), photo });
      toast.success('Administrator profile updated successfully.');
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
      toast.success('Administrator password changed successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Administrator Profile</h1>
        <p className="text-sm text-muted">Manage system administrator credentials and access configuration.</p>
      </div>

      <div className="apple-card p-6 flex flex-col sm:flex-row items-center gap-6">
        {photo ? (
          <img src={photo} alt="Admin" className="h-24 w-24 rounded-2xl object-cover ring-2 ring-primary shadow-sm" />
        ) : (
          <div className="grid h-24 w-24 place-items-center rounded-2xl bg-primary/10 text-3xl font-black text-primary shadow-sm">
            {(user?.name || 'A').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold flex items-center justify-center sm:justify-start gap-2">
            {user?.name} <span className="chip badge-primary"><ShieldCheck size={12} /> System Admin</span>
          </h2>
          <p className="text-sm text-muted">@{user?.username} · {user?.email}</p>
        </div>
        <label className="btn-outline-grad cursor-pointer shrink-0">
          <Camera size={16} /> Change photo
          <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
        </label>
      </div>

      <div className="apple-card p-6 space-y-4">
        <h2 className="text-lg font-bold">Account details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-base">Full name</label>
            <input className="input-base" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-base">Username (Read-only)</label>
            <input className="input-base opacity-60 cursor-not-allowed" value={form.username} disabled />
          </div>
          <div className="sm:col-span-2">
            <label className="label-base">Email</label>
            <input type="email" className="input-base" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary-grad">
          <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="apple-card p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <KeyRound size={18} className="text-primary" /> Change password
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label-base">Current password</label>
            <input type="password" className="input-base" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} />
          </div>
          <div>
            <label className="label-base">New password</label>
            <input type="password" className="input-base" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
          </div>
          <div>
            <label className="label-base">Confirm new</label>
            <input type="password" className="input-base" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
          </div>
        </div>
        <button onClick={doChangePassword} disabled={changingPw} className="btn-secondary">
          <KeyRound size={16} /> {changingPw ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </div>
  );
}