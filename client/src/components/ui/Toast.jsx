import { useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';

const variants = {
  success: 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
  error: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
  info: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
};

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: Info,
  info: Info,
};

export function Toast({ type = 'info', title, message, onClose, duration = 5000 }) {
  const Icon = icons[type];
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-sm animate-in slide-in-from-right-2 duration-300',
        variants[type]
      )}
    >
      <div className="flex-shrink-0 w-5 h-5 mt-0.5">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="text-sm font-semibold leading-tight">{title}</h4>}
        {message && <p className="text-xs text-opacity-80 mt-0.5 leading-relaxed">{message}</p>}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-lg p-1.5 hover:bg-current/10 text-current transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto w-full max-w-sm">
          <Toast
            type={t.type}
            title={t.title}
            message={t.message}
            onClose={() => onDismiss(t.id)}
          />
        </div>
      ))}
    </div>
  );
}

export const useToast = () => {
  // Hook is a placeholder; actual state lives in zustand store imported by consumers
  return { add: () => {}, dismiss: () => {} };
};

export const Skeleton = ({ className = '', width = '100%', height = '1em' }) => (
  <div
    className={cn(
      'animate-pulse rounded-md bg-slate-200 dark:bg-slate-800',
      className
    )}
    style={{ width, height }}
  />
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} height="0.875rem" />
    ))}
  </div>
);
