import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40 active:opacity-90',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-card hover:brightness-105',
        outline: 'border border-border bg-card text-foreground hover:bg-muted',
        secondary: 'bg-secondary text-secondary-foreground hover:brightness-110',
        ghost: 'bg-transparent text-foreground hover:bg-muted',
        subtle: 'bg-muted text-foreground hover:brightness-95',
      },
      size: {
        default: 'h-12 px-5 text-base',
        sm: 'h-9 px-3.5 text-sm rounded-md',
        lg: 'h-14 px-6 text-lg',
        icon: 'h-9 w-9 rounded-md',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export default function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
