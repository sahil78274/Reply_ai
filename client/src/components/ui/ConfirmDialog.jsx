import { AlertTriangle } from 'lucide-react';
import { Button } from './Button.jsx';
import { cn } from '../../lib/utils.js';

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = 'Confirm action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={cn(
            'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 max-w-md w-full',
            variant === 'danger' && 'border-red-200 dark:border-red-800'
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            {message}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={variant}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Processing…' : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
