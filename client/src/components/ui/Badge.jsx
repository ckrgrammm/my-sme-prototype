import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

export const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold whitespace-nowrap',
  {
    variants: {
      variant: {
        muted: 'bg-muted text-muted-foreground',
        success: 'bg-success/15 text-success',
        warning: 'bg-warning/15 text-warning',
        destructive: 'bg-destructive/15 text-destructive',
        primary: 'bg-primary/15 text-primary',
      },
    },
    defaultVariants: { variant: 'muted' },
  }
);

export default function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
