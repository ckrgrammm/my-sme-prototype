import { cn } from '../../lib/utils.js';

export default function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-card text-card-foreground shadow-card', className)}
      {...props}
    />
  );
}
