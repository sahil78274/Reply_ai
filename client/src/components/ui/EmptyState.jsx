import { MessageCircle, Inbox, Users, AlertCircle, Bot, FileText } from 'lucide-react';
import { Button } from './Button.jsx';
import { cn } from '../../lib/utils.js';

const icons = {
  conversations: MessageCircle,
  customers: Users,
  leads: Inbox,
  knowledge: FileText,
  notifications: BellIcon,
  default: MessageCircle,
};

function BellIcon(props) {
  return <AlertCircle {...props} />;
}

export function EmptyState({
  type = 'default',
  title,
  subtitle,
  actionLabel,
  onAction,
  className = '',
}) {
  const Icon = icons[type];
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs">{subtitle}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
