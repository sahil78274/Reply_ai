import { Bot, Check, CheckCheck, Clock, Send } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { formatTime, sourceLabel } from '../../lib/utils.js';

export function MessageBubble({ message, currentUser = true }) {
  const outbound = message.direction === 'outbound';
  const isAi = message.source === 'ai';
  const isDemo = message.source === 'demo';
  const statusIcon = () => {
    if (message.status === 'read') return <CheckCheck className="w-3 h-3 text-brand-600" />;
    if (message.status === 'delivered') return <CheckCheck className="w-3 h-3 text-slate-400" />;
    if (message.status === 'sent') return <Check className="w-3 h-3 text-slate-400" />;
    return <Clock className="w-3 h-3 text-slate-400" />;
  };

  return (
    <div className={cn('flex w-full mb-3', outbound ? 'justify-end' : 'justify-start')}>
      {outbound ? (
        <>
          <div className="flex items-end gap-1 mb-0.5">
            {isAi && <Badge variant="secondary" className="h-5">AI</Badge>}
            {isDemo && <Badge variant="outline" className="h-5 text-xs">Demo</Badge>}
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="relative rounded-xl bg-brand-600 text-white px-4 py-2.5 text-sm shadow-sm max-w-[80%]">
              {message.content}
              <span className="absolute -right-1 -bottom-1.5 flex items-end gap-0.5 text-[10px] opacity-60">
                {statusIcon()}
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-end gap-1 mb-0.5">
            <Badge variant="outline" className="h-5 text-xs border-transparent bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {sourceLabel(message.source)}
            </Badge>
            {isDemo && <Badge variant="secondary" className="h-5 text-xs">Demo</Badge>}
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="relative rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2.5 text-sm shadow-sm max-w-[80%]">
              {message.content}
              <span className="absolute -right-1 -bottom-1.5 flex items-end gap-0.5 text-[10px] opacity-60">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
