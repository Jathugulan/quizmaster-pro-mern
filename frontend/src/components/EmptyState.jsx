import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description,
  action,
  children,
}) {
  return (
    <div className="apple-card flex flex-col items-center justify-center gap-3.5 px-6 py-16 text-center animate-fade-in border border-border">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-surface text-primary border border-border shadow-sm">
        <Icon size={28} strokeWidth={2} />
      </div>
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-black text-text tracking-tight">{title}</h3>
        {description && <p className="max-w-md text-xs sm:text-sm text-text-secondary leading-relaxed">{description}</p>}
      </div>
      {(children || action) && <div className="mt-2 flex flex-wrap gap-2.5 justify-center">{children || action}</div>}
    </div>
  );
}