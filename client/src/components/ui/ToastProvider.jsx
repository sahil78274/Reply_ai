import { useEffect } from 'react';
import { useStore } from '../../store.js';
import { ToastContainer } from './Toast.jsx';

export function ToastProvider() {
  const { toasts, removeToast } = useStore();

  useEffect(() => {
    const timers = toasts.map((t) => {
      if (t.persistent) return null;
      return setTimeout(() => removeToast(t.id), t.duration ?? 5000);
    });
    return () => timers.forEach((timer) => timer && clearTimeout(timer));
  }, [toasts, removeToast]);

  return <ToastContainer toasts={toasts} onDismiss={removeToast} />;
}
