import { useState } from 'react';
import { Bell, Eye, LayoutGrid, Save, Palette, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getUserPrefs, saveUserPrefs, getSettings } from '../../utils/storage.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';

export default function UserSettings() {
  const { user } = useAuth();
  const toast = useToast();
  const { theme, isDark } = useTheme();
  const [prefs, setPrefs] = useState(() => getUserPrefs(user?.id));
  const settings = getSettings();

  const set = (k) => (v) => setPrefs((p) => ({ ...p, [k]: v }));
  const save = () => {
    saveUserPrefs(user?.id, prefs);
    toast.success('Preferences saved successfully');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-7 animate-fade-in pb-12">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
          <Sparkles size={13} /> Preferences
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Platform Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Configure theme, accessibility, and examination notifications.</p>
      </div>

      {/* Appearance Section */}
      <div className="apple-card p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-black text-text tracking-tight flex items-center gap-2">
          <Palette size={18} className="text-primary" /> Appearance &amp; Display
        </h2>
        <div className="flex items-center justify-between rounded-2xl border border-border bg-surface/50 p-4">
          <div>
            <p className="text-sm font-bold text-text">System Theme</p>
            <p className="text-xs text-text-secondary mt-0.5">Toggle between Apple HIG light mode and high-contrast dark theme</p>
          </div>
          <ThemeToggle showLabel />
        </div>
      </div>

      {/* Notifications Section */}
      <div className="apple-card p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-black text-text tracking-tight flex items-center gap-2">
          <Bell size={18} className="text-primary" /> Notifications
        </h2>
        <ToggleRow
          icon={Bell}
          title="Email Notifications"
          description="Receive an email notification when examination results and certificates are available"
          value={prefs.emailNotifications}
          onChange={set('emailNotifications')}
        />
      </div>

      {/* Learning & Experience Section */}
      <div className="apple-card p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-black text-text tracking-tight flex items-center gap-2">
          <Eye size={18} className="text-primary" /> Examination Preferences
        </h2>
        <ToggleRow
          icon={Eye}
          title="Contextual Hints"
          description="Display helpful tips and hints during practice examinations"
          value={prefs.showHints}
          onChange={set('showHints')}
        />
        <ToggleRow
          icon={LayoutGrid}
          title="Compact Card View"
          description="Display denser quiz cards for streamlined browsing"
          value={prefs.compactCards}
          onChange={set('compactCards')}
        />
      </div>

      <button onClick={save} className="btn-primary-grad px-6 h-11 text-sm font-bold">
        <Save size={16} /> Save All Preferences
      </button>
    </div>
  );
}

function ToggleRow({ icon: Icon, title, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-surface/50 p-4 gap-4">
      <div className="flex items-start gap-3">
        <Icon size={18} className="text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-text">{title}</p>
          {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-300 ${
          value ? 'bg-primary shadow-sm' : 'bg-surface-hover border border-border'
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transform transition-all duration-300 ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}