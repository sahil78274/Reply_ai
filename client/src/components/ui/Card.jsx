import { cn } from '../../lib/utils.js';

export const Card = ({ className, children, ...props }) => (
  <div
    className={cn(
      'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardBody = ({ className, children }) => (
  <div className={cn('p-5', className)}>{children}</div>
);

export const CardHeader = ({ className, children }) => (
  <div className={cn('p-5 border-b border-slate-200 dark:border-slate-800', className)}>{children}</div>
);
