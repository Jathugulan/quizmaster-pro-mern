import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
let toastId = 0;

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TINTS = {
  success: 'text-emerald-500 border-emerald-500/30',
  error: 'text-red-500 border-red-500/30',
  info: 'text-indigo-500 border-indigo-500/30',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'success', title) => {
      const id = ++toastId;
      setToasts((t) => [...t, { id, message, type, title }]);
      clearTimeout(toastId._t);
      setTimeout(() => dismiss(id), 4000);
      return id;
    },
    [dismiss]
  );

  const api = {
    toast: push,
    success: (m, t) => push(m, 'success', t),
    error: (m, t) => push(m, 'error', t),
    info: (m, t) => push(m, 'info', t),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div
              key={t.id}
              className={`card-base pointer-events-auto flex items-start gap-3 px-4 py-3 animate-toast-in min-w-[18rem] max-w-sm border ${
                TINTS[t.type] || TINTS.info
              }`}
              role="status"
            >
              <Icon size={20} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                {t.title && <p className="text-sm font-semibold">{t.title}</p>}
                <p className="text-sm text-muted">{t.message}</p>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-muted hover:text-text transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}