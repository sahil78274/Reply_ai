import { cn } from '../../lib/utils.js';

export const Input = ({ className, ...props }) => (
  <input
    className={cn(
      'block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-2.5 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all sm:text-sm',
      className
    )}
    {...props}
  />
);
