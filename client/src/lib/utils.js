import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNowStrict, format, isToday, isYesterday, parseISO } from 'date-fns';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const d = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
  return format(d, 'hh:mm a');
};

export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const d = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
};

export const formatRelative = (timestamp) => {
  if (!timestamp) return '';
  const d = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
  return formatDistanceToNowStrict(d, { addSuffix: true });
};

export const initials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const sourceLabel = (source) => {
  const labels = {
    whatsapp: 'WhatsApp',
    ai: 'AI',
    manual: 'Manual',
    demo: 'Demo',
    system: 'System',
  };
  return labels[source] || source;
};
