import { forwardRef } from 'react';
import { cn } from '../../lib/utils.js';

export const Button = forwardRef(({ className, variant = 'primary', size = 'md', disabled, asChild = false, ...props }, ref) => {
  const Comp = asChild ? (props) => <span {...props} /> : 'button';
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-950',
    ghost: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600',
    danger: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 focus-visible:ring-2 focus-visible:ring-red-500',
    outline: 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <Comp
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = 'Button';
