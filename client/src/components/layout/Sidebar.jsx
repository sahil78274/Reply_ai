import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageCircle,
  Users,
  Bot,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  ShieldAlert,
  Menu,
  ChevronLeft,
  TrendingUp,
  Mail,
  Send,
  Settings as GearIcon,
  Users as UsersIcon,
  Activity,
  PieChart,
  Clock,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { cn } from '../../lib/utils.js';
import { useStore } from '../../store.js';

const NAV = [
  { name: 'Overview Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Live WhatsApp Inbox', href: '/inbox', icon: MessageCircle },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
  { name: 'Contacts & Customers', href: '/customers', icon: Users },
  { name: 'Leads & CRM', href: '/leads', icon: SlidersHorizontal },
  { name: 'Knowledge Base', href: '/knowledge', icon: FileText },
  { name: 'AI Training & Personality', href: '/ai-training', icon: SlidersHorizontal },
  { name: 'Automation Workflows', href: '/automation', icon: Mail },
  { name: 'Broadcast Campaigns', href: '/broadcast', icon: Send },
  { name: 'Analytics & Reports', href: '/analytics', icon: Activity },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Integrations', href: '/integrations', icon: Globe },
  { name: 'Team Management', href: '/team', icon: UsersIcon },
  { name: 'Settings', href: '/settings', icon: GearIcon },
];

function Bell(props) {
  return <Mail {...props} />;
}

export function Sidebar({ className, mobile = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setMobileDrawerOpen } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen z-40 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-transform duration-300 flex flex-col',
        mobile ? 'translate-x-full lg:translate-x-0 shadow-2xl' : 'w-64',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
            RA
          </div>
          <span className={cn('font-bold text-slate-900 dark:text-white', mobile ? 'text-lg' : 'text-sm')}>ReplyAI</span>
        </div>
        {mobile && (
          <Button variant="ghost" size="sm" iconOnly onClick={onClose}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => mobile && setMobileDrawerOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors block',
                isActive
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border-r-3 border-brand-600'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 dark:border-slate-800 p-4 shrink-0">
        <Button
          variant="ghost"
          onClick={() => {
            localStorage.removeItem('ra_token');
            navigate('/login');
          }}
          className="w-full text-left justify-start"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}

export function DesktopSidebar() {
  return <Sidebar mobile={false} />;
}

export function MobileSidebar({ onClose }) {
  return <Sidebar mobile onClose={onClose} />;
}
