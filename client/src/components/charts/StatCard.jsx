import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Activity,
  Bot,
  Users,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { cn } from '../../lib/utils.js';

const ICONS = {
  total: Users,
  active: Activity,
  ai: Bot,
  human: MessageCircle,
  unread: Clock,
  leads: Users,
};

const COLOR_MAP = {
  total: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  active: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
  ai: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
  human: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  unread: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  leads: 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20',
};

export function StatCard({ title, value, subtitle, type = 'total', trend, trendLabel }) {
  const Icon = ICONS[type] || Users;
  const color = COLOR_MAP[type] || COLOR_MAP.total;
  const isPositive = trend && trend >= 0;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend !== undefined && (
        <p className={cn('text-xs font-medium mt-2 flex items-center gap-1', isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(Number(trend || 0))}% {trendLabel || 'change'}
        </p>
      )}
    </div>
  );
}
