import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  Bell,
  Clock as ClockIcon,
  Bot as BotIcon,
  AlertTriangle,
  Trash2,
  RefreshCw,
  CheckCircle,
  Mail,
} from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { cn } from '../lib/utils.js';

const TYPE_ICONS = {
  new_message: Mail,
  new_enquiry: ClockIcon,
  unanswered: AlertTriangle,
  ai_status: BotIcon,
  system: CheckCircle,
  broadcast: Bell,
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const [data, count] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ]);
      setNotifications(data.notifications || []);
      setUnreadCount(count.count || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      loadNotifications();
    } catch (err) {
      console.error('Mark read failed', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      loadNotifications();
    } catch (err) {
      console.error('Mark all read failed', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      loadNotifications();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const TYPE_LABELS = {
    new_message: 'New Message',
    new_enquiry: 'New Enquiry',
    unanswered: 'Unanswered',
    ai_status: 'AI Status',
    system: 'System',
    broadcast: 'Broadcast',
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Stay on top of new messages, enquiries, and system alerts.
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={loadNotifications}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border',
                filter === f
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              )}
            >
              {f === 'all' ? 'All' : f === 'unread' ? `Unread (${unreadCount})` : 'Read'}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            type="notifications"
            title="No notifications"
            subtitle={filter === 'unread' ? 'All caught up!' : 'No notifications found.'}
            actionLabel="Refresh"
            onAction={loadNotifications}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => (
              <Card
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={cn(
                  'cursor-pointer p-4 transition-colors border',
                  !n.read
                    ? 'bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )}
              >
                <div className="flex items-start gap-3">
                  {(() => {
                    const Icon = TYPE_ICONS[n.type] || Bell;
                    return (
                      <div className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                        n.type === 'new_message' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                        n.type === 'ai_status' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                        n.type === 'unanswered' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium {cn(!n.read && 'text-slate-900 dark:text-white', n.read && 'text-slate-600 dark:text-slate-400')}">
                        {TYPE_LABELS[n.type] || n.type}
                      </h4>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {n.body}
                    </p>
                    {n.conversationId && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Conversation #{n.conversationId}
                      </p>
                    )}
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-brand-600" />
                  )}
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  {!n.read && (
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markRead(n.id); }}>
                      Mark read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

