import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Apple HIG Sheet / Modal dialog with frosted glass overlay, smooth scale, and spring escape.
 */
function Modal({
  open,
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md', // sm | md | lg | xl
  hideClose = false,
}) {
  const showModal = Boolean(open ?? isOpen);

  useEffect(() => {
    if (!showModal) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    // Lock body scroll while open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [showModal, onClose]);

  if (!showModal) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-4xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizes[size] || sizes.md} bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-apple-lg animate-pop-in max-h-[92vh] flex flex-col overflow-hidden`}
      >
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/40">
            <h3 className="text-base sm:text-lg font-black text-text tracking-tight">{title}</h3>
            {!hideClose && (
              <button
                onClick={onClose}
                className="h-8 w-8 grid place-items-center rounded-full bg-surface text-muted hover:bg-surface-hover hover:text-text transition-colors"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-border bg-surface/30 flex flex-wrap gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Confirmation modal for destructive / consequential actions. */
export function ConfirmModal({
  open,
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  danger = true,
  isDangerous,
}) {
  const showModal = Boolean(open ?? isOpen);
  const isDestructive = isDangerous !== undefined ? isDangerous : danger;

  return (
    <Modal
      open={showModal}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn-secondary text-xs h-9 px-4 font-bold" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`btn-primary-grad text-xs h-9 px-4 font-bold ${
              isDestructive ? '!bg-gradient-to-b !from-red-500 !to-rose-600 !text-white' : ''
            }`}
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
    </Modal>
  );
}

export { Modal };
export default Modal;