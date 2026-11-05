import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  Activity,
  Download,
  Clock as ClockIcon,
  Bot as BotIcon,
  UserRound,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import {
  ConversationChart,
  AIVsHumanChart,
  LeadStatusChart,
  StatCard,
} from '../components/charts/index.jsx';
import { cn } from '../lib/utils.js';

export default function Analytics() {
  const [range, setRange] = useState('7d');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/conversations/stats'),
      api.get('/conversations'),
    ]).then(([s, c]) => {
      setStats(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [range]);

  const rangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
        <Activity className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Analytics & Reports</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track conversation performance and AI effectiveness.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {}}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Range selector */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-slate-500 dark:text-slate-400">Time range</span>
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1">
            {rangeOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => setRange(o.value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm transition-colors',
                  range === o.value
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-6">
          <StatCard title="Total Conversations" value={stats?.totalConversations ?? 0} type="total" trend={12} trendLabel="vs last week" />
          <StatCard title="Messages Today" value={stats?.messagesReceivedToday ?? 0} type="total" trend={-5} trendLabel="vs yesterday" />
          <StatCard title="AI Replies" value={stats?.aiRepliesSent ?? 0} type="ai" trend={18} trendLabel="vs last week" />
          <StatCard title="Human Replies" value={stats?.humanHandledConversations ?? 0} type="human" trend={-10} trendLabel="vs last week" />
          <StatCard title="Active Chats" value={stats?.activeConversations ?? 0} type="active" trend={8} trendLabel="vs last week" />
          <StatCard title="Unanswered" value={stats?.unansweredMessages ?? 0} type="unread" trend={-15} trendLabel="vs yesterday" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <ConversationChart />
          </div>
          <div className="lg:col-span-1">
            <LeadStatusChart />
          </div>
          <div className="lg:col-span-2">
            <AIVsHumanChart />
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Card>
            <CardBody className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">AI Response Rate</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {(stats?.aiRepliesSent && stats?.messagesReceivedToday ? Math.round((stats.aiRepliesSent / Math.max(stats.messagesReceivedToday, 1)) * 100) : 0)}%
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Of incoming messages handled by AI automatically.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Avg. Response Time</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">2.4s</div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Average time from customer message to AI reply.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <UserRound className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Human Takeover Rate</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {(stats?.humanHandledConversations && stats?.totalConversations ? Math.round((stats.humanHandledConversations / Math.max(stats.totalConversations, 1)) * 100) : 0)}%
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Conversations requiring manual intervention.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

