import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatClock } from '../utils/scoreCalculator.js';

/**
 * Apple HIG countdown timer with alert states.
 */
export default function Timer({ expiresAt, onExpire, paused = false }) {
  const [remaining, setRemaining] = useState(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
  const firedRef = useRef(false);
  const expiresRef = useRef(expiresAt);
  expiresRef.current = expiresAt;

  useEffect(() => {
    setRemaining(Math.max(0, Math.floor((expiresRef.current - Date.now()) / 1000)));
    if (paused) return undefined;
    const id = setInterval(() => {
      const left = expiresRef.current - Date.now();
      const secLeft = Math.max(0, Math.floor(left / 1000));
      setRemaining(secLeft);
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true;
        clearInterval(id);
        onExpire?.();
      }
    }, 250);
    return () => clearInterval(id);
  }, [paused, onExpire]);

  const critical = remaining < 61;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 font-mono text-sm sm:text-base font-black tabular-nums transition-all select-none shadow-sm ${
        critical
          ? 'border-danger/40 bg-danger-soft text-danger animate-pulse ring-1 ring-danger/40'
          : 'border-border bg-card text-text'
      }`}
      role="timer"
      aria-label="Remaining time"
    >
      <Clock size={16} className={critical ? 'text-danger' : 'text-primary'} />
      <span>{formatClock(remaining)}</span>
    </div>
  );
}