import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Apple HIG Control Center styled animated theme toggle.
 * Features a tactile iOS-style switch with smooth spring movement,
 * high-contrast glyphs, and distinct light/dark states.
 */
export default function ThemeToggle({ className = '', showLabel = false }) {
  const { theme, toggle, isDark } = useTheme();

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`group relative inline-flex items-center gap-2 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      <div className="relative inline-flex h-8 w-[60px] shrink-0 cursor-pointer items-center rounded-full p-1 transition-all duration-300 ease-out bg-surface border border-border group-hover:border-primary/40 shadow-inner">
        {/* Track ambient background */}
        <div
          className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
            isDark ? 'bg-primary/20 opacity-100' : 'bg-amber-500/10 opacity-0'
          }`}
        />

        {/* Sun Icon (Left) */}
        <div
          className={`absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 pointer-events-none ${
            isDark ? 'opacity-30 scale-75 rotate-45 text-muted' : 'opacity-100 scale-100 rotate-0 text-amber-500'
          }`}
        >
          <Sun size={14} strokeWidth={2.4} />
        </div>

        {/* Moon Icon (Right) */}
        <div
          className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 pointer-events-none ${
            isDark ? 'opacity-100 scale-100 rotate-0 text-primary-light' : 'opacity-30 scale-75 -rotate-45 text-muted'
          }`}
        >
          <Moon size={13} strokeWidth={2.4} />
        </div>

        {/* Apple HIG Slider Knob */}
        <div
          className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transform transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${
            isDark
              ? 'translate-x-[28px] bg-gradient-to-b from-[#242938] to-[#171b26] border border-white/15 text-primary-light shadow-lg'
              : 'translate-x-0 bg-white border border-black/5 text-amber-500 shadow-sm'
          }`}
        >
          {isDark ? (
            <Moon size={12} strokeWidth={2.5} className="text-primary-light" />
          ) : (
            <Sun size={13} strokeWidth={2.5} className="text-amber-500" />
          )}
        </div>
      </div>

      {showLabel && (
        <span className="text-xs font-semibold text-text-secondary">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}