import { useState } from 'react';
import { Search, Clock, Bot, UserRound, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { initials, formatTime, formatDate } from '../../lib/utils.js';

export function ConversationList({ conversations, onSelect, selectedId }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.customerName.toLowerCase().includes(q) ||
      c.customerPhone.includes(q) ||
      (c.lastMessage || '').toLowerCase().includes(q)
    );
  });

  const handleSelect = (c) => {
    onSelect(c);
    navigate(`/inbox/${c.id}`);
  };

  return (
    <div className="flex flex-col h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="flex items-center justify-between h-13 border-b border-slate-200 dark:border-slate-800 px-4 bg-white dark:bg-slate-950 shrink-0 z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="Search conversations"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 px-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm">No conversations{search ? ' matching your search' : ''}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((c) => {
              const isActive = selectedId === c.id;
              const human = c.humanTakeover;
              const aiOff = !c.aiEnabled && !human;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors',
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-900/20 border-l-3 border-l-brand-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
                    !isActive && 'border-l-3 border-l-transparent'
                  )}
                >
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium">
                    {c.source === 'demo' ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 text-sm font-bold">
                          {initials(c.customerName)}
                        </div>
                        <div className="absolute -right-1 -bottom-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white dark:border-slate-950" />
                      </>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-400 text-sm font-bold">
                        {initials(c.customerName)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {c.customerName}
                      </span>
                      {c.unreadCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {c.lastMessage || 'No messages yet'}
                      </span>
                      {aiOff && (
                        <span className="text-xs text-slate-400">· AI off</span>
                      )}
                      {human && (
                        <span className="text-xs text-amber-500">· Human</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {formatDate(c.lastMessageAt)}
                    </span>
                    {c.unreadCount > 0 && (
                      <Badge variant="secondary" className="h-5 w-5 p-0 text-xs leading-none">
                        {c.unreadCount > 9 ? '9+' : c.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
