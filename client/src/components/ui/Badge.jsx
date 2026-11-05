import { cn } from '../../lib/utils.js';

const variants = {
  default: 'border-transparent bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300',
  secondary: 'border-transparent bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200',
  success: 'border-transparent bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  warning: 'border-transparent bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  danger: 'border-transparent bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  outline: 'border border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400',
};

export const Badge = ({ className, variant = 'default', ...props }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
      variants[variant],
      className
    )}
    {...props}
  />
);
