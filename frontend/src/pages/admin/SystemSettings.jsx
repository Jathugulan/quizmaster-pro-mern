import { useState, useEffect } from 'react';
import { Clock, Save, RefreshCw, Shuffle, Eye, Repeat, Users, Image as ImageIcon, Sparkles } from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';

export default function SystemSettings() {
  const toast = useToast();
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const res = await adminApi.getSettings();
        if (isMounted && res) {
          setS({
            quiz: res.quiz || {
              defaultDurationSeconds: 600,
              defaultPassingScore: 50,
              defaultRandomize: false,
              defaultShuffleAnswers: false,
              defaultShowExplanations: true,
              defaultAllowRetake: true,
            },
            users: res.users || {
              allowRegistration: true,
              allowPhotoUpload: true,
            },
            appearance: res.appearance || {
              accent: '#4F46E5',
            },
          });
        }
      } catch (err) {
        console.warn('[SystemSettings] Failed to fetch server settings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const setQuiz = (k) => (v) => setS((p) => ({ ...p, quiz: { ...p.quiz, [k]: v } }));
  const setUsers = (k) => (v) => setS((p) => ({ ...p, users: { ...p.users, [k]: v } }));
  const setAppearance = (k) => (v) => setS((p) => ({ ...p, appearance: { ...p.appearance, [k]: v } }));

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings(s);
      toast.success('System configuration saved to backend.');
    } catch (err) {
      toast.error(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !s) return <PageSkeleton />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">System Settings</h1>
        <p className="text-sm text-muted">Global configuration defaults for examinations, candidate policies, and UI styling.</p>
      </div>

      <div className="apple-card p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Clock size={18} className="text-primary" /> Examination Defaults
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-base">Default Duration (Seconds)</label>
            <input
              type="number"
              min="60"
              className="input-base"
              value={s.quiz.defaultDurationSeconds}
              onChange={(e) => setQuiz('defaultDurationSeconds')(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label-base">Default Pass Score (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="input-base"
              value={s.quiz.defaultPassingScore}
              onChange={(e) => setQuiz('defaultPassingScore')(Number(e.target.value))}
            />
          </div>
        </div>
        <ToggleRow icon={RefreshCw} label="Randomize questions by default" checked={s.quiz.defaultRandomize} onChange={setQuiz('defaultRandomize')} />
        <ToggleRow icon={Shuffle} label="Shuffle answer choices by default" checked={s.quiz.defaultShuffleAnswers} onChange={setQuiz('defaultShuffleAnswers')} />
        <ToggleRow icon={Eye} label="Display solution explanations by default" checked={s.quiz.defaultShowExplanations} onChange={setQuiz('defaultShowExplanations')} />
        <ToggleRow icon={Repeat} label="Allow retakes by default" checked={s.quiz.defaultAllowRetake} onChange={setQuiz('defaultAllowRetake')} />
      </div>

      <div className="apple-card p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Users size={18} className="text-primary" /> Registration &amp; Student Policies
        </h2>
        <ToggleRow icon={Users} label="Allow new self-registrations" checked={s.users.allowRegistration} onChange={setUsers('allowRegistration')} />
        <ToggleRow icon={ImageIcon} label="Allow candidate profile photo uploads" checked={s.users.allowPhotoUpload} onChange={setUsers('allowPhotoUpload')} />
      </div>

      <div className="apple-card p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Sparkles size={18} className="text-primary" /> Global Theme Styling
        </h2>
        <div>
          <label className="label-base">Accent Brand Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="h-10 w-16 rounded-xl border border-border cursor-pointer"
              value={s.appearance.accent}
              onChange={(e) => setAppearance('accent')(e.target.value)}
            />
            <span className="text-sm text-text font-mono font-bold">{s.appearance.accent}</span>
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary-grad">
        <Save size={16} /> {saving ? 'Saving Settings…' : 'Save System Settings'}
      </button>
    </div>
  );
}

function ToggleRow({ icon: Icon, label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between p-3 rounded-2xl border border-border bg-surface/50 cursor-pointer">
      <span className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-text">
        <Icon size={16} className="text-primary" /> {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary rounded cursor-pointer"
      />
    </label>
  );
}