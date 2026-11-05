import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, Settings as SettingsIcon, Moon, Sun, Menu as MenuIcon, ShieldAlert, Bot } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { useStore } from '../../store.js';

export function Header({ onMenuClick }) {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const { socket, unreadNotifications, markRead } = useSocket();
  const { setMobileDrawerOpen } = useStore();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur supports-[backdrop-blur]:bg-white/50 dark:supports-[backdrop-blur]:bg-slate-950/50 px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" iconOnly onClick={onMenuClick}>
          <MenuIcon className="w-5 h-5" />
        </Button>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
            RA
          </div>
          <span className="font-semibold text-slate-900 dark:text-white tracking-tight">ReplyAI</span>
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <div className="relative flex-1 w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <InputPlaceholder className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" />
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell
            unread={unreadNotifications}
            onOpenChange={(open) => setNotifOpen(open)}
            open={notifOpen}
          />
          <ThemeToggle />
          <UserProfile user={user} onLogout={logout} />
        </div>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" size="sm" iconOnly onClick={toggle} aria-label="Switch theme">
      {theme === 'light' ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </Button>
  );
}

function UserProfile({ user, onLogout }) {
  return (
    <div className="flex items-center gap-2 ml-2 hidden sm:flex">
      <div className="hidden md:flex flex-col items-end text-right">
        <span className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || 'Owner'}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</span>
      </div>
      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
        {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
      </div>
      <Button variant="danger" size="sm" onClick={onLogout} className="ml-2">
        Sign out
      </Button>
    </div>
  );
}

function NotificationBell({ unread, onOpenChange, open }) {
  const { socket } = useSocket();
  const { markRead, notifications } = useStore();

  const handleMarkRead = () => {
    markRead();
    if (socket) socket.emit('mark:read');
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" iconOnly aria-label="Notifications">
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse" />
        )}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2 z-50">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</span>
              <Button variant="ghost" size="sm" onClick={handleMarkRead} className="px-2">
                Mark all read
              </Button>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-slate-400 text-sm">No notifications</div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.conversationId) {
                      // handled by parent router via context could be added
                    }
                    markRead(n.id);
                  }}
                  className={cn(
                    'flex gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-50 dark:border-slate-700/50 last:border-0',
                    !n.read && 'bg-brand-50 dark:bg-brand-900/10'
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
                    {n.type === 'new_message' ? '💬' : n.type === 'ai_status' ? '🤖' : '📢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-white leading-tight">{n.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.body}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InputPlaceholder(props) {
  return <input {...props} readOnly />;
}
