import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { api } from '../services/api.js';
import {
  ArrowRight,
  Users,
  MessageCircle,
  Bot,
  UserRound,
  Clock,
  AlertCircle,
  Activity,
  CheckCheck,
  ShieldAlert,
  Bot as BotIcon,
  RefreshCw as RefreshIcon,
} from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { formatRelative } from '../lib/utils.js';
import { cn } from '../lib/utils.js';
import {
  ConversationChart,
  AIVsHumanChart,
  LeadStatusChart,
  StatCard,
} from '../components/charts/index.jsx';

const STATS = [
  {
    label: 'Total Conversations',
    key: 'totalConversations',
    icon: Users,
    color: 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20',
    type: 'total',
  },
  {
    label: 'Messages Received Today',
    key: 'messagesReceivedToday',
    icon: MessageCircle,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    type: 'total',
  },
  {
    label: 'AI Replies Sent',
    key: 'aiRepliesSent',
    icon: Bot,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    type: 'ai',
  },
  {
    label: 'Human Handled',
    key: 'humanHandledConversations',
    icon: UserRound,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
    type: 'human',
  },
  {
    label: 'Active',
    key: 'activeConversations',
    icon: Clock,
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
    type: 'active',
  },
  {
    label: 'Unanswered',
    key: 'unansweredMessages',
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    type: 'unread',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [s, c] = await Promise.all([
        api.get('/conversations/stats'),
        api.get('/conversations'),
      ]);
      setStats(s);
      setRecent((c.conversations || []).slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
        <Activity className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const aiRate = stats?.messagesReceivedToday
    ? Math.round((stats.aiRepliesSent / Math.max(stats.messagesReceivedToday, 1)) * 100)
    : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Welcome back, {user?.name || 'Owner'}. Here is how your WhatsApp automation is performing.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ArrowRight className="w-4 h-4 mr-2" />
              Export leads
            </Button>
            <Button variant="primary" size="sm" onClick={loadStats}>
              <RefreshIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            const value = stats?.[stat.key] ?? 0;
            return (
              <StatCard
                key={stat.label}
                title={stat.label}
                value={value}
                type={stat.type}
                trend={stat.key === 'aiRepliesSent' ? 12 : stat.key === 'unansweredMessages' ? -8 : 5}
                trendLabel="vs last period"
              />
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: AI Automation Status + Recent Conversations */}
          <Card className="lg:col-span-2">
            <CardBody className="p-0">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-white">AI Automation Status</h2>
              </div>
              <div className="px-5 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Automatic AI replies</span>
                  <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', stats?.aiAutomationOn ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300')}>
                    {stats?.aiAutomationOn ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCheck className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400">AI handles FAQs, pricing and common questions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCheck className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400">Complicated queries are escalated to you</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCheck className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400">You can take over or resume AI anytime</span>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Demo data shown. Connect your Meta WhatsApp Cloud API credentials in Settings to go live.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Right: AI Response Rate */}
          <Card>
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">AI Response Rate</h3>
                <Badge variant="secondary">Today</Badge>
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{aiRate}%</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Of {stats?.messagesReceivedToday ?? 0} incoming messages today, {stats?.aiRepliesSent ?? 0} were handled by AI.
              </p>
              <div className="mt-4 h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 transition-all duration-1000"
                  style={{ width: `${Math.min(aiRate, 100)}%` }}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
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

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardBody className="p-0">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900 dark:text-white">Recent Conversations</h2>
                  <Button variant="ghost" size="sm" onClick={loadStats}>
                    <ArrowRight className="w-3 h-3" />
                    View all
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {(recent?.length ? recent : []).map((c) => (
                  <div key={c.id} className="px-5 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold">
                      {c.source === 'demo' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400' : 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'}
                      {c.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.customerName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                        {c.lastMessage || 'No messages yet'}
                        {c.source === 'demo' && <span className="text-amber-500">[demo]</span>}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">{formatRelative(c.lastMessageAt)}</span>
                    {c.unreadCount > 0 && (
                      <Badge variant="secondary" className="h-5 w-5 p-0 text-xs leading-none">
                        {c.unreadCount > 9 ? '9+' : c.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))}
                {!recent?.length && (
                  <div className="px-5 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No recent conversations
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
                      <BotIcon className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900 dark:text-white">
                        AI replied to <span className="font-medium">Rahul Sharma</span> about pricing
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">2 minutes ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}


