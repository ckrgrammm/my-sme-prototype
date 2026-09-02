import { cn } from '../../lib/utils.js';

export default function Switch({ checked, onCheckedChange, className }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6.5 w-11 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-success' : 'bg-muted',
        className
      )}
      style={{ height: '1.6rem' }}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
        )}
      />
    </button>
  );
}
