import React from 'react';

/**
 * Production-ready Google Authentication Button adhering to official Google Brand Guidelines.
 */
export default function GoogleAuthButton({
  onClick,
  loading = false,
  text = 'Continue with Google',
  disabled = false,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      aria-label={text}
      className={`btn-secondary w-full justify-center text-xs sm:text-sm min-h-[44px] sm:min-h-[48px] font-bold flex items-center gap-3 border border-border shadow-sm hover:bg-surface-hover/80 active:scale-[0.99] transition-all select-none disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2 text-text">
          <span className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin shrink-0" />
          <span>Connecting to Google...</span>
        </span>
      ) : (
        <>
          {/* Official Multi-Color Google G SVG Icon */}
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5 shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.36 7.37 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span className="text-text font-bold whitespace-nowrap">{text}</span>
        </>
      )}
    </button>
  );
}
