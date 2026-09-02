import { cn } from '../../lib/utils.js';

export function Dialog({ open, onClose, children, className }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center md:p-5"
      onClick={onClose}
    >
      <div
        className={cn(
          'max-h-[80vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]',
          'md:max-h-[min(600px,80vh)] md:rounded-2xl md:border md:border-border md:shadow-popover',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogClose({ onClose }) {
  return (
    <button
      onClick={onClose}
      className="float-right flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"
    >
      ✕
    </button>
  );
}
